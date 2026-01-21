import { CandidateRow } from '@/types'
import { create } from 'zustand'

interface CandidateStore {
  candidate: CandidateRow
  setCandidate: (candidate: CandidateRow) => void
  resetCandidate: () => void
}

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidate: { id: null, candidate_name: null, serial_number: null },
  setCandidate: (candidate) => set({ candidate }),
  resetCandidate: () => set({ candidate: { id: null, candidate_name: null, serial_number: null } })
}))
