import { ipcMain } from 'electron'
import AppDatabase from './AppDatabase'

export default function databaseHandler(db: AppDatabase) {
  ipcMain.handle('trail::add', (event, employee_name: string, registration_number: number) => {
    return db.addNewTrail(employee_name, registration_number)
  })
}
