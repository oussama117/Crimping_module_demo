import { Levels } from '@/types'
import { create } from 'zustand'

interface LevelStore {
  level: Levels
  setLevel: (level: Levels) => void
  resetLevel: () => void
}

export const useLevelStore = create<LevelStore>((set) => ({
  level: Levels.level_init,
  setLevel: (level) => set({ level }),
  resetLevel: () =>
    set({
      level: Levels.level_init
    })
}))
