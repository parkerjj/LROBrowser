mod report;

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
        .invoke_handler(tauri::generate_handler![probe_args, report])
        .run(tauri::generate_context!())
        .expect("tauri run");
}
