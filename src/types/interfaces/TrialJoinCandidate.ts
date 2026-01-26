import { Classifications } from '../enums/classification'
import { Levels } from '../enums/levels'
import { Results } from '../enums/result'

export interface TrialJoinCandidate {
  id: number | null
  candidateId: number | null
  turns_m: number | null
  remaining_time: number | null
  result: Results | null
  level: Levels | null
  class: Classifications | null
  created_at: string | null
  updated_at: string | null
  candidate: {
    id: number | null
    candidate_name: string | null
    serial_number: number | null
    created_at: string | null
    updated_at: string | null
  } | null
}
