import sqlite3Pkg from 'sqlite3'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Always resolve the database path relative to this file
const dbPath = path.join(__dirname, '../db/database.sqlite')

const sqlite3 = sqlite3Pkg.verbose()
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message)
  } else {
    console.log(`SQLite database connected at ${dbPath}`)
  }
})

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`)

// Register new user
const registerUser = async (email, password, callback) => {
  const hashed = await bcrypt.hash(password, 10)
  const query = `INSERT INTO users (email, password) VALUES (?, ?)`
  db.run(query, [email, hashed], callback)
}

// Find user by email
const findUser = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?'
  db.get(query, [email], callback)
}

export {
  registerUser,
  findUser
}
