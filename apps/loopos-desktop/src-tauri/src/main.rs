// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod menu;

use tauri::{Manager, SystemTray, SystemTrayEvent};
use menu::create_menu;

fn main() {
    let tray = SystemTray::new()
        .with_menu(menu::create_tray_menu());

    tauri::Builder::default()
        .setup(|app| {
            // Set up global shortcuts
            let handle = app.handle();

            // Command Palette: Cmd/Ctrl+K
            app.global_shortcut_manager()
                .register("CommandOrControl+K", move || {
                    if let Some(window) = handle.get_window("main") {
                        window.emit("shortcut:command-palette", ()).unwrap();
                    }
                })
                .unwrap();

            // New Node: Cmd/Ctrl+N
            let handle_n = app.handle();
            app.global_shortcut_manager()
                .register("CommandOrControl+N", move || {
                    if let Some(window) = handle_n.get_window("main") {
                        window.emit("shortcut:new-node", ()).unwrap();
                    }
                })
                .unwrap();

            // Journal: Cmd/Ctrl+J
            let handle_j = app.handle();
            app.global_shortcut_manager()
                .register("CommandOrControl+J", move || {
                    if let Some(window) = handle_j.get_window("main") {
                        window.emit("shortcut:journal", ()).unwrap();
                    }
                })
                .unwrap();

            // Designer: Cmd/Ctrl+D
            let handle_d = app.handle();
            app.global_shortcut_manager()
                .register("CommandOrControl+D", move || {
                    if let Some(window) = handle_d.get_window("main") {
                        window.emit("shortcut:designer", ()).unwrap();
                    }
                })
                .unwrap();

            // Export: Cmd/Ctrl+Shift+E
            let handle_e = app.handle();
            app.global_shortcut_manager()
                .register("CommandOrControl+Shift+E", move || {
                    if let Some(window) = handle_e.get_window("main") {
                        window.emit("shortcut:export", ()).unwrap();
                    }
                })
                .unwrap();

            Ok(())
        })
        .menu(create_menu())
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_cache_file,
            commands::write_cache_file,
            commands::list_cache_files,
            commands::ensure_cache_dir,
            commands::delete_cache_file,
            commands::get_app_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
