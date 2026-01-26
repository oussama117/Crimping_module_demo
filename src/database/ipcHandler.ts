import { ipcMain } from 'electron'
import AppDatabase from './AppDatabase'
import { AppSettings, Languages, TrialRow } from '@/types'

export default function databaseHandler(db: AppDatabase) {
  ipcMain.handle('candidate::create/get', (_e, candidate_name: string, serial_number: number) => {
    return db.createOrGetCandidate(candidate_name, serial_number)
  })
  ipcMain.handle('trial/candidate::getAll', (_e) => {
    return db.getAllTrialJoinCandidate()
  })
  ipcMain.handle('trial::getByCandidateId', (_e, candidateId: number) => {
    return db.getTrialByCandidateId(candidateId)
  })
  ipcMain.handle('trial::updateTrial', (_e, trial: TrialRow) => {
    return db.updateTrial(trial)
  })
  ipcMain.handle('candidate/trial::delete', (_e, candidateId: number) => {
    return db.deleteCandidateAndTrial(candidateId)
  })
  ipcMain.handle('candidate/trial::deleteManually', (_e, candidateId: number) => {
    return db.deleteManually(candidateId)
  })
  ipcMain.handle('settings::getSetting', (_e) => {
    return db.getSettings()
  })
  ipcMain.handle('settings::updateSetting', (_e, settings: AppSettings) => {
    return db.updateSettings(settings)
  })
  ipcMain.handle('settings::updateLaguage', (_e, language: Languages) => {
    return db.updateLanguage(language)
  })
}
