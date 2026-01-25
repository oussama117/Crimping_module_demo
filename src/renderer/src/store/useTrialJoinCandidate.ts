import { TrailJoinCandidate } from '@/types'
import { create } from 'zustand'

interface TrailCandidateStore {
  join: TrailJoinCandidate[]
  setTrialJoinCnadidate: (join: TrailJoinCandidate[]) => void
}

export const useTrailCandidateStore = create<TrailCandidateStore>((set) => ({
  join: [],
  setTrialJoinCnadidate: (join) => set({ join })
}))
