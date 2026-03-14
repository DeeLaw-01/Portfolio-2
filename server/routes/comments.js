import express from 'express'
import Comment from '../models/Comment.js'
import Blog from '../models/Blog.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Simple in-memory rate limiter (IP -> timestamps[])
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 10 // max 10 comments per IP per hour

function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Clean old entries
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  rateLimitMap.set(ip, recent)

  if (recent.length >= RATE_LIMIT_MAX) {
    return false
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

// Clean up rate limit map every hour
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
    if (recent.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, recent)
    }
  }
}, RATE_LIMIT_WINDOW)

// ==================== PUBLIC ROUTES ====================

// GET /api/comments/:blogId - Get comments for a blog post
router.get('/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .select('name content createdAt')
      .sort({ createdAt: -1 })

    res.json({ success: true, comments })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments.'
    })
  }
})

// POST /api/comments/:blogId - Add a comment (public, with honeypot + rate limit)
router.post('/:blogId', async (req, res) => {
  try {
    const { name, email, content, website } = req.body

    // Honeypot check - "website" field should be empty (hidden from users, bots fill it)
    if (website) {
      // Silently reject - don't let bots know they were caught
      return res.status(201).json({
        success: true,
        message: 'Comment added.'
      })
    }

    // Rate limit check
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        message: "You're commenting too fast. Take a breath."
      })
    }

    // Validate
    if (!name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and comment are required.'
      })
    }

    if (name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "That's a suspiciously long name."
      })
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "That's more of a blog post than a comment. Keep it under 2000 characters."
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "That doesn't look like a real email."
      })
    }

    // Check blog exists
    const blog = await Blog.findById(req.params.blogId)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      })
    }

    const comment = new Comment({
      blog: req.params.blogId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      ip
    })

    await comment.save()

    // Update comment count on blog
    await Blog.findByIdAndUpdate(req.params.blogId, {
      $inc: { commentsCount: 1 }
    })

    // Return comment without email or ip
    res.status(201).json({
      success: true,
      comment: {
        _id: comment._id,
        name: comment.name,
        content: comment.content,
        createdAt: comment.createdAt
      }
    })
  } catch (error) {
    console.error('Comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to post comment.'
    })
  }
})

// ==================== ADMIN ROUTES ====================

// GET /api/comments/admin/all - Get all comments (admin)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Comment.countDocuments()

    const comments = await Comment.find()
      .populate('blog', 'title slug')
      .select('name email content createdAt blog')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments.'
    })
  }
})

// DELETE /api/comments/admin/:id - Delete a comment (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      })
    }

    // Decrement comment count on blog
    await Blog.findByIdAndUpdate(comment.blog, {
      $inc: { commentsCount: -1 }
    })

    await Comment.findByIdAndDelete(req.params.id)

    res.json({ success: true, message: 'Comment deleted.' })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment.'
    })
  }
})

export default router
