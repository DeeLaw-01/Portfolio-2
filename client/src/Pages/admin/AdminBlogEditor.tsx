import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save,
  Send,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  X,
  Plus,
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Code,
  Quote,
  List,
  ListOrdered,
  Table,
  Minus,
  Youtube,
  Twitter,
  FileCode
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import {
  blogService,
  type Blog,
  type Tag as TagType
} from '../../services/blogService'
import { cloudinaryService } from '../../services/cloudinaryService'

export default function AdminBlogEditor () {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)

  const [allTags, setAllTags] = useState<TagType[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [error, setError] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [showNewTag, setShowNewTag] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [preRefineState, setPreRefineState] = useState<{
    title: string
    excerpt: string
    content: string
  } | null>(null)

  useEffect(() => {
    loadTags()
    if (isEditing) loadBlog()
  }, [id])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      )
    }
  }, [title, isEditing])

  const loadTags = async () => {
    try {
      const res = await blogService.getTags()
      if (res.success) setAllTags(res.tags)
    } catch (err) {
      console.error('Failed to load tags:', err)
    }
  }

  const loadBlog = async () => {
    try {
      const res = await blogService.getAdminBlog(id!)
      if (res.success) {
        const blog = res.blog
        setTitle(blog.title)
        setSlug(blog.slug)
        setExcerpt(blog.excerpt)
        setContent(blog.content)
        setCoverImage(blog.coverImage || '')
        setSelectedTags(blog.tags.map((t: TagType) => t._id))
        setPublished(blog.published)
      }
    } catch {
      setError('Failed to load blog.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (shouldPublish?: boolean) => {
    setError('')
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      setError('Title, excerpt, and content are required. Obviously.')
      return
    }

    setIsSaving(true)
    try {
      const data = {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        tags: selectedTags,
        published: shouldPublish !== undefined ? shouldPublish : published
      }

      const res = isEditing
        ? await blogService.updateBlog(id!, data)
        : await blogService.createBlog(data)

      if (res.success) {
        navigate('/admin/blogs')
      } else {
        setError('Failed to save. Try again.')
      }
    } catch {
      setError('Something went wrong while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const res = await cloudinaryService.uploadImage(file)
        const markdownImage = `![${file.name}](${res.secure_url})`

        // Insert at cursor position
        const textarea = textareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newContent =
            content.substring(0, start) + markdownImage + content.substring(end)
          setContent(newContent)

          // Set cursor after inserted text
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              start + markdownImage.length
            textarea.focus()
          }, 0)
        } else {
          setContent(prev => prev + '\n' + markdownImage)
        }
      } catch (err) {
        setError('Image upload failed. Check your Cloudinary config.')
        console.error(err)
      } finally {
        setIsUploading(false)
      }
    },
    [content]
  )

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const res = await cloudinaryService.uploadImage(file)
      setCoverImage(res.secure_url)
    } catch {
      setError('Cover image upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file)
      }
    },
    [handleImageUpload]
  )

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await blogService.createTag(newTagName.trim())
      if (res.success) {
        setAllTags(prev => [...prev, res.tag])
        setSelectedTags(prev => [...prev, res.tag._id])
        setNewTagName('')
        setShowNewTag(false)
      }
    } catch {
      setError('Failed to create tag.')
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  // ── Toolbar insert helpers ──────────────────────────────────────────

  const insertAtCursor = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selected = content.substring(start, end)
      const insertText = selected || placeholder
      const newContent =
        content.substring(0, start) +
        before +
        insertText +
        after +
        content.substring(end)
      setContent(newContent)

      // Position cursor: if there was a selection, select the inserted text; otherwise place cursor inside
      setTimeout(() => {
        textarea.focus()
        if (selected) {
          textarea.selectionStart = start + before.length
          textarea.selectionEnd = start + before.length + selected.length
        } else {
          textarea.selectionStart = start + before.length
          textarea.selectionEnd = start + before.length + placeholder.length
        }
      }, 0)
    },
    [content]
  )

  const toolbarActions = [
    {
      icon: Heading1,
      label: 'H1',
      action: () => insertAtCursor('\n# ', '\n', 'Heading')
    },
    {
      icon: Heading2,
      label: 'H2',
      action: () => insertAtCursor('\n## ', '\n', 'Heading')
    },
    {
      icon: Heading3,
      label: 'H3',
      action: () => insertAtCursor('\n### ', '\n', 'Heading')
    },
    { type: 'divider' as const },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertAtCursor('**', '**', 'bold text')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertAtCursor('*', '*', 'italic text')
    },
    {
      icon: Code,
      label: 'Inline code',
      action: () => insertAtCursor('`', '`', 'code')
    },
    { type: 'divider' as const },
    {
      icon: Link,
      label: 'Link',
      action: () => insertAtCursor('[', '](https://)', 'link text')
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => insertAtCursor('\n> ', '\n', 'quote')
    },
    {
      icon: Minus,
      label: 'Horizontal rule',
      action: () => insertAtCursor('\n---\n')
    },
    { type: 'divider' as const },
    {
      icon: List,
      label: 'Bullet list',
      action: () => insertAtCursor('\n- ', '\n', 'item')
    },
    {
      icon: ListOrdered,
      label: 'Numbered list',
      action: () => insertAtCursor('\n1. ', '\n', 'item')
    },
    {
      icon: FileCode,
      label: 'Code block',
      action: () =>
        insertAtCursor('\n```javascript\n', '\n```\n', '// code here')
    },
    {
      icon: Table,
      label: 'Table',
      action: () =>
        insertAtCursor(
          '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| ',
          ' | cell | cell |\n',
          'cell'
        )
    },
    { type: 'divider' as const },
    {
      icon: Youtube,
      label: 'YouTube embed',
      action: () =>
        insertAtCursor('\n', '\n', 'https://www.youtube.com/watch?v=VIDEO_ID')
    },
    {
      icon: Twitter,
      label: 'Tweet embed',
      action: () =>
        insertAtCursor('\n', '\n', 'https://twitter.com/user/status/123456789')
    }
  ]

  const handleRefine = async () => {
    if (!content.trim() && !title.trim() && !excerpt.trim()) {
      setError('Write something first before asking AI to refine it.')
      return
    }
    setIsRefining(true)
    setError('')
    // Save current state for revert
    setPreRefineState({ title, excerpt, content })
    try {
      const res = await blogService.refineBlogContent({
        title: title.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content: content.trim() || undefined
      })
      if (res.success && res.refined) {
        if (res.refined.title) setTitle(res.refined.title)
        if (res.refined.excerpt) setExcerpt(res.refined.excerpt)
        if (res.refined.content) setContent(res.refined.content)
      } else {
        setPreRefineState(null)
        setError(res.message || 'AI refinement failed.')
      }
    } catch {
      setPreRefineState(null)
      setError('AI refinement failed. Check your Gemini API key.')
    } finally {
      setIsRefining(false)
    }
  }

  const handleRevert = () => {
    if (preRefineState !== null) {
      setTitle(preRefineState.title)
      setExcerpt(preRefineState.excerpt)
      setContent(preRefineState.content)
      setPreRefineState(null)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title='Loading...' subtitle='Fetching your masterpiece...'>
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='w-6 h-6 text-[#a855f7] animate-spin' />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isEditing ? 'Edit Post' : 'New Post'}
      subtitle={
        isEditing
          ? 'Fixing your mistakes, are we?'
          : 'Time to share your infinite wisdom with the world.'
      }
    >
      <div className='space-y-6'>
        {/* Top Bar */}
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navigate('/admin/blogs')}
            className='text-sm text-[#dadada]/50 hover:text-[#dadada] transition-colors flex items-center gap-1'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to posts
          </button>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className='bg-white/[0.08] hover:bg-white/[0.12] text-[#dadada] px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-white/[0.05] disabled:opacity-50'
            >
              {isSaving ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Save className='w-4 h-4' />
              )}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className='bg-[#7203a9] hover:bg-[#8a1bb8] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50'
            >
              {isSaving ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
              {published ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {error && (
          <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm'>
            {error}
          </div>
        )}

        <div className='grid lg:grid-cols-[1fr_320px] gap-6'>
          {/* Main Editor Area */}
          <div className='space-y-4'>
            {/* Title */}
            <input
              type='text'
              placeholder='Post title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              className='w-full bg-transparent text-3xl font-bold text-white placeholder-[#dadada]/20 focus:outline-none border-b border-white/[0.05] pb-3'
            />

            {/* Slug */}
            <div className='flex items-center gap-2'>
              <span className='text-xs text-[#dadada]/30'>/blog/</span>
              <input
                type='text'
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className='bg-transparent text-xs text-[#dadada]/50 focus:outline-none focus:text-[#dadada]/80 flex-1'
              />
            </div>

            {/* Excerpt */}
            <textarea
              placeholder='Write a short excerpt (shown on blog cards)...'
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              maxLength={300}
              rows={2}
              className='w-full bg-white/[0.04] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-[#dadada] placeholder-[#dadada]/20 focus:outline-none focus:border-[#a855f7]/30 resize-none'
            />

            {/* Content Editor / Preview */}
            {showPreview ? (
              <div className='bg-white/[0.04] border border-white/[0.05] rounded-[20px] p-6 min-h-[500px]'>
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className='text-[#dadada]/20'>
                    Nothing to preview. Write something first, genius.
                  </p>
                )}
              </div>
            ) : (
              <div
                className='relative'
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                {/* Floating Toolbar */}
                <div className='flex items-center gap-0.5 flex-wrap bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-1.5 mb-2'>
                  {toolbarActions.map((item, i) => {
                    if ('type' in item && item.type === 'divider') {
                      return (
                        <div
                          key={`div-${i}`}
                          className='w-px h-5 bg-white/[0.1] mx-1'
                        />
                      )
                    }
                    const Icon = (item as any).icon
                    return (
                      <button
                        key={i}
                        type='button'
                        onClick={(item as any).action}
                        className='p-1.5 rounded-lg hover:bg-white/[0.1] text-[#dadada]/50 hover:text-[#dadada] transition-colors'
                        title={(item as any).label}
                      >
                        <Icon className='w-4 h-4' />
                      </button>
                    )
                  })}
                </div>

                <textarea
                  ref={textareaRef}
                  placeholder='Write your post in Markdown... Paste YouTube, Twitter/X, Reddit, GitHub Gist, or CodePen URLs on their own line for auto-embeds.'
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className='w-full bg-white/[0.04] border border-white/[0.05] rounded-[20px] px-5 py-4 text-sm text-[#dadada] placeholder-[#dadada]/20 focus:outline-none focus:border-[#a855f7]/30 resize-none font-mono leading-relaxed min-h-[500px]'
                  style={{ tabSize: 2 }}
                  onKeyDown={e => {
                    // Handle Tab key for indentation
                    if (e.key === 'Tab') {
                      e.preventDefault()
                      const start = e.currentTarget.selectionStart
                      const end = e.currentTarget.selectionEnd
                      const newContent =
                        content.substring(0, start) +
                        '  ' +
                        content.substring(end)
                      setContent(newContent)
                      setTimeout(() => {
                        e.currentTarget.selectionStart =
                          e.currentTarget.selectionEnd = start + 2
                      }, 0)
                    }
                  }}
                />
                {isUploading && (
                  <div className='absolute inset-0 bg-black/50 rounded-[20px] flex items-center justify-center'>
                    <div className='flex items-center gap-2 text-[#a855f7]'>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span className='text-sm'>Uploading image...</span>
                    </div>
                  </div>
                )}

                {/* Hidden file input for image uploads */}
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                    e.target.value = ''
                  }}
                  accept='image/*'
                  className='hidden'
                />

                {/* Drop hint */}
                <div className='absolute bottom-3 right-3'>
                  <span className='text-[10px] text-[#dadada]/20'>
                    Drop images to upload
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-4'>
            {/* Cover Image */}
            <div className='bg-white/[0.08] border border-white/[0.05] rounded-[20px] p-5'>
              <h3 className='text-sm font-medium text-white mb-3'>
                Cover Image
              </h3>
              {coverImage ? (
                <div className='relative group'>
                  <img
                    src={coverImage}
                    alt='Cover'
                    className='w-full h-36 object-cover rounded-xl'
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className='absolute top-2 right-2 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-3 h-3 text-white' />
                  </button>
                </div>
              ) : (
                <label className='flex flex-col items-center justify-center h-36 border-2 border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-[#a855f7]/40 transition-colors'>
                  <ImageIcon className='w-8 h-8 text-[#dadada]/20 mb-2' />
                  <span className='text-xs text-[#dadada]/30'>
                    Click to upload
                  </span>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleCoverUpload(file)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>

            {/* Tags */}
            <div className='bg-white/[0.08] border border-white/[0.05] rounded-[20px] p-5'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-medium text-white'>Tags</h3>
                <button
                  onClick={() => setShowNewTag(!showNewTag)}
                  className='text-[#a855f7] hover:text-[#c084fc] transition-colors'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>

              {showNewTag && (
                <div className='flex gap-2 mb-3'>
                  <input
                    type='text'
                    placeholder='New tag name'
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                    className='flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#a855f7]/50'
                  />
                  <button
                    onClick={handleCreateTag}
                    className='bg-[#7203a9] text-white px-2 py-1.5 rounded-lg text-xs'
                  >
                    Add
                  </button>
                </div>
              )}

              <div className='flex flex-wrap gap-1.5'>
                {allTags.map(tag => (
                  <button
                    key={tag._id}
                    onClick={() => toggleTag(tag._id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                      selectedTags.includes(tag._id)
                        ? 'border-[#a855f7] bg-[#7203a9]/20 text-[#a855f7]'
                        : 'border-white/[0.08] text-[#dadada]/50 hover:border-white/[0.15]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                {allTags.length === 0 && (
                  <p className='text-xs text-[#dadada]/30'>
                    No tags yet. Create some.
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className='bg-white/[0.08] border border-white/[0.05] rounded-[20px] p-5'>
              <h3 className='text-sm font-medium text-white mb-3'>Status</h3>
              <div className='flex items-center gap-2'>
                <span
                  className={`w-2 h-2 rounded-full ${
                    published ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                />
                <span className='text-sm text-[#dadada]/60'>
                  {published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Markdown Help */}
            <div className='bg-white/[0.08] border border-white/[0.05] rounded-[20px] p-5'>
              <h3 className='text-sm font-medium text-white mb-3'>
                Markdown Cheatsheet
              </h3>
              <div className='space-y-1.5 text-xs text-[#dadada]/40 font-mono'>
                <p># Heading 1</p>
                <p>## Heading 2</p>
                <p>**bold** *italic*</p>
                <p>[link](url)</p>
                <p>![alt](image-url)</p>
                <p>```language</p>
                <p>&gt; blockquote</p>
                <p>- list item</p>
                <p>---</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className='fixed bottom-6 right-6 z-50 flex items-center gap-3'>
        {/* Revert Button — only visible after a successful AI refine */}
        {preRefineState !== null && (
          <button
            onClick={handleRevert}
            className='bg-white/[0.08] hover:bg-white/[0.12] text-[#dadada] border border-white/[0.1] p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2'
            title='Revert to pre-refine content'
          >
            <ArrowLeft className='w-5 h-5' />
            <span className='hidden sm:inline text-sm font-medium'>Revert</span>
          </button>
        )}

        {/* AI Refine Button — triggers directly, no modal */}
        <button
          onClick={handleRefine}
          disabled={
            isRefining || (!content.trim() && !title.trim() && !excerpt.trim())
          }
          className={`text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2 ${
            isRefining
              ? 'bg-[#a855f7]/50 cursor-wait'
              : !content.trim() && !title.trim() && !excerpt.trim()
              ? 'bg-white/[0.08] cursor-not-allowed opacity-40'
              : 'bg-gradient-to-r from-[#7203a9] to-[#a855f7] hover:from-[#8a1bb8] hover:to-[#c084fc]'
          }`}
          title='AI Refine with Gemini'
        >
          {isRefining ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Sparkles className='w-5 h-5' />
          )}
          <span className='hidden sm:inline text-sm font-medium'>
            {isRefining ? 'Refining...' : 'AI Refine'}
          </span>
        </button>

        {/* Preview Button */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className='bg-[#7203a9] hover:bg-[#8a1bb8] text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2'
          title={showPreview ? 'Show Editor' : 'Show Preview'}
        >
          {showPreview ? (
            <EyeOff className='w-5 h-5' />
          ) : (
            <Eye className='w-5 h-5' />
          )}
          <span className='hidden sm:inline text-sm font-medium'>
            {showPreview ? 'Editor' : 'Preview'}
          </span>
        </button>
      </div>
    </AdminLayout>
  )
}
