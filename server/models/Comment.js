import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    ip: {
      type: String,
      select: false // Never sent to client by default
    }
  },
  { timestamps: true }
)

// Index for efficient queries
commentSchema.index({ blog: 1, createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)
export default Comment
