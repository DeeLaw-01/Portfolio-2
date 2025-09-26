import { useState } from 'react'

interface VinylRecordProps {
  albumArt?: string
  albumTitle?: string
  artist?: string
  isPlaying?: boolean
  isCurrentlyPlaying?: boolean
  onClick?: () => void
  is4K?: boolean
}

export default function VinylRecord ({
  albumArt = 'https://via.placeholder.com/200x200/7203a9/ffffff?text=♪',
  albumTitle = 'Currently Playing',
  artist = 'Your Music',
  isPlaying = false,
  isCurrentlyPlaying = false,
  onClick,
  is4K = false
}: VinylRecordProps) {
  return (
    <div className='relative'>
      {/* Vinyl Record */}
      <div
        className={`relative cursor-pointer ${
          is4K ? 'w-[48rem] h-[48rem]' : 'w-[32rem] h-[32rem]'
        }`}
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
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-xl ${
            is4K ? 'w-72 h-72' : 'w-48 h-48'
          }`}
        >
          <img
            src={albumArt}
            alt={`${albumTitle} by ${artist}`}
            className='w-full h-full object-cover transition-all duration-500 ease-in-out'
            key={albumArt} // Force re-render on album art change for smooth transition
          />

          {/* Center hole */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0e0e14] rounded-full shadow-inner ${
              is4K ? 'w-12 h-12' : 'w-8 h-8'
            }`}
          >
            <div
              className={`absolute bg-[#2a0a3d] rounded-full ${
                is4K ? 'inset-2' : 'inset-1'
              }`}
            ></div>
          </div>
        </div>

        {/* Reflection/shine effect */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-br from-[#7203a9]/20 via-transparent to-transparent opacity-40'></div>
      </div>
    </div>
  )
}
