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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_asynchronous_uri_scheme_protocol("lro", |_ctx, request, responder| {
            tauri::async_runtime::spawn(async move {
                responder.respond(resource_protocol::handle(request).await);
            });
        })
        .invoke_handler(tauri::generate_handler![probe_args, report, relay::relay_probe])
        .run(tauri::generate_context!())
        .expect("tauri run");
}
