import { Levels } from '../enums/levels'
import { Results } from '../enums/result'

export interface TrailRow {
  id: number | null
  candidate_id: number | null
  turns_m: number | null
  elapsed_time: number | null
  result: Results | null
  level: Levels | null
}
