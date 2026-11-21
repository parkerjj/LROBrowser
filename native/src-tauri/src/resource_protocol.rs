use crate::policy::{CHROME_UA, OFFICIAL_ONLINE_PATH, resolve_lro_path};
use futures_util::future::{AbortHandle, AbortRegistration, Abortable};
use std::{
    collections::{HashMap, hash_map::Entry},
    sync::{LazyLock, Mutex},
    time::{Duration, Instant},
};
use tauri::http::{HeaderValue, Method, Request, Response, StatusCode, header};
use tokio::sync::Semaphore;

const OFFICIAL_ORIGIN: &str = "https://game.lastro.cn";
const OFFICIAL_REFERER: &str = "https://game.lastro.cn/";
const MAX_RESOURCE_BYTES: usize = 256 * 1024 * 1024;
// Match the limit of the frontend's official profile parser.
const MAX_ONLINE_BYTES: usize = 4 * 1024 * 1024;
const MAX_OFFICIAL_DOWNLOADS: u32 = 8;
static OFFICIAL_DOWNLOADS: Semaphore = Semaphore::const_new(MAX_OFFICIAL_DOWNLOADS as usize);
const EARLY_CANCEL_TTL: Duration = Duration::from_secs(30);
const MAX_EARLY_CANCELLATIONS: usize = 1_024;
type DownloadKey = (String, String);

#[derive(Default)]
struct DownloadEntries {
    active: HashMap<DownloadKey, AbortHandle>,
    cancelled: HashMap<DownloadKey, Instant>,
}

#[derive(Default)]
struct DownloadRequests(Mutex<DownloadEntries>);

impl DownloadRequests {
    fn start(&self, key: DownloadKey) -> Result<AbortRegistration, StatusCode> {
        let mut requests = self.0.lock().expect("resource requests mutex poisoned");
        if requests
            .cancelled
            .get(&key)
            .is_some_and(|expiry| *expiry > Instant::now())
        {
            return Err(StatusCode::GONE);
        }
        requests.cancelled.remove(&key);
        let Entry::Vacant(slot) = requests.active.entry(key) else {
            return Err(StatusCode::CONFLICT);
        };
        let (abort, registration) = AbortHandle::new_pair();
        slot.insert(abort);
        Ok(registration)
    }

    fn cancel(&self, key: &DownloadKey) {
        let mut requests = self.0.lock().expect("resource requests mutex poisoned");
        if let Some(abort) = requests.active.get(key) {
            abort.abort();
            return;
        }
        // WebView may deliver the independent cancellation fetch before the download.
        let now = Instant::now();
        requests.cancelled.retain(|_, expiry| *expiry > now);
        if requests.cancelled.len() >= MAX_EARLY_CANCELLATIONS
            && !requests.cancelled.contains_key(key)
            && let Some(oldest) = requests
                .cancelled
                .iter()
                .min_by_key(|(_, expiry)| *expiry)
                .map(|(key, _)| key.clone())
        {
            requests.cancelled.remove(&oldest);
        }
        requests
            .cancelled
            .insert(key.clone(), now + EARLY_CANCEL_TTL);
    }

    fn finish(&self, key: &DownloadKey) {
        self.0
            .lock()
            .expect("resource requests mutex poisoned")
            .active
            .remove(key);
    }
}

fn is_download_id(id: &str) -> bool {
    id.len() == 32 && id.bytes().all(|byte| byte.is_ascii_hexdigit())
}

fn query_download_id(query: &str) -> Option<&str> {
    query
        .strip_prefix("request=")
        .filter(|id| is_download_id(id))
}

pub fn register<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    static CLIENT: LazyLock<Result<reqwest::Client, reqwest::Error>> =
        LazyLock::new(|| resource_client(true));
    static REQUESTS: LazyLock<DownloadRequests> = LazyLock::new(DownloadRequests::default);

    builder.register_asynchronous_uri_scheme_protocol("lro", |context, request, responder| {
        let mut download = None;
        if request.method() == Method::GET && is_allowed_request(&request) {
            let key = |id: &str| (context.webview_label().to_owned(), id.to_owned());
            if let Some(id) = request.uri().path().strip_prefix("/cancel/") {
                let result = if request.uri().query().is_none() && is_download_id(id) {
                    REQUESTS.cancel(&key(id));
                    response(
                        StatusCode::NO_CONTENT,
                        Vec::new(),
                        HeaderValue::from_static("text/plain"),
                    )
                } else {
                    error_response(StatusCode::FORBIDDEN, "Resource request forbidden")
                };
                responder.respond(result);
                return;
            }
            if let Some(id) = request.uri().query().and_then(query_download_id) {
                let key = key(id);
                let registration = match REQUESTS.start(key.clone()) {
                    Ok(registration) => registration,
                    Err(status) => {
                        let reason = if status == StatusCode::GONE {
                            "Resource request cancelled"
                        } else {
                            "Resource request already active"
                        };
                        responder.respond(error_response(status, reason));
                        return;
                    }
                };
                download = Some((key, registration));
            }
        }
        tauri::async_runtime::spawn(async move {
            let transfer = async {
                match &*CLIENT {
                    Ok(client) => handle_with_upstream(client, request, |url| url).await,
                    Err(_) => {
                        error_response(StatusCode::BAD_GATEWAY, "Resource client unavailable")
                    }
                }
            };
            let result = match download {
                Some((key, registration)) => {
                    let result = Abortable::new(transfer, registration).await;
                    REQUESTS.finish(&key);
                    result.unwrap_or_else(|_| {
                        error_response(StatusCode::GONE, "Resource request cancelled")
                    })
                }
                None => transfer.await,
            };
            responder.respond(result);
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
        || uri.query().is_some_and(|query| {
            uri.path() == OFFICIAL_ONLINE_PATH || query_download_id(query).is_none()
        })
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
    // Classify the validated upstream before mapping it to a test server.
    // Downloads from the mirror can finish even if the official source is full.
    let _download = if upstream.starts_with(OFFICIAL_REFERER) {
        Some(
            OFFICIAL_DOWNLOADS
                .acquire()
                .await
                .expect("download semaphore stays open"),
        )
    } else {
        None
    };
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
    async fn mirror_can_finish_while_official_download_slots_are_full() {
        let slots = OFFICIAL_DOWNLOADS
            .acquire_many(MAX_OFFICIAL_DOWNLOADS)
            .await
            .unwrap();
        let reply = b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok";
        let (official_url, official_server) = serve_once(reply.to_vec()).await;
        let (mirror_url, mirror_server) = serve_once(reply.to_vec()).await;
        let client = resource_client(false).unwrap();
        let mut official = std::pin::pin!(handle_with_upstream(
            &client,
            request(Method::GET, "/lastro/data/prontera.gnd"),
            |_| official_url,
        ));
        assert!(futures_util::poll!(&mut official).is_pending());

        let deadline = Duration::from_secs(2);
        let mirror = tokio::time::timeout(
            deadline,
            handle_with_upstream(
                &client,
                request(Method::GET, "/rodata/data/prontera.gnd"),
                |_| mirror_url,
            ),
        )
        .await
        .expect("the mirror must not wait for an official slot");
        assert_eq!(mirror.body(), b"ok");
        assert!(!official_server.is_finished());
        drop(slots);

        assert_eq!(
            tokio::time::timeout(deadline, official)
                .await
                .unwrap()
                .body(),
            b"ok"
        );
        official_server.await.unwrap();
        mirror_server.await.unwrap();
    }

    #[test]
    fn cancellation_before_download_prevents_work_from_starting_for_that_window() {
        let requests = DownloadRequests::default();
        let id = "0123456789abcdef0123456789abcdef";
        let key = ("main".to_owned(), id.to_owned());
        requests.cancel(&key);
        assert_eq!(requests.start(key.clone()).err(), Some(StatusCode::GONE));
        assert_eq!(requests.start(key).err(), Some(StatusCode::GONE));
        assert!(requests.start(("other".to_owned(), id.to_owned())).is_ok());
    }

    #[tokio::test]
    async fn cancelling_a_download_closes_its_upstream_only_for_its_window() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let upstream = format!("http://{}/fixture", listener.local_addr().unwrap());
        let (started, waiting) = tokio::sync::oneshot::channel();
        let server = tokio::spawn(async move {
            let (mut socket, _) = listener.accept().await.unwrap();
            let mut request = Vec::new();
            while !request.ends_with(b"\r\n\r\n") {
                let mut buffer = [0; 512];
                let count = socket.read(&mut buffer).await.unwrap();
                assert!(count > 0);
                request.extend_from_slice(&buffer[..count]);
            }
            socket
                .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 6\r\n\r\na")
                .await
                .unwrap();
            started.send(()).unwrap();
            assert_eq!(socket.read(&mut [0]).await.unwrap(), 0);
        });

        let requests = DownloadRequests::default();
        let id = "0123456789abcdef0123456789abcdef";
        let key = ("main".to_owned(), id.to_owned());
        let registration = requests.start(key.clone()).unwrap();
        assert_eq!(
            requests.start(key.clone()).err(),
            Some(StatusCode::CONFLICT)
        );
        let mut download = tokio::spawn(async move {
            let client = resource_client(false).unwrap();
            let path = format!("/lastro/data/map.gat?request={id}");
            let transfer = handle_with_upstream(&client, request(Method::GET, &path), |_| upstream);
            Abortable::new(transfer, registration).await
        });
        let timeout = Duration::from_secs(3);
        tokio::time::timeout(timeout, waiting)
            .await
            .unwrap()
            .unwrap();
        requests.cancel(&("other".to_owned(), id.to_owned()));
        assert!(
            tokio::time::timeout(Duration::from_millis(25), &mut download)
                .await
                .is_err()
        );
        requests.cancel(&key);
        assert!(
            tokio::time::timeout(timeout, download)
                .await
                .unwrap()
                .unwrap()
                .is_err()
        );
        tokio::time::timeout(timeout, server)
            .await
            .unwrap()
            .unwrap();
        requests.finish(&key);
        assert!(requests.start(key).is_ok());
    }

    #[tokio::test]
    async fn live_both_resource_origins_deliver_bytes_through_rust_https() {
        if std::env::var("LASTRO_RESOURCES_LIVE").as_deref() != Ok("1") {
            return;
        }
        let client = resource_client(true).unwrap();
        for source in ["lastro", "rodata"] {
            let started = std::time::Instant::now();
            let path = format!("/{source}/data/prontera.gnd");
            let result =
                handle_with_upstream(&client, request(Method::GET, &path), |url| url).await;
            let elapsed = started.elapsed().as_secs_f64();
            let bytes = result.body().len();
            eprintln!(
                "{source}: {}, {bytes} decoded bytes in {elapsed:.3} s ({:.0} B/s)",
                result.status(),
                bytes as f64 / elapsed
            );
            assert_eq!(result.status(), StatusCode::OK, "{source}");
            assert!(
                bytes > 1_000_000 && result.body().starts_with(b"GRGN"),
                "{source}"
            );
            assert_ne!(result.headers()[header::CONTENT_TYPE], "text/html");
        }
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
                request(
                    Method::GET,
                    "/official/ro/Online.js?request=0123456789abcdef0123456789abcdef",
                ),
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
