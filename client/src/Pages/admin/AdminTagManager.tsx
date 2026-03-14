import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { blogService, type Tag as TagType } from '../../services/blogService'

export default function AdminTagManager () {
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#7203a9')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [error, setError] = useState('')

  const presetColors = [
    '#7203a9',
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
    '#f43f5e',
    '#8b5cf6',
    '#14b8a6',
    '#f97316'
  ]

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const res = await blogService.getTags()
      if (res.success) setTags(res.tags)
    } catch {
      setError('Failed to load tags.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    setError('')

    try {
      const res = await blogService.createTag(newTagName.trim(), newTagColor)
      if (res.success) {
        setTags(prev => [...prev, res.tag])
        setNewTagName('')
        setNewTagColor('#7203a9')
      } else {
        setError('Tag already exists. Think of something new.')
      }
    } catch {
      setError('Failed to create tag.')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setError('')

    try {
      const res = await blogService.updateTag(id, {
        name: editName.trim(),
        color: editColor
      })
      if (res.success) {
        setTags(prev => prev.map(t => (t._id === id ? res.tag : t)))
        setEditingId(null)
      }
    } catch {
      setError('Failed to update tag.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"? Posts using it will lose this tag.`))
      return

    try {
      const res = await blogService.deleteTag(id)
      if (res.success) {
        setTags(prev => prev.filter(t => t._id !== id))
      }
    } catch {
      setError('Failed to delete tag.')
    }
  }

  const startEditing = (tag: TagType) => {
    setEditingId(tag._id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  return (
    <AdminLayout
      title='Tags'
      subtitle='Organize your thoughts. If you have any.'
    >
      {error && (
        <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6'>
          {error}
        </div>
      )}

      {/* Create new tag */}
      <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-6 mb-6'>
        <h2 className='text-lg font-medium text-white mb-4'>Create New Tag</h2>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-xs text-[#dadada]/40 mb-1.5'>
              Name
            </label>
            <input
              type='text'
              placeholder='e.g., React, DevOps, Hot Takes'
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className='w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50'
            />
          </div>
          <div>
            <label className='block text-xs text-[#dadada]/40 mb-1.5'>
              Color
            </label>
            <div className='flex gap-1.5'>
              {presetColors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    newTagColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0e0e14] scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTagName.trim()}
            className='bg-[#7203a9] hover:bg-[#8a1bb8] disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Create
          </button>
        </div>

        {/* Preview */}
        {newTagName && (
          <div className='mt-4'>
            <span className='text-xs text-[#dadada]/30 mr-2'>Preview:</span>
            <span
              className='px-3 py-1 rounded-full text-xs font-medium border'
              style={{
                borderColor: newTagColor + '40',
                color: newTagColor,
                backgroundColor: newTagColor + '15'
              }}
            >
              {newTagName}
            </span>
          </div>
        )}
      </div>

      {/* Tag list */}
      {isLoading ? (
        <div className='space-y-2'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-16 bg-white/[0.08] rounded-[20px] animate-pulse'
            />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className='text-center py-16'>
          <Tag className='w-10 h-10 text-[#dadada]/10 mx-auto mb-3' />
          <p className='text-[#dadada]/30'>No tags yet. Create your first one above.</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {tags.map((tag, i) => (
            <motion.div
              key={tag._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-4 group hover:bg-white/[0.10] transition-colors'
            >
              {editingId === tag._id ? (
                <div className='flex items-center gap-3'>
                  <input
                    type='text'
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e =>
                      e.key === 'Enter' && handleUpdate(tag._id)
                    }
                    className='flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-[#dadada] focus:outline-none focus:border-[#7203a9]/50'
                    autoFocus
                  />
                  <div className='flex gap-1'>
                    {presetColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditColor(color)}
                        className={`w-5 h-5 rounded-md transition-all ${
                          editColor === color
                            ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0e0e14]'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpdate(tag._id)}
                    className='p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors'
                  >
                    <Check className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className='p-1.5 rounded-lg bg-white/[0.06] text-[#dadada]/40 hover:bg-white/[0.1] transition-colors'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-md flex-shrink-0'
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className='text-sm text-[#dadada] font-medium'>
                      {tag.name}
                    </span>
                    <span className='text-xs text-[#dadada]/20 font-mono'>
                      /{tag.slug}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={() => startEditing(tag)}
                      className='p-1.5 rounded-lg hover:bg-white/[0.1] text-[#dadada]/40 hover:text-[#7203a9] transition-colors'
                    >
                      <Pencil className='w-3.5 h-3.5' />
                    </button>
                    <button
                      onClick={() => handleDelete(tag._id, tag.name)}
                      className='p-1.5 rounded-lg hover:bg-red-500/10 text-[#dadada]/40 hover:text-red-400 transition-colors'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
