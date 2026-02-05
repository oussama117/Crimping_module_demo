import { ErrorObject, Levels, TrialRow } from '@/types'
import { ElectronAPI } from '@electron-toolkit/preload'

export interface ICustomAPI {
  requestAppClose: () => void
  createOrGetCandidate: (candidate_name: string, serial_number: number) => Promise<CandidateRow>
  getTrialJoinCandidate: () => Promise<any[]> // Replace any with your specific join type
  getSettings: () => Promise<AppSettings>
  updateSettings: (settings: AppSettings) => Promise<ErrorObject>
  updateLanguage: (language: Languages) => Promise<ErrorObject>
  getTrialByCandidateId: (candidateId: number) => Promise<TrialRow>
  updateTrial: (trial: TrialRow) => Promise<ErrorObject>
  deleteCandidateAndTrial: (candidateId: number) => Promise<any>
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
