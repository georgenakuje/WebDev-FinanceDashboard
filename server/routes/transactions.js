import express from 'express'
import jwt from 'jsonwebtoken'
import { addTransaction, getTransactions, deleteTransaction, updateTransaction } from '../models/Models.js'
import db from '../db/db.js'

const router = express.Router()
const JWT_SECRET = 'WebDev-Finance'

// Test endpoint to verify server is running
router.get('/test', (req, res) => {
    res.json({ message: 'Server is running' })
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err)
            return res.status(403).json({ message: 'Invalid token' })
        }
        req.user = user
        next()
    })
}

// Apply authentication middleware to all routes EXCEPT test
router.use((req, res, next) => {
    if (req.path === '/test') {
        return next()
    }
    authenticateToken(req, res, next)
})

// GET all transactions for the authenticated user
router.get('/', async (req, res) => {
    try {
        const transactions = await getTransactions(req.user.id)
        res.json(transactions)
    } catch (error) {
        console.error('Error getting transactions:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST a new transaction
router.post('/', async (req, res) => {
    const { desc, amount, date } = req.body
    
    if (!desc || amount == null || !date) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
        const transaction = await addTransaction(req.user.id, desc, amount, date)
        res.status(201).json(transaction)
    } catch (error) {
        console.error('Error adding transaction:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// DELETE a transaction
router.delete('/:id', async (req, res) => {
    try {
        const success = await deleteTransaction(req.params.id, req.user.id)
        if (success) {
            res.json({ message: 'Transaction deleted' })
        } else {
            res.status(404).json({ message: 'Transaction not found' })
        }
    } catch (error) {
        console.error('Error deleting transaction:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// PUT update a transaction
router.put('/:id', async (req, res) => {
    const { description, amount, date } = req.body
    const transactionId = req.params.id
    const userId = req.user.id
    
    console.log('Update request received:', {
        transactionId,
        userId,
        body: req.body
    })
    
    if (!description || amount == null || !date) {
        console.log('Missing fields:', { description, amount, date })
        return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
        const updatedTransaction = await updateTransaction(transactionId, userId, description, amount, date)
        
        if (!updatedTransaction) {
            console.log(`Transaction ${transactionId} not found for user ${userId}`)
            return res.status(404).json({ message: 'Transaction not found' })
        }
        
        console.log('Transaction updated successfully:', updatedTransaction)
        res.json(updatedTransaction)
    } catch (error) {
        console.error('Error updating transaction:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router
