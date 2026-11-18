mod net;
mod policy;
mod resource_protocol;
mod windows;

use tauri::{Manager, webview::PageLoadEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = windows::configure(builder);
    resource_protocol::register(builder)
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
        ])
        .run(tauri::generate_context!())
        .expect("failed to run LRO Client");
}
