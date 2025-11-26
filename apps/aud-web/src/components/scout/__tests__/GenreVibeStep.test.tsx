import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GenreVibeStep } from '../steps/GenreVibeStep'
import type { ScoutWizardState } from '../ScoutWizard'

const createMockState = (overrides: Partial<ScoutWizardState> = {}): ScoutWizardState => ({
  trackTitle: 'Test Track',
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

describe('GenreVibeStep', () => {
  it('renders step header correctly', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    expect(screen.getByText('Genre and vibe')).toBeInTheDocument()
  })

  it('renders all genre buttons', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    // Check some key genres
    expect(screen.getByRole('button', { name: 'Electronic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hip-Hop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Indie' })).toBeInTheDocument()
  })

  it('renders all vibe buttons', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.getByRole('button', { name: 'Energetic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chill' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Uplifting' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Experimental' })).toBeInTheDocument()
  })

  it('adds genre when clicking unselected genre button', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    const electronicButton = screen.getByRole('button', { name: 'Electronic' })
    fireEvent.click(electronicButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ genres: ['Electronic'] })
  })

  it('removes genre when clicking selected genre button', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ genres: ['Electronic', 'Pop'] })
    render(<GenreVibeStep state={state} updateState={mockUpdateState} />)

    const electronicButton = screen.getByRole('button', { name: 'Electronic' })
    fireEvent.click(electronicButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ genres: ['Pop'] })
  })

  it('adds multiple genres when clicking different buttons', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ genres: ['Electronic'] })
    render(<GenreVibeStep state={state} updateState={mockUpdateState} />)

    const popButton = screen.getByRole('button', { name: 'Pop' })
    fireEvent.click(popButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ genres: ['Electronic', 'Pop'] })
  })

  it('updates vibe when clicking vibe button', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    const chillButton = screen.getByRole('button', { name: 'Chill' })
    fireEvent.click(chillButton)

    expect(mockUpdateState).toHaveBeenCalledWith({ vibe: 'chill' })
  })

  it('shows selected genres summary', () => {
    const mockUpdateState = vi.fn()
    const state = createMockState({ genres: ['Electronic', 'Pop', 'Indie'] })
    render(<GenreVibeStep state={state} updateState={mockUpdateState} />)

    expect(screen.getByText('Selected: Electronic, Pop, Indie')).toBeInTheDocument()
  })

  it('does not show summary when no genres selected', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    expect(screen.queryByText(/^Selected:/)).not.toBeInTheDocument()
  })

  it('displays required indicator for genres', () => {
    const mockUpdateState = vi.fn()
    render(<GenreVibeStep state={createMockState()} updateState={mockUpdateState} />)

    const label = screen.getByText(/Genres/).closest('label')
    expect(label).toHaveTextContent('*')
  })
})
