import { useState, useEffect, useRef } from 'react'
import { GitCommit } from 'lucide-react'
import GitHubActivity from './GitHubActivity'
import { githubService, type GitHubCommit } from '../services/githubService'

interface HeroProps {
  isLargeScreen?: boolean
  is4K?: boolean
}

export default function Hero ({
  isLargeScreen = false,
  is4K = false
}: HeroProps) {
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadGitHubData()

    intervalRef.current = setInterval(() => {
      loadGitHubData()
    }, 5 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const loadGitHubData = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true)
      const data = await githubService.getRecentCommits(forceRefresh)
      setCommits(data.commits)
      setUsername(data.username)
    } catch (error) {
      console.error('Error loading GitHub data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] flex flex-col justify-between group w-full relative overflow-hidden hover:bg-white/[0.12] transition-all duration-300 ${
        isLargeScreen ? 'h-full min-h-[355px]' : 'h-[355px]'
      } ${is4K ? 'p-8' : 'p-6'}`}
    >
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#7203a9]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

      {/* Large GitCommit icon — spans full card height vertically */}
      <div
        className='absolute top-1/2 -translate-y-1/2 -right-60 pointer-events-none md:block hidden'
        style={{
          maskImage:
            'linear-gradient(to right, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, black 50%, transparent 100%)',
          transform: 'translateY(-50%) rotate(90deg)'
        }}
      >
        <GitCommit
          className={`relative text-[#a855f7] ${
            is4K ? 'w-[500px] h-[500px]' : 'w-[800px] h-[800px]'
          }`}
          strokeWidth={0.8}
        />
      </div>

      {/* GitHub Activity — commit info top-left */}
      <div className='relative z-10 pt-10'>
        <GitHubActivity
          commits={commits}
          username={username}
          isLoading={isLoading}
          is4K={is4K}
        />
      </div>

      {/* Main Slogan — anchored to bottom */}
      <div className='relative z-10 mt-auto'>
        <div
          className='text-[#dadada] pb-12  pl-8'
          style={{ letterSpacing: '0px', textAlign: 'left' }}
        >
          <div
            className={`group-hover:text-white transition-colors duration-300 ${
              is4K
                ? 'text-5xl leading-[96px] -mb-6'
                : 'text-4xl leading-tight -mb-1'
            }`}
          >
            Design Meets
          </div>
          <div
            className={`font-extralight italic group-hover:text-white transition-colors duration-300 ${
              is4K ? 'text-8xl leading-[96px]' : 'text-8xl leading-tight'
            }`}
          >
            Efficiency
          </div>
          <div
            className={`font-bold mt-1 group-hover:text-white transition-colors duration-300 ${
              is4K
                ? 'text-4xl ml-48 leading-[72px]'
                : 'text-2xl ml-36 leading-tight'
            }`}
          >
            -Beautifully Coded.
          </div>
        </div>
      </div>
    </div>
  )
}
