import express from 'express'
import Tag from '../models/Tag.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// GET /api/tags - Get all tags (public)
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 })
    res.json({ success: true, tags })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags.'
    })
  }
})

// POST /api/tags - Create a new tag (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, color } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required.'
      })
    }

    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    })

    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: 'Tag already exists. Be more creative.'
      })
    }

    const tag = new Tag({ name, color })
    await tag.save()

    res.status(201).json({ success: true, tag })
  } catch (error) {
    console.error('Create tag error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create tag.'
    })
  }
})

// PUT /api/tags/:id - Update a tag (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color } = req.body
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found.'
      })
    }

    if (name) tag.name = name
    if (color) tag.color = color
    await tag.save()

    res.json({ success: true, tag })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tag.'
    })
  }
})

// DELETE /api/tags/:id - Delete a tag (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id)

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found.'
      })
    }

    res.json({ success: true, message: 'Tag deleted.' })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag.'
    })
  }
})

export default router
