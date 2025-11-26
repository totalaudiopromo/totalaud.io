import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrackInfoStep } from '../steps/TrackInfoStep'
import type { ScoutWizardState } from '../ScoutWizard'

const createMockState = (overrides: Partial<ScoutWizardState> = {}): ScoutWizardState => ({
  trackTitle: '',
  trackDescription: '',
  spotifyUrl: '',
  genres: [],
  vibe: 'energetic',
  goals: [],
  targetRegions: ['UK'],
  status: 'idle',
  progress: 0,
  opportunities: [],
  ...overrides,
})

describe('TrackInfoStep', () => {
  it('renders step header correctly', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByText('Tell us about your track')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByLabelText(/Track title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Spotify/)).toBeInTheDocument()
  })

  it('displays current state values in inputs', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({
      trackTitle: 'Midnight Signals',
      trackDescription: 'A dreamy synth track',
      spotifyUrl: 'https://open.spotify.com/track/123',
    })

    render(<TrackInfoStep state={state} updateState={mockUpdateState} />)

    expect(screen.getByLabelText(/Track title/)).toHaveValue('Midnight Signals')
    expect(screen.getByLabelText(/Description/)).toHaveValue('A dreamy synth track')
    expect(screen.getByLabelText(/Spotify/)).toHaveValue('https://open.spotify.com/track/123')
  })

  it('calls updateState when track title changes', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    const input = screen.getByLabelText(/Track title/)
    fireEvent.change(input, { target: { value: 'New Track Name' } })

    expect(mockUpdateState).toHaveBeenCalledWith({ trackTitle: 'New Track Name' })
  })

  it('calls updateState when description changes', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    const textarea = screen.getByLabelText(/Description/)
    fireEvent.change(textarea, { target: { value: 'My track description' } })

    expect(mockUpdateState).toHaveBeenCalledWith({ trackDescription: 'My track description' })
  })

  it('calls updateState when Spotify URL changes', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    const input = screen.getByLabelText(/Spotify/)
    fireEvent.change(input, { target: { value: 'https://open.spotify.com/track/abc' } })

    expect(mockUpdateState).toHaveBeenCalledWith({
      spotifyUrl: 'https://open.spotify.com/track/abc',
    })
  })

  it('shows required indicator for track title', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    // The asterisk indicates required
    const label = screen.getByText(/Track title/).closest('label')
    expect(label).toHaveTextContent('*')
  })

  it('shows optional indicator for description and Spotify URL', () => {
    const mockUpdateState = vi.fn()
    render(<TrackInfoStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getAllByText('(optional)')).toHaveLength(2)
  })
})
