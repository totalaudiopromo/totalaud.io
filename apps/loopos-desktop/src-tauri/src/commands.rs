use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

fn get_cache_base_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_data_dir(&app_handle.config())
        .ok_or_else(|| "Failed to get app data directory".to_string())
        .map(|mut path| {
            path.push("loopos");
            path
        })
}

fn get_cache_path(app_handle: &tauri::AppHandle, relative_path: &str) -> Result<PathBuf, String> {
    let base = get_cache_base_dir(app_handle)?;
    let mut full_path = base.clone();
    full_path.push(relative_path);

    // Security: ensure the path is within the cache directory
    if !full_path.starts_with(&base) {
        return Err("Invalid path: attempted directory traversal".to_string());
    }

    Ok(full_path)
}

#[tauri::command]
pub fn get_app_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    get_cache_base_dir(&app_handle)
        .and_then(|path| {
            path.to_str()
                .ok_or_else(|| "Failed to convert path to string".to_string())
                .map(|s| s.to_string())
        })
}

#[tauri::command]
pub fn ensure_cache_dir(app_handle: tauri::AppHandle, relative_path: String) -> Result<(), String> {
    let dir_path = get_cache_path(&app_handle, &relative_path)?;

    fs::create_dir_all(&dir_path)
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub fn read_cache_file(app_handle: tauri::AppHandle, relative_path: String) -> Result<String, String> {
    let file_path = get_cache_path(&app_handle, &relative_path)?;

    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn write_cache_file(
    app_handle: tauri::AppHandle,
    relative_path: String,
    contents: String,
) -> Result<(), String> {
    let file_path = get_cache_path(&app_handle, &relative_path)?;

    // Ensure parent directory exists
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }

    fs::write(&file_path, contents)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn list_cache_files(
    app_handle: tauri::AppHandle,
    relative_path: String,
) -> Result<Vec<String>, String> {
    let dir_path = get_cache_path(&app_handle, &relative_path)?;

    if !dir_path.exists() {
        return Ok(vec![]);
    }

    fs::read_dir(&dir_path)
        .map_err(|e| format!("Failed to read directory: {}", e))
        .and_then(|entries| {
            entries
                .filter_map(|entry| {
                    entry.ok().and_then(|e| {
                        e.file_name().to_str().map(|s| s.to_string())
                    })
                })
                .collect::<Vec<String>>()
                .into()
        })
        .map(Ok)?
}

#[tauri::command]
pub fn delete_cache_file(app_handle: tauri::AppHandle, relative_path: String) -> Result<(), String> {
    let file_path = get_cache_path(&app_handle, &relative_path)?;

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete file: {}", e))
    } else {
        Ok(())
    }
}
