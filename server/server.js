import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'


dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

app.use('/api/transactions', transactionRoutes)
app.use('/api/auth', authRoutes)


app.get('/', (req, res) => {
    res.send('Finance Dashboard Backend')
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})