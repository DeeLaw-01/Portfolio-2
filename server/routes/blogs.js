import express from 'express'
import Blog from '../models/Blog.js'
import Tag from '../models/Tag.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// ==================== PUBLIC ROUTES ====================

// GET /api/blogs - Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { tag, page = 1, limit = 10, search } = req.query
    const query = { published: true }

    // Filter by tag slug
    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag })
      if (tagDoc) {
        query.tags = tagDoc._id
      }
    }

    // Search in title and excerpt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Blog.countDocuments(query)

    const blogs = await Blog.find(query)
      .populate('tags', 'name slug color')
      .select('-content') // Don't send full content in list view
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Fetch blogs error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs.'
    })
  }
})

// GET /api/blogs/meta - Preload all published blog metadata for client-side search
router.get('/meta', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .populate('tags', 'name slug color')
      .select('title slug excerpt tags publishedAt views likes commentsCount coverImage')
      .sort({ publishedAt: -1 })

    res.json({ success: true, blogs })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog metadata.'
    })
  }
})

// GET /api/blogs/stats - Get public blog stats
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await Blog.countDocuments({ published: true })
    const totalViews = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])
    const totalTags = await Tag.countDocuments()

    res.json({
      success: true,
      stats: {
        totalPosts,
        totalViews: totalViews[0]?.total || 0,
        totalTags
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats.'
    })
  }
})

// GET /api/blogs/search - Full-text content search (public)
router.get('/search', async (req, res) => {
  try {
    const { q, tag, from, to, page = 1, limit = 10 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters.'
      })
    }

    const query = { published: true }

    // Try text search first, fall back to regex
    const textSearchQuery = {
      ...query,
      $text: { $search: q }
    }

    // Tag filter
    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag })
      if (tagDoc) {
        textSearchQuery.tags = tagDoc._id
        query.tags = tagDoc._id
      }
    }

    // Date range filter
    if (from || to) {
      textSearchQuery.publishedAt = {}
      query.publishedAt = {}
      if (from) {
        textSearchQuery.publishedAt.$gte = new Date(from)
        query.publishedAt.$gte = new Date(from)
      }
      if (to) {
        textSearchQuery.publishedAt.$lte = new Date(to)
        query.publishedAt.$lte = new Date(to)
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    let blogs, total

    try {
      // Attempt text index search (fast, relevance-ranked)
      total = await Blog.countDocuments(textSearchQuery)
      blogs = await Blog.find(textSearchQuery, { score: { $meta: 'textScore' } })
        .populate('tags', 'name slug color')
        .select('-content')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
    } catch {
      // Fallback to regex search if text index doesn't exist yet
      const regexQuery = {
        ...query,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { excerpt: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      }
      total = await Blog.countDocuments(regexQuery)
      blogs = await Blog.find(regexQuery)
        .populate('tags', 'name slug color')
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    }

    res.json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Search failed.'
    })
  }
})

// POST /api/blogs/:slug/like - Like a blog (public, anonymous)
router.post('/:slug/like', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' })
    }

    blog.likes += 1
    await blog.save()

    res.json({ success: true, likes: blog.likes })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like post.' })
  }
})

// POST /api/blogs/:slug/unlike - Unlike a blog (public, anonymous)
router.post('/:slug/unlike', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' })
    }

    blog.likes = Math.max(0, blog.likes - 1)
    await blog.save()

    res.json({ success: true, likes: blog.likes })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unlike post.' })
  }
})

// GET /api/blogs/:slug - Get a single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      published: true
    }).populate('tags', 'name slug color')

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found. Maybe it's hiding."
      })
    }

    // Increment view count
    blog.views += 1
    await blog.save()

    res.json({ success: true, blog })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog.'
    })
  }
})

// ==================== ADMIN ROUTES ====================

// GET /api/blogs/admin/all - Get all blogs including drafts (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Blog.countDocuments()

    const blogs = await Blog.find()
      .populate('tags', 'name slug color')
      .select('-content')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs.'
    })
  }
})

// GET /api/blogs/admin/stats - Get admin dashboard stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const totalPosts = await Blog.countDocuments()
    const publishedPosts = await Blog.countDocuments({ published: true })
    const draftPosts = await Blog.countDocuments({ published: false })
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])
    const totalTags = await Tag.countDocuments()

    // Most viewed blogs
    const topBlogs = await Blog.find({ published: true })
      .select('title slug views publishedAt')
      .sort({ views: -1 })
      .limit(5)

    // Recent blogs
    const recentBlogs = await Blog.find()
      .populate('tags', 'name slug color')
      .select('title slug published views updatedAt publishedAt')
      .sort({ updatedAt: -1 })
      .limit(5)

    // Views over time (last 30 days - aggregate by blog creation)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    res.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews[0]?.total || 0,
        totalTags,
        topBlogs,
        recentBlogs
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats.'
    })
  }
})

// GET /api/blogs/admin/:id - Get a single blog by ID for editing (admin only)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'tags',
      'name slug color'
    )

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      })
    }

    res.json({ success: true, blog })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog.'
    })
  }
})

// POST /api/blogs/admin - Create a new blog (admin only)
router.post('/admin', auth, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, published } = req.body

    if (!title || !content || !excerpt) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and excerpt are required.'
      })
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      coverImage,
      tags: tags || [],
      published: published || false,
      views: 0, // Explicitly set to 0 on creation
      likes: 0,
      commentsCount: 0
    })

    await blog.save()
    await blog.populate('tags', 'name slug color')

    res.status(201).json({ success: true, blog })
  } catch (error) {
    console.error('Create blog error:', error)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A blog with this title/slug already exists.'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create blog.'
    })
  }
})

// PUT /api/blogs/admin/:id - Update a blog (admin only)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const { title, slug, content, excerpt, coverImage, tags, published } =
      req.body

    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      })
    }

    if (title !== undefined) blog.title = title
    if (slug !== undefined) blog.slug = slug
    if (content !== undefined) blog.content = content
    if (excerpt !== undefined) blog.excerpt = excerpt
    if (coverImage !== undefined) blog.coverImage = coverImage
    if (tags !== undefined) blog.tags = tags
    if (published !== undefined) blog.published = published

    await blog.save()
    await blog.populate('tags', 'name slug color')

    res.json({ success: true, blog })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A blog with this slug already exists.'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update blog.'
    })
  }
})

// DELETE /api/blogs/admin/:id - Delete a blog (admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.'
      })
    }

    res.json({ success: true, message: 'Blog deleted. Gone forever.' })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog.'
    })
  }
})

export default router
