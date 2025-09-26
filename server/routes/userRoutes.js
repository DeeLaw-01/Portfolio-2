import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getAllUsers
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.get('/all', protect, getAllUsers)
router.get('/:userId', protect, getUserById)

export default router
