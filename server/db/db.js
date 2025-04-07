import sqlite3Pkg from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'database.sqlite')

const sqlite3 = sqlite3Pkg.verbose()
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message)
  } else {
    console.log(`SQLite database connected at ${dbPath}`)
  }
})

export default db 