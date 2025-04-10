import sqlite3Pkg from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../db/database.sqlite");

const sqlite3 = sqlite3Pkg.verbose();
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
  } else {
    console.log(`SQLite database connected at ${dbPath}`);
    db.run("SELECT 1", (err) => {
      if (err) {
        console.error("Database write test failed:", err);
      } else {
        console.log("Database write test successful");
      }
    });
  }
});

// Create the users table if it doesn't exist
db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table verified/created");
    }
  }
);

// Create transactions table
db.run(
  `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating transactions table:", err);
    } else {
      console.log("Transactions table verified/created");
    }
  }
);

// Create settings table
db.run(
  `
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark')),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'JPY', 'GBP', 'CAD', 'AUD')),
    email_notifications BOOLEAN DEFAULT 0,
    budget_alerts BOOLEAN DEFAULT 0,
    last_password_change TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating settings table:", err);
    } else {
      console.log("Settings table verified/created");
    }
  }
);

// Register new user
const registerUser = async (email, password, callback) => {
  console.log("Attempting to register user:", email);
  try {
    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashed],
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            console.error("SQL Error during registration:", err);
            callback(err);
            return;
          }

          const userId = this.lastID;

          // Create default settings for new user
          db.run(
            `INSERT INTO user_settings (user_id, theme, currency, email_notifications, budget_alerts)
             VALUES (?, 'light', 'USD', 0, 0)`,
            [userId],
            (err) => {
              if (err) {
                db.run("ROLLBACK");
                console.error("Error creating user settings:", err);
                callback(err);
                return;
              }

              db.run("COMMIT");
              callback(null);
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Registration error:", error);
    callback(error);
  }
};

// Settings functions
const getSettings = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM user_settings WHERE user_id = ?",
      [userId],
      (err, settings) => {
        if (err) reject(err);
        else resolve(settings);
      }
    );
  });
};

const updateSettings = (userId, settings) => {
  return new Promise((resolve, reject) => {
    const { theme, currency, email_notifications, budget_alerts } = settings;

    db.run(
      `UPDATE user_settings 
       SET theme = ?, 
           currency = ?, 
           email_notifications = ?, 
           budget_alerts = ?
       WHERE user_id = ?`,
      [theme, currency, email_notifications, budget_alerts, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

const updatePassword = (userId, newPasswordHash) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET password = ? WHERE id = ?`,
      [newPasswordHash, userId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }

        // Update last password change timestamp
        db.run(
          `UPDATE user_settings 
           SET last_password_change = datetime('now')
           WHERE user_id = ?`,
          [userId],
          (err) => {
            if (err) reject(err);
            else resolve(this.changes > 0);
          }
        );
      }
    );
  });
};

const updateEmail = (userId, newEmail) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET email = ? WHERE id = ?`,
      [newEmail, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

// Find user by email
const findUser = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  db.get(query, [email], callback);
};

// Transaction functions
const addTransaction = (userId, description, amount, date) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO transactions (user_id, description, amount, date) VALUES (?, ?, ?, ?)`;
    db.run(query, [userId, description, amount, date], function (err) {
      if (err) reject(err);
      else
        resolve({
          id: this.lastID,
          user_id: userId,
          description,
          amount,
          date,
        });
    });
  });
};

const getTransactions = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`;
    db.all(query, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const deleteTransaction = (transactionId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM transactions WHERE id = ? AND user_id = ?`;
    db.run(query, [transactionId, userId], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
};

const updateTransaction = (
  transactionId,
  userId,
  description,
  amount,
  date
) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [transactionId, userId],
      (err, row) => {
        if (err) {
          console.error("Error checking transaction:", err);
          reject(err);
          return;
        }

        if (!row) {
          console.log(
            `Transaction ${transactionId} not found for user ${userId}`
          );
          resolve(null);
          return;
        }

        const query = `UPDATE transactions 
                      SET description = ?, amount = ?, date = ? 
                      WHERE id = ? AND user_id = ?`;

        db.run(
          query,
          [description, amount, date, transactionId, userId],
          function (err) {
            if (err) {
              console.error("Error updating transaction:", err);
              reject(err);
              return;
            }

            db.get(
              "SELECT * FROM transactions WHERE id = ?",
              [transactionId],
              (err, updatedRow) => {
                if (err) {
                  console.error("Error fetching updated transaction:", err);
                  reject(err);
                  return;
                }

                resolve(updatedRow);
              }
            );
          }
        );
      }
    );
  });
};

export {
  registerUser,
  findUser,
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSettings,
  updateSettings,
  updatePassword,
  updateEmail,
};
