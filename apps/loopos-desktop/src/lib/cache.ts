/**
 * LoopOS Desktop - Local Cache System
 * Provides secure local file storage for offline-first behaviour
 */

import { invoke } from '@tauri-apps/api/tauri'

export interface CacheOptions {
  encrypt?: boolean
}

/**
 * Get the app data directory path
 */
export async function getAppDataDir(): Promise<string> {
  return await invoke<string>('get_app_data_dir')
}

/**
 * Ensure a cache directory exists
 */
export async function ensureCacheDir(relativePath: string): Promise<void> {
  await invoke('ensure_cache_dir', { relativePath })
}

/**
 * Read a file from the local cache
 */
export async function readCache<T = unknown>(
  relativePath: string
): Promise<T | null> {
  try {
    const contents = await invoke<string>('read_cache_file', { relativePath })
    return JSON.parse(contents) as T
  } catch (error) {
    // File doesn't exist or is invalid JSON
    return null
  }
}

/**
 * Write data to the local cache
 */
export async function writeCache<T = unknown>(
  relativePath: string,
  data: T
): Promise<void> {
  const contents = JSON.stringify(data, null, 2)
  await invoke('write_cache_file', { relativePath, contents })
}

/**
 * List files in a cache directory
 */
export async function listCacheFiles(
  relativePath: string
): Promise<string[]> {
  return await invoke<string[]>('list_cache_files', { relativePath })
}

/**
 * Delete a file from the cache
 */
export async function deleteCache(relativePath: string): Promise<void> {
  await invoke('delete_cache_file', { relativePath })
}

/**
 * Cache key helpers
 */
export const cacheKeys = {
  moodboards: (workspaceId: string) => `cache/${workspaceId}/moodboards.json`,
  journal: (workspaceId: string) => `cache/${workspaceId}/journal.json`,
  designerScenes: (workspaceId: string) =>
    `cache/${workspaceId}/designer_scenes.json`,
  nodes: (workspaceId: string) => `cache/${workspaceId}/nodes.json`,
  offlineQueue: () => 'queue/pending_actions.json',
  settings: () => 'config/settings.json',
}
