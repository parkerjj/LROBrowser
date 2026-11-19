use super::{NetEvent, Transport, registry::ConnectionRegistry, relay, tcp};
use std::future::{Future, pending};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpListener,
    sync::mpsc,
    time::{Duration, timeout},
};

const TIMEOUT: Duration = Duration::from_secs(5);

type Events = mpsc::UnboundedReceiver<NetEvent>;

fn start(
    registry: &ConnectionRegistry,
    owner: &str,
    connect: impl Future<Output = Result<Transport, String>> + Send + 'static,
) -> (u64, Events) {
    let (tx, rx) = mpsc::unbounded_channel();
    let id = super::start(registry, owner, connect, move |event| {
        tx.send(event).map_err(|error| error.to_string())
    })
    .unwrap();
    (id, rx)
}

async fn next(events: &mut Events) -> Option<NetEvent> {
    timeout(TIMEOUT, events.recv()).await.unwrap()
}

async fn pair(registry: &ConnectionRegistry, owner: &str) -> (u64, Events, tokio::net::TcpStream) {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let (id, mut events) = start(registry, owner, async move {
        tcp::connect_tcp_unchecked(address)
            .await
            .map(Transport::stream)
    });
    let (peer, _) = timeout(TIMEOUT, listener.accept()).await.unwrap().unwrap();
    assert_eq!(next(&mut events).await, Some(NetEvent::Open));
    (id, events, peer)
}

#[tokio::test]
async fn tcp_echo_is_byte_exact_for_large_and_single_byte_writes() {
    let registry = ConnectionRegistry::default();
    let (id, mut events, mut peer) = pair(&registry, "main").await;
    for bytes in [vec![0x81], (0..=255).cycle().take(96 * 1024).collect()] {
        let len = bytes.len();
        tokio::try_join!(
            async {
                registry
                    .send("main", id, bytes.clone())
                    .await
                    .map_err(std::io::Error::other)
            },
            async {
                let mut received = vec![0; len];
                peer.read_exact(&mut received).await?;
                assert_eq!(received, bytes);
                peer.write_all(&received).await
            }
        )
        .unwrap();
        let mut received = Vec::new();
        while received.len() < len {
            match next(&mut events).await {
                Some(NetEvent::Data(chunk)) => received.extend(chunk),
                event => panic!("unexpected TCP event: {event:?}"),
            }
        }
        assert_eq!(received, bytes);
    }
}

#[tokio::test]
async fn tcp_writes_keep_their_order() {
    let registry = ConnectionRegistry::default();
    let (id, _events, mut peer) = pair(&registry, "main").await;
    let expected: Vec<u8> = (0..1000u32).flat_map(u32::to_be_bytes).collect();
    let mut received = vec![0; expected.len()];
    timeout(TIMEOUT, async {
        tokio::join!(
            async {
                for seq in 0..1000u32 {
                    registry
                        .send("main", id, seq.to_be_bytes().to_vec())
                        .await
                        .unwrap();
                }
            },
            async {
                peer.read_exact(&mut received).await.unwrap();
            }
        );
    })
    .await
    .unwrap();
    assert_eq!(received, expected);
}

#[tokio::test]
async fn tcp_peer_eof_emits_one_clean_close() {
    let registry = ConnectionRegistry::default();
    let (_id, mut events, mut peer) = pair(&registry, "main").await;
    peer.shutdown().await.unwrap();
    assert_eq!(
        next(&mut events).await,
        Some(NetEvent::Closed { error: None })
    );
    assert_eq!(next(&mut events).await, None);
}

#[tokio::test]
async fn tcp_connection_refused_reports_failed() {
    let registry = ConnectionRegistry::default();
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    drop(listener);
    let (_id, mut events) = start(&registry, "main", async move {
        tcp::connect_tcp_unchecked(address)
            .await
            .map(Transport::stream)
    });
    assert!(matches!(
        next(&mut events).await,
        Some(NetEvent::Failed { .. })
    ));
    assert_eq!(next(&mut events).await, None);
}

#[tokio::test]
async fn registry_rejects_operations_from_another_window() {
    let registry = ConnectionRegistry::default();
    let (id, _events, mut peer) = pair(&registry, "main").await;
    assert_eq!(registry.owner(id).as_deref(), Some("main"));
    assert!(registry.send("game-1", id, vec![8]).await.is_err());
    assert!(registry.close("game-1", id).is_err());
    registry.send("main", id, vec![9]).await.unwrap();
    assert_eq!(peer.read_u8().await.unwrap(), 9);
}

#[tokio::test]
async fn registry_close_is_idempotent_and_releases_the_tcp_connection() {
    let registry = ConnectionRegistry::default();
    let (id, mut events, mut peer) = pair(&registry, "main").await;
    registry.close("main", id).unwrap();
    registry.close("main", id).unwrap();
    assert_eq!(
        next(&mut events).await,
        Some(NetEvent::Closed { error: None })
    );
    assert_eq!(next(&mut events).await, None);
    assert_eq!(
        timeout(TIMEOUT, peer.read(&mut [0]))
            .await
            .unwrap()
            .unwrap(),
        0
    );
    registry.close("main", id).unwrap();
}

#[tokio::test]
async fn registry_close_cancels_opening_without_reporting_success() {
    let registry = ConnectionRegistry::default();
    let (id, mut events) = start(&registry, "main", pending());
    registry.close("main", id).unwrap();
    assert_eq!(next(&mut events).await, None);
    assert_eq!(registry.owner(id), None);
}

#[tokio::test]
async fn registry_close_cancels_a_write_waiting_on_backpressure() {
    let registry = ConnectionRegistry::default();
    let (stream, _peer) = tokio::io::duplex(1);
    let (id, mut events) = start(&registry, "main", async { Ok(Transport::stream(stream)) });
    assert_eq!(next(&mut events).await, Some(NetEvent::Open));
    let send = registry.send("main", id, vec![1, 2]);
    let mut send = std::pin::pin!(send);
    assert!(futures_util::poll!(&mut send).is_pending());
    registry.close("main", id).unwrap();
    assert!(timeout(TIMEOUT, send).await.unwrap().is_err());
    assert_eq!(
        next(&mut events).await,
        Some(NetEvent::Closed { error: None })
    );
}

#[tokio::test]
async fn registry_window_destruction_closes_only_its_connections() {
    let registry = ConnectionRegistry::default();
    let (old_id, mut events, mut old_peer) = pair(&registry, "main").await;
    let (active_id, mut active_events, mut active_peer) = pair(&registry, "game-1").await;
    registry.close_window("main");
    assert_eq!(
        timeout(TIMEOUT, old_peer.read(&mut [0]))
            .await
            .unwrap()
            .unwrap(),
        0
    );
    assert_eq!(next(&mut events).await, None);
    assert_eq!(registry.owner(old_id), None);
    assert_eq!(registry.owner(active_id).as_deref(), Some("game-1"));
    registry.send("game-1", active_id, vec![254]).await.unwrap();
    assert_eq!(active_peer.read_u8().await.unwrap(), 254);
    active_peer.write_all(&[17]).await.unwrap();
    assert_eq!(
        next(&mut active_events).await,
        Some(NetEvent::Data(vec![17]))
    );
}

#[tokio::test]
async fn registry_window_label_can_be_reused_after_destruction() {
    let registry = ConnectionRegistry::default();
    let (old_id, mut old_events) = start(&registry, "main", pending());
    registry.close_window("main");
    let (new_id, _events, mut peer) = pair(&registry, "main").await;
    assert_eq!(next(&mut old_events).await, None);
    assert_ne!(new_id, old_id);
    assert!(registry.send("main", old_id, vec![6]).await.is_err());
    registry.send("main", new_id, vec![5]).await.unwrap();
    assert_eq!(peer.read_u8().await.unwrap(), 5);
}

#[tokio::test]
#[expect(
    clippy::result_large_err,
    reason = "tungstenite's callback owns the HTTP response"
)]
async fn relay_handshake_and_binary_frames_are_preserved() {
    use futures_util::{SinkExt, StreamExt};
    use tokio_tungstenite::tungstenite::{
        Message,
        handshake::server::{Request, Response},
    };

    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("ws://{}", listener.local_addr().unwrap());
    let server = tokio::spawn(async move {
        let (peer, _) = listener.accept().await.unwrap();
        let mut ws = tokio_tungstenite::accept_hdr_async(peer, |req: &Request, res: Response| {
            assert_eq!(req.headers()["Origin"], "https://game.lastro.cn");
            assert_eq!(req.headers()["Referer"], "https://game.lastro.cn/");
            assert_eq!(req.headers()["User-Agent"], crate::policy::CHROME_UA);
            Ok(res)
        })
        .await
        .unwrap();
        ws.send(Message::Text("ignored".into())).await.unwrap();
        for bytes in [vec![0, 1, 255], vec![17]] {
            let frame = ws.next().await.unwrap().unwrap();
            assert_eq!(frame, Message::Binary(bytes.into()));
            ws.send(frame).await.unwrap();
        }
        ws.send(Message::Ping(vec![5].into())).await.unwrap();
        assert_eq!(
            ws.next().await.unwrap().unwrap(),
            Message::Pong(vec![5].into())
        );
        ws.close(None).await.unwrap();
        assert!(matches!(
            ws.next().await.unwrap().unwrap(),
            Message::Close(_)
        ));
    });

    let registry = ConnectionRegistry::default();
    let (id, mut events) = start(&registry, "main", async move {
        relay::connect_relay_with(&url, &relay::RelayHeaders::OFFICIAL)
            .await
            .map(Transport::relay)
    });
    assert_eq!(next(&mut events).await, Some(NetEvent::Open));
    for bytes in [vec![0, 1, 255], vec![17]] {
        registry.send("main", id, bytes.clone()).await.unwrap();
        assert_eq!(next(&mut events).await, Some(NetEvent::Data(bytes)));
    }
    assert_eq!(
        next(&mut events).await,
        Some(NetEvent::Closed { error: None })
    );
    assert_eq!(next(&mut events).await, None);
    timeout(TIMEOUT, server).await.unwrap().unwrap();
}

#[tokio::test]
#[expect(
    clippy::result_large_err,
    reason = "tungstenite's callback owns the HTTP response"
)]
async fn relay_handshake_403_is_reported_as_failed() {
    use tokio_tungstenite::tungstenite::{
        self,
        handshake::server::{Request, Response},
    };

    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("ws://{}", listener.local_addr().unwrap());
    let server = tokio::spawn(async move {
        let (peer, _) = listener.accept().await.unwrap();
        let _ = tokio_tungstenite::accept_hdr_async(peer, |_: &Request, _: Response| {
            Err(tungstenite::http::Response::builder()
                .status(403)
                .body(None)
                .unwrap())
        })
        .await;
    });
    let registry = ConnectionRegistry::default();
    let (_id, mut events) = start(&registry, "main", async move {
        relay::connect_relay_with(&url, &relay::RelayHeaders::OFFICIAL)
            .await
            .map(Transport::relay)
    });
    assert!(
        matches!(next(&mut events).await, Some(NetEvent::Failed { message }) if message.contains("403"))
    );
    assert_eq!(next(&mut events).await, None);
    timeout(TIMEOUT, server).await.unwrap().unwrap();
}

#[tokio::test]
async fn live_relay_returns_101() {
    if std::env::var("LASTRO_RELAY_LIVE").as_deref() != Ok("1") {
        return;
    }
    let mut ws = timeout(
        Duration::from_secs(15),
        relay::connect_relay_with(
            "wss://port.lastro.cn/103.8.222.164:26569",
            &relay::RelayHeaders::OFFICIAL,
        ),
    )
    .await
    .unwrap()
    .unwrap();
    ws.close(None).await.unwrap();
}
