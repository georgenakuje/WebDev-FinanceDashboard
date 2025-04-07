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
    // Verify we can write to the database
    db.run('SELECT 1', (err) => {
      if (err) {
        console.error('Database write test failed:', err)
      } else {
        console.log('Database write test successful')
      }
    })
  }
})

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err)
  } else {
    console.log('Users table verified/created')
  }
})

// Create transactions table
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating transactions table:', err)
  } else {
    console.log('Transactions table verified/created')
  }
})

// Register new user
const registerUser = async (email, password, callback) => {
  console.log('Attempting to register user:', email)
  try {
    const hashed = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`
    console.log('Executing query:', query, 'with values:', [email, hashed.substring(0, 10) + '...'])
    
    db.run(query, [email, hashed], function(err) {
      if (err) {
        console.error('SQL Error during registration:', err)
        callback(err)
      } else {
        console.log(`User registered successfully with ID: ${this.lastID}`)
        // Verify the user was actually inserted
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error verifying user insertion:', err)
          } else if (!row) {
            console.error('User verification failed - no row found')
          } else {
            console.log('User verification successful:', row.email)
          }
        })
        callback(null)
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    callback(error)
  }
}

// Find user by email
const findUser = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?'
  db.get(query, [email], callback)
}

// Transaction functions
const addTransaction = (userId, description, amount, date) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO transactions (user_id, description, amount, date) VALUES (?, ?, ?, ?)`
    db.run(query, [userId, description, amount, date], function(err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, user_id: userId, description, amount, date })
    })
  })
}

const getTransactions = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`
    db.all(query, [userId], (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

const deleteTransaction = (transactionId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM transactions WHERE id = ? AND user_id = ?`
    db.run(query, [transactionId, userId], function(err) {
      if (err) reject(err)
      else resolve(this.changes > 0)
    })
  })
}

const updateTransaction = (transactionId, userId, description, amount, date) => {
  return new Promise((resolve, reject) => {
    // First verify the transaction exists and belongs to the user
    db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId], (err, row) => {
      if (err) {
        console.error('Error checking transaction:', err)
        reject(err)
        return
      }
      
      if (!row) {
        console.log(`Transaction ${transactionId} not found for user ${userId}`)
        resolve(null)
        return
      }
      
      console.log('Found transaction:', row)
      
      // Proceed with update
      const query = `UPDATE transactions 
                    SET description = ?, amount = ?, date = ? 
                    WHERE id = ? AND user_id = ?`
      
      db.run(query, [description, amount, date, transactionId, userId], function(err) {
        if (err) {
          console.error('Error updating transaction:', err)
          reject(err)
          return
        }
        
        // Return the updated transaction
        db.get('SELECT * FROM transactions WHERE id = ?', [transactionId], (err, updatedRow) => {
          if (err) {
            console.error('Error fetching updated transaction:', err)
            reject(err)
            return
          }
          
          console.log('Updated transaction:', updatedRow)
          resolve(updatedRow)
        })
      })
    })
  })
}

export {
  registerUser,
  findUser,
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
}
