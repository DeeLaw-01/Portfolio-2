interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  external_urls: {
    spotify: string
  }
}

interface SpotifyApiResponse {
  items: SpotifyTrack[]
}

interface SpotifyBackendResponse {
  success: boolean
  track: SpotifyTrack | null
  isCurrentlyPlaying?: boolean
  message?: string
}

class SpotifyService {
  private baseUrl: string
  private cache: SpotifyTrack | null = null
  private cacheExpiry: number = 0
  private isCurrentlyPlaying: boolean = false

  constructor () {
    // Use environment variable or fallback to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  }

  private async fetchFromBackend (endpoint: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          console.warn('Spotify token not available or expired')
          return null
        }
        throw new Error(`Backend API error: ${res.status}`)
      }

      return await res.json()
    } catch (error) {
      console.error('Backend API fetch error:', error)
      return null
    }
  }

  async getTrackToDisplay (
    forceRefresh: boolean = false
  ): Promise<SpotifyTrack | null> {
    // Return cached data if still valid and not forcing refresh (cache for 15 seconds since we poll every 30 seconds)
    if (!forceRefresh && this.cache && Date.now() < this.cacheExpiry) {
      return this.cache
    }

    try {
      const response: SpotifyBackendResponse = await this.fetchFromBackend(
        '/api/spotify/current-track'
      )

      if (response && response.success && response.track) {
        this.cache = response.track
        this.isCurrentlyPlaying = response.isCurrentlyPlaying || false
        this.cacheExpiry = Date.now() + 15 * 1000 // Cache for 15 seconds
        return this.cache
      } else if (response && response.success && !response.track) {
        // No track data available - clear cache
        this.cache = null
        this.isCurrentlyPlaying = false
        this.cacheExpiry = 0
        return null
      }
    } catch (error) {
      console.error('Error fetching track data:', error)
    }

    return null
  }

  getPlaceholderTrack (): SpotifyTrack {
    return {
      id: 'placeholder',
      name: 'My Coding Playlist',
      artists: [{ name: 'Waleed Ahmed' }],
      album: {
        name: 'Portfolio Vibes',
        images: [
          {
            url: 'https://via.placeholder.com/200x200/7203a9/dadada?text=♪',
            height: 200,
            width: 200
          }
        ]
      },
      external_urls: {
        spotify: 'https://open.spotify.com'
      }
    }
  }

  // Get whether the current track is actually playing or is a top track
  getIsCurrentlyPlaying (): boolean {
    return this.isCurrentlyPlaying
  }

  // Clear cache when needed
  clearCache () {
    this.cache = null
    this.cacheExpiry = 0
    this.isCurrentlyPlaying = false
  }

  // Force refresh the current track data
  async forceRefresh (): Promise<SpotifyTrack | null> {
    return this.getTrackToDisplay(true)
  }
}

export const spotifyService = new SpotifyService()
export type { SpotifyTrack }
