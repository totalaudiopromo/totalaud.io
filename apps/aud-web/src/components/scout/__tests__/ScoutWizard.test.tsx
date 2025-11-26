import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScoutWizard } from '../ScoutWizard'

// Mock the child step components to isolate ScoutWizard logic
vi.mock('../steps/TrackInfoStep', () => ({
  TrackInfoStep: ({ updateState }: { updateState: (updates: Record<string, unknown>) => void }) => (
    <div data-testid="track-info-step">
      <button onClick={() => updateState({ trackTitle: 'Test Track' })}>Set Title</button>
    </div>
  ),
}))

vi.mock('../steps/GenreVibeStep', () => ({
  GenreVibeStep: ({ updateState }: { updateState: (updates: Record<string, unknown>) => void }) => (
    <div data-testid="genre-vibe-step">
      <button onClick={() => updateState({ genres: ['Electronic'] })}>Set Genre</button>
    </div>
  ),
}))

vi.mock('../steps/GoalsStep', () => ({
  GoalsStep: ({ updateState }: { updateState: (updates: Record<string, unknown>) => void }) => (
    <div data-testid="goals-step">
      <button onClick={() => updateState({ goals: ['playlist'] })}>Set Goal</button>
    </div>
  ),
}))

vi.mock('../steps/DiscoveryStep', () => ({
  DiscoveryStep: ({
    onComplete,
    updateState,
  }: {
    onComplete: () => void
    updateState: (updates: Record<string, unknown>) => void
  }) => (
    <div data-testid="discovery-step">
      <button
        onClick={() => {
          updateState({ status: 'complete' })
          onComplete()
        }}
      >
        Complete Discovery
      </button>
    </div>
  ),
}))

vi.mock('../steps/ResultsStep', () => ({
  ResultsStep: ({ onReset }: { onReset: () => void }) => (
    <div data-testid="results-step">
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}))

vi.mock('../ScoutProgress', () => ({
  ScoutProgress: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="scout-progress">
      Step {currentStep + 1} of {totalSteps}
    </div>
  ),
}))

describe('ScoutWizard', () => {
  it('renders the progress indicator', () => {
    render(<ScoutWizard />)
    expect(screen.getByTestId('scout-progress')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('starts on step 1 (TrackInfoStep)', () => {
    render(<ScoutWizard />)
    expect(screen.getByTestId('track-info-step')).toBeInTheDocument()
  })

  it('shows Continue button on step 1', () => {
    render(<ScoutWizard />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('does not show Back button on step 1', () => {
    render(<ScoutWizard />)
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('Continue button is disabled when step requirements not met', () => {
    render(<ScoutWizard />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
  })

  it('Continue button is enabled when step requirements are met', () => {
    render(<ScoutWizard />)

    // Set the track title to satisfy step 1 requirements
    const setTitleButton = screen.getByRole('button', { name: 'Set Title' })
    fireEvent.click(setTitleButton)

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).not.toBeDisabled()
  })

  it('advances to step 2 when Continue is clicked and requirements met', () => {
    render(<ScoutWizard />)

    // Set the track title
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))

    // Click Continue
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    // Should now be on step 2
    expect(screen.getByTestId('genre-vibe-step')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
  })

  it('shows Back button on step 2', () => {
    render(<ScoutWizard />)

    // Navigate to step 2
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('goes back to step 1 when Back is clicked on step 2', () => {
    render(<ScoutWizard />)

    // Navigate to step 2
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    // Should be back on step 1
    expect(screen.getByTestId('track-info-step')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('shows "Start Scout" button on step 3 instead of "Continue"', () => {
    render(<ScoutWizard />)

    // Navigate through steps 1 and 2
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Genre' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    // On step 3, button text should be "Start Scout"
    expect(screen.getByRole('button', { name: 'Start Scout' })).toBeInTheDocument()
  })

  it('hides navigation footer on discovery step (step 4)', () => {
    render(<ScoutWizard />)

    // Navigate through steps 1, 2, and 3
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Genre' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start Scout' }))

    // Should be on discovery step (step 4)
    expect(screen.getByTestId('discovery-step')).toBeInTheDocument()

    // Navigation footer should be hidden
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('advances to results step when discovery completes', () => {
    render(<ScoutWizard />)

    // Navigate through all steps
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Genre' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start Scout' }))

    // Complete discovery
    fireEvent.click(screen.getByRole('button', { name: 'Complete Discovery' }))

    // Should be on results step
    expect(screen.getByTestId('results-step')).toBeInTheDocument()
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
  })

  it('resets to step 1 when reset is triggered from results', () => {
    render(<ScoutWizard />)

    // Navigate through all steps to results
    fireEvent.click(screen.getByRole('button', { name: 'Set Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Genre' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    fireEvent.click(screen.getByRole('button', { name: 'Set Goal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start Scout' }))

    fireEvent.click(screen.getByRole('button', { name: 'Complete Discovery' }))

    // Click Reset
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    // Should be back on step 1
    expect(screen.getByTestId('track-info-step')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })
})
