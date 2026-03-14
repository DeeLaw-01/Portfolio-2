import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Eye,
  Send,
  FilePlus,
  Tags,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'
import { format } from 'date-fns'
import AdminLayout from '../../components/AdminLayout'
import { blogService, type StatsResponse } from '../../services/blogService'

export default function AdminDashboard () {
  const navigate = useNavigate()
  const [stats, setStats] = useState<StatsResponse['stats'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await blogService.getAdminStats()
      if (res.success) setStats(res.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = stats
    ? [
        {
          label: 'Total Posts',
          value: stats.totalPosts,
          icon: FileText,
          color: '#7203a9'
        },
        {
          label: 'Published',
          value: stats.publishedPosts,
          icon: Send,
          color: '#22c55e'
        },
        {
          label: 'Drafts',
          value: stats.draftPosts,
          icon: FilePlus,
          color: '#f59e0b'
        },
        {
          label: 'Total Views',
          value: stats.totalViews,
          icon: Eye,
          color: '#3b82f6'
        },
        {
          label: 'Tags',
          value: stats.totalTags,
          icon: Tags,
          color: '#ec4899'
        }
      ]
    : []

  return (
    <AdminLayout
      title='Dashboard'
      subtitle="Here's what's happening with your blog. You're welcome."
    >
      {isLoading ? (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-28 bg-white/[0.08] rounded-[20px] animate-pulse'
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
            {statCards.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-5'
                >
                  <div className='flex items-center gap-2 mb-3'>
                    <div
                      className='w-8 h-8 rounded-lg flex items-center justify-center'
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <Icon
                        className='w-4 h-4'
                        style={{ color: stat.color }}
                      />
                    </div>
                  </div>
                  <p className='text-2xl font-bold text-white'>{stat.value}</p>
                  <p className='text-xs text-[#dadada]/40'>{stat.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Top Posts */}
            <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <TrendingUp className='w-4 h-4 text-[#7203a9]' />
                <h2 className='text-lg font-semibold text-white'>Top Posts</h2>
              </div>
              {stats?.topBlogs && stats.topBlogs.length > 0 ? (
                <div className='space-y-3'>
                  {stats.topBlogs.map((blog, i) => (
                    <div
                      key={blog.slug}
                      className='flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-xl transition-colors'
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-xs text-[#dadada]/30 w-5'>
                          #{i + 1}
                        </span>
                        <span className='text-sm text-[#dadada] group-hover:text-white transition-colors truncate max-w-[200px]'>
                          {blog.title}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-[#dadada]/40 flex items-center gap-1'>
                          <Eye className='w-3 h-3' />
                          {blog.views}
                        </span>
                        <ArrowUpRight className='w-3 h-3 text-[#7203a9] opacity-0 group-hover:opacity-100 transition-opacity' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-[#dadada]/30'>
                  No posts yet. The void stares back.
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <FileText className='w-4 h-4 text-[#7203a9]' />
                <h2 className='text-lg font-semibold text-white'>
                  Recent Activity
                </h2>
              </div>
              {stats?.recentBlogs && stats.recentBlogs.length > 0 ? (
                <div className='space-y-3'>
                  {stats.recentBlogs.map(blog => (
                    <div
                      key={blog._id}
                      className='flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-xl transition-colors'
                      onClick={() =>
                        navigate(`/admin/blogs/edit/${blog._id}`)
                      }
                    >
                      <div className='flex items-center gap-3'>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            blog.published ? 'bg-green-400' : 'bg-yellow-400'
                          }`}
                        />
                        <span className='text-sm text-[#dadada] group-hover:text-white transition-colors truncate max-w-[200px]'>
                          {blog.title}
                        </span>
                      </div>
                      <span className='text-xs text-[#dadada]/30'>
                        {format(new Date(blog.updatedAt), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-[#dadada]/30'>
                  Nothing to see here. Yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => navigate('/admin/blogs/new')}
              className='bg-[#7203a9] hover:bg-[#8a1bb8] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2'
            >
              <FilePlus className='w-4 h-4' />
              Write a new post
            </button>
            <button
              onClick={() => navigate('/admin/tags')}
              className='bg-white/[0.08] hover:bg-white/[0.12] text-[#dadada] px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-white/[0.05]'
            >
              <Tags className='w-4 h-4' />
              Manage tags
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
