mod pdf;
mod schedule;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_prevent_default::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            schedule::get_schedule,
            schedule::save_schedule,
            schedule::get_today_routine,
            pdf::export_schedule_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
