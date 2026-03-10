'use client'

import type { DirectorAction } from './directorScript'

interface AsciiDirectorController {
  typeCommand: (text: string) => void
  submitCommand: () => void
}

interface AnalogueDirectorController {
  highlightCardByTitle: (title: string) => void
}

interface XpDirectorController {
  focusLastCompletedRun: () => void
}

interface LoopOSDirectorController {
  playFor: (durationMs: number) => void
  stop: () => void
}

interface AquaDirectorController {
  askCoachAboutPitch: () => void
}

interface CameraDirectorController {
  panTo: (target: 'timeline' | 'inspector' | 'minimap', durationMs: number) => void
  reset: () => void
}

let asciiController: AsciiDirectorController | null = null
let analogueController: AnalogueDirectorController | null = null
let xpController: XpDirectorController | null = null
let looposController: LoopOSDirectorController | null = null
let aquaController: AquaDirectorController | null = null
let cameraController: CameraDirectorController | null = null

export function registerAsciiController(controller: AsciiDirectorController | null) {
  asciiController = controller
}

export function registerAnalogueController(controller: AnalogueDirectorController | null) {
  analogueController = controller
}

export function registerXpController(controller: XpDirectorController | null) {
  xpController = controller
}

export function registerLoopOSController(controller: LoopOSDirectorController | null) {
  looposController = controller
}

export function registerAquaController(controller: AquaDirectorController | null) {
  aquaController = controller
}

export function registerCameraController(controller: CameraDirectorController | null) {
  cameraController = controller
}

export interface DirectorExecutionDeps {
  goToStep: (id: string) => void
  setNote: (note: string | null) => void
  setAmbientIntensityOverride?: (value: number | null) => void
}

export function executeDirectorAction(action: DirectorAction, deps: DirectorExecutionDeps) {
  const { kind, stepId, payload, durationMs } = action

  if (stepId) {
    deps.goToStep(stepId)
  }

  switch (kind) {
    case 'WAIT':
      break
    case 'SET_OS':
      break
    case 'SHOW_NOTE': {
      const text = typeof payload === 'string' ? payload : (payload as any)?.text
      if (typeof text === 'string') {
        deps.setNote(text)
      }
      break
    }
    case 'TYPE_ASCII': {
      if (!asciiController) break
      const text = typeof payload === 'string' ? payload : ''
      if (!text) break
      asciiController.typeCommand(text)
      break
    }
    case 'RUN_ASCII_COMMAND': {
      asciiController?.submitCommand()
      break
    }
    case 'HIGHLIGHT_ANALOGUE_CARD': {
      if (!analogueController) break
      const title = typeof payload === 'string' ? payload : ((payload as any)?.title ?? undefined)
      if (!title) break
      analogueController.highlightCardByTitle(title)
      break
    }
    case 'FOCUS_XP_AGENT_RUN': {
      xpController?.focusLastCompletedRun()
      break
    }
    case 'PAN_CAMERA': {
      if (!cameraController) break
      const target = (payload as any)?.target ?? 'timeline'
      const duration = durationMs ?? 2000
      cameraController.panTo(target, duration)
      break
    }
    case 'PLAY_LOOPOS': {
      if (!looposController) break
      const duration = durationMs ?? 2500
      looposController.playFor(duration)
      break
    }
    case 'STOP_LOOPOS': {
      looposController?.stop()
      break
    }
    case 'OPEN_AQUA_AGENT': {
      aquaController?.askCoachAboutPitch()
      break
    }
    case 'SET_AMBIENT_INTENSITY': {
      const value = typeof payload === 'number' ? payload : ((payload as any)?.value ?? undefined)
      if (typeof value === 'number') {
        deps.setAmbientIntensityOverride?.(value)
      }
      break
    }
    default:
      break
  }
}
