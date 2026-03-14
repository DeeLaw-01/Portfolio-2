import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Globe,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import AdminLayout from '../../components/AdminLayout'
import { blogService, type Blog } from '../../services/blogService'

export default function AdminBlogList () {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      const res = await blogService.getAdminBlogs()
      if (res.success) setBlogs(res.blogs)
    } catch (err) {
      console.error('Failed to load blogs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This is permanent. No take-backs.`)) return

    try {
      const res = await blogService.deleteBlog(id)
      if (res.success) {
        setBlogs(prev => prev.filter(b => b._id !== id))
      }
    } catch (err) {
      console.error('Failed to delete blog:', err)
    }
  }

  const handleTogglePublish = async (blog: Blog) => {
    const action = blog.published ? 'unpublish' : 'publish'
    const confirmed = confirm(
      `Are you sure you want to ${action} "${blog.title}"?`
    )
    if (!confirmed) return

    try {
      const res = await blogService.updateBlog(blog._id, {
        published: !blog.published
      })
      if (res.success) {
        setBlogs(prev =>
          prev.map(b =>
            b._id === blog._id
              ? { ...b, published: !b.published }
              : b
          )
        )
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  return (
    <AdminLayout
      title='Posts'
      subtitle={`${blogs.length} post${blogs.length !== 1 ? 's' : ''} total. Impressive? You tell me.`}
    >
      <div className='mb-6'>
        <button
          onClick={() => navigate('/admin/blogs/new')}
          className='bg-[#7203a9] hover:bg-[#8a1bb8] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          New Post
        </button>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-20 bg-white/[0.08] rounded-[20px] animate-pulse'
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className='text-center py-20'>
          <FileText className='w-12 h-12 text-[#dadada]/10 mx-auto mb-4' />
          <p className='text-xl text-[#dadada]/30 mb-2'>No posts yet</p>
          <p className='text-[#dadada]/20 text-sm'>
            The blog section is as empty as your schedule. Write something.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {blogs.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-5 group hover:bg-white/[0.10] transition-colors'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        blog.published ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    />
                    <h3 className='text-white font-medium truncate'>
                      {blog.title}
                    </h3>
                  </div>

                  <p className='text-sm text-[#dadada]/40 truncate mb-2'>
                    {blog.excerpt}
                  </p>

                  <div className='flex items-center gap-4 text-xs text-[#dadada]/30'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      {format(new Date(blog.updatedAt), 'MMM d, yyyy')}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Eye className='w-3 h-3' />
                      {blog.views} views
                    </span>
                    {blog.tags.length > 0 && (
                      <div className='flex gap-1'>
                        {blog.tags.map(tag => (
                          <span
                            key={tag._id}
                            className='px-1.5 py-0.5 rounded text-[10px]'
                            style={{
                              color: tag.color,
                              backgroundColor: tag.color + '15'
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {blog.published && (
                    <button
                      onClick={() =>
                        window.open(`/blog/${blog.slug}`, '_blank')
                      }
                      className='p-2 rounded-lg hover:bg-white/[0.1] text-[#dadada]/40 hover:text-[#dadada] transition-colors'
                      title='View post'
                    >
                      <ExternalLink className='w-4 h-4' />
                    </button>
                  )}
                  <button
                    onClick={() => handleTogglePublish(blog)}
                    className={`p-2 rounded-lg hover:bg-white/[0.1] transition-colors ${
                      blog.published
                        ? 'text-green-400 hover:text-yellow-400'
                        : 'text-yellow-400 hover:text-green-400'
                    }`}
                    title={blog.published ? 'Unpublish' : 'Publish'}
                  >
                    <Globe className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/admin/blogs/edit/${blog._id}`)
                    }
                    className='p-2 rounded-lg hover:bg-white/[0.1] text-[#dadada]/40 hover:text-[#a855f7] transition-colors'
                    title='Edit'
                  >
                    <Pencil className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id, blog.title)}
                    className='p-2 rounded-lg hover:bg-red-500/10 text-[#dadada]/40 hover:text-red-400 transition-colors'
                    title='Delete'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
