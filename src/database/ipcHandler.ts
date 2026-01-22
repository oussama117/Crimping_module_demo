import { ipcMain } from 'electron'
import AppDatabase from './AppDatabase'
import { AppSettings, Languages, TrailRow } from '@/types'

export default function databaseHandler(db: AppDatabase) {
  ipcMain.handle('candidate::create/get', (e, candidate_name: string, serial_number: number) => {
    return db.createOrGetCandidate(candidate_name, serial_number)
  })
  ipcMain.handle('trail/candidate::getAll', (e) => {
    return db.getAllTrailJoinCandidate()
  })
  ipcMain.handle('trail::getByCandidateId', (e, candidateId: number) => {
    return db.getTrailByCandidateId(candidateId)
  })
  ipcMain.handle('settings::getSetting', (e) => {
    return db.getSettings()
  })
  ipcMain.handle('settings::updateSetting', (e, settings: AppSettings) => {
    return db.updateSettings(settings)
  })
  ipcMain.handle('settings::updateLaguage', (e, language: Languages) => {
    return db.updateLanguage(language)
  })
  ipcMain.handle('trail::updateTrail', (e, trail: TrailRow) => {
    return db.updateTrail(trail)
  })
}
