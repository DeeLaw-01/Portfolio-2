import { useState, useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import MetaMaxPro from '../assets/Metamaxpro.webp'
import Pantheon from '../assets/Pantheon.webp'
import FounderScale from '../assets/Founderscale.webp'
import BillNow from '../assets/Billnow.webp'

interface WorkProps {
  isLargeScreen?: boolean
  is4K?: boolean
}

export default function Work ({
  isLargeScreen = false,
  is4K = false
}: WorkProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(
    'MetaMaxPro'
  )
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const projects = [
    {
      name: 'MetaMaxPro',
      hasImage: true,
      imageUrl: MetaMaxPro,
      projectUrl: 'https://metamaxpro.com'
    },
    {
      name: 'Pantheon',
      hasImage: true,
      imageUrl: Pantheon,
      projectUrl: 'https://pantheon.com'
    },
    {
      name: 'FounderScale',
      hasImage: true,
      imageUrl: FounderScale,
      projectUrl: 'https://founderscale.com'
    },
    {
      name: 'BillNow',
      hasImage: true,
      imageUrl: BillNow,
      projectUrl: 'https://billnow.com'
    }
  ]

  const handleProjectClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
    }

    let currentIndex = 0
    autoScrollRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % projects.length
      setHoveredProject(projects[currentIndex].name)
    }, 3000)
  }

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }

  const handleUserInteraction = () => {
    setIsUserInteracting(true)
    stopAutoScroll()

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    // Set new timeout for 2 seconds of inactivity
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false)
      startAutoScroll()
    }, 2000)
  }

  useEffect(() => {
    // Start auto-scroll after 2 seconds of initial load
    const initialTimeout = setTimeout(() => {
      if (!isUserInteracting) {
        startAutoScroll()
      }
    }, 2000)

    return () => {
      clearTimeout(initialTimeout)
      stopAutoScroll()
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }
    }
  }, [isUserInteracting])

  return (
    <div
      className={`bg-white/[0.08] rounded-[20px] overflow-hidden w-full ${
        isLargeScreen ? 'h-full min-h-[506px] flex-1' : 'h-[506px]'
      } ${is4K ? 'p-8' : 'p-5'}`}
    >
      <div className='h-full flex flex-col'>
        {projects.map((project, index) => (
          <div
            key={project.name}
            className={`group flex-1 flex flex-col transition-all duration-300 ease-in-out ${
              hoveredProject === project.name ? 'flex-[2]' : 'flex-1'
            }`}
            onMouseEnter={() => {
              setHoveredProject(project.name)
              handleUserInteraction()
            }}
            onMouseLeave={() => {
              handleUserInteraction()
            }}
          >
            {/* Project Header */}
            <div className='flex justify-between items-center mb-2 transition-all duration-300 ease-in-out'>
              <h3
                className={`font-normal text-[#dadada] transition-all duration-300 ease-in-out ${
                  is4K ? 'text-[40px]' : 'text-[25px]'
                } ${
                  hoveredProject === project.name
                    ? 'transform -translate-y-2'
                    : 'transform translate-y-0'
                }`}
              >
                {project.name}
              </h3>
              <div
                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ease-in-out ${
                  hoveredProject === project.name
                    ? 'transform -translate-x-1 -translate-y-1'
                    : 'transform translate-x-0 translate-y-0'
                }`}
              >
                <ArrowUpRight
                  className={`text-[#dadada] ${is4K ? 'w-12 h-12' : 'w-8 h-8'}`}
                />
              </div>
            </div>

            {/* Project Image - Shows on hover */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                hoveredProject === project.name
                  ? 'opacity-100 max-h-[200px] mb-4'
                  : 'opacity-0 max-h-0 mb-0'
              }`}
            >
              <img
                src={project.imageUrl}
                alt={project.name}
                className={`w-full object-cover rounded-[20px] cursor-pointer ${
                  is4K ? 'h-[280px]' : 'h-[180px]'
                }`}
                onClick={() => {
                  handleProjectClick(project.projectUrl)
                  handleUserInteraction()
                }}
              />
            </div>

            {/* Border Line (except for last item) */}
            {index < projects.length - 1 && (
              <div
                className={`h-[1px] bg-[#7203a9] transition-all duration-300 ease-in-out ${
                  hoveredProject === project.name ? 'mt-4' : 'mt-2'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
