import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GoalsStep } from '../steps/GoalsStep'
import type { ScoutWizardState } from '../ScoutWizard'

const createMockState = (overrides: Partial<ScoutWizardState> = {}): ScoutWizardState => ({
  trackTitle: 'Test Track',
  trackDescription: '',
  spotifyUrl: '',
  genres: ['Electronic'],
  vibe: 'energetic',
  goals: [],
  targetRegions: ['UK'],
  status: 'idle',
  progress: 0,
  opportunities: [],
  ...overrides,
})

describe('GoalsStep', () => {
  it('renders step header correctly', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
    expect(screen.getByText('What are you looking for?')).toBeInTheDocument()
  })

  it('renders all goal options', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByText('Playlist Curators')).toBeInTheDocument()
    expect(screen.getByText('Music Blogs')).toBeInTheDocument()
    expect(screen.getByText('Radio Stations')).toBeInTheDocument()
    expect(screen.getByText('YouTube Channels')).toBeInTheDocument()
    expect(screen.getByText('Podcasts')).toBeInTheDocument()
  })

  it('renders goal descriptions', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    expect(
      screen.getByText('Spotify, Apple Music, and independent playlist placements')
    ).toBeInTheDocument()
    expect(screen.getByText('Reviews, features, and premiere opportunities')).toBeInTheDocument()
    expect(screen.getByText('BBC, community radio, and online stations')).toBeInTheDocument()
  })

  it('renders all region options', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByRole('button', { name: 'UK' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'US' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Europe' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Global' })).toBeInTheDocument()
  })

  it('adds goal when clicking unselected goal', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    const playlistButton = screen.getByText('Playlist Curators').closest('button')!
    fireEvent.click(playlistButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ goals: ['playlist'] })
  })

  it('removes goal when clicking selected goal', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ goals: ['playlist', 'blog'] })
    render(<GoalsStep state={state} updateState={mockUpdateState} />)

    const playlistButton = screen.getByText('Playlist Curators').closest('button')!
    fireEvent.click(playlistButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ goals: ['blog'] })
  })

  it('adds region when clicking unselected region', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    const usButton = screen.getByRole('button', { name: 'US' })
    fireEvent.click(usButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ targetRegions: ['UK', 'US'] })
  })

  it('removes region when clicking selected region (if more than one)', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ targetRegions: ['UK', 'US'] })
    render(<GoalsStep state={state} updateState={mockUpdateState} />)

    const ukButton = screen.getByRole('button', { name: 'UK' })
    fireEvent.click(ukButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ targetRegions: ['US'] })
  })

  it('does not allow removing last region', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ targetRegions: ['UK'] })
    render(<GoalsStep state={state} updateState={mockUpdateState} />)

    const ukButton = screen.getByRole('button', { name: 'UK' })
    fireEvent.click(ukButton)

    // Should not be called because we can't remove the last region
    expect(mockUpdateState).not.toHaveBeenCalled()
  })

  it('shows summary when goals are selected', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({
      goals: ['playlist', 'blog'],
      targetRegions: ['UK', 'Europe'],
    })
    render(<GoalsStep state={state} updateState={mockUpdateState} />)

    expect(screen.getByText('Scout will search for')).toBeInTheDocument()
    expect(screen.getByText(/Playlist Curators, Music Blogs/)).toBeInTheDocument()
    expect(screen.getByText(/UK, Europe/)).toBeInTheDocument()
  })

  it('does not show summary when no goals selected', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.queryByText('Scout will search for')).not.toBeInTheDocument()
  })

  it('displays required indicator for opportunity types', () => {
    const mockUpdateState = vi.fn()
    render(<GoalsStep state={createMockState()} updateState={mockUpdateState} />)

    const label = screen.getByText(/Opportunity types/).closest('label')
    expect(label).toHaveTextContent('*')
  })
})
