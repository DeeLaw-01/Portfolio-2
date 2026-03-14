import { useState, useEffect, useRef } from 'react'
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

    // Poll every 5 minutes
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
      className={`bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] flex flex-col group w-full relative overflow-hidden hover:bg-white/[0.12] transition-all duration-300 ${
        isLargeScreen ? 'h-full min-h-[355px]' : 'h-[355px]'
      } ${is4K ? 'p-8' : 'p-5'}`}
    >
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#7203a9]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

      {/* GitHub Activity — fills the top portion */}
      <div className='relative z-10 flex-1 min-h-0'>
        <GitHubActivity
          commits={commits}
          username={username}
          isLoading={isLoading}
          is4K={is4K}
        />
      </div>

      {/* Main Slogan — anchored to bottom */}
      <div className='relative z-10 mt-auto pt-2'>
        <div
          className='text-[#dadada]'
          style={{ letterSpacing: '0px', textAlign: 'left' }}
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
