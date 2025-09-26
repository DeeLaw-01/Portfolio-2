import express from 'express'
import {
  sendMessage,
  getMessages,
  getConversations,
  getConversation,
  createOrGetConversation,
  markMessagesAsSeen,
  getUnreadCount
} from '../controllers/chatController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected route - Send a message
router.post('/messages', protect, sendMessage)

// Protected route - Get messages for a conversation
router.get('/messages/:conversationId', protect, getMessages)

// Protected route - Mark messages as seen
router.post('/messages/:conversationId/seen', protect, markMessagesAsSeen)

// Protected route - Get unread message count
router.get('/unread-count', protect, getUnreadCount)

// Protected route - Get all conversations for the user
router.get('/conversations', protect, getConversations)

// Protected route - Get a specific conversation
router.get('/conversations/:conversationId', protect, getConversation)

// Protected route - Create or get conversation between two users
router.post('/conversations', protect, createOrGetConversation)

export default router
