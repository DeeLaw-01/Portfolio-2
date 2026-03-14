import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    color: {
      type: String,
      default: '#7203a9' // Default to site accent color
    }
  },
  { timestamps: true }
)

// Auto-generate slug from name before saving
tagSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

const Tag = mongoose.model('Tag', tagSchema)
export default Tag
