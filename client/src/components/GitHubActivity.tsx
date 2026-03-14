import { Github, GitCommit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { GitHubCommit } from '../services/githubService'

interface GitHubActivityProps {
  commits: GitHubCommit[]
  username: string
  isLoading?: boolean
  is4K?: boolean
}

export default function GitHubActivity ({
  commits,
  username,
  isLoading = false,
  is4K = false
}: GitHubActivityProps) {
  const latestCommit = commits[0] || null
  const profileUrl = username ? `https://github.com/${username}` : '#'

  return (
    <a
      href={profileUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='block w-full h-full'
    >
      <div className='relative w-full h-full flex items-center'>
        {/* Left side — commit info */}
        <div
          className={`relative z-10 flex flex-col justify-center flex-1 min-w-0 ${
            is4K ? 'pr-8' : 'pr-4'
          }`}
        >
          {/* Label */}
          <div className='flex items-center gap-2 mb-3'>
            <Github
              className={`text-[#a855f7] ${is4K ? 'w-5 h-5' : 'w-4 h-4'}`}
            />
            <span
              className={`text-[#dadada]/50 uppercase tracking-widest font-medium ${
                is4K ? 'text-xs' : 'text-[10px]'
              }`}
            >
              Latest Commit
            </span>
          </div>

          {isLoading ? (
            <div className='space-y-2'>
              <div
                className={`bg-white/[0.08] rounded animate-pulse ${
                  is4K ? 'h-6 w-4/5' : 'h-5 w-3/4'
                }`}
              />
              <div
                className={`bg-white/[0.06] rounded animate-pulse ${
                  is4K ? 'h-4 w-2/3' : 'h-3 w-1/2'
                }`}
              />
            </div>
          ) : latestCommit ? (
            <>
              {/* Commit message */}
              <p
                className={`text-white font-semibold leading-snug mb-2 line-clamp-2 ${
                  is4K ? 'text-xl' : 'text-base'
                }`}
              >
                {latestCommit.commit.message.split('\n')[0]}
              </p>

              {/* Repo + time */}
              <div
                className={`flex items-center gap-2 text-[#dadada]/40 ${
                  is4K ? 'text-sm' : 'text-xs'
                }`}
              >
                <span className='text-[#a855f7]/80 font-medium truncate'>
                  {latestCommit.repository?.name || 'repo'}
                </span>
                <span className='text-[#dadada]/20'>·</span>
                <span>
                  {formatDistanceToNow(
                    new Date(latestCommit.commit.author.date),
                    { addSuffix: true }
                  )}
                </span>
              </div>
            </>
          ) : (
            <p
              className={`text-[#dadada]/30 italic ${
                is4K ? 'text-sm' : 'text-xs'
              }`}
            >
              No recent commits
            </p>
          )}
        </div>
      </div>
    </a>
  )
}
