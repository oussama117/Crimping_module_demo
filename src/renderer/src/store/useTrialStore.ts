import { TrialRow } from '@/types'
import { create } from 'zustand'

interface TrialStore {
  trial: TrialRow
  setTrial: (trial: TrialRow) => void
  resetTrial: () => void
}

export const useTrialStore = create<TrialStore>((set) => ({
  trial: {
    id: null,
    candidate_id: null,
    turns_m: null,
    remaining_time: null,
    result: null,
    level: null,
    class: null
  },
  setTrial: (trial) => set({ trial }),
  resetTrial: () =>
    set({
      trial: {
        id: null,
        candidate_id: null,
        turns_m: null,
        remaining_time: null,
        result: null,
        level: null,
        class: null
      }
    })
}))
