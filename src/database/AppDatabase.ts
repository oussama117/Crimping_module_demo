import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { __SCHEMA } from './schema/schema'
import {
  TrailJoinCandidate,
  TrailRow,
  CandidateRow,
  ReturnCandidateDTO,
  AppSettings,
  Languages,
  Levels
} from '@/types'

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
    this.db.pragma('foreign_keys = ON')
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

  public getAllTrailJoinCandidate(): TrailJoinCandidate[] {
    try {
      // Use aliases to prevent column name collisions
      const sql = `
      SELECT 
        t.id as t_id, t.turns_m, t.seconds_elapsed, t.result, t.level, 
        t.created_at as t_created, t.updated_at as t_updated,
        c.id as c_id, c.candidate_name, c.serial_number, 
        c.created_at as c_created, c.updated_at as c_updated
      FROM trail t
      LEFT JOIN candidate c ON t.candidate_id = c.id
      ORDER BY t.created_at DESC
    `

      const stmt = this.db.prepare(sql)
      const rows = stmt.all() as any[]

      // Map flat rows into your nested interface
      return rows.map((row) => ({
        id: row.t_id,
        turns_m: row.turns_m,
        time_elapsed: row.seconds_elapsed,
        result: row.result,
        level: row.level,
        created_at: row.t_created,
        updated_at: row.t_updated,
        candidate: row.c_id
          ? {
              id: row.c_id,
              candidate_name: row.candidate_name,
              serial_number: row.serial_number ? Number(row.serial_number) : null,
              created_at: row.c_created,
              updated_at: row.c_updated
            }
          : null
      }))
    } catch (error) {
      // Log the error for the developer
      console.error('SQL Error in getAllTrailJoinCandidate:', error)

      // Return an empty array so the Frontend can still render (showing 0 results)
      return []
    }
  }

  public getCandidateBySerial(serial_number: string): ReturnCandidateDTO {
    try {
      const stmt = this.db.prepare('SELECT * FROM candidate WHERE serial_number = ?')
      const result = stmt.get(serial_number) as CandidateRow | undefined

      if (result) {
        return {
          exists: true,
          id: result.id,
          candidate_name: result.candidate_name,
          serial_number: result.serial_number as number,
          error: null
        }
      }

      return {
        exists: true,
        id: null,
        candidate_name: null,
        serial_number: null,
        error: null
      }
    } catch (err) {
      return {
        exists: false,
        id: null,
        candidate_name: null,
        serial_number: null,
        error: err
      }
    }
  }

  public createOrGetCandidate(candidate_name: string, serial_number: number): CandidateRow {
    const serialStr = serial_number.toString()

    // 1. Check for existing candidate
    const checkResult = this.getCandidateBySerial(serialStr)

    if (checkResult.error) {
      throw new Error('Database error during check: ' + checkResult.error)
    }

    // 2. If exists, fetch and return the full row
    if (checkResult.exists && checkResult.id) {
      return {
        id: checkResult.id,
        candidate_name: checkResult.candidate_name,
        serial_number: checkResult.serial_number
      } as CandidateRow
    }

    // 3. If doesn't exist, create it using RETURNING *
    try {
      const createStmt = this.db.prepare(`
      INSERT INTO candidate (candidate_name, serial_number)
      VALUES (?, ?)
      RETURNING *
    `)

      const newCandidate = createStmt.get(candidate_name, serialStr) as CandidateRow | undefined

      if (!newCandidate) {
        throw new Error('Failed to create candidate: No data returned')
      }

      const trailStmt = this.db.prepare(`
      INSERT INTO trail ( candidate_id, turns_m, time_elapsed, result, level )
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)
      const newTrail = trailStmt.get(newCandidate.id, -1, -1, 'init', 'level_init')
      if (!newTrail) {
        throw new Error('Failed to create trail: No data returned')
      }
      return newCandidate
    } catch (err) {
      throw new Error(
        'Failed to insert new candidate: ' + (err instanceof Error ? err.message : err)
      )
    }
  }

  public deleteCandidateAndTrail(candidateId: number): { success: boolean; error: any } {
    try {
      const stmt = this.db.prepare('DELETE FROM candidate WHERE id = ?')
      const result = stmt.run(candidateId)

      if (result.changes > 0) {
        return { success: true, error: null }
      } else {
        return { success: false, error: 'Candidate not found' }
      }
    } catch (error) {
      console.error('SQL Delete Error:', error)
      return { success: false, error: error }
    }
  }

  public deleteManually(candidateId: number): { success: boolean; error: any } {
    const deleteTransaction = this.db.transaction((id: number) => {
      // 1. Delete associated trails first
      this.db.prepare('DELETE FROM trail WHERE candidate_id = ?').run(id)

      // 2. Then delete the candidate
      const result = this.db.prepare('DELETE FROM candidate WHERE id = ?').run(id)

      return result.changes > 0
    })

    try {
      const success = deleteTransaction(candidateId)
      return { success, error: null }
    } catch (error) {
      return { success: false, error: error }
    }
  }
  public getTrailByCandidateId(candidateId: number): TrailRow {
    return this.db
      .prepare(`SELECT * FROM trail WHERE candidate_id = ?`)
      .get(candidateId) as TrailRow
  }
  updateTrailResult(id: number, result: TrailRow, level: Levels, turns_m: number): void {
    const stmt = this.db.prepare(`
      UPDATE trail
      SET result = ?, turns_m = ?, level = ?
      WHERE candidateId = ?`)
    stmt.run(result, turns_m, level, id)
  }

  // Method to fetch all trails (for your Shadcn tables later)
  public getAllTrails(): TrailRow[] {
    return this.db.prepare('SELECT * FROM trail ORDER BY created_at DESC').all() as TrailRow[]
  }
  public getAllCandidates(): CandidateRow[] {
    return this.db
      .prepare('SELECT * FROM candidate ORDER BY created_at DESC')
      .all() as CandidateRow[]
  }
  public getSettings(): AppSettings {
    return this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get() as AppSettings
  }
  public updateSettings(appSetting: AppSettings) {
    console.log('Updating settings in DB: ', appSetting)

    const stmt = this.db.prepare(`
      UPDATE app_settings SET language = ?, trail_time = ?, level_1 = ?, level_2 = ?, level_3 = ?
      WHERE id = 1`)
    stmt.run(
      appSetting.language === Languages.fr
        ? Languages.fr
        : appSetting.language === Languages.en
          ? Languages.en
          : Languages.ar,
      appSetting.trail_time,
      appSetting.level_1,
      appSetting.level_2,
      appSetting.level_3
    )
  }
  public updateLanguage(language: Languages) {
    const stmt = this.db.prepare(`
      UPDATE app_settings SET language = ?
      WHERE id = 1`)
    const result = stmt.run(
      language === Languages.fr
        ? Languages.fr
        : language === Languages.en
          ? Languages.en
          : Languages.ar
    )
    console.log('Language update result:', result)
  }
  // Close the database connection gracefully
  closeDB(): void {
    this.db.close()
    console.log('Database connection closed.')
  }
}

export default AppDatabase // Export as a singleton for easy use
