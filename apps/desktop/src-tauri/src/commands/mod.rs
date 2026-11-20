mod notifications;
mod settings;

pub use notifications::*;
pub use settings::*;

/// Check if running in desktop environment
#[tauri::command]
pub fn is_desktop() -> bool {
    true
}

/// The OS clock override, if the user set one: Some(true) for 24-hour,
/// Some(false) for 12-hour, None to follow the locale. WKWebView's `Intl`
/// ignores macOS's "24-hour time" switch, so the web app asks here first.
#[tauri::command]
pub fn uses_24_hour_clock() -> Option<bool> {
    #[cfg(target_os = "macos")]
    {
        let read = |key: &str| {
            std::process::Command::new("/usr/bin/defaults")
                .args(["read", "-g", key])
                .output()
                .ok()
                .filter(|out| out.status.success())
                .map(|out| String::from_utf8_lossy(&out.stdout).trim() == "1")
        };
        if read("AppleICUForce24HourTime") == Some(true) {
            return Some(true);
        }
        if read("AppleICUForce12HourTime") == Some(true) {
            return Some(false);
        }
    }
    None
}
