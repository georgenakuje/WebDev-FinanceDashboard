import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { getSettings, updateSettings, updatePassword, updateEmail } from '../models/Models.js'
import { findUser} from '../models/Models.js'


const router = express.Router()
const JWT_SECRET = 'WebDev-Finance'

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

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get user settings
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings(req.user.id)
    res.json(settings)
  } catch (error) {
    console.error('Error getting settings:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user settings
router.put('/', async (req, res) => {
  try {
    const success = await updateSettings(req.user.id, req.body)
    if (success) {
      const settings = await getSettings(req.user.id)
      res.json(settings)
    } else {
      res.status(404).json({ message: 'Settings not found' })
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    // Verify current password
    const user = await new Promise((resolve, reject) => {
      findUser(req.user.email, (err, user) => {
        if (err) reject(err)
        else resolve(user)
      })
    })
    
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const success = await updatePassword(req.user.id, hashedPassword)
    
    if (success) {
      res.json({ message: 'Password updated successfully' })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update email
router.put('/email', async (req, res) => {
  try {
    const { newEmail, password } = req.body
    
    // Verify password
    const user = await new Promise((resolve, reject) => {
      findUser(req.user.email, (err, user) => {
        if (err) reject(err)
        else resolve(user)
      })
    })
    
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Password is incorrect' })
    }
    
    const success = await updateEmail(req.user.id, newEmail)
    
    if (success) {
      // Generate new token with updated email
      const token = jwt.sign({ 
        email: newEmail,
        id: req.user.id
      }, JWT_SECRET, { expiresIn: '1h' })
      
      res.json({ 
        message: 'Email updated successfully',
        token
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Error updating email:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router