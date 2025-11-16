use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, SystemTrayMenu, SystemTrayMenuItem};

pub fn create_menu() -> Menu {
    let app_menu = Submenu::new(
        "LoopOS",
        Menu::new()
            .add_native_item(MenuItem::About("LoopOS".to_string(), Default::default()))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("new_workspace".to_string(), "New Workspace"))
            .add_item(CustomMenuItem::new("switch_workspace".to_string(), "Switch Workspace"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("export_campaign".to_string(), "Export Campaign"))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::CloseWindow),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let view_menu = Submenu::new(
        "View",
        Menu::new()
            .add_item(CustomMenuItem::new("toggle_fullscreen".to_string(), "Toggle Full Screen"))
            .add_item(CustomMenuItem::new("reload".to_string(), "Reload"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("dev_tools".to_string(), "Toggle Developer Tools")),
    );

    let window_menu = Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom),
    );

    let help_menu = Submenu::new(
        "Help",
        Menu::new()
            .add_item(CustomMenuItem::new("docs".to_string(), "Open Documentation"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("about".to_string(), "About LoopOS")),
    );

    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(window_menu)
        .add_submenu(help_menu)
}

pub fn create_tray_menu() -> SystemTrayMenu {
    let show = CustomMenuItem::new("show".to_string(), "Show LoopOS");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit)
}
