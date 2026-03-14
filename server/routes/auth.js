import express from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// GET /api/auth/check - Check if an admin exists
router.get('/check', async (req, res) => {
  try {
    const adminExists = await Admin.countDocuments() > 0
    res.json({ success: true, adminExists })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Check failed.' })
  }
})

// POST /api/auth/register - One-time admin registration
router.post('/register', async (req, res) => {
  try {
    // Check if an admin already exists
    const existingAdmin = await Admin.findOne()
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. Nice try though.'
      })
    }

    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required. Come on now.'
      })
    }

    const admin = new Admin({ email, password, name })
    await admin.save()

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      token,
      admin: admin.toJSON()
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Something broke. Probably your fault.'
    })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Who are you?'
      })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Try harder.'
      })
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.json({
      success: true,
      token,
      admin: admin.toJSON()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    })
  }
})

// GET /api/auth/me - Get current admin
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId)
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found. Spooky.'
      })
    }

    res.json({
      success: true,
      admin: admin.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    })
  }
})

export default router
