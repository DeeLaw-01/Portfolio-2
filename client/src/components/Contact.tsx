import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import BlobCursor from './BlobCursor'
import ContactModal from './ContactModal'

interface ContactProps {
  isLargeScreen?: boolean
  is4K?: boolean
}

export default function Contact ({
  isLargeScreen = false,
  is4K = false
}: ContactProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  return (
    <div
      className={`relative w-full cursor-pointer group ${
        isLargeScreen ? 'h-full min-h-[235px]' : 'h-[235px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Main card with blob cursor */}
      <div
        className={`w-full h-full rounded-[20px] overflow-hidden transition-colors duration-500 ${
          isHovered
            ? 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.05]'
            : 'bg-[#7203a9]'
        }`}
      >
        {isHovered && (
          <BlobCursor
            blobType='circle'
            fillColor='#7203a9'
            trailCount={3}
            sizes={[50, 80, 65]}
            innerSizes={[20, 30, 25]}
            innerColor='rgba(114,3,169,0.9)'
            opacities={[0.9, 0.7, 0.5]}
            shadowColor='rgba(114,3,169,0.6)'
            shadowBlur={20}
            shadowOffsetX={0}
            shadowOffsetY={0}
            filterStdDeviation={35}
            useFilter={true}
            fastDuration={0.1}
            slowDuration={0.5}
            zIndex={1}
          />
        )}
      </div>

      {/* Absolutely positioned text overlay with pointer-events passthrough */}
      <div className='absolute inset-0 p-5 flex flex-col justify-between pointer-events-none z-10'>
        {/* Top Section */}
        <div className='flex justify-between items-start'>
          <p
            className={`text-[#dadada] ${
              is4K ? 'text-[18px] leading-[22px]' : 'text-[13px] leading-[15px]'
            }`}
          >
            Have some
            <br />
            questions?
          </p>

          {/* Arrow Icon */}
          <div
            className={`absolute group-hover:top-3 group-hover:right-3 flex items-center justify-center transition-all duration-300 ease-in-out ${
              is4K
                ? 'w-[48px] h-[48px] top-6 right-6'
                : 'w-[32px] h-[32px] top-4 right-4'
            }`}
          >
            <ArrowUpRight
              className={`text-[#dadada] ${is4K ? 'w-12 h-12' : 'w-8 h-8'}`}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div>
          <h2
            className={`text-[#dadada] font-normal ${
              is4K ? 'text-[70px] leading-[80px]' : 'text-[46px] leading-[54px]'
            }`}
          >
            Contact me
          </h2>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
