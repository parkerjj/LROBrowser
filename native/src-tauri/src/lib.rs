mod net;
mod policy;
mod resource_protocol;
#[cfg(any(target_os = "linux", target_os = "windows", target_os = "macos"))]
mod updater;
#[cfg(desktop)]
mod window_size;
mod windows;

use tauri::{Manager, webview::PageLoadEvent};
use tauri_plugin_opener::OpenerExt;

// The Windows test harness also loads Tauri's Common Controls v6 imports.
#[cfg(all(test, target_os = "windows", target_env = "msvc"))]
#[link(
    name = "resource.lib",
    kind = "static",
    modifiers = "-bundle,+verbatim"
)]
unsafe extern "C" {}

#[tauri::command]
async fn open_ke_ltsd_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    let url = policy::validate_ke_ltsd_url(&url).map_err(|error| error.to_string())?;
    app.opener()
        .open_url(url.as_str(), None::<&str>)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn native_update_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
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
            #[cfg(desktop)]
            app.manage(window_size::WindowSizes::load(app.handle()));
            windows::create_main_window(app.handle())?;
            #[cfg(any(target_os = "linux", target_os = "windows", target_os = "macos"))]
            updater::start(app.handle());
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
            native_update_version,
            #[cfg(any(target_os = "linux", target_os = "windows", target_os = "macos"))]
            updater::native_check_update,
        ])
        .build(tauri::generate_context!())
        .expect("failed to build LRO Client")
        .run(|_app, _event| {
            #[cfg(desktop)]
            if matches!(_event, tauri::RunEvent::Exit) {
                _app.state::<window_size::WindowSizes>().save();
            }
        });
}
