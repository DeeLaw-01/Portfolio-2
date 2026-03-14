import { authService } from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface Tag {
  _id: string
  name: string
  slug: string
  color: string
}

interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  tags: Tag[]
  published: boolean
  publishedAt: string | null
  views: number
  likes: number
  commentsCount: number
  createdAt: string
  updatedAt: string
}

interface BlogMeta {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  tags: Tag[]
  publishedAt: string | null
  views: number
  likes: number
  commentsCount: number
}

interface Comment {
  _id: string
  name?: string
  content?: string
  email?: string
  blog?: { title: string; slug: string }
  createdAt?: string
}

interface BlogListResponse {
  success: boolean
  blogs: Blog[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

interface BlogResponse {
  success: boolean
  blog: Blog
}

interface StatsResponse {
  success: boolean
  stats: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    totalTags: number
    topBlogs: { title: string; slug: string; views: number; publishedAt: string }[]
    recentBlogs: Blog[]
  }
}

interface BlogInput {
  title: string
  slug?: string
  content: string
  excerpt: string
  coverImage?: string
  tags?: string[]
  published?: boolean
}

class BlogService {
  // ==================== PUBLIC ====================

  async getPublishedBlogs(
    page = 1,
    limit = 10,
    tag?: string,
    search?: string
  ): Promise<BlogListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    })
    if (tag) params.set('tag', tag)
    if (search) params.set('search', search)

    const res = await fetch(`${API_URL}/api/blogs?${params}`)
    return res.json()
  }

  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    const res = await fetch(`${API_URL}/api/blogs/${slug}`)
    return res.json()
  }

  async getPublicStats(): Promise<{ success: boolean; stats: { totalPosts: number; totalViews: number; totalTags: number } }> {
    const res = await fetch(`${API_URL}/api/blogs/stats`)
    return res.json()
  }

  async getBlogsMeta(): Promise<{ success: boolean; blogs: BlogMeta[] }> {
    const res = await fetch(`${API_URL}/api/blogs/meta`)
    return res.json()
  }

  async searchBlogs(
    q: string,
    options?: { tag?: string; from?: string; to?: string; page?: number; limit?: number }
  ): Promise<BlogListResponse> {
    const params = new URLSearchParams({ q })
    if (options?.tag) params.set('tag', options.tag)
    if (options?.from) params.set('from', options.from)
    if (options?.to) params.set('to', options.to)
    if (options?.page) params.set('page', String(options.page))
    if (options?.limit) params.set('limit', String(options.limit))
    const res = await fetch(`${API_URL}/api/blogs/search?${params}`)
    return res.json()
  }

  // ==================== LIKES ====================

  async likeBlog(slug: string): Promise<{ success: boolean; likes: number }> {
    const res = await fetch(`${API_URL}/api/blogs/${slug}/like`, { method: 'POST' })
    return res.json()
  }

  async unlikeBlog(slug: string): Promise<{ success: boolean; likes: number }> {
    const res = await fetch(`${API_URL}/api/blogs/${slug}/unlike`, { method: 'POST' })
    return res.json()
  }

  // ==================== COMMENTS ====================

  async getComments(blogId: string): Promise<{ success: boolean; comments: Comment[] }> {
    const res = await fetch(`${API_URL}/api/comments/${blogId}`)
    return res.json()
  }

  async postComment(
    blogId: string,
    data: { name: string; email: string; content: string; website?: string }
  ): Promise<{ success: boolean; comment?: Comment; message?: string }> {
    const res = await fetch(`${API_URL}/api/comments/${blogId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }

  async getAdminComments(
    page = 1,
    limit = 30
  ): Promise<{
    success: boolean
    comments: Comment[]
    pagination: { total: number; page: number; pages: number }
  }> {
    const res = await fetch(
      `${API_URL}/api/comments/admin/all?page=${page}&limit=${limit}`,
      { headers: authService.getAuthHeaders() }
    )
    return res.json()
  }

  async deleteComment(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/comments/admin/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    })
    return res.json()
  }

  // ==================== ADMIN ====================

  async getAdminBlogs(page = 1, limit = 20): Promise<BlogListResponse> {
    const res = await fetch(
      `${API_URL}/api/blogs/admin/all?page=${page}&limit=${limit}`,
      { headers: authService.getAuthHeaders() }
    )
    return res.json()
  }

  async getAdminStats(): Promise<StatsResponse> {
    const res = await fetch(`${API_URL}/api/blogs/admin/stats`, {
      headers: authService.getAuthHeaders()
    })
    return res.json()
  }

  async getAdminBlog(id: string): Promise<BlogResponse> {
    const res = await fetch(`${API_URL}/api/blogs/admin/${id}`, {
      headers: authService.getAuthHeaders()
    })
    return res.json()
  }

  async createBlog(data: BlogInput): Promise<BlogResponse> {
    const res = await fetch(`${API_URL}/api/blogs/admin`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  }

  async updateBlog(id: string, data: Partial<BlogInput>): Promise<BlogResponse> {
    const res = await fetch(`${API_URL}/api/blogs/admin/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  }

  async deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/blogs/admin/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    })
    return res.json()
  }

  // ==================== AI ====================

  async refineBlogContent(
    data: { title?: string; excerpt?: string; content?: string }
  ): Promise<{
    success: boolean
    refined?: { title: string | null; excerpt: string | null; content: string | null }
    message?: string
  }> {
    const res = await fetch(`${API_URL}/api/ai/refine`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  }

  // ==================== TAGS ====================

  async getTags(): Promise<{ success: boolean; tags: Tag[] }> {
    const res = await fetch(`${API_URL}/api/tags`)
    return res.json()
  }

  async createTag(
    name: string,
    color?: string
  ): Promise<{ success: boolean; tag: Tag }> {
    const res = await fetch(`${API_URL}/api/tags`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ name, color })
    })
    return res.json()
  }

  async updateTag(
    id: string,
    data: { name?: string; color?: string }
  ): Promise<{ success: boolean; tag: Tag }> {
    const res = await fetch(`${API_URL}/api/tags/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  }

  async deleteTag(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/tags/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    })
    return res.json()
  }
}

export const blogService = new BlogService()
export type { Blog, BlogMeta, Tag, Comment, BlogInput, BlogListResponse, StatsResponse }
