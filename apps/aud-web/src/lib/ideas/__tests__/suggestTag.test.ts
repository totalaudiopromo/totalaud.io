/**
 * Tag Suggestion Tests
 *
 * DESSA Phase 3: Automation
 */

import { describe, it, expect } from 'vitest'
import { suggestTag } from '../suggestTag'

describe('suggestTag', () => {
  describe('content tag suggestions', () => {
    it('should suggest "content" for TikTok/Reels mentions', () => {
      expect(suggestTag('Make a TikTok about the new single')).toBe('content')
      expect(suggestTag('Create 3 reels for Instagram')).toBe('content')
      expect(suggestTag('Film a behind the scenes video')).toBe('content')
    })

    it('should suggest "content" for social media platforms', () => {
      expect(suggestTag('Post on Instagram about the release')).toBe('content')
      expect(suggestTag('YouTube shorts series idea')).toBe('content')
      expect(suggestTag('Twitter thread about the writing process')).toBe('content')
    })

    it('should suggest "content" for visual content creation', () => {
      expect(suggestTag('Studio photo shoot this weekend')).toBe('content')
      expect(suggestTag('Capture some recording footage')).toBe('content')
      expect(suggestTag('Film the live performance')).toBe('content')
    })
  })

  describe('brand tag suggestions', () => {
    it('should suggest "brand" for identity mentions', () => {
      expect(suggestTag('Define my artist identity')).toBe('brand')
      expect(suggestTag('What is my brand aesthetic?')).toBe('brand')
      expect(suggestTag('Craft my artist persona')).toBe('brand')
    })

    it('should suggest "brand" for narrative/story mentions', () => {
      expect(suggestTag('Write my artist bio')).toBe('brand')
      expect(suggestTag('What is my story as a musician?')).toBe('brand')
      expect(suggestTag('Define my values and mission')).toBe('brand')
    })

    it('should suggest "brand" for style/aesthetic mentions', () => {
      expect(suggestTag('What vibe do I want to project?')).toBe('brand')
      expect(suggestTag('Define my visual style and look')).toBe('brand')
      expect(suggestTag('What is my tone and voice?')).toBe('brand')
    })
  })

  describe('promo tag suggestions', () => {
    it('should suggest "promo" for marketing mentions', () => {
      expect(suggestTag('Email radio stations for airplay')).toBe('promo')
      expect(suggestTag('Submit to playlists on Spotify')).toBe('promo')
      expect(suggestTag('Pitch to music blogs and press')).toBe('promo')
    })

    it('should suggest "promo" for release planning', () => {
      expect(suggestTag('Plan the release campaign strategy')).toBe('promo')
      expect(suggestTag('Launch schedule for the new EP')).toBe('promo')
      expect(suggestTag('Promote the single to curators')).toBe('promo')
    })

    it('should suggest "promo" for outreach mentions', () => {
      expect(suggestTag('Contact playlist curators')).toBe('promo')
      expect(suggestTag('Network with other artists')).toBe('promo')
      expect(suggestTag('Reach out to my audience on socials')).toBe('promo')
    })
  })

  describe('default behaviour', () => {
    it('should default to "content" for empty strings', () => {
      expect(suggestTag('')).toBe('content')
    })

    it('should default to "content" for ambiguous text', () => {
      expect(suggestTag('Random idea')).toBe('content')
      expect(suggestTag('Something to think about')).toBe('content')
      expect(suggestTag('Notes from today')).toBe('content')
    })
  })

  describe('case insensitivity', () => {
    it('should work regardless of case', () => {
      expect(suggestTag('MAKE A TIKTOK VIDEO')).toBe('content')
      expect(suggestTag('Email Radio Stations')).toBe('promo')
      expect(suggestTag('Define My Brand Identity')).toBe('brand')
    })
  })

  describe('priority order', () => {
    it('should prioritise content over other tags when multiple keywords present', () => {
      // If a text mentions both content creation AND promotion, content wins
      expect(suggestTag('Create a TikTok to promote the release')).toBe('content')
    })

    it('should prioritise brand when no content keywords present', () => {
      expect(suggestTag('My brand story and marketing plan')).toBe('brand')
    })
  })
})
