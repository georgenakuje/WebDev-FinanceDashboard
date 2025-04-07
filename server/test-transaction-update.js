import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, './db/database.sqlite')

const db = new sqlite3.Database(dbPath)

// Test data
const testUserId = 1
const testTransactionId = 4  // Using an existing transaction ID from your database
const testUpdate = {
    description: 'Updated Test Transaction',
    amount: 1500.00,
    date: '2024-04-08'
}

async function testTransactionUpdate() {
    console.log('Starting transaction update test...')
    
    // 1. First verify the transaction exists
    db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', 
        [testTransactionId, testUserId], 
        (err, row) => {
            if (err) {
                console.error('Error checking transaction:', err)
                return
            }
            
            if (!row) {
                console.error(`Transaction ${testTransactionId} not found for user ${testUserId}`)
                return
            }
            
            console.log('Transaction found:', row)
            
            // 2. Attempt to update the transaction
            const updateQuery = `
                UPDATE transactions 
                SET description = ?, amount = ?, date = ? 
                WHERE id = ? AND user_id = ?
            `
            
            db.run(updateQuery, 
                [testUpdate.description, testUpdate.amount, testUpdate.date, testTransactionId, testUserId],
                function(err) {
                    if (err) {
                        console.error('Error updating transaction:', err)
                        return
                    }
                    
                    console.log(`Update result: ${this.changes} changes made`)
                    
                    // 3. Verify the update was successful
                    db.get('SELECT * FROM transactions WHERE id = ?', 
                        [testTransactionId], 
                        (err, updatedRow) => {
                            if (err) {
                                console.error('Error verifying update:', err)
                                return
                            }
                            
                            console.log('Updated transaction:', updatedRow)
                            
                            // Verify the values were updated correctly
                            if (updatedRow.description === testUpdate.description &&
                                updatedRow.amount === testUpdate.amount &&
                                updatedRow.date === testUpdate.date) {
                                console.log('✅ Test passed: Transaction updated successfully')
                            } else {
                                console.error('❌ Test failed: Transaction not updated correctly')
                                console.log('Expected:', testUpdate)
                                console.log('Actual:', {
                                    description: updatedRow.description,
                                    amount: updatedRow.amount,
                                    date: updatedRow.date
                                })
                            }
                            
                            // Close the database connection
                            db.close()
                        }
                    )
                }
            )
        }
    )
}

// Run the test
testTransactionUpdate() 