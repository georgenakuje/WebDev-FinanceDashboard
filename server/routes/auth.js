import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {registerUser, findUser} from '../models/Models.js'

const router = express.Router()
const JWT_SECRET = 'WebDev-Finance'


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log('Login attempt for email:', email)
  
    findUser(email, async (err, user) => {
      if (err || !user) {
        console.log('User not found or error:', err)
        return res.status(401).json({ message: 'User not found' })
      }
  
      console.log('User found:', user)
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        console.log('Password mismatch')
        return res.status(401).json({ message: 'Incorrect password' })
      }
  
      console.log('Creating token with user data:', { email: user.email, id: user.id })
      const token = jwt.sign({ 
        email: user.email,
        id: user.id
      }, JWT_SECRET, { expiresIn: '1h' })
  
      console.log('Token created successfully')
      res.status(200).json({
        message: 'Login successful',
        token
      })
    })
  })
  

// Register Route
router.post('/register', async (req, res) => {
    console.log('Registration request received:', req.body)
    const {email, password} = req.body

    if (!email || !password) {
        console.log('Missing email or password')
        return res.status(400).json({message: 'Missing email or password'})
    }

    try {
        console.log('Attempting to register user')
        await registerUser(email, password, (err) => {
            if (err) {
                console.error('Registration callback error:', err)
                return res.status(400).json({message: 'User already exists or registration failed'})
            }
            console.log('Registration successful')
            res.status(201).json({message: 'User registered'})
        })
    } catch (error) {
        console.error('Registration try-catch error:', error)
        res.status(500).json({message: 'Server error'})
    }
})

export default router