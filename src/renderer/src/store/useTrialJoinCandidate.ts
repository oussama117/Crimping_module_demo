import { TrialJoinCandidate } from '@/types'
import { create } from 'zustand'

interface TrialCandidateStore {
  join: TrialJoinCandidate[]
  setTrialJoinCnadidate: (join: TrialJoinCandidate[]) => void
}

export const useTrialCandidateStore = create<TrialCandidateStore>((set) => ({
  join: [],
  setTrialJoinCnadidate: (join) => set({ join })
}))
