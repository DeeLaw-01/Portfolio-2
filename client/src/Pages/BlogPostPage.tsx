import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Clock,
  Tag,
  Heart,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import BlogLayout from '../components/BlogLayout'
import MarkdownRenderer from '../components/MarkdownRenderer'
import {
  blogService,
  type Blog,
  type Comment
} from '../services/blogService'

// localStorage helpers for likes
const LIKES_KEY = 'blog_likes'
function getLikedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '[]')
  } catch {
    return []
  }
}
function setLikedSlug(slug: string) {
  const liked = getLikedSlugs()
  if (!liked.includes(slug)) {
    liked.push(slug)
    localStorage.setItem(LIKES_KEY, JSON.stringify(liked))
  }
}
function removeLikedSlug(slug: string) {
  const liked = getLikedSlugs().filter(s => s !== slug)
  localStorage.setItem(LIKES_KEY, JSON.stringify(liked))
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Likes
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeAnimating, setLikeAnimating] = useState(false)

  // Comments
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentName, setCommentName] = useState(
    localStorage.getItem('comment_name') || ''
  )
  const [commentEmail, setCommentEmail] = useState(
    localStorage.getItem('comment_email') || ''
  )
  const [commentContent, setCommentContent] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentSuccess, setCommentSuccess] = useState('')

  useEffect(() => {
    if (slug) loadBlog()
  }, [slug])

  const loadBlog = async () => {
    setIsLoading(true)
    try {
      const res = await blogService.getBlogBySlug(slug!)
      if (res.success) {
        setBlog(res.blog)
        setLikeCount(res.blog.likes || 0)
        setLiked(getLikedSlugs().includes(slug!))
        loadComments(res.blog._id)
      } else {
        setError('Post not found. It might have achieved sentience and left.')
      }
    } catch {
      setError('Something went wrong. Blame the servers.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async (blogId: string) => {
    setCommentsLoading(true)
    try {
      const res = await blogService.getComments(blogId)
      if (res.success) setComments(res.comments)
    } catch {
      // Silently fail
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleLike = useCallback(async () => {
    if (!slug || likeAnimating) return
    setLikeAnimating(true)

    try {
      if (liked) {
        const res = await blogService.unlikeBlog(slug)
        if (res.success) {
          setLiked(false)
          setLikeCount(res.likes)
          removeLikedSlug(slug)
        }
      } else {
        const res = await blogService.likeBlog(slug)
        if (res.success) {
          setLiked(true)
          setLikeCount(res.likes)
          setLikedSlug(slug)
        }
      }
    } catch {
      // Silently fail
    } finally {
      setTimeout(() => setLikeAnimating(false), 300)
    }
  }, [slug, liked, likeAnimating])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blog || commentSubmitting) return

    setCommentError('')
    setCommentSuccess('')

    if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim()) {
      setCommentError('All fields are required. Even the email.')
      return
    }

    setCommentSubmitting(true)
    try {
      const res = await blogService.postComment(blog._id, {
        name: commentName.trim(),
        email: commentEmail.trim(),
        content: commentContent.trim(),
        website: '' // honeypot - always empty from real users
      })

      if (res.success) {
        // Save name/email for convenience
        localStorage.setItem('comment_name', commentName.trim())
        localStorage.setItem('comment_email', commentEmail.trim())
        setCommentContent('')
        setCommentSuccess('Comment posted. You are now part of the conversation.')
        // Reload comments
        loadComments(blog._id)
      } else {
        setCommentError(res.message || 'Failed to post comment.')
      }
    } catch {
      setCommentError('Something went wrong. Try again.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  // Estimate reading time
  const readingTime = blog
    ? Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200))
    : 0

  if (isLoading) {
    return (
      <BlogLayout>
        <div className='space-y-6 animate-pulse'>
          <div className='h-8 bg-white/[0.08] rounded-xl w-1/3' />
          <div className='h-12 bg-white/[0.08] rounded-xl w-2/3' />
          <div className='h-64 bg-white/[0.08] rounded-[20px]' />
          <div className='space-y-3'>
            <div className='h-4 bg-white/[0.08] rounded w-full' />
            <div className='h-4 bg-white/[0.08] rounded w-5/6' />
            <div className='h-4 bg-white/[0.08] rounded w-4/6' />
          </div>
        </div>
      </BlogLayout>
    )
  }

  if (error || !blog) {
    return (
      <BlogLayout>
        <div className='text-center py-20'>
          <p className='text-4xl mb-4'>🫠</p>
          <p className='text-2xl text-[#dadada]/40 mb-2'>
            {error || 'Post not found.'}
          </p>
          <button
            onClick={() => navigate('/blog')}
            className='mt-4 text-[#7203a9] hover:text-[#8a1bb8] transition-colors'
          >
            ← Back to blog
          </button>
        </div>
      </BlogLayout>
    )
  }

  return (
    <BlogLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/blog')}
        className='flex items-center gap-2 text-sm text-[#dadada]/50 hover:text-[#7203a9] transition-colors mb-6 group'
      >
        <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
        Back to all posts
      </button>

      <article>
        {/* Cover Image */}
        {blog.coverImage && (
          <motion.div
            className='rounded-[20px] overflow-hidden mb-8 border border-white/[0.05]'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={blog.coverImage}
              alt={blog.title}
              className='w-full max-h-[400px] object-cover'
            />
          </motion.div>
        )}

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {blog.tags.map(tag => (
              <button
                key={tag._id}
                onClick={() => navigate(`/blog?tag=${tag.slug}`)}
                className='flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:border-[#7203a9]/60'
                style={{
                  borderColor: tag.color + '40',
                  color: tag.color,
                  backgroundColor: tag.color + '15'
                }}
              >
                <Tag className='w-3 h-3' />
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className='text-3xl md:text-5xl font-bold text-white mb-4 leading-tight'>
          {blog.title}
        </h1>

        {/* Meta */}
        <div className='flex flex-wrap items-center gap-4 text-sm text-[#dadada]/40 mb-8 pb-8 border-b border-white/[0.08]'>
          <span className='flex items-center gap-1.5'>
            <Calendar className='w-4 h-4' />
            {blog.publishedAt
              ? format(new Date(blog.publishedAt), 'MMMM d, yyyy')
              : 'Draft'}
          </span>
          <span className='flex items-center gap-1.5'>
            <Clock className='w-4 h-4' />
            {readingTime} min read
          </span>
          <span className='flex items-center gap-1.5'>
            <Eye className='w-4 h-4' />
            {blog.views} views
          </span>
          <span className='flex items-center gap-1.5'>
            <MessageCircle className='w-4 h-4' />
            {comments.length} comments
          </span>
        </div>

        {/* Content */}
        <MarkdownRenderer content={blog.content} />

        {/* Like + Share Bar */}
        <div className='mt-12 pt-8 border-t border-white/[0.08]'>
          <div className='flex items-center gap-6'>
            <motion.button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                liked
                  ? 'bg-[#7203a9]/20 border-[#7203a9]/50 text-[#7203a9]'
                  : 'bg-white/[0.05] border-white/[0.08] text-[#dadada]/60 hover:border-[#7203a9]/30 hover:text-[#dadada]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={
                  likeAnimating && liked
                    ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-4 h-4 ${liked ? 'fill-[#7203a9]' : ''}`}
                />
              </motion.div>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </motion.button>

            <span className='text-sm text-[#dadada]/30'>
              {liked
                ? 'You have taste.'
                : 'Like it if you mean it.'}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className='mt-12 pt-8 border-t border-white/[0.08]'>
          <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
            <MessageCircle className='w-6 h-6 text-[#7203a9]' />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleComment} className='mb-10'>
            <div className='bg-white/[0.04] border border-white/[0.05] rounded-2xl p-5 space-y-4'>
              <p className='text-sm text-[#dadada]/40'>
                Drop a comment. Your email stays hidden — we&apos;re not savages.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input
                  type='text'
                  placeholder='Name'
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  maxLength={80}
                  className='bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50 transition-colors'
                />
                <input
                  type='email'
                  placeholder='Email (hidden, pinky promise)'
                  value={commentEmail}
                  onChange={e => setCommentEmail(e.target.value)}
                  className='bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50 transition-colors'
                />
              </div>

              {/* Honeypot field - hidden from users, bots will fill it */}
              <input
                type='text'
                name='website'
                tabIndex={-1}
                autoComplete='off'
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                aria-hidden='true'
              />

              <textarea
                placeholder='Your thoughts (max 2000 chars)...'
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                maxLength={2000}
                rows={4}
                className='w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50 transition-colors resize-none'
              />

              <div className='flex items-center justify-between'>
                <span className='text-xs text-[#dadada]/30'>
                  {commentContent.length}/2000
                </span>
                <button
                  type='submit'
                  disabled={commentSubmitting}
                  className='flex items-center gap-2 px-5 py-2 rounded-xl bg-[#7203a9] hover:bg-[#8a1bb8] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {commentSubmitting ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Send className='w-4 h-4' />
                  )}
                  {commentSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              <AnimatePresence>
                {commentError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className='text-red-400 text-sm'
                  >
                    {commentError}
                  </motion.p>
                )}
                {commentSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className='text-green-400 text-sm'
                  >
                    {commentSuccess}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Comment List */}
          {commentsLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='bg-white/[0.04] rounded-xl p-4 animate-pulse space-y-2'
                >
                  <div className='h-4 bg-white/[0.08] rounded w-1/4' />
                  <div className='h-3 bg-white/[0.08] rounded w-3/4' />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className='text-center py-10'>
              <MessageCircle className='w-10 h-10 text-[#dadada]/20 mx-auto mb-3' />
              <p className='text-[#dadada]/40'>
                No comments yet. Be the first to grace this post with your wisdom.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {comments.map((comment, i) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='bg-white/[0.04] border border-white/[0.05] rounded-xl p-4'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      {/* Gravatar-like avatar from name initial */}
                      <div className='w-7 h-7 rounded-full bg-[#7203a9]/30 flex items-center justify-center text-xs font-bold text-[#7203a9]'>
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <span className='text-sm font-medium text-white'>
                        {comment.name}
                      </span>
                    </div>
                    <span className='text-xs text-[#dadada]/30'>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                  <p className='text-sm text-[#dadada]/80 whitespace-pre-wrap leading-relaxed'>
                    {comment.content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </article>
    </BlogLayout>
  )
}
