use std::sync::OnceLock;
use tauri::http::{Request, Response};

pub const CHROME_UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

fn client() -> &'static reqwest::Client {
    static C: OnceLock<reqwest::Client> = OnceLock::new();
    C.get_or_init(|| reqwest::Client::builder().user_agent(CHROME_UA).build().expect("client"))
}

fn root_url(id: &str) -> Option<&'static str> {
    match id {
        "lastro" => Some("https://game.lastro.cn/ro/client_re/"),
        "rodata" => Some("https://rodata.ltsd.ro/ro/client_re/"),
        _ => None,
    }
}

fn reply(status: u16, body: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header("Access-Control-Allow-Origin", "*")
        .header("Cross-Origin-Resource-Policy", "cross-origin")
        .body(body)
        .expect("response")
}

/// 路径形如 `/<root-id>%2F<逻辑路径>`（convertFileSrc 会把整段路径编码）。
pub async fn handle(request: Request<Vec<u8>>) -> Response<Vec<u8>> {
    let raw = request.uri().path().trim_start_matches('/');
    let decoded = percent_encoding::percent_decode_str(raw).decode_utf8_lossy().to_string();
    let Some((root_id, rest)) = decoded.split_once('/') else { return reply(403, b"bad path".to_vec()) };
    let Some(root) = root_url(root_id) else { return reply(403, b"forbidden root".to_vec()) };
    if rest.is_empty() || rest.split('/').any(|s| s.is_empty() || s == "." || s == "..") {
        return reply(403, b"bad path".to_vec());
    }
    let upstream = format!("{root}{rest}");
    match client().get(&upstream)
        .header("Origin", "https://game.lastro.cn")
        .header("Referer", "https://game.lastro.cn/")
        .send().await
    {
        Ok(r) => {
            let status = r.status().as_u16();
            match r.bytes().await { Ok(b) => reply(status, b.to_vec()), Err(e) => reply(502, e.to_string().into_bytes()) }
        }
        Err(e) => reply(502, e.to_string().into_bytes()),
    }
}
