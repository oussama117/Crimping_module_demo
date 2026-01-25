import { ErrorObject, TrailRow } from '@/types'
import { ElectronAPI } from '@electron-toolkit/preload'

export interface ICustomAPI {
  requestAppClose: () => void
  createOrGetCandidate: (candidate_name: string, serial_number: number) => Promise<CandidateRow>
  getTrailJoinCandidate: () => Promise<any[]> // Replace any with your specific join type
  getSettings: () => Promise<AppSettings>
  updateSettings: (settings: AppSettings) => Promise<ErrorObject>
  updateLanguage: (language: Languages) => Promise<ErrorObject>
  getTrailByCandidateId: (candidateId: number) => Promise<TrailRow>
  updateTrail: (trail: TrailRow) => Promise<ErrorObject>
  deleteCandidateAndTrail: (candidateId: number) => Promise<any>
  deleteManually: (candidateId: number) => Promise<any>
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
