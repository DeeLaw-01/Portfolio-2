import { useState } from 'react'

interface VinylRecordProps {
  albumArt?: string
  albumTitle?: string
  artist?: string
  isPlaying?: boolean
  isCurrentlyPlaying?: boolean
  onClick?: () => void
}

export default function VinylRecord ({
  albumArt = 'https://via.placeholder.com/200x200/7203a9/ffffff?text=♪',
  albumTitle = 'Currently Playing',
  artist = 'Your Music',
  isPlaying = false,
  isCurrentlyPlaying = false,
  onClick
}: VinylRecordProps) {
  return (
    <div className='relative'>
      {/* Vinyl Record */}
      <div
        className='relative w-[32rem] h-[32rem] cursor-pointer'
        style={{
          animation: 'spin 12s linear infinite'
        }}
        onClick={onClick}
      >
        {/* Outer vinyl ring - dark purple theme */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-br from-[#1a0b2e] via-[#0e0e14] to-[#2a0a3d] shadow-2xl'>
          {/* Vinyl grooves */}
          <div className='absolute inset-4 rounded-full border border-[#7203a9]/30 opacity-40'></div>
          <div className='absolute inset-8 rounded-full border border-[#7203a9]/20 opacity-30'></div>
          <div className='absolute inset-12 rounded-full border border-[#7203a9]/15 opacity-20'></div>
          <div className='absolute inset-16 rounded-full border border-[#7203a9]/10 opacity-15'></div>
        </div>

        {/* Album cover in center */}
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full overflow-hidden shadow-xl'>
          <img
            src={albumArt}
            alt={`${albumTitle} by ${artist}`}
            className='w-full h-full object-cover'
          />

          {/* Center hole */}
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0e0e14] rounded-full shadow-inner'>
            <div className='absolute inset-1 bg-[#2a0a3d] rounded-full'></div>
          </div>
        </div>

        {/* Reflection/shine effect */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-br from-[#7203a9]/20 via-transparent to-transparent opacity-40'></div>
      </div>
    </div>
  )
}
