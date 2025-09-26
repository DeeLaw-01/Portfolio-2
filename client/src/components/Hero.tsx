import { useState, useEffect, useRef } from 'react'
import VinylRecord from './VinylRecord'
import { spotifyService, type SpotifyTrack } from '../services/spotifyService'

interface HeroProps {
  isLargeScreen?: boolean
  is4K?: boolean
}

export default function Hero ({
  isLargeScreen = false,
  is4K = false
}: HeroProps) {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Dynamic polling based on playing status
  const startPolling = (isPlaying: boolean) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const interval = isPlaying ? 10000 : 30000 // 10s when playing, 30s when not
    intervalRef.current = setInterval(() => {
      loadSpotifyData()
    }, interval)
  }

  useEffect(() => {
    loadSpotifyData()

    // Start with 30 second polling initially
    startPolling(false)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const loadSpotifyData = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true)
      const track = await spotifyService.getTrackToDisplay(forceRefresh)
      const currentlyPlaying = spotifyService.getIsCurrentlyPlaying()

      setCurrentTrack(track)
      setIsCurrentlyPlaying(currentlyPlaying)

      // Restart polling with new interval based on playing status
      startPolling(currentlyPlaying)
    } catch (error) {
      console.error('Error loading Spotify data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpotifyClick = () => {
    if (currentTrack?.external_urls?.spotify) {
      window.open(currentTrack.external_urls.spotify, '_blank')
    } else {
      window.open('https://open.spotify.com', '_blank')
    }
  }

  const handleTrackInfoClick = () => {
    // Force refresh the Spotify data
    loadSpotifyData(true)
  }

  return (
    <div
      className={`bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] flex flex-col justify-between group w-full relative overflow-hidden hover:bg-white/[0.12] transition-all duration-300 ${
        isLargeScreen ? 'h-full min-h-[355px]' : 'h-[355px]'
      } ${is4K ? 'p-8' : 'p-5'}`}
    >
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#7203a9]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

      {/* Track Info - Clean and Minimal */}
      <div
        className={`absolute z-20 cursor-pointer hover:opacity-80 transition-opacity duration-200 group/spotify ${
          is4K ? 'top-6 left-6' : 'top-4 left-4'
        }`}
        onClick={handleTrackInfoClick}
        title='Click to refresh Spotify status'
      >
        <div
          className={`text-white mb-1 font-medium ${
            is4K ? 'text-base' : 'text-xs'
          }`}
        >
          {isLoading
            ? 'Loading...'
            : currentTrack
            ? isCurrentlyPlaying
              ? 'Currently Listening To'
              : 'Top This Week'
            : 'Spotify Status'}
        </div>
        <div
          className={`font-medium text-white truncate ${
            is4K ? 'text-lg max-w-[300px]' : 'text-sm max-w-[200px]'
          }`}
        >
          {isLoading ? 'Loading...' : currentTrack?.name || 'Nothing playing'}
        </div>
        <div
          className={`text-[#dadada]/70 truncate ${
            is4K ? 'text-base max-w-[300px]' : 'text-xs max-w-[200px]'
          }`}
        >
          {isLoading
            ? 'Spotify'
            : currentTrack?.artists?.[0]?.name || 'Check your Spotify'}
        </div>

        {/* KMB Credit - appears on hover */}
        <div
          className={`text-white/60 mt-1 opacity-0 group-hover/spotify:opacity-100 transition-opacity duration-300 ${
            is4K ? 'text-xs' : 'text-[10px]'
          }`}
        >
          Inspired by KMB
        </div>
      </div>

      {/* Vinyl Record Background - Top Right */}
      <div
        className={`absolute z-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300 ${
          is4K ? '-top-80 -right-80' : '-top-56 -right-56'
        }`}
      >
        <VinylRecord
          albumArt={
            currentTrack?.album?.images?.[0]?.url ||
            'https://www.cranfield-colours.co.uk/wp-content/uploads/2022/01/cranfield-traditional-etching-ink-mid-black.jpg'
          }
          albumTitle={
            isLoading ? 'Loading...' : currentTrack?.name || 'No track playing'
          }
          artist={
            isLoading
              ? 'Spotify'
              : currentTrack?.artists?.[0]?.name || 'Unknown Artist'
          }
          isCurrentlyPlaying={isCurrentlyPlaying}
          onClick={handleSpotifyClick}
          is4K={is4K}
        />
      </div>

      {/* Main Slogan - Exact Figma Typography */}
      <div className='mt-auto relative z-10'>
        <div
          className='text-[#dadada]'
          style={{
            letterSpacing: '0px',
            textAlign: 'left'
          }}
        >
          <div
            className={`group-hover:text-white transition-colors duration-300 ${
              is4K
                ? 'text-5xl leading-[96px] -mb-6'
                : 'text-3xl leading-[64px] -mb-4'
            }`}
          >
            Design Meets
          </div>
          <div
            className={`font-extralight italic group-hover:text-white transition-colors duration-300 ${
              is4K ? 'text-8xl leading-[96px]' : 'text-6xl leading-[64px]'
            }`}
          >
            Efficiency
          </div>
          <div
            className={`font-bold mt-2 group-hover:text-white transition-colors duration-300 ${
              is4K
                ? 'text-4xl ml-48 leading-[72px]'
                : 'text-2xl ml-32 leading-[48px]'
            }`}
          >
            -Beautifully Coded.
          </div>
        </div>
      </div>
    </div>
  )
}
