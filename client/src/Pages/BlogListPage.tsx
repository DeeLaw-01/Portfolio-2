import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calendar,
  Eye,
  ArrowRight,
  ArrowUp,
  Tag,
  Heart,
  MessageCircle,
  X,
  SlidersHorizontal,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import BlogLayout from '../components/BlogLayout'
import {
  blogService,
  type BlogMeta,
  type Tag as TagType
} from '../services/blogService'

export default function BlogListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // All preloaded blog metadata for instant filtering
  const [allBlogs, setAllBlogs] = useState<BlogMeta[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Search & filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '')
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '')
  const [showFilters, setShowFilters] = useState(false)

  // Deep content search (server-side)
  const [contentResults, setContentResults] = useState<BlogMeta[] | null>(null)
  const [contentSearching, setContentSearching] = useState(false)
  const contentSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pagination
  const PAGE_SIZE = 12
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Scroll to top
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  // Load all blog metadata + tags on mount (preload)
  useEffect(() => {
    loadData()
  }, [])

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [blogsRes, tagsRes] = await Promise.all([
        blogService.getBlogsMeta(),
        blogService.getTags()
      ])
      if (blogsRes.success) setAllBlogs(blogsRes.blogs)
      if (tagsRes.success) setTags(tagsRes.tags)
    } catch (err) {
      console.error('Failed to load blog data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side instant filtering
  const filteredBlogs = useMemo(() => {
    let result = allBlogs

    // Tag filter
    if (activeTag) {
      result = result.filter(b =>
        b.tags.some(t => t.slug === activeTag)
      )
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter(
        b => b.publishedAt && new Date(b.publishedAt) >= from
      )
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter(
        b => b.publishedAt && new Date(b.publishedAt) <= to
      )
    }

    // Title + excerpt search (instant, client-side)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q)
      )
    }

    return result
  }, [allBlogs, activeTag, dateFrom, dateTo, search])

  // Deep content search (debounced, server-side)
  const triggerContentSearch = useCallback(
    (query: string) => {
      if (contentSearchTimeout.current) {
        clearTimeout(contentSearchTimeout.current)
      }

      if (!query.trim() || query.trim().length < 2) {
        setContentResults(null)
        setContentSearching(false)
        return
      }

      setContentSearching(true)
      contentSearchTimeout.current = setTimeout(async () => {
        try {
          const res = await blogService.searchBlogs(query, {
            tag: activeTag || undefined,
            from: dateFrom || undefined,
            to: dateTo || undefined,
            limit: 50
          })
          if (res.success) {
            setContentResults(
              res.blogs.map(b => ({
                _id: b._id,
                title: b.title,
                slug: b.slug,
                excerpt: b.excerpt,
                coverImage: b.coverImage,
                tags: b.tags,
                publishedAt: b.publishedAt,
                views: b.views,
                likes: b.likes ?? 0,
                commentsCount: b.commentsCount ?? 0
              }))
            )
          }
        } catch {
          setContentResults(null)
        } finally {
          setContentSearching(false)
        }
      }, 500)
    },
    [activeTag, dateFrom, dateTo]
  )

  // Trigger content search when search changes
  useEffect(() => {
    triggerContentSearch(search)
    return () => {
      if (contentSearchTimeout.current) clearTimeout(contentSearchTimeout.current)
    }
  }, [search, triggerContentSearch])

  // The final displayed blogs: prefer content search results when available, else client-side
  const displayedBlogs = useMemo(() => {
    if (search.trim().length >= 2 && contentResults !== null) {
      // Merge: show client-side matches first, then add any server-side matches not already shown
      const clientIds = new Set(filteredBlogs.map(b => b._id))
      const serverOnly = contentResults.filter(b => !clientIds.has(b._id))
      return [...filteredBlogs, ...serverOnly].slice(0, visibleCount)
    }
    return filteredBlogs.slice(0, visibleCount)
  }, [filteredBlogs, contentResults, search, visibleCount])

  const totalResults = useMemo(() => {
    if (search.trim().length >= 2 && contentResults !== null) {
      const clientIds = new Set(filteredBlogs.map(b => b._id))
      const serverOnly = contentResults.filter(b => !clientIds.has(b._id))
      return filteredBlogs.length + serverOnly.length
    }
    return filteredBlogs.length
  }, [filteredBlogs, contentResults, search])

  const handleTagClick = (slug: string) => {
    const newTag = activeTag === slug ? '' : slug
    setActiveTag(newTag)
    setVisibleCount(PAGE_SIZE)
    setSearchParams(prev => {
      if (newTag) prev.set('tag', newTag)
      else prev.delete('tag')
      return prev
    })
  }

  const clearFilters = () => {
    setSearch('')
    setActiveTag('')
    setDateFrom('')
    setDateTo('')
    setVisibleCount(PAGE_SIZE)
    setSearchParams({})
    setContentResults(null)
    searchInputRef.current?.focus()
  }

  const hasActiveFilters = search || activeTag || dateFrom || dateTo

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] as any }
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  return (
    <BlogLayout>
      {/* Page Header - More Compact */}
      <div className='mb-6'>
        <h1 className='text-3xl md:text-4xl font-bold text-white mb-1'>
          Blog
        </h1>
        <p className='text-sm text-[#dadada]/50'>
          Thoughts, learnings, and the occasional rant.
        </p>
      </div>

      {/* Search Bar - Sleeker */}
      <div className='mb-4 space-y-2'>
        <div className='relative flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#dadada]/30' />
            <input
              ref={searchInputRef}
              type='text'
              placeholder="Search titles, excerpts, even content..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setVisibleCount(PAGE_SIZE)
                setSearchParams(prev => {
                  if (e.target.value) prev.set('search', e.target.value)
                  else prev.delete('search')
                  return prev
                })
              }}
              className='w-full bg-white/[0.06] border border-white/[0.05] rounded-xl pl-9 pr-8 py-2 text-sm text-[#dadada] placeholder-[#dadada]/25 focus:outline-none focus:border-[#a855f7]/50 transition-colors'
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  setContentResults(null)
                  setSearchParams(prev => {
                    prev.delete('search')
                    return prev
                  })
                  searchInputRef.current?.focus()
                }}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-[#dadada]/20 hover:text-[#dadada]/40 transition-colors'
              >
                <X className='w-3 h-3' />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all ${
              showFilters || dateFrom || dateTo
                ? 'bg-[#7203a9]/20 border-[#a855f7]/50 text-[#a855f7]'
                : 'bg-white/[0.06] border-white/[0.05] text-[#dadada]/50 hover:text-[#dadada]'
            }`}
          >
            <SlidersHorizontal className='w-3 h-3' />
            <span className='hidden sm:inline'>Filters</span>
          </button>
        </div>

        {/* Search Status - Smaller */}
        {search.trim() && (
          <div className='flex items-center gap-1.5 text-xs text-[#dadada]/30'>
            {contentSearching && (
              <Loader2 className='w-2.5 h-2.5 animate-spin text-[#a855f7]' />
            )}
            <span>
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Advanced Filters Panel - Compact */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='bg-white/[0.04] border border-white/[0.05] rounded-xl p-3 space-y-3'>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-[10px] text-[#dadada]/30 mb-1 block uppercase tracking-wide'>
                      From
                    </label>
                    <input
                      type='date'
                      value={dateFrom}
                      onChange={e => {
                        setDateFrom(e.target.value)
                        setVisibleCount(PAGE_SIZE)
                        setSearchParams(prev => {
                          if (e.target.value) prev.set('from', e.target.value)
                          else prev.delete('from')
                          return prev
                        })
                      }}
                      className='w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-[#dadada] focus:outline-none focus:border-[#a855f7]/50 transition-colors [color-scheme:dark]'
                    />
                  </div>
                  <div>
                    <label className='text-[10px] text-[#dadada]/30 mb-1 block uppercase tracking-wide'>
                      To
                    </label>
                    <input
                      type='date'
                      value={dateTo}
                      onChange={e => {
                        setDateTo(e.target.value)
                        setVisibleCount(PAGE_SIZE)
                        setSearchParams(prev => {
                          if (e.target.value) prev.set('to', e.target.value)
                          else prev.delete('to')
                          return prev
                        })
                      }}
                      className='w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-[#dadada] focus:outline-none focus:border-[#a855f7]/50 transition-colors [color-scheme:dark]'
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags - Compact */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {tags.map(tag => (
              <button
                key={tag._id}
                onClick={() => handleTagClick(tag.slug)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 border ${
                  activeTag === tag.slug
                    ? 'bg-[#7203a9] border-[#a855f7] text-white'
                    : 'bg-white/[0.04] border-white/[0.08] text-[#dadada]/60 hover:border-[#a855f7]/40 hover:text-[#dadada]'
                }`}
              >
                <Tag className='w-2.5 h-2.5 inline mr-1' />
                {tag.name}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='px-2 py-1 rounded-lg text-[10px] font-medium border border-red-500/30 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all'
              >
                <X className='w-2.5 h-2.5 inline mr-1' />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blog Grid - Sleeker Cards */}
      {isLoading ? (
        <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-white/[0.06] rounded-xl h-48 animate-pulse'
            />
          ))}
        </div>
      ) : displayedBlogs.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-lg text-[#dadada]/40 mb-1'>Nothing here yet.</p>
          <p className='text-xs text-[#dadada]/25'>
            {hasActiveFilters
              ? "No posts match your filters."
              : "I'll get around to writing eventually."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className='mt-3 text-xs text-[#a855f7] hover:text-[#c084fc] transition-colors'
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence mode='popLayout'>
              {displayedBlogs.map((blog, i) => (
                <motion.article
                  key={blog._id}
                  custom={i}
                  variants={cardVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  layout
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className='group bg-white/[0.06] backdrop-blur-sm border border-white/[0.05] rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.10] hover:border-white/[0.10] transition-all duration-200'
                >
                  {blog.coverImage && (
                    <div className='h-32 overflow-hidden'>
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        loading='lazy'
                      />
                    </div>
                  )}
                  <div className='p-3'>
                    {/* Tags - Compact */}
                    {blog.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1 mb-2'>
                        {blog.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag._id}
                            className='px-1.5 py-0.5 rounded text-[9px] font-medium border'
                            style={{
                              borderColor: tag.color + '30',
                              color: tag.color,
                              backgroundColor: tag.color + '10'
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {blog.tags.length > 2 && (
                          <span className='px-1.5 py-0.5 rounded text-[9px] text-[#dadada]/40'>
                            +{blog.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <h2 className='text-sm font-semibold text-white mb-1.5 group-hover:text-[#a855f7] transition-colors line-clamp-2 leading-snug'>
                      {blog.title}
                    </h2>
                    <p className='text-[11px] text-[#dadada]/50 mb-2.5 line-clamp-2 leading-relaxed'>
                      {blog.excerpt}
                    </p>

                    <div className='flex items-center justify-between text-[10px] text-[#dadada]/30'>
                      <div className='flex items-center gap-2'>
                        <span className='flex items-center gap-0.5'>
                          <Calendar className='w-2.5 h-2.5' />
                          {blog.publishedAt
                            ? format(new Date(blog.publishedAt), 'MMM d')
                            : 'Draft'}
                        </span>
                        <span className='flex items-center gap-0.5'>
                          <Eye className='w-2.5 h-2.5' />
                          {blog.views}
                        </span>
                        <span className='flex items-center gap-0.5'>
                          <Heart className='w-2.5 h-2.5' />
                          {blog.likes}
                        </span>
                        <span className='flex items-center gap-0.5'>
                          <MessageCircle className='w-2.5 h-2.5' />
                          {blog.commentsCount}
                        </span>
                      </div>
                      <ArrowRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#a855f7] opacity-0 group-hover:opacity-100' />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More - Compact */}
          {visibleCount < totalResults && (
            <div className='flex justify-center mt-6'>
              <button
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                className='px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.05] text-xs text-[#dadada]/50 hover:bg-white/[0.10] hover:text-[#dadada] transition-all'
              >
                Load more ({totalResults - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Scroll to Top Button - Bottom Left */}
      {showScrollToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className='fixed bottom-6 left-6 z-50 bg-[#7203a9] text-white p-3 rounded-full shadow-lg hover:bg-[#8a1bb8] transition-colors duration-200'
        >
          <ArrowUp className='w-5 h-5' />
        </motion.button>
      )}
    </BlogLayout>
  )
}
