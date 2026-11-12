use std::time::{Duration, Instant};
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::tungstenite::http::HeaderValue;

const RELAY_URL: &str = "wss://port.lastro.cn/103.8.222.164:26569";

#[derive(serde::Serialize)]
pub struct RelayResult { status: u16, ms: u64, error: Option<String> }

/// 握手后立刻关闭。user_agent 为 None 时用 CHROME_UA。
#[tauri::command]
pub async fn relay_probe(user_agent: Option<String>) -> RelayResult {
    let started = Instant::now();
    let ua = user_agent.unwrap_or_else(|| crate::resource_protocol::CHROME_UA.to_string());
    let result = async {
        let mut req = RELAY_URL.into_client_request().map_err(|e| e.to_string())?;
        let h = req.headers_mut();
        h.insert("Origin", HeaderValue::from_static("https://game.lastro.cn"));
        h.insert("User-Agent", HeaderValue::from_str(&ua).map_err(|e| e.to_string())?);
        match tokio::time::timeout(Duration::from_secs(15), tokio_tungstenite::connect_async(req)).await {
            Err(_) => Err("timeout".to_string()),
            Ok(Ok((mut ws, resp))) => {
                let status = resp.status().as_u16();
                use futures_util::SinkExt;
                let _ = ws.close(None).await;
                Ok(status)
            }
            Ok(Err(tokio_tungstenite::tungstenite::Error::Http(resp))) => Ok(resp.status().as_u16()),
            Ok(Err(e)) => Err(e.to_string()),
        }
    }.await;
    let ms = started.elapsed().as_millis() as u64;
    match result {
        Ok(status) => RelayResult { status, ms, error: None },
        Err(e) => RelayResult { status: 0, ms, error: Some(e) },
    }
}
