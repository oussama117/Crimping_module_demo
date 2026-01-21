import { Levels } from '../enums/levels'

export interface TrailJoinCandidate {
  id: number | null
  turns_m: number | null
  time_elapsed: number | null
  result: string | null
  level: Levels | null
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
