/**
 * Community Data Loader
 *
 * Loads and normalizes Community Hub data
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CommunityContext, LoaderOptions, LoaderResult } from '../types'

export async function loadCommunityContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<CommunityContext>> {
  const startTime = Date.now()

  try {
    // Load user profile
    const { data: profile } = await supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', options.userId)
      .single()

    // Load user posts
    const { data: posts } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Load follow counts
    const { count: followingCount } = await supabase
      .from('community_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', options.userId)

    const { count: followerCount } = await supabase
      .from('community_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', options.userId)

    // Calculate engagement score
    const totalUpvotes = posts?.reduce((sum, p) => sum + (p.upvotes || 0), 0) || 0
    const totalViews = posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
    const engagementScore = totalViews > 0 ? (totalUpvotes / totalViews) * 100 : 0

    const context: CommunityContext = {
      profile: profile
        ? {
            id: profile.id,
            displayName: profile.display_name,
            bio: profile.bio,
            avatarUrl: profile.avatar_url,
            profileType: profile.profile_type,
            isVerified: profile.is_verified,
          }
        : undefined,
      posts:
        posts?.map((p) => ({
          id: p.id,
          title: p.title,
          postType: p.post_type,
          upvotes: p.upvotes || 0,
          viewCount: p.view_count || 0,
          createdAt: new Date(p.created_at),
        })) || [],
      followingCount: followingCount || 0,
      followerCount: followerCount || 0,
      engagementScore,
      recentActivity: [], // TODO: Implement activity tracking
    }

    return {
      data: context,
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        posts: [],
        followingCount: 0,
        followerCount: 0,
        engagementScore: 0,
        recentActivity: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error loading Community context',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
