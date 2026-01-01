/**
 * Ideas Domain Types
 */

export type IdeaTag = 'content' | 'brand' | 'music' | 'promo'
export type SortMode = 'newest' | 'oldest' | 'alpha'
export type ViewMode = 'canvas' | 'list'

export interface IdeaCard {
  id: string
  content: string
  tag: IdeaTag
  position: { x: number; y: number }
  createdAt: string
  updatedAt: string
  isStarter?: boolean
}
