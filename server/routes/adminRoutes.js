import express from 'express'
import { protect, requireAdmin } from '../middleware/authMiddleware.js'
import { getAllUsers, makeUserAdmin } from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(requireAdmin)

// Get all users (admin only)
router.get('/users', getAllUsers)

// Make a user admin (admin only)
router.put('/users/:userId/make-admin', makeUserAdmin)

export default router
