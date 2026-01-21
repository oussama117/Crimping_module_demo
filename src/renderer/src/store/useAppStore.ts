import { create } from 'zustand'
import { TrailJoinCandidate } from '@/types'

// Define the shape of your state
interface AppState {
  // Data State
  currentCandidate: TrailJoinCandidate | null
  activeLevel: string | null

  // Actions (Functions to update state)
  setCurrentCandidate: (candidate: TrailJoinCandidate | null) => void
  setActiveLevel: (level: string) => void
  resetSession: () => void
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  currentCandidate: null,
  activeLevel: 'level_1',

  setCurrentCandidate: (candidate) => set({ currentCandidate: candidate }),

  setActiveLevel: (level) => set({ activeLevel: level }),

  resetSession: () =>
    set({
      currentCandidate: null,
      activeLevel: 'level_1'
    })
}))
