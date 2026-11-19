use std::{cell::Cell, fs, io, path::PathBuf, sync::Mutex, time::Duration};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, PhysicalSize, WebviewWindow, WindowEvent};

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub(crate) struct WindowSize {
    pub width: u32,
    pub height: u32,
}

impl WindowSize {
    fn valid(self) -> bool {
        self.width > 0 && self.height > 0
    }

    fn from_physical(size: PhysicalSize<u32>, scale: f64) -> Option<Self> {
        if !scale.is_finite() || scale <= 0.0 {
            return None;
        }
        let logical = size.to_logical::<u32>(scale);
        let size = Self {
            width: logical.width,
            height: logical.height,
        };
        size.valid().then_some(size)
    }
}

#[derive(Default)]
struct SizeState {
    current: Option<WindowSize>,
    saved: Option<WindowSize>,
    save_scheduled: bool,
}

pub(crate) struct WindowSizes {
    path: Option<PathBuf>,
    state: Mutex<SizeState>,
}

impl WindowSizes {
    pub(crate) fn load(app: &AppHandle) -> Self {
        let path = app
            .path()
            .app_config_dir()
            .ok()
            .map(|directory| directory.join("window-size.json"));
        Self::open(path)
    }

    fn open(path: Option<PathBuf>) -> Self {
        let saved = path
            .as_ref()
            .and_then(|path| fs::read(path).ok())
            .and_then(|bytes| serde_json::from_slice::<WindowSize>(&bytes).ok())
            .filter(|size| size.valid());
        Self {
            path,
            state: Mutex::new(SizeState {
                current: saved,
                saved,
                ..Default::default()
            }),
        }
    }

    pub(crate) fn current(&self) -> Option<WindowSize> {
        self.state.lock().unwrap().current
    }

    fn record(&self, size: WindowSize) -> bool {
        let mut state = self.state.lock().unwrap();
        if state.current == Some(size) {
            return false;
        }
        state.current = Some(size);
        self.path.is_some() && !std::mem::replace(&mut state.save_scheduled, true)
    }

    fn flush(&self) -> io::Result<()> {
        let mut state = self.state.lock().unwrap();
        state.save_scheduled = false;
        let (Some(path), Some(size)) = (&self.path, state.current) else {
            return Ok(());
        };
        if state.saved == Some(size) {
            return Ok(());
        }
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let temporary = path.with_extension("tmp");
        fs::write(&temporary, serde_json::to_vec(&size)?)?;
        fs::rename(temporary, path)?;
        state.saved = Some(size);
        Ok(())
    }

    pub(crate) fn save(&self) {
        if let Err(error) = self.flush() {
            eprintln!("failed to save window size: {error}");
        }
    }
}

pub(crate) fn track(window: &WebviewWindow) {
    fn current_size(window: &WebviewWindow) -> Option<WindowSize> {
        WindowSize::from_physical(window.inner_size().ok()?, window.scale_factor().ok()?)
    }

    let observed = Cell::new(current_size(window));
    let window_handle = window.clone();
    window.on_window_event(move |event| {
        let app = window_handle.app_handle();
        let preferences = app.state::<WindowSizes>();
        match event {
            WindowEvent::Resized(_) => {
                if !matches!(
                    (
                        window_handle.is_maximized(),
                        window_handle.is_minimized(),
                        window_handle.is_fullscreen(),
                    ),
                    (Ok(false), Ok(false), Ok(false))
                ) {
                    return;
                }
                // Read the current bounds alongside the current window state.
                // A queued resize can describe the window before a maximize or restore.
                let Some(size) = current_size(&window_handle) else {
                    return;
                };
                // Restore and repeated resize events can report an unchanged normal size.
                if observed.replace(Some(size)) != Some(size) && preferences.record(size) {
                    let app = app.clone();
                    tauri::async_runtime::spawn(async move {
                        tokio::time::sleep(Duration::from_millis(300)).await;
                        let _ = tauri::async_runtime::spawn_blocking(move || {
                            app.state::<WindowSizes>().save();
                        })
                        .await;
                    });
                }
            }
            WindowEvent::CloseRequested { .. } => preferences.save(),
            _ => {}
        }
    });
}

#[cfg(target_os = "windows")]
pub(crate) fn restore_with_menu(window: &WebviewWindow, size: WindowSize) -> tauri::Result<()> {
    // Tauri attaches the Windows menu after applying the builder's initial size.
    // Set the client size again with the menu in place so every restart keeps the same height.
    let mut requested =
        tauri::LogicalSize::new(size.width, size.height).to_physical::<u32>(window.scale_factor()?);
    if let Some(monitor) = window.current_monitor()? {
        let work_area = monitor.work_area().size;
        let outer = window.outer_size()?;
        let inner = window.inner_size()?;
        let frame_width = outer.width.saturating_sub(inner.width);
        let frame_height = outer.height.saturating_sub(inner.height);
        requested.width = requested
            .width
            .min(work_area.width.saturating_sub(frame_width).max(1));
        requested.height = requested
            .height
            .min(work_area.height.saturating_sub(frame_height).max(1));
    }
    window.set_size(requested)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn latest_normal_size_survives_restart() {
        let directory = std::env::temp_dir().join(format!(
            "lro-window-size-{}-{}",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos(),
        ));
        let path = directory.join("window-size.json");
        let first = WindowSize {
            width: 1030,
            height: 710,
        };
        let latest = WindowSize {
            width: 1190,
            height: 780,
        };
        let preferences = WindowSizes::open(Some(path.clone()));

        assert_eq!(preferences.current(), None);
        assert!(preferences.record(first));
        assert!(!preferences.record(latest));
        assert_eq!(preferences.current(), Some(latest));
        preferences.flush().unwrap();

        assert_eq!(
            WindowSizes::open(Some(path.clone())).current(),
            Some(latest)
        );
        std::fs::write(&path, r#"{"width":0,"height":600}"#).unwrap();
        assert_eq!(WindowSizes::open(Some(path.clone())).current(), None);
        std::fs::remove_file(path).unwrap();
        std::fs::remove_dir(directory).unwrap();
    }

    #[test]
    fn physical_pixels_are_saved_as_logical_window_size() {
        let size = WindowSize::from_physical(tauri::PhysicalSize::new(1440, 960), 1.5);
        assert_eq!(
            size,
            Some(WindowSize {
                width: 960,
                height: 640
            })
        );
        assert_eq!(
            WindowSize::from_physical(tauri::PhysicalSize::new(0, 960), 1.5),
            None
        );
    }
}
