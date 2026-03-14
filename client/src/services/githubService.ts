interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
  repository?: {
    name: string
    full_name: string
  }
}

interface GitHubBackendResponse {
  success: boolean
  username?: string
  commits: GitHubCommit[]
  message?: string
}

class GitHubService {
  private baseUrl: string
  private cache: { commits: GitHubCommit[]; username: string } | null = null
  private cacheExpiry: number = 0

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  }

  private async fetchFromBackend(endpoint: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`Backend API error: ${res.status}`)
      }

      return await res.json()
    } catch (error) {
      console.error('Backend API fetch error:', error)
      return null
    }
  }

  async getRecentCommits(
    forceRefresh: boolean = false
  ): Promise<{ commits: GitHubCommit[]; username: string }> {
    // Cache for 5 minutes
    if (!forceRefresh && this.cache && Date.now() < this.cacheExpiry) {
      return this.cache
    }

    try {
      const response: GitHubBackendResponse = await this.fetchFromBackend(
        '/api/github/recent-activity'
      )

      if (response && response.success && response.commits) {
        this.cache = {
          commits: response.commits,
          username: response.username || ''
        }
        this.cacheExpiry = Date.now() + 5 * 60 * 1000
        return this.cache
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
    }

    return { commits: [], username: '' }
  }

  clearCache() {
    this.cache = null
    this.cacheExpiry = 0
  }

  async forceRefresh(): Promise<{ commits: GitHubCommit[]; username: string }> {
    return this.getRecentCommits(true)
  }
}

export const githubService = new GitHubService()
export type { GitHubCommit }
