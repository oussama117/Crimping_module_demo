import { Classifications } from '../enums/classification'
import { Levels } from '../enums/levels'
import { Results } from '../enums/result'

export interface TrialRow {
  id: number | null
  candidate_id: number | null
  turns_m: number | null
  remaining_time: number | null
  result: Results | null
  level: Levels | null
  class: Classifications | null
}
