use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpStream;
use tokio_tungstenite::{
    MaybeTlsStream, WebSocketStream, connect_async_with_config,
    tungstenite::{
        Message,
        client::IntoClientRequest,
        http::header::{HeaderValue, ORIGIN, REFERER, USER_AGENT},
    },
};

use crate::policy::CHROME_UA;

use super::Writes;

pub(super) type RelaySocket = WebSocketStream<MaybeTlsStream<TcpStream>>;

pub(super) struct RelayHeaders {
    origin: &'static str,
    referer: &'static str,
    user_agent: &'static str,
}

impl RelayHeaders {
    pub(super) const OFFICIAL: Self = Self {
        origin: "https://game.lastro.cn",
        referer: "https://game.lastro.cn/",
        user_agent: CHROME_UA,
    };
}

pub(super) async fn connect_relay_with(
    url: &str,
    headers: &RelayHeaders,
) -> Result<RelaySocket, String> {
    let mut request = url
        .into_client_request()
        .map_err(|error| error.to_string())?;
    request
        .headers_mut()
        .insert(ORIGIN, HeaderValue::from_static(headers.origin));
    request
        .headers_mut()
        .insert(REFERER, HeaderValue::from_static(headers.referer));
    request
        .headers_mut()
        .insert(USER_AGENT, HeaderValue::from_static(headers.user_agent));
    connect_async_with_config(request, None, true)
        .await
        .map(|(socket, _)| socket)
        .map_err(|error| format!("relay handshake failed: {error}"))
}

pub(super) async fn run(
    socket: RelaySocket,
    mut writes: Writes,
    on_data: impl Fn(Vec<u8>) -> Result<(), String>,
) -> Result<(), String> {
    let (mut sink, mut frames) = socket.split();
    let read = async {
        while let Some(frame) = frames.next().await {
            match frame.map_err(|error| error.to_string())? {
                Message::Binary(bytes) => on_data(bytes.to_vec())?,
                Message::Close(_) => return Ok(true),
                _ => {}
            }
        }
        Ok::<_, String>(false)
    };
    let write = async {
        while let Some(write) = writes.recv().await {
            let result = sink
                .send(Message::Binary(write.bytes.into()))
                .await
                .map_err(|error| error.to_string());
            let _ = write.result.send(result.clone());
            result?;
        }
        Ok(())
    };
    let peer_closed = tokio::select! {
        result = read => result?,
        result = write => return result,
    };
    if peer_closed {
        // Tungstenite queues the reply to Close. Bound the flush if the peer stops reading.
        let _ = tokio::time::timeout(Duration::from_secs(1), sink.flush()).await;
    }
    Ok(())
}
