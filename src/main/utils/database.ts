import sqlite3 from 'sqlite3'
import { app } from 'electron'
import path from 'path'

class DatabaseManager {
  private static instance: sqlite3.Database

  static getDB(): sqlite3.Database {
    if (!this.instance) {
      const userDataPath = app.getPath('userData')
      const dbPath = path.join(userDataPath, 'projects.sqlite')
      this.instance = new sqlite3.Database(dbPath)
      this.initializeDatabase()
    }
    return this.instance
  }

  private static initializeDatabase(): void {
    this.instance.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          tags TEXT,
          status TEXT,
        );

        CREATE TABLE IF NOT EXISTS contributors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          gh_id TEXT NOT NULL,
          icon TEXT
        );
      `)
  }
}

export { DatabaseManager }
