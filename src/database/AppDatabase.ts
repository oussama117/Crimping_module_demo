import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { __SCHEMA } from './schema/schema'

// type trail = {
//   id?: number
//   employee_name: string
//   registration_number: number
//   turns_m?: number
//   result?: 'success' | 'failure'
//   level?: 'beginner' | 'intermediate' | 'advanced'
// }

class AppDatabase {
  private db: Database.Database

  constructor() {
    // Persistent storage path
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'taping_db.sqlite')

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    // Open connection (Synchronous)
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    console.log('Database connected at:', dbPath)

    this.init()
  }

  private init(): void {
    try {
      // .exec handles the entire multi-line schema (Table + Trigger)
      this.db.exec(__SCHEMA)
      console.log('Trail table and triggers initialized.')
    } catch (err) {
      console.error('Schema initialization failed:', err)
    }
  }
  public addNewTrail(employee_name: string, registration_number: number): any {
    const stmt = this.db.prepare(`
       INSERT INTO trail (employee_name, registration_number, turns_m, result, level)
       VALUES (?, ?, 0, 'failure', 'beginner')`)
    const trailResult = stmt.run(employee_name, registration_number)
    console.log('New trail added ID: ', trailResult.lastInsertRowid)
    if (trailResult.changes === 0) {
      throw new Error('Failed to insert new trail record.')
    } else {
      const stmtReturn = this.db.prepare(`SELECT * FROM trail WHERE id = ?`)
      console.log('New trail added: ', stmtReturn)
      return stmtReturn.run(trailResult.lastInsertRowid)
    }
  }

  deleteTrail(id: number): void {
    const stmt = this.db.prepare(`DELETE FROM trail WHERE id = ?`)
    stmt.run(id)
  }

  updateTrailResult(
    id: number,
    result: 'success' | 'failure',
    level: 'beginner' | 'intermediate' | 'advanced',
    turns_m: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE trail
      SET result = ?, turns_m = ?, level = ?
      WHERE id = ?`)
    stmt.run(result, turns_m, level, id)
  }

  // Method to fetch all trails (for your Shadcn tables later)
  public getAllTrails() {
    return this.db.prepare('SELECT * FROM trail ORDER BY created_at DESC').all()
  }
  closeDB(): void {
    this.db.close()
    console.log('Database connection closed.')
  }
}

export default AppDatabase // Export as a singleton for easy use
