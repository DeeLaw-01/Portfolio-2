import { useState, useEffect, useRef } from 'react'
import VinylRecord from './VinylRecord'
import { spotifyService, type SpotifyTrack } from '../services/spotifyService'

export default function Hero () {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadSpotifyData()

    // Set up polling every 30 seconds (30000ms)
    intervalRef.current = setInterval(() => {
      loadSpotifyData()
    }, 30000)

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
      setCurrentTrack(track)
      setIsCurrentlyPlaying(spotifyService.getIsCurrentlyPlaying())
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
    <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-5 h-[355px] flex flex-col justify-between group w-full relative overflow-hidden hover:bg-white/[0.12] transition-all duration-300'>
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#7203a9]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

      {/* Track Info - Clean and Minimal */}
      <div
        className='absolute top-4 left-4 z-20 cursor-pointer hover:opacity-80 transition-opacity duration-200'
        onClick={handleTrackInfoClick}
        title='Click to refresh Spotify status'
      >
        <div className='text-xs text-white mb-1 font-medium'>
          {isLoading
            ? '🎵 Loading...'
            : currentTrack
            ? isCurrentlyPlaying
              ? '🎵 Currently Listening To'
              : '⭐ Top This Week'
            : '🎵 Spotify Status'}
        </div>
        <div className='font-medium text-white text-sm max-w-[200px] truncate'>
          {isLoading ? 'Loading...' : currentTrack?.name || 'Nothing playing'}
        </div>
        <div className='text-[#dadada]/70 text-xs max-w-[200px] truncate'>
          {isLoading
            ? 'Spotify'
            : currentTrack?.artists?.[0]?.name || 'Check your Spotify'}
        </div>
      </div>

      {/* Vinyl Record Background - Top Right */}
      <div className='absolute -top-56 -right-56 z-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300'>
        <VinylRecord
          albumArt={
            currentTrack?.album?.images?.[0]?.url ||
            'https://via.placeholder.com/200x200/7203a9/dadada?text=♪'
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
          <div className='text-3xl leading-[64px]  group-hover:text-white transition-colors duration-300 -mb-4'>
            Design Meets
          </div>
          <div className='text-6xl leading-[64px] font-extralight italic group-hover:text-white transition-colors duration-300'>
            Efficiency
          </div>
          <div className='text-2xl ml-32 leading-[48px] font-bold mt-2 group-hover:text-white transition-colors duration-300'>
            -Beautifully Coded.
          </div>
        </div>
      </div>
    </div>
  )
}
