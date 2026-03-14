import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300
    },
    coverImage: {
      type: String,
      default: ''
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    published: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

// Text index for fast full-text search on title, excerpt, and content
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' })

// Auto-generate slug from title before validation
blogSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

// Set publishedAt when publishing
blogSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

const Blog = mongoose.model('Blog', blogSchema)
export default Blog
