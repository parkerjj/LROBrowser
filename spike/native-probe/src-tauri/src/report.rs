use std::io::Write;

/// 打印报告并落盘（Windows GUI 程序没有 stdout，CI 读这个文件）。
pub fn emit(json: &str) {
    println!("PROBE_REPORT {json}");
    let _ = std::io::stdout().flush();
    #[cfg(target_os = "android")]
    log_android(json);
    let path = std::env::temp_dir().join("lro-probe-report.json");
    let _ = std::fs::write(path, json);
}

#[cfg(target_os = "android")]
fn log_android(json: &str) {
    eprintln!("LroProbe PROBE_REPORT {json}");
}
