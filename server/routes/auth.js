import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {registerUser, findUser} from '../models/Models.js'

const router = express.Router()
const JWT_SECRET = 'WebDev-Finance'


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body
  
    findUser(email, async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'User not found' }) // 🟢 fixed here
      }
  
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return res.status(401).json({ message: 'Incorrect password' })
      }
  
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' })
  
      // Send the token properly so Vue can receive it
      res.status(200).json({
        message: 'Login successful',
        token
      })
    })
  })
  

// Register Route
router.post('/register', async (req, res) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({message: 'Missing email or password'})
    }

    try{
        await registerUser(email, password, (err) => {
            if (err) return res.status(400).json({message: 'User already exists'})
            res.status(201).json({message: 'User registered'})
        })
    } catch (error) {
        res.status(500).json({message: 'Server error'})
    }
})

export default router