import express from 'express'
const router = express.Router()

let transactions = []

// GET all transactions
router.get('/', (req, res) => {
    res.json(transactions)
})

// POST a new transaction
router.post('/', (req, res) => {
    const { desc, amount, date } = req.body
    if ( !desc || amount == null || !date ){
        return res.status(400).json({message: 'Missing fields'})
    }

    const newTransaction = {
        id: Date.now(), 
        desc, 
        amount, 
        date
    }

    transactions.push(newTransaction)
    res.status.apply(201).json(newTransaction)
})

export default router
