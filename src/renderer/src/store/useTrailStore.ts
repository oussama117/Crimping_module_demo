import { TrailRow } from '@/types'
import { create } from 'zustand'

interface TrailStore {
  trail: TrailRow
  setTrail: (trail: TrailRow) => void
  resetTrail: () => void
}

export const useTrailStore = create<TrailStore>((set) => ({
  trail: {
    id: null,
    candidate_id: null,
    turns_m: null,
    elapsed_time: null,
    result: null,
    level: null
  },
  setTrail: (trail) => set({ trail }),
  resetTrail: () =>
    set({
      trail: {
        id: null,
        candidate_id: null,
        turns_m: null,
        elapsed_time: null,
        result: null,
        level: null
      }
    })
}))
