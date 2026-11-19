use crate::policy::{CHROME_UA, OFFICIAL_ONLINE_PATH, resolve_lro_path};
use std::{sync::LazyLock, time::Duration};
use tauri::http::{HeaderValue, Method, Request, Response, StatusCode, header};
use tokio::sync::Semaphore;

const OFFICIAL_ORIGIN: &str = "https://game.lastro.cn";
const OFFICIAL_REFERER: &str = "https://game.lastro.cn/";
const MAX_RESOURCE_BYTES: usize = 256 * 1024 * 1024;
// Match the limit of the frontend's official profile parser.
const MAX_ONLINE_BYTES: usize = 4 * 1024 * 1024;
static ACTIVE_DOWNLOADS: Semaphore = Semaphore::const_new(8);

pub fn register<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    static CLIENT: LazyLock<Result<reqwest::Client, reqwest::Error>> =
        LazyLock::new(|| resource_client(true));

    builder.register_asynchronous_uri_scheme_protocol("lro", |_context, request, responder| {
        tauri::async_runtime::spawn(async move {
            let response = match &*CLIENT {
                Ok(client) => handle_with_upstream(client, request, |url| url).await,
                Err(_) => error_response(StatusCode::BAD_GATEWAY, "Resource client unavailable"),
            };
            responder.respond(response);
        });
    })
}

fn resource_client(https_only: bool) -> Result<reqwest::Client, reqwest::Error> {
    // reqwest's rustls-no-provider feature shares the ring backend with game TLS.
    let _ = rustls::crypto::ring::default_provider().install_default();
    reqwest::Client::builder()
        .https_only(https_only)
        .no_proxy()
        .redirect(reqwest::redirect::Policy::none())
        .user_agent(CHROME_UA)
        .connect_timeout(Duration::from_secs(8))
        .read_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(300))
        .build()
}

fn is_allowed_request(request: &Request<Vec<u8>>) -> bool {
    let uri = request.uri();
    // Wry restores Windows' `https://lro.localhost` to `lro://localhost` before this callback.
    if uri.scheme_str() != Some("lro")
        || !uri
            .authority()
            .is_some_and(|authority| authority.as_str() == "localhost")
        || uri.query().is_some()
    {
        return false;
    }

    let mut origins = request.headers().get_all(header::ORIGIN).iter();
    let origin = origins.next();
    let allowed_origin = if cfg!(any(target_os = "windows", target_os = "android")) {
        origin.is_some_and(|value| value == "https://tauri.localhost")
    } else {
        // WebKit may represent a nonstandard origin as opaque or omit the header.
        origin.is_none_or(|value| value == "tauri://localhost" || value == "null")
    };
    allowed_origin
        && origins.next().is_none()
        && request
            .headers()
            .get_all("sec-fetch-dest")
            .iter()
            .all(|dest| dest == "empty")
}

fn response(status: StatusCode, body: Vec<u8>, content_type: HeaderValue) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCESS_CONTROL_EXPOSE_HEADERS, "ETag")
        .header("Cross-Origin-Resource-Policy", "cross-origin")
        .header(header::VARY, "Origin, Sec-Fetch-Dest")
        .header(header::CONTENT_TYPE, content_type)
        .header(header::X_CONTENT_TYPE_OPTIONS, "nosniff")
        .header(header::CONTENT_DISPOSITION, "attachment")
        .header(
            header::CONTENT_SECURITY_POLICY,
            "sandbox; default-src 'none'",
        )
        .body(body)
        .expect("fixed resource response headers")
}

fn error_response(status: StatusCode, reason: &'static str) -> Response<Vec<u8>> {
    response(
        status,
        reason.as_bytes().to_vec(),
        HeaderValue::from_static("text/plain; charset=utf-8"),
    )
}

fn resource_content_type(content_type: Option<&HeaderValue>, is_script: bool) -> HeaderValue {
    if is_script {
        return HeaderValue::from_static("text/plain; charset=utf-8");
    }
    let Some(content_type) = content_type else {
        return HeaderValue::from_static("application/octet-stream");
    };
    let mime = content_type
        .to_str()
        .ok()
        .and_then(|value| value.split(';').next())
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase();
    // Keep HTML distinguishable for the asset resolver's fallback checks. All
    // replies carry a sandbox and nosniff, and no executable MIME type is relayed.
    if matches!(
        mime.as_str(),
        "text/html"
            | "text/plain"
            | "text/csv"
            | "text/xml"
            | "application/xml"
            | "application/octet-stream"
            | "image/bmp"
            | "image/png"
            | "image/jpeg"
            | "image/gif"
            | "image/webp"
            | "image/x-tga"
            | "image/vnd-ms.dds"
            | "audio/mpeg"
            | "audio/wav"
            | "audio/x-wav"
            | "audio/ogg"
            | "audio/opus"
            | "audio/flac"
            | "font/otf"
            | "font/ttf"
    ) {
        return content_type.clone();
    }
    HeaderValue::from_static("application/octet-stream")
}

async fn handle_with_upstream(
    client: &reqwest::Client,
    request: Request<Vec<u8>>,
    upstream_resolver: impl FnOnce(String) -> String,
) -> Response<Vec<u8>> {
    if *request.method() != Method::GET {
        let mut result = error_response(StatusCode::METHOD_NOT_ALLOWED, "GET required");
        result
            .headers_mut()
            .insert(header::ALLOW, HeaderValue::from_static("GET"));
        return result;
    }
    if !is_allowed_request(&request) {
        return error_response(StatusCode::FORBIDDEN, "Resource request forbidden");
    }
    let path = request.uri().path();
    let Ok(upstream) = resolve_lro_path(path) else {
        return error_response(StatusCode::FORBIDDEN, "Resource path forbidden");
    };
    let _download = ACTIVE_DOWNLOADS
        .acquire()
        .await
        .expect("download semaphore stays open");
    let is_script = path == OFFICIAL_ONLINE_PATH;
    let body_limit = if is_script {
        MAX_ONLINE_BYTES
    } else {
        MAX_RESOURCE_BYTES
    };
    let result = client
        .get(upstream_resolver(upstream))
        .header(header::ORIGIN, OFFICIAL_ORIGIN)
        .header(header::REFERER, OFFICIAL_REFERER)
        .send()
        .await;
    let Ok(mut upstream) = result else {
        return error_response(StatusCode::BAD_GATEWAY, "Resource connection failed");
    };
    let status = upstream.status();
    if status.is_redirection() && status != StatusCode::NOT_MODIFIED {
        return error_response(StatusCode::BAD_GATEWAY, "Resource redirect forbidden");
    }
    if upstream
        .content_length()
        .is_some_and(|length| length > body_limit as u64)
    {
        return error_response(StatusCode::BAD_GATEWAY, "Resource too large");
    }

    let mut body = Vec::new();
    loop {
        match upstream.chunk().await {
            Ok(Some(chunk)) if chunk.len() <= body_limit - body.len() => {
                body.extend_from_slice(&chunk)
            }
            Ok(Some(_)) => return error_response(StatusCode::BAD_GATEWAY, "Resource too large"),
            Ok(None) => break,
            Err(_) => return error_response(StatusCode::BAD_GATEWAY, "Resource read failed"),
        }
    }
    let content_type =
        resource_content_type(upstream.headers().get(header::CONTENT_TYPE), is_script);
    let mut result = response(status, body, content_type);
    for name in [header::ETAG, header::LAST_MODIFIED] {
        if let Some(value) = upstream.headers().get(&name) {
            result.headers_mut().insert(name, value.clone());
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::{
        io::{AsyncReadExt, AsyncWriteExt},
        net::TcpListener,
        task::JoinHandle,
    };

    fn request(method: Method, path: &str) -> Request<Vec<u8>> {
        let origin = if cfg!(any(target_os = "windows", target_os = "android")) {
            "https://tauri.localhost"
        } else {
            "tauri://localhost"
        };
        Request::builder()
            .method(method)
            .uri(format!("lro://localhost{path}"))
            .header(header::ORIGIN, origin)
            .body(Vec::new())
            .unwrap()
    }

    async fn serve_once(response: Vec<u8>) -> (String, JoinHandle<String>) {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let serve = tokio::spawn(async move {
            let (mut socket, _) = listener.accept().await.unwrap();
            let mut request = Vec::new();
            while !request.ends_with(b"\r\n\r\n") {
                let mut buffer = [0; 1024];
                let count = socket.read(&mut buffer).await.unwrap();
                assert!(count > 0);
                request.extend_from_slice(&buffer[..count]);
            }
            socket.write_all(&response).await.unwrap();
            socket.shutdown().await.unwrap();
            String::from_utf8(request).unwrap()
        });
        (format!("http://{address}/fixture"), serve)
    }

    #[tokio::test]
    async fn forwards_error_status_and_binary_bytes_with_cors_and_corp() {
        let mut reply = b"HTTP/1.1 404 Not Found\r\nContent-Type: application/octet-stream\r\nContent-Length: 4\r\nConnection: close\r\n\r\n".to_vec();
        reply.extend_from_slice(&[0, 255, 42, 10]);
        let (upstream, server) = serve_once(reply).await;
        let response = handle_with_upstream(
            &resource_client(false).unwrap(),
            request(Method::GET, "/lastro/data/map.gat"),
            |url| {
                assert_eq!(url, "https://game.lastro.cn/ro/client_re/data/map.gat");
                upstream
            },
        )
        .await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
        assert_eq!(response.body(), &[0, 255, 42, 10]);
        assert_eq!(response.headers()[header::ACCESS_CONTROL_ALLOW_ORIGIN], "*");
        assert_eq!(
            response.headers()["cross-origin-resource-policy"],
            "cross-origin"
        );

        let headers = server.await.unwrap();
        assert!(headers.starts_with("GET /fixture HTTP/1.1\r\n"));
        assert!(
            headers.contains("\r\norigin: https://game.lastro.cn\r\n"),
            "{headers}"
        );
        assert!(
            headers.contains("\r\nreferer: https://game.lastro.cn/\r\n"),
            "{headers}"
        );
        assert!(
            headers.contains(&format!("\r\nuser-agent: {CHROME_UA}\r\n")),
            "{headers}"
        );
    }

    #[tokio::test]
    async fn invalid_requests_do_not_resolve_an_upstream() {
        let client = resource_client(false).unwrap();
        for (request, status) in [
            (
                request(Method::GET, "/lastro/data/file.js"),
                StatusCode::FORBIDDEN,
            ),
            (
                request(Method::GET, "/lastro/data/file.txt?query"),
                StatusCode::FORBIDDEN,
            ),
            (
                request(Method::POST, "/lastro/data/file.txt"),
                StatusCode::METHOD_NOT_ALLOWED,
            ),
        ] {
            let response =
                handle_with_upstream(&client, request, |_| panic!("unexpected upstream")).await;
            assert_eq!(response.status(), status);
        }

        let mut other_host = request(Method::GET, "/lastro/data/file.txt");
        *other_host.uri_mut() = "lro://other.test/lastro/data/file.txt".parse().unwrap();
        let mut other_scheme = request(Method::GET, "/lastro/data/file.txt");
        *other_scheme.uri_mut() = "https://localhost/lastro/data/file.txt".parse().unwrap();
        let mut cross_origin = request(Method::GET, "/lastro/data/file.txt");
        cross_origin.headers_mut().insert(
            header::ORIGIN,
            HeaderValue::from_static("https://example.test"),
        );
        let mut script = request(Method::GET, "/official/ro/Online.js");
        script
            .headers_mut()
            .insert("sec-fetch-dest", HeaderValue::from_static("script"));
        for request in [other_host, other_scheme, cross_origin, script] {
            let response =
                handle_with_upstream(&client, request, |_| panic!("unexpected upstream")).await;
            assert_eq!(response.status(), StatusCode::FORBIDDEN);
        }
    }

    #[tokio::test]
    async fn official_online_script_is_returned_as_inert_text() {
        let reply = b"HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\nContent-Length: 3\r\nConnection: close\r\n\r\na()".to_vec();
        let (upstream, server) = serve_once(reply).await;
        let response = handle_with_upstream(
            &resource_client(false).unwrap(),
            request(Method::GET, "/official/ro/Online.js"),
            |url| {
                assert_eq!(url, "https://game.lastro.cn/ro/Online.js");
                upstream
            },
        )
        .await;
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(response.body(), b"a()");
        assert_eq!(
            response.headers()[header::CONTENT_TYPE],
            "text/plain; charset=utf-8"
        );
        assert_eq!(response.headers()["x-content-type-options"], "nosniff");
        assert_eq!(
            response.headers()[header::CONTENT_SECURITY_POLICY],
            "sandbox; default-src 'none'"
        );
        server.await.unwrap();
    }

    #[tokio::test]
    async fn upstream_html_is_recognizable_and_sandboxed() {
        let reply = b"HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Length: 6\r\nConnection: close\r\n\r\n<html>".to_vec();
        let (upstream, server) = serve_once(reply).await;
        let response = handle_with_upstream(
            &resource_client(false).unwrap(),
            request(Method::GET, "/lastro/data/info.xml"),
            |_| upstream,
        )
        .await;
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers()[header::CONTENT_TYPE],
            "text/html; charset=UTF-8"
        );
        assert_eq!(
            response.headers()[header::CONTENT_DISPOSITION],
            "attachment"
        );
        assert_eq!(response.body(), b"<html>");
        server.await.unwrap();
    }

    #[tokio::test]
    async fn upstream_connection_failure_is_bad_gateway() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let upstream = format!("http://{}/fixture", listener.local_addr().unwrap());
        drop(listener);
        let response = handle_with_upstream(
            &resource_client(false).unwrap(),
            request(Method::GET, "/lastro/data/map.gat"),
            |_| upstream,
        )
        .await;
        assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
    }

    #[tokio::test]
    async fn redirects_are_never_followed() {
        let (second, redirected) = serve_once(
            b"HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".to_vec(),
        )
        .await;
        let reply = format!(
            "HTTP/1.1 302 Found\r\nLocation: {second}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
        );
        let (first, original) = serve_once(reply.into_bytes()).await;
        let response = handle_with_upstream(
            &resource_client(false).unwrap(),
            request(Method::GET, "/lastro/data/map.gat"),
            |_| first,
        )
        .await;
        assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
        assert!(!response.headers().contains_key(header::LOCATION));
        original.await.unwrap();
        assert!(!redirected.is_finished());
        redirected.abort();
    }

    #[tokio::test]
    async fn rejects_over_limit_declared_and_streamed_bodies() {
        let reply = format!(
            "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            MAX_RESOURCE_BYTES + 1
        );
        let (upstream, server) = serve_once(reply.into_bytes()).await;
        let client = resource_client(false).unwrap();
        let response = handle_with_upstream(
            &client,
            request(Method::GET, "/lastro/data/map.gat"),
            |_| upstream,
        )
        .await;
        assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
        server.await.unwrap();

        let mut reply = format!(
            "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n{:x}\r\n",
            MAX_ONLINE_BYTES + 1
        )
        .into_bytes();
        reply.resize(reply.len() + MAX_ONLINE_BYTES + 1, b'a');
        reply.extend_from_slice(b"\r\n0\r\n\r\n");
        let (upstream, server) = serve_once(reply).await;
        let response = handle_with_upstream(
            &client,
            request(Method::GET, "/official/ro/Online.js"),
            |_| upstream,
        )
        .await;
        assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
        server.await.unwrap();
    }
}
