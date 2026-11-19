use std::time::Duration;

use serde_json::Value;
use tauri::{
    AppHandle, Manager, async_runtime,
    utils::{config::BundleType, platform::bundle_type},
};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_updater::{Config, Update, UpdaterExt};
use tokio::sync::oneshot;
use url::Url;

const UPDATE_HOST: &str = "client.ltsd.ro";
const MAIN_FEED: &str = "https://client.ltsd.ro/native/latest.json";
const LINUX_FEED: &str = "https://client.ltsd.ro/native/linux.json";
const CHECK_INTERVAL: Duration = Duration::from_secs(6 * 60 * 60);
const CHECK_TIMEOUT: Duration = Duration::from_secs(20);

// Release packaging injects the key and endpoint. The default local Tauri
// configuration has neither setting and makes no network requests for updates.
fn enabled(config: Option<&Value>, feed: &str) -> bool {
    let Some(config) =
        config.and_then(|value| serde_json::from_value::<Config>(value.clone()).ok())
    else {
        return false;
    };
    !config.pubkey.trim().is_empty()
        && config.require_signed_version
        && !config.allow_downgrades
        && !config.dangerous_insecure_transport_protocol
        && !config.dangerous_accept_invalid_certs
        && !config.dangerous_accept_invalid_hostnames
        && matches!(config.endpoints.as_slice(), [endpoint] if endpoint.as_str() == feed)
}

pub(crate) fn start(app: &AppHandle) {
    let Some(suffix) = package_suffix(std::env::consts::OS, std::env::consts::ARCH, bundle_type())
    else {
        return;
    };
    let endpoint = if cfg!(target_os = "linux") {
        LINUX_FEED
    } else {
        MAIN_FEED
    };
    let config = app.config().plugins.0.get("updater");
    if !enabled(config, endpoint) {
        if config.is_some() {
            eprintln!("Native updater configuration is incomplete or invalid");
        }
        return;
    }
    if let Err(error) = app.plugin(tauri_plugin_dialog::init()) {
        eprintln!("Native updater dialog initialization failed: {error}");
        return;
    }
    if let Err(error) = app.plugin(tauri_plugin_updater::Builder::new().build()) {
        eprintln!("Native updater initialization failed: {error}");
        return;
    }

    let app = app.clone();
    async_runtime::spawn(async move {
        loop {
            match check(&app, suffix).await {
                Ok(Some(update)) => apply_if_confirmed(&app, update).await,
                Ok(None) => {}
                Err(error) => eprintln!("Native update check failed: {error}"),
            }
            tokio::time::sleep(CHECK_INTERVAL).await;
        }
    });
}

fn package_suffix(os: &str, arch: &str, bundle: Option<BundleType>) -> Option<&'static str> {
    match (os, arch, bundle) {
        ("windows", "x86_64", Some(BundleType::Nsis)) => Some("windows-x64-setup.exe"),
        ("macos", "x86_64" | "aarch64", Some(BundleType::App)) => {
            Some("macos-universal.app.tar.gz")
        }
        ("linux", "x86_64", Some(BundleType::Deb)) => Some("linux-amd64.deb"),
        ("linux", "aarch64", Some(BundleType::Deb)) => Some("linux-arm64.deb"),
        ("linux", "x86_64", Some(BundleType::Rpm)) => Some("linux-x86_64.rpm"),
        ("linux", "aarch64", Some(BundleType::Rpm)) => Some("linux-aarch64.rpm"),
        _ => None,
    }
}

fn allowed_download(url: &Url, version: &str, suffix: &str) -> bool {
    url.scheme() == "https"
        && url.host_str() == Some(UPDATE_HOST)
        && url.port().is_none()
        && url.username().is_empty()
        && url.password().is_none()
        && url.query().is_none()
        && url.fragment().is_none()
        && url.path() == format!("/native/{version}/LRO-Client-{version}-{suffix}")
}

async fn check(
    app: &AppHandle,
    suffix: &str,
) -> Result<Option<Update>, Box<dyn std::error::Error + Send + Sync>> {
    let updater = app
        .updater_builder()
        .configure_client(|client| {
            client
                .connect_timeout(Duration::from_secs(10))
                .read_timeout(Duration::from_secs(30))
                .redirect(reqwest::redirect::Policy::none())
        })
        .build()?;
    let update = tokio::time::timeout(CHECK_TIMEOUT, updater.check()).await??;
    if let Some(update) = &update
        && !allowed_download(&update.download_url, &update.version, suffix)
    {
        return Err("update package URL is outside the Native release directory".into());
    }
    Ok(update)
}

fn dialog(
    app: &AppHandle,
    title: &str,
    message: impl Into<String>,
) -> tauri_plugin_dialog::MessageDialogBuilder<tauri::Wry> {
    let dialog = app.dialog().message(message).title(title);
    match app.get_webview_window("main") {
        Some(window) => dialog.parent(&window),
        None => dialog,
    }
}

async fn confirm(app: &AppHandle, title: &str, message: String, accept: &str) -> bool {
    let (answer, response) = oneshot::channel();
    dialog(app, title, message)
        .buttons(MessageDialogButtons::OkCancelCustom(
            accept.into(),
            "稍后".into(),
        ))
        .show(move |confirmed| {
            let _ = answer.send(confirmed);
        });
    response.await.unwrap_or(false)
}

async fn apply_if_confirmed(app: &AppHandle, update: Update) {
    let notes: String = update
        .body
        .as_deref()
        .unwrap_or("")
        .chars()
        .take(1200)
        .collect();
    if !confirm(
        app,
        "发现客户端更新",
        format!(
            "当前版本 {}，新版本 {}。可以在游戏运行时下载。\n\n{notes}",
            update.current_version, update.version
        ),
        "下载更新",
    )
    .await
    {
        return;
    }
    let bytes = match update.download(|_, _| {}, || {}).await {
        Ok(bytes) => bytes,
        Err(error) => {
            show_error(app, "下载或校验更新失败", error);
            return;
        }
    };

    // Ask just before installing, since the player may have logged in while downloading.
    if !confirm(
        app,
        "更新已准备好",
        format!(
            "{} 已下载并通过签名校验。现在安装会关闭所有游戏窗口并重启客户端。",
            update.version
        ),
        "安装并重启",
    )
    .await
    {
        return;
    }

    let app_to_save = app.clone();
    let result = async_runtime::spawn_blocking(move || {
        // The Windows updater exits directly after it launches NSIS, bypassing RunEvent::Exit.
        app_to_save
            .state::<crate::window_size::WindowSizes>()
            .save();
        update.install(bytes)
    })
    .await;
    match result {
        Ok(Ok(())) => {
            #[cfg(not(target_os = "windows"))]
            app.request_restart();
        }
        Ok(Err(error)) => show_error(app, "安装更新失败", error),
        Err(error) => show_error(app, "安装更新失败", error),
    }
}

fn show_error(app: &AppHandle, title: &str, error: impl std::fmt::Display) {
    eprintln!("{title}: {error}");
    dialog(app, title, "请稍后重试。当前客户端仍可继续使用。")
        .kind(MessageDialogKind::Error)
        .show(|_| {});
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{Engine, engine::general_purpose::STANDARD};
    use serde_json::json;
    use tokio::{
        io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
        net::TcpListener,
    };

    #[test]
    fn checks_only_the_configured_pinned_release_feed() {
        let mut config = json!({
            "endpoints": [MAIN_FEED], "pubkey": "public-key", "requireSignedVersion": true,
        });
        assert!(!enabled(None, MAIN_FEED));
        assert!(enabled(Some(&config), MAIN_FEED));
        assert!(!enabled(Some(&config), LINUX_FEED));
        config["endpoints"] = json!([LINUX_FEED]);
        assert!(enabled(Some(&config), LINUX_FEED));
        config["allowDowngrades"] = json!(true);
        assert!(!enabled(Some(&config), LINUX_FEED));
        config["allowDowngrades"] = json!(false);
        config["requireSignedVersion"] = json!(false);
        assert!(!enabled(Some(&config), LINUX_FEED));
        config["requireSignedVersion"] = json!(true);
        config["pubkey"] = json!("");
        assert!(!enabled(Some(&config), LINUX_FEED));
    }

    #[test]
    fn package_url_is_bound_to_the_feed_origin_and_version() {
        let bundle = package_suffix("windows", "x86_64", Some(BundleType::Nsis)).unwrap();
        for (url, accept) in [
            (
                "https://client.ltsd.ro/native/1.2.3/LRO-Client-1.2.3-windows-x64-setup.exe",
                true,
            ),
            (
                "https://client.ltsd.ro/native/1.2.2/LRO-Client-1.2.3-windows-x64-setup.exe",
                false,
            ),
            (
                "https://client.ltsd.ro/native/1.2.3/sub/LRO-Client-1.2.3-windows-x64-setup.exe",
                false,
            ),
            (
                "https://client.ltsd.ro/native/1.2.3/LRO-Client-1.2.3-windows-x64-setup.exe?a=1",
                false,
            ),
            (
                "https://client.ltsd.ro:8443/native/1.2.3/LRO-Client-1.2.3-windows-x64-setup.exe",
                false,
            ),
            (
                "https://client.ltsd.ro.example/native/1.2.3/LRO-Client-1.2.3-windows-x64-setup.exe",
                false,
            ),
            (
                "http://client.ltsd.ro/native/1.2.3/LRO-Client-1.2.3-windows-x64-setup.exe",
                false,
            ),
        ] {
            assert_eq!(
                allowed_download(&Url::parse(url).unwrap(), "1.2.3", bundle),
                accept,
                "{url}"
            );
        }

        let arm_deb =
            Url::parse("https://client.ltsd.ro/native/1.2.3/LRO-Client-1.2.3-linux-arm64.deb")
                .unwrap();
        for (arch, bundle, accept) in [
            ("aarch64", BundleType::Deb, true),
            ("x86_64", BundleType::Deb, false),
            ("aarch64", BundleType::Rpm, false),
        ] {
            let suffix = package_suffix("linux", arch, Some(bundle)).unwrap();
            assert_eq!(allowed_download(&arm_deb, "1.2.3", suffix), accept);
        }
        assert_eq!(package_suffix("linux", "aarch64", None), None);
    }

    #[tokio::test]
    async fn official_updater_selects_newer_manifest_and_checks_signed_version_and_package() {
        const PACKAGE: &[u8] = b"update payload";
        let keypair = minisign::KeyPair::generate_unencrypted_keypair().unwrap();
        let public_key = STANDARD.encode(keypair.pk.to_box().unwrap().into_string());
        let signature = minisign::sign(
            Some(&keypair.pk),
            &keypair.sk,
            PACKAGE,
            Some("timestamp:1\tfile:update.exe\tversion:1.2.4"),
            None,
        )
        .unwrap();
        let signature = STANDARD.encode(signature.into_string());

        let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
        let origin = format!("http://{}", listener.local_addr().unwrap());
        let fixture_origin = origin.clone();
        let fixture = tokio::spawn(async move {
            loop {
                let (mut stream, _) = listener.accept().await.unwrap();
                let mut reader = BufReader::new(&mut stream);
                let mut request = String::new();
                reader.read_line(&mut request).await.unwrap();
                let path = request.split_ascii_whitespace().nth(1).unwrap();
                let (body, content_type) = if matches!(path, "/installer" | "/modified") {
                    let bytes = if path == "/installer" {
                        PACKAGE
                    } else {
                        b"tampered package"
                    };
                    (bytes.to_vec(), "application/octet-stream")
                } else {
                    let (version, file) = match path {
                        "/older" => ("1.2.2", "installer"),
                        "/current" => ("1.2.3", "installer"),
                        "/new" => ("1.2.4", "installer"),
                        "/tampered" => ("1.2.4", "modified"),
                        "/wrong-version" => ("1.2.5", "installer"),
                        _ => panic!("unexpected fixture request: {path}"),
                    };
                    let platform = json!({ "url": format!("{fixture_origin}/{file}"), "signature": signature });
                    let manifest = json!({ "version": version, "platforms": {
                        "windows-x86_64": platform, "linux-aarch64-deb": platform, "darwin-aarch64": platform,
                    }});
                    (serde_json::to_vec(&manifest).unwrap(), "application/json")
                };
                let mut header = String::new();
                loop {
                    header.clear();
                    if reader.read_line(&mut header).await.unwrap() == 0 || header == "\r\n" {
                        break;
                    }
                }
                let format = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                    body.len()
                );
                stream.write_all(format.as_bytes()).await.unwrap();
                stream.write_all(&body).await.unwrap();
            }
        });

        let mut app_context = tauri::test::mock_context(tauri::test::noop_assets());
        app_context.package_info_mut().version = "1.2.3".parse().unwrap();
        app_context.config_mut().plugins.0.insert(
            "updater".into(),
            json!({
                "pubkey": public_key,
                "requireSignedVersion": true,
                "dangerousInsecureTransportProtocol": true,
            }),
        );
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_updater::Builder::new().build())
            .build(app_context)
            .unwrap();
        let at = |path: &str, target: &str| {
            app.updater_builder()
                .target(target)
                .endpoints(vec![Url::parse(&format!("{origin}/{path}")).unwrap()])
                .unwrap()
                .no_proxy()
                .timeout(Duration::from_secs(2))
                .build()
                .unwrap()
        };

        let target = "windows-x86_64";
        for unchanged in ["current", "older"] {
            assert!(at(unchanged, target).check().await.unwrap().is_none());
        }
        for target in [target, "linux-aarch64-deb", "darwin-aarch64"] {
            let update = at("new", target).check().await.unwrap().unwrap();
            assert_eq!(update.version, "1.2.4");
            assert_eq!(update.download(|_, _| {}, || {}).await.unwrap(), PACKAGE);
        }
        let tampered = at("tampered", target).check().await.unwrap().unwrap();
        assert!(tampered.download(|_, _| {}, || {}).await.is_err());
        let wrong_version = at("wrong-version", target).check().await.unwrap().unwrap();
        assert!(matches!(
            wrong_version.download(|_, _| {}, || {}).await,
            Err(tauri_plugin_updater::Error::SignedVersionMismatch { .. })
        ));
        fixture.abort();
    }
}
