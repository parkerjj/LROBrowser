pub(crate) mod registry;
mod relay;
mod tcp;

#[cfg(test)]
mod tests;

use std::{future::Future, time::Duration};

use registry::{ConnectionRegistry, Writes};
use serde::{Deserialize, Serialize};
use tauri::{
    State, WebviewWindow,
    ipc::{Channel, InvokeResponseBody},
};
use tokio::io::{AsyncRead, AsyncWrite};

use crate::policy::{validate_relay_url, validate_tcp_target, validate_tls_target};

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum NetKind {
    Tcp,
    Tls,
    Relay,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum NetEvent {
    Open,
    Failed {
        message: String,
    },
    #[serde(skip)]
    Data(Vec<u8>),
    Closed {
        #[serde(skip_serializing_if = "Option::is_none")]
        error: Option<String>,
    },
}

trait ByteStream: AsyncRead + AsyncWrite + Unpin + Send {}
impl<T: AsyncRead + AsyncWrite + Unpin + Send> ByteStream for T {}

enum Transport {
    Stream(Box<dyn ByteStream>),
    Relay(Box<relay::RelaySocket>),
}

impl Transport {
    fn stream(stream: impl ByteStream + 'static) -> Self {
        Self::Stream(Box::new(stream))
    }

    fn relay(socket: relay::RelaySocket) -> Self {
        Self::Relay(Box::new(socket))
    }

    async fn run(
        self,
        writes: Writes,
        on_data: impl Fn(Vec<u8>) -> Result<(), String>,
    ) -> Result<(), String> {
        match self {
            Self::Stream(stream) => tcp::run(stream, writes, on_data).await,
            Self::Relay(socket) => relay::run(*socket, writes, on_data).await,
        }
    }
}

async fn connect(kind: NetKind, host: String, port: u16) -> Result<Transport, String> {
    match kind {
        NetKind::Tcp => {
            validate_tcp_target(&host, port).map_err(|error| error.to_string())?;
            tcp::connect_public(&host, port)
                .await
                .map(Transport::stream)
        }
        NetKind::Tls => {
            validate_tls_target(&host, port).map_err(|error| error.to_string())?;
            tcp::connect_tls(&host, port).await.map(Transport::stream)
        }
        NetKind::Relay => {
            let target = validate_relay_url(&host).map_err(|error| error.to_string())?;
            let url = url::Url::parse(&target.url).map_err(|error| error.to_string())?;
            if url.host_str() != Some("port.lastro.cn") || url.port_or_known_default() != Some(443)
            {
                return Err("relay endpoint must be wss://port.lastro.cn/".into());
            }
            relay::connect_relay_with(&target.url, &relay::RelayHeaders::OFFICIAL)
                .await
                .map(Transport::relay)
        }
    }
}

fn start(
    registry: &ConnectionRegistry,
    owner: &str,
    connect: impl Future<Output = Result<Transport, String>> + Send + 'static,
    emit: impl Fn(NetEvent) -> Result<(), String> + Send + Sync + 'static,
) -> Result<u64, String> {
    let (id, writes, mut cancelled) = registry.insert(owner)?;
    let registry = registry.clone();
    tauri::async_runtime::spawn(async move {
        const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);
        let transport = tokio::select! {
            biased;
            _ = &mut cancelled => {
                registry.finish(id, None, &emit);
                return;
            }
            result = tokio::time::timeout(CONNECT_TIMEOUT, connect) => match result {
                Ok(result) => result,
                Err(_) => Err("connection timed out".into()),
            },
        };
        let event = match transport {
            Err(message) => Some(NetEvent::Failed { message }),
            Ok(transport) if registry.open(id, &emit) => {
                let error = tokio::select! {
                    biased;
                    _ = &mut cancelled => None,
                    result = transport.run(writes, |data| registry.data(id, data, &emit)) => result.err(),
                };
                Some(NetEvent::Closed { error })
            }
            Ok(_) => None,
        };
        registry.finish(id, event, &emit);
    });
    Ok(id)
}

#[tauri::command]
pub(crate) fn net_open(
    window: WebviewWindow,
    registry: State<'_, ConnectionRegistry>,
    kind: NetKind,
    host: String,
    port: u16,
    on_event: Channel<InvokeResponseBody>,
) -> Result<u64, String> {
    start(
        &registry,
        window.label(),
        connect(kind, host, port),
        move |event| {
            let response = match event {
                NetEvent::Data(bytes) => InvokeResponseBody::Raw(bytes),
                event => InvokeResponseBody::Json(
                    serde_json::to_string(&event).map_err(|error| error.to_string())?,
                ),
            };
            on_event.send(response).map_err(|error| error.to_string())
        },
    )
}

#[tauri::command]
pub(crate) async fn net_send(
    window: WebviewWindow,
    registry: State<'_, ConnectionRegistry>,
    id: u64,
    bytes: Vec<u8>,
) -> Result<(), String> {
    registry.send(window.label(), id, bytes).await
}

#[tauri::command]
pub(crate) fn net_close(
    window: WebviewWindow,
    registry: State<'_, ConnectionRegistry>,
    id: u64,
) -> Result<(), String> {
    registry.close(window.label(), id)
}
