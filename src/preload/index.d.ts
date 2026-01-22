import { TrailRow } from '@/types'
import { ElectronAPI } from '@electron-toolkit/preload'

export interface ICustomAPI {
  createOrGetCandidate: (candidate_name: string, serial_number: number) => Promise<CandidateRow>
  getTrailJoinCandidate: () => Promise<any[]> // Replace any with your specific join type
  getSettings: () => Promise<AppSettings>
  updateSettings: (settings: AppSettings) => Promise<void>
  updateLanguage: (language: Languages) => Promise<void>
  getTrailByCandidateId: (candidateId: number) => Promise<TrailRow>
  updateTrail: (trail: TrailRow) => Promise<TrailRow>
}

export interface ICustomHardware {
  sendCommand: (command: string) => Promise<boolean>
  onData: (callback: (data: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ICustomAPI
    hardware: ICustomHardware
  }
}
