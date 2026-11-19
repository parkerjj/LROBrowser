use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::sync::{mpsc, oneshot};

use super::NetEvent;

const MAX_CONNECTION_ID: u64 = (1 << 53) - 1;
const WRITE_QUEUE_SIZE: usize = 16;

pub(super) type Writes = mpsc::Receiver<Write>;
type Emit<'a> = &'a dyn Fn(NetEvent) -> Result<(), String>;

pub(super) struct Write {
    pub bytes: Vec<u8>,
    pub result: oneshot::Sender<Result<(), String>>,
}

struct Connection {
    owner: String,
    opened: bool,
    writes: mpsc::Sender<Write>,
    cancel: Option<oneshot::Sender<()>>,
}

#[derive(Default)]
struct Connections {
    next_id: u64,
    entries: HashMap<u64, Connection>,
}

#[derive(Clone, Default)]
pub(crate) struct ConnectionRegistry(Arc<Mutex<Connections>>);

impl ConnectionRegistry {
    pub(super) fn insert(
        &self,
        owner: &str,
    ) -> Result<(u64, Writes, oneshot::Receiver<()>), String> {
        let (writes, receiver) = mpsc::channel(WRITE_QUEUE_SIZE);
        let (cancel, cancelled) = oneshot::channel();
        let mut connections = self.0.lock().unwrap();
        if connections.next_id == MAX_CONNECTION_ID {
            return Err("connection identifier limit reached".into());
        }
        connections.next_id += 1;
        let id = connections.next_id;
        connections.entries.insert(
            id,
            Connection {
                owner: owner.to_owned(),
                opened: false,
                writes,
                cancel: Some(cancel),
            },
        );
        Ok((id, receiver, cancelled))
    }

    pub(super) async fn send(&self, owner: &str, id: u64, bytes: Vec<u8>) -> Result<(), String> {
        let (result, written) = oneshot::channel();
        {
            let connections = self.0.lock().unwrap();
            let connection = connections.entries.get(&id).ok_or("connection is closed")?;
            if connection.owner != owner {
                return Err("connection belongs to another window".into());
            }
            if !connection.opened || connection.cancel.is_none() {
                return Err("connection is not open".into());
            }
            connection
                .writes
                .try_send(Write { bytes, result })
                .map_err(|error| match error {
                    mpsc::error::TrySendError::Closed(_) => "connection is closed",
                    mpsc::error::TrySendError::Full(_) => "connection write queue is full",
                })?;
        }
        written.await.map_err(|_| "connection is closed")?
    }

    pub(super) fn close(&self, owner: &str, id: u64) -> Result<(), String> {
        let mut connections = self.0.lock().unwrap();
        if let Some(connection) = connections.entries.get_mut(&id) {
            if connection.owner != owner {
                return Err("connection belongs to another window".into());
            }
            if let Some(cancel) = connection.cancel.take() {
                let _ = cancel.send(());
            }
        }
        Ok(())
    }

    pub(crate) fn close_window(&self, owner: &str) {
        // Removing entries drops the cancellation senders and prevents further IPC.
        self.0
            .lock()
            .unwrap()
            .entries
            .retain(|_, connection| connection.owner != owner);
    }

    #[cfg(test)]
    pub(super) fn owner(&self, id: u64) -> Option<String> {
        self.0
            .lock()
            .unwrap()
            .entries
            .get(&id)
            .map(|connection| connection.owner.clone())
    }

    pub(super) fn open(&self, id: u64, emit: Emit<'_>) -> bool {
        let mut connections = self.0.lock().unwrap();
        if let Some(connection) = connections.entries.get_mut(&id)
            && connection.cancel.is_some()
            && emit(NetEvent::Open).is_ok()
        {
            connection.opened = true;
            return true;
        }
        false
    }

    pub(super) fn data(&self, id: u64, bytes: Vec<u8>, emit: Emit<'_>) -> Result<(), String> {
        let connections = self.0.lock().unwrap();
        if connections
            .entries
            .get(&id)
            .is_some_and(|connection| connection.cancel.is_some())
        {
            return emit(NetEvent::Data(bytes));
        }
        Err("connection is closed".into())
    }

    pub(super) fn finish(&self, id: u64, event: Option<NetEvent>, emit: Emit<'_>) {
        let mut connections = self.0.lock().unwrap();
        let Some(connection) = connections.entries.remove(&id) else {
            return;
        };
        // Keep removal and final delivery ordered against close_window.
        if connection.cancel.is_none() {
            if connection.opened {
                let _ = emit(NetEvent::Closed { error: None });
            }
        } else if let Some(event) = event {
            let _ = emit(event);
        }
    }
}
