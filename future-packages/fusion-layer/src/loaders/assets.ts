/**
 * Assets Data Loader
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssetContext, LoaderOptions, LoaderResult } from '../types'

export async function loadAssetContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<AssetContext>> {
  const startTime = Date.now()

  try {
    const { data: assets } = await supabase
      .from('asset_drop')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)

    const byType: Record<string, number> = {}
    let totalSize = 0

    assets?.forEach((asset) => {
      byType[asset.asset_type] = (byType[asset.asset_type] || 0) + 1
      totalSize += asset.file_size || 0
    })

    return {
      data: {
        assets:
          assets?.map((a) => ({
            id: a.id,
            type: a.asset_type,
            fileName: a.file_name,
            url: a.url,
            size: a.file_size || 0,
            uploadedAt: new Date(a.created_at),
            tags: a.tags || [],
          })) || [],
        totalAssets: assets?.length || 0,
        byType,
        recentUploads:
          assets?.slice(0, 10).map((a) => ({
            id: a.id,
            type: a.asset_type,
            fileName: a.file_name,
            url: a.url,
            size: a.file_size || 0,
            uploadedAt: new Date(a.created_at),
            tags: a.tags || [],
          })) || [],
        storageUsed: totalSize,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        assets: [],
        totalAssets: 0,
        byType: {},
        recentUploads: [],
        storageUsed: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
