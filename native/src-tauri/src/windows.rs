#[cfg(desktop)]
use std::sync::atomic::{AtomicU64, Ordering};

#[cfg(desktop)]
use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};

use std::borrow::Cow;
use tauri::{
    AppHandle, WebviewWindowBuilder,
    http::{HeaderValue, Request, Response, header},
    utils::config::WindowConfig,
};

#[cfg(desktop)]
use crate::window_size;

fn game_window_config(app: &AppHandle) -> std::io::Result<&WindowConfig> {
    app.config()
        .app
        .windows
        .iter()
        .find(|window| window.label == "main")
        .ok_or_else(|| std::io::Error::other("main window configuration is missing"))
}

fn fix_embedded_mime(request: Request<Vec<u8>>, response: &mut Response<Cow<'static, [u8]>>) {
    // Tauri labels unknown binary formats (e.g. .spr) as text/html. Its actual
    // HTML fallback always carries the app CSP, which must remain identifiable.
    if request.uri().path().starts_with("/core/")
        && !response
            .headers()
            .contains_key(header::CONTENT_SECURITY_POLICY)
        && response
            .headers()
            .get(header::CONTENT_TYPE)
            .is_some_and(|value| value == "text/html")
    {
        response.headers_mut().insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("application/octet-stream"),
        );
    }
}

fn build_game_window(app: &AppHandle, config: &WindowConfig) -> tauri::Result<()> {
    let builder =
        WebviewWindowBuilder::from_config(app, config)?.on_web_resource_request(fix_embedded_mime);
    #[cfg(desktop)]
    let saved_size = app.state::<window_size::WindowSizes>().current();
    #[cfg(desktop)]
    let builder = match saved_size {
        Some(size) => builder
            .inner_size(f64::from(size.width), f64::from(size.height))
            .prevent_overflow(),
        None => builder,
    };
    #[cfg(target_os = "windows")]
    let builder = if saved_size.is_some() {
        builder.visible(false)
    } else {
        builder
    };
    let window = builder.build()?;
    #[cfg(target_os = "windows")]
    if let Some(size) = saved_size {
        if let Err(error) = window_size::restore_with_menu(&window, size) {
            eprintln!("failed to restore window size: {error}");
        }
        if config.visible {
            window.show()?;
        }
    }
    #[cfg(desktop)]
    window_size::track(&window);
    #[cfg(mobile)]
    let _ = window;
    Ok(())
}

pub(crate) fn create_main_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    build_game_window(app, game_window_config(app)?)?;
    Ok(())
}

#[cfg(desktop)]
const NEW_GAME_WINDOW: &str = "new-game-window";

#[cfg(desktop)]
fn create_game_window(app: &AppHandle) -> Result<String, String> {
    static NEXT_WINDOW: AtomicU64 = AtomicU64::new(1);
    let id = NEXT_WINDOW.fetch_add(1, Ordering::Relaxed);
    let label = format!("game-{id}");
    let mut config = game_window_config(app)
        .map_err(|error| error.to_string())?
        .clone();
    config.label = label.clone();
    build_game_window(app, &config).map_err(|error| error.to_string())?;
    Ok(label)
}

#[tauri::command]
pub(crate) async fn open_game_window(app: AppHandle) -> Result<String, String> {
    #[cfg(desktop)]
    {
        create_game_window(&app)
    }
    #[cfg(mobile)]
    {
        let _ = app;
        Err("opening another game window requires a desktop".into())
    }
}

#[cfg(desktop)]
fn open_in_background(app: &AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        if let Err(error) = create_game_window(&app) {
            eprintln!("failed to open game window: {error}");
        }
    });
}

#[cfg(desktop)]
pub(crate) fn configure(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            open_in_background(app)
        }))
        .menu(|app| {
            let windows = SubmenuBuilder::new(app, "窗口")
                .text(NEW_GAME_WINDOW, "新开窗口")
                .build()?;
            MenuBuilder::new(app).item(&windows).build()
        })
        .on_menu_event(|app, event| {
            if event.id() == NEW_GAME_WINDOW {
                open_in_background(app);
            }
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_embedded_core_binary_mime_is_corrected() {
        for (path, html_fallback, expected) in [
            (
                "/core/data/sprite/cursors.spr",
                false,
                "application/octet-stream",
            ),
            ("/core/missing.spr", true, "text/html"),
            ("/play.html", false, "text/html"),
        ] {
            let request = Request::builder().uri(path).body(Vec::new()).unwrap();
            let mut response = Response::builder()
                .header(header::CONTENT_TYPE, "text/html")
                .body(Cow::Borrowed(&b"body"[..]))
                .unwrap();
            if html_fallback {
                response.headers_mut().insert(
                    header::CONTENT_SECURITY_POLICY,
                    HeaderValue::from_static("default-src 'self'"),
                );
            }
            fix_embedded_mime(request, &mut response);
            assert_eq!(response.headers()[header::CONTENT_TYPE], expected);
        }
    }
}
