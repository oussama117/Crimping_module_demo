import {
  AppSettings,
  CandidateRow,
  ErrorObject,
  Languages,
  TrailJoinCandidate,
  TrailRow
} from '@/types'

export default class apis {
  public static async getSettings(): Promise<AppSettings> {
    return await window.api.getSettings()
  }

  public static async updateSettings(settings: AppSettings): Promise<ErrorObject> {
    return await window.api.updateSettings(settings)
  }

  public static async updateLangauge(language: Languages): Promise<ErrorObject> {
    return await window.api.updateLanguage(language)
  }

  public static async getCandidate(name: string, serial: number): Promise<CandidateRow> {
    return await window.api.createOrGetCandidate(name, serial)
  }
  public static async getTrailByCandidateId(candidateId: number): Promise<TrailRow> {
    return await window.api.getTrailByCandidateId(candidateId)
  }

  public static async updateTrail(trail: TrailRow): Promise<ErrorObject> {
    return await window.api.updateTrail(trail)
  }

  public static async getAllTrailJoinCandidate(): Promise<TrailJoinCandidate[]> {
    return await window.api.getTrailJoinCandidate()
  }

  public static async deleteCandidateAndTrail(candidateId: number): Promise<TrailJoinCandidate[]> {
    return await window.api.deleteCandidateAndTrail(candidateId)
  }

  public static async deleteManually(candidateId: number): Promise<TrailJoinCandidate[]> {
    return await window.api.deleteManually(candidateId)
  }
}
