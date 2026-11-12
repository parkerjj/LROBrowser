mod relay;
mod report;
mod resource_protocol;

#[derive(serde::Serialize)]
struct Args { auto: bool, duration_s: u64 }

#[tauri::command]
fn probe_args() -> Args {
    let argv: Vec<String> = std::env::args().collect();
    let duration_s = argv.iter()
        .find_map(|a| a.strip_prefix("--probe-duration-s=").and_then(|v| v.parse().ok()))
        .unwrap_or(60);
    Args { auto: argv.iter().any(|a| a == "--probe-auto"), duration_s }
}

#[tauri::command]
fn report(app: tauri::AppHandle, json: String) {
    report::emit(&json);
    if probe_args().auto { app.exit(0); }
}

type Children = std::sync::Mutex<Vec<(String, String)>>;

#[tauri::command]
fn report_child(children: tauri::State<Children>, label: String, json: String) {
    children.lock().unwrap().push((label, json));
}

#[tauri::command]
fn child_results(children: tauri::State<Children>) -> Vec<(String, String)> {
    children.lock().unwrap().clone()
}

/// 再开 count 个窗口：依次为 normal、minimized、hidden 循环。
#[tauri::command]
async fn open_probe_windows(app: tauri::AppHandle, count: u32, duration_s: u64) -> Result<(), String> {
    use tauri::{WebviewUrl, WebviewWindowBuilder};
    for i in 0..count {
        let state = ["normal", "minimized", "hidden"][(i % 3) as usize];
        let url = format!("index.html?child=1&state={state}&duration={duration_s}");
        let win = WebviewWindowBuilder::new(&app, format!("child-{state}-{i}"), WebviewUrl::App(url.into()))
            .title(format!("probe {state}")).inner_size(400.0, 300.0)
            .build().map_err(|e| e.to_string())?;
        match state {
            "minimized" => { let _ = win.minimize(); }
            "hidden" => { let _ = win.hide(); }
            _ => {}
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Children::default())
        .register_asynchronous_uri_scheme_protocol("lro", |_ctx, request, responder| {
            tauri::async_runtime::spawn(async move {
                responder.respond(resource_protocol::handle(request).await);
            });
        })
        .invoke_handler(tauri::generate_handler![probe_args, report, relay::relay_probe, report_child, child_results, open_probe_windows])
        .run(tauri::generate_context!())
        .expect("tauri run");
}
