import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'


dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}))
app.use(bodyParser.json())

app.use('/api/transactions', transactionRoutes)
app.use('/api/auth', authRoutes)


app.get('/', (req, res) => {
    res.send('Finance Dashboard Backend')
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err)
    res.status(500).json({
        message: 'Server error',
        details: err.message
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})