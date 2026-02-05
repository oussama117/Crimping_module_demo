import { Languages } from '../enums/languages'

export interface AppSettings {
  id: number | null
  language: Languages | null
  terminals: number | null
  module_number: number | null
  level_1: number | null
  level_2: number | null
  level_3: number | null
  created_at: string | null
  updated_at: string | null
}
