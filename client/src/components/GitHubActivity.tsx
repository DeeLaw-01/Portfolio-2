import { Github } from 'lucide-react'
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
      className='block'
    >
      <div className='flex flex-col gap-2'>
        {/* Label */}
        <div className='flex items-center gap-2'>
          <Github
            className={`text-[#a855f7] ${is4K ? 'w-5 h-5' : 'w-5 h-5'}`}
          />
          <span
            className={`text-[#dadada]/50 uppercase tracking-widest font-medium ${
              is4K ? 'text-sm' : 'text-xs'
            }`}
          >
            Latest Commit
          </span>
        </div>

        {isLoading ? (
          <div className='space-y-2'>
            <div
              className={`bg-white/[0.08] rounded animate-pulse ${
                is4K ? 'h-7 w-4/5' : 'h-6 w-3/4'
              }`}
            />
            <div
              className={`bg-white/[0.06] rounded animate-pulse ${
                is4K ? 'h-5 w-2/3' : 'h-4 w-1/2'
              }`}
            />
          </div>
        ) : latestCommit ? (
          <>
            {/* Commit message */}
            <p
              className={`text-white font-bold leading-snug line-clamp-2 ${
                is4K ? 'text-2xl' : 'text-xl'
              }`}
            >
              {latestCommit.commit.message.split('\n')[0]}
            </p>

            {/* Repo + time */}
            <div
              className={`flex items-center gap-2 text-[#dadada]/40 ${
                is4K ? 'text-base' : 'text-sm'
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
              is4K ? 'text-base' : 'text-sm'
            }`}
          >
            No recent commits
          </p>
        )}
      </div>
    </a>
  )
}
