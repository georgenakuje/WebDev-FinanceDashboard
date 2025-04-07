import express from 'express'
import cors from 'cors'
import transactionsRouter from './routes/transactions.js'

const app = express()
const port = 3000

// Enable CORS for all routes
app.use(cors())

// Parse JSON bodies
app.use(express.json())

// Use transactions router
app.use('/api/transactions', transactionsRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err)
    res.status(500).json({
        message: 'Server error',
        details: err.message
    })
})

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
}) 