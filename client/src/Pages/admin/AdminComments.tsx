import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Trash2,
  ExternalLink,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AdminLayout from '../../components/AdminLayout'
import { blogService, type Comment } from '../../services/blogService'

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadComments()
  }, [page])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const res = await blogService.getAdminComments(page, 30)
      if (res.success) {
        // Filter out any comments missing required fields
        const validComments = (res.comments || []).filter(
          (c: Comment) => c && c._id && (c.name || c.content)
        )
        setComments(validComments)
        setTotalPages(res.pagination.pages)
        setTotal(res.pagination.total)
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await blogService.deleteComment(id)
      if (res.success) {
        setComments(prev => prev.filter(c => c._id !== id))
        setTotal(prev => prev - 1)
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout title='Comments' subtitle={`${total} comment${total !== 1 ? 's' : ''} across all posts`}>
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className='bg-white/[0.06] rounded-xl h-24 animate-pulse'
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className='text-center py-20'>
          <MessageCircle className='w-12 h-12 text-[#dadada]/20 mx-auto mb-4' />
          <p className='text-xl text-[#dadada]/40'>No comments yet.</p>
          <p className='text-[#dadada]/25 mt-1'>
            Either nobody reads your blog or they{"'"}re all speechless.
          </p>
        </div>
      ) : (
        <>
          <div className='space-y-3'>
            <AnimatePresence>
              {comments.map(comment => (
                <motion.div
                  key={comment._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className='bg-white/[0.06] border border-white/[0.05] rounded-xl p-4'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      {/* Header */}
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 rounded-full bg-[#7203a9]/30 flex items-center justify-center text-sm font-bold text-[#7203a9] shrink-0'>
                          {(comment.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-medium text-white truncate'>
                              {comment.name || 'Anonymous'}
                            </span>
                            {comment.email && (
                              <span className='flex items-center gap-1 text-xs text-[#dadada]/30'>
                                <Mail className='w-3 h-3' />
                                {comment.email}
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-xs text-[#dadada]/30'>
                            {comment.createdAt && (
                              <span>
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true
                                })}
                              </span>
                            )}
                            {comment.blog && (
                              <>
                                <span>·</span>
                                <a
                                  href={`/blog/${comment.blog.slug}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 text-[#7203a9] hover:underline truncate'
                                >
                                  {comment.blog.title}
                                  <ExternalLink className='w-3 h-3 shrink-0' />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <p className='text-sm text-[#dadada]/70 whitespace-pre-wrap leading-relaxed ml-11'>
                        {comment.content || '(No content)'}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(comment._id)}
                      disabled={deleting === comment._id}
                      className='shrink-0 p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50'
                      title='Delete comment'
                    >
                      {deleting === comment._id ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Trash2 className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-3 mt-8'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className='p-2 rounded-lg bg-white/[0.06] text-[#dadada]/60 hover:text-[#dadada] disabled:opacity-30 disabled:cursor-not-allowed transition-all'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-sm text-[#dadada]/40'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='p-2 rounded-lg bg-white/[0.06] text-[#dadada]/60 hover:text-[#dadada] disabled:opacity-30 disabled:cursor-not-allowed transition-all'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
