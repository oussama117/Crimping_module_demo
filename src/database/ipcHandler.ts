import { ipcMain } from 'electron'
import AppDatabase from './AppDatabase'
import { AppSettings, Languages, TrailRow } from '@/types'

export default function databaseHandler(db: AppDatabase) {
  ipcMain.handle('candidate::create/get', (_e, candidate_name: string, serial_number: number) => {
    return db.createOrGetCandidate(candidate_name, serial_number)
  })
  ipcMain.handle('trail/candidate::getAll', (_e) => {
    return db.getAllTrailJoinCandidate()
  })
  ipcMain.handle('trail::getByCandidateId', (_e, candidateId: number) => {
    return db.getTrailByCandidateId(candidateId)
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
  ipcMain.handle('trail::updateTrail', (_e, trail: TrailRow) => {
    return db.updateTrail(trail)
  })
  ipcMain.handle('candidate/trail::delete', (_e, candidateId: number) => {
    return db.deleteCandidateAndTrail(candidateId)
  })
  ipcMain.handle('candidate/trail::deleteManually', (_e, candidateId: number) => {
    return db.deleteManually(candidateId)
  })
}
