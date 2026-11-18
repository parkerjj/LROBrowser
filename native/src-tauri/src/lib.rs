mod net;
mod policy;
mod resource_protocol;
mod windows;

use tauri::{Manager, webview::PageLoadEvent};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
async fn open_ke_ltsd_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    let url = policy::validate_ke_ltsd_url(&url).map_err(|error| error.to_string())?;
    app.opener()
        .open_url(url.as_str(), None::<&str>)
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = windows::configure(builder);
    resource_protocol::register(builder)
        .plugin(
            tauri_plugin_opener::Builder::new()
                .open_js_links_on_click(false)
                .build(),
        )
        .manage(net::registry::ConnectionRegistry::default())
        .setup(|app| {
            windows::create_main_window(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::Destroyed) {
                window
                    .state::<net::registry::ConnectionRegistry>()
                    .close_window(window.label());
            }
        })
        .on_page_load(|webview, payload| {
            if payload.event() == PageLoadEvent::Started {
                webview
                    .state::<net::registry::ConnectionRegistry>()
                    .close_window(webview.label());
            }
        })
        .invoke_handler(tauri::generate_handler![
            net::net_open,
            net::net_send,
            net::net_close,
            windows::open_game_window,
            open_ke_ltsd_url,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run LRO Client");
}
