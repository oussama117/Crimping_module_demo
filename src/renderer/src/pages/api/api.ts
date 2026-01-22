import { AppSettings, CandidateRow, Languages, TrailRow } from '@/types'

export default class apis {
  public static async updateSettings(settings: AppSettings) {
    await (window as any).api.updateSettings(settings)
  }

  public static async updateLangauge(language: Languages) {
    await (window as any).api.updateLanguage(language)
  }

  public static async getCandidate(name: string, serial: number): Promise<CandidateRow> {
    return await (window as any).api.createOrGetCandidate(name, serial)
  }
  public static async getTrailByCandidateId(candidateId: number): Promise<TrailRow> {
    return await (window as any).api.getTrailByCandidateId(candidateId)
  }

  public static async updateTrail(trail: TrailRow): Promise<TrailRow> {
    return await (window as any).api.updateTrail(trail)
  }
}
