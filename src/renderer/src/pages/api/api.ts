import {
  AppSettings,
  CandidateRow,
  ErrorObject,
  Languages,
  TrialJoinCandidate,
  TrialRow
} from '@/types'

export default class apis {
  public static async getCandidate(name: string, serial: number): Promise<CandidateRow> {
    return await window.api.createOrGetCandidate(name, serial)
  }

  public static async getTrialByCandidateId(candidateId: number): Promise<TrialRow> {
    return await window.api.getTrialByCandidateId(candidateId)
  }

  public static async updateTrial(trial: TrialRow): Promise<ErrorObject> {
    return await window.api.updateTrial(trial)
  }

  public static async getAllTrialJoinCandidate(): Promise<TrialJoinCandidate[]> {
    return await window.api.getTrialJoinCandidate()
  }

  public static async deleteCandidateAndTrial(candidateId: number): Promise<TrialJoinCandidate[]> {
    return await window.api.deleteCandidateAndTrial(candidateId)
  }

  public static async deleteManually(candidateId: number): Promise<TrialJoinCandidate[]> {
    return await window.api.deleteManually(candidateId)
  }

  public static async getSettings(): Promise<AppSettings> {
    return await window.api.getSettings()
  }

  public static async updateSettings(settings: AppSettings): Promise<ErrorObject> {
    return await window.api.updateSettings(settings)
  }

  public static async updateLangauge(language: Languages): Promise<ErrorObject> {
    return await window.api.updateLanguage(language)
  }
}
