import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// ── Embed detection helpers ──────────────────────────────────────────

const EMBED_PATTERNS = {
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  twitter: /(?:https?:\/\/)?(?:twitter\.com|x\.com)\/([\w]+)\/status\/(\d+)/,
  reddit: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/([\w]+)\/comments\/([\w]+)/,
  gist: /(?:https?:\/\/)?gist\.github\.com\/([\w-]+)\/([\w]+)/,
  codepen: /(?:https?:\/\/)?codepen\.io\/([\w-]+)\/pen\/([\w]+)/
}

function YouTubeEmbed ({ videoId }: { videoId: string }) {
  return (
    <div className='my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg'>
      <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
        <iframe
          className='absolute inset-0 w-full h-full'
          src={`https://www.youtube.com/embed/${videoId}`}
          title='YouTube video'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      </div>
    </div>
  )
}

function TwitterEmbed ({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Use Twitter's oEmbed endpoint to get the embed HTML
    const fetchEmbed = async () => {
      try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=dark&omit_script=false&dnt=true`
        const res = await fetch(oembedUrl)
        if (!res.ok) throw new Error('oEmbed failed')
        const data = await res.json()
        if (!cancelled && data.html) {
          setHtml(data.html)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    fetchEmbed()
    return () => { cancelled = true }
  }, [url])

  // After injecting HTML, load the Twitter widget script
  useEffect(() => {
    if (!html || !ref.current) return
    // Load/reload the Twitter widget script
    const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]')
    if (existingScript) {
      ;(window as any).twttr?.widgets?.load(ref.current)
    } else {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      ref.current.appendChild(script)
    }
  }, [html])

  if (failed) {
    return (
      <div className='my-6 flex justify-center'>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-xl px-5 py-4 text-[#a855f7] hover:text-[#c084fc] hover:bg-white/[0.1] transition-colors'
        >
          <svg viewBox='0 0 24 24' className='w-5 h-5 fill-current' aria-hidden='true'>
            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
          </svg>
          <span className='text-sm font-medium'>View post on X</span>
        </a>
      </div>
    )
  }

  if (!html) {
    return (
      <div className='my-6 flex justify-center'>
        <div className='bg-white/[0.06] border border-white/10 rounded-xl px-5 py-4 text-[#dadada]/50 text-sm animate-pulse'>
          Loading tweet...
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className='my-6 flex justify-center [&_twitter-widget]:rounded-xl'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function RedditEmbed ({ url }: { url: string }) {
  // Reddit's embed uses their embed URL format
  const embedUrl = url.replace('www.reddit.com', 'www.redditmedia.com') + '?ref_source=embed&embed=true&theme=dark'
  return (
    <div className='my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg'>
      <iframe
        src={embedUrl}
        className='w-full border-0'
        height='500'
        sandbox='allow-scripts allow-same-origin allow-popups'
        title='Reddit embed'
        loading='lazy'
      />
    </div>
  )
}

function GistEmbed ({ user, id }: { user: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.border = 'none'
    iframe.style.minHeight = '200px'
    ref.current.innerHTML = ''
    ref.current.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(`
        <html>
          <head>
            <base target="_blank">
            <style>
              body { margin: 0; background: transparent; }
              .gist .gist-file { border: none !important; }
              .gist .gist-data { background: #1a1a2e !important; border: none !important; }
              .gist .gist-meta { background: #1a1a2e !important; color: #888 !important; }
              .gist .blob-code { background: #1a1a2e !important; color: #dadada !important; }
              .gist .blob-num { background: #1a1a2e !important; color: #555 !important; }
            </style>
          </head>
          <body>
            <script src="https://gist.github.com/${user}/${id}.js"><\/script>
          </body>
        </html>
      `)
      doc.close()

      // Auto-resize iframe
      const resizeObserver = new ResizeObserver(() => {
        if (doc.body) {
          iframe.style.height = doc.body.scrollHeight + 'px'
        }
      })
      setTimeout(() => {
        if (doc.body) {
          resizeObserver.observe(doc.body)
          iframe.style.height = doc.body.scrollHeight + 'px'
        }
      }, 1000)
    }
  }, [user, id])

  return (
    <div ref={ref} className='my-6 rounded-xl overflow-hidden border border-white/10' />
  )
}

function CodePenEmbed ({ user, penId }: { user: string; penId: string }) {
  return (
    <div className='my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg'>
      <iframe
        height='400'
        className='w-full border-0'
        src={`https://codepen.io/${user}/embed/${penId}?default-tab=result&theme-id=dark`}
        loading='lazy'
        title='CodePen embed'
        allowFullScreen
      />
    </div>
  )
}

/** Check if a string is a standalone embed URL and return the embed component */
function getEmbedForUrl (text: string): React.ReactNode | null {
  const trimmed = text.trim()

  const ytMatch = EMBED_PATTERNS.youtube.exec(trimmed)
  if (ytMatch) return <YouTubeEmbed videoId={ytMatch[1]} />

  const twMatch = EMBED_PATTERNS.twitter.exec(trimmed)
  if (twMatch) return <TwitterEmbed url={trimmed} />

  const rdMatch = EMBED_PATTERNS.reddit.exec(trimmed)
  if (rdMatch) return <RedditEmbed url={trimmed} />

  const gistMatch = EMBED_PATTERNS.gist.exec(trimmed)
  if (gistMatch) return <GistEmbed user={gistMatch[1]} id={gistMatch[2]} />

  const cpMatch = EMBED_PATTERNS.codepen.exec(trimmed)
  if (cpMatch) return <CodePenEmbed user={cpMatch[1]} penId={cpMatch[2]} />

  return null
}

// ── Pre-process content to convert standalone embed URLs ─────────────

function preprocessEmbeds (content: string): string {
  // Convert standalone YouTube URLs to iframes (lines that are ONLY a YouTube URL)
  return content.replace(
    /^(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)\S*)$/gm,
    '<div data-embed="youtube" data-id="$2"></div>'
  ).replace(
    /^(https?:\/\/(?:twitter\.com|x\.com)\/([\w]+)\/status\/(\d+)\S*)$/gm,
    '<div data-embed="twitter" data-url="$1"></div>'
  ).replace(
    /^(https?:\/\/(?:www\.)?reddit\.com\/r\/([\w]+)\/comments\/([\w]+)\S*)$/gm,
    '<div data-embed="reddit" data-url="$1"></div>'
  ).replace(
    /^(https?:\/\/gist\.github\.com\/([\w-]+)\/([\w]+)\S*)$/gm,
    '<div data-embed="gist" data-user="$2" data-id="$3"></div>'
  ).replace(
    /^(https?:\/\/codepen\.io\/([\w-]+)\/pen\/([\w]+)\S*)$/gm,
    '<div data-embed="codepen" data-user="$2" data-id="$3"></div>'
  )
}

// ── Main component ───────────────────────────────────────────────────

export default function MarkdownRenderer ({
  content,
  className = ''
}: MarkdownRendererProps) {
  const processed = preprocessEmbeds(content)

  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className='text-3xl md:text-4xl font-bold text-white mt-10 mb-4 first:mt-0'>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-2xl md:text-3xl font-bold text-white mt-8 mb-3'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-xl md:text-2xl font-semibold text-white mt-6 mb-2'>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className='text-lg font-semibold text-white mt-4 mb-2'>
              {children}
            </h4>
          ),

          // Paragraph — also check for standalone embed URLs
          p: ({ children, ...props }) => {
            // If the paragraph contains a single text child that's an embed URL, render the embed
            if (
              typeof children === 'string' ||
              (Array.isArray(children) && children.length === 1 && typeof children[0] === 'string')
            ) {
              const text = typeof children === 'string' ? children : (children as string[])[0]
              const embed = getEmbedForUrl(text)
              if (embed) return <>{embed}</>
            }
            return (
              <p className='text-[#dadada]/90 leading-relaxed mb-4 text-base md:text-lg'>
                {children}
              </p>
            )
          },

          // Embeds via data-embed divs (from preprocessor)
          div: ({ node, children, ...props }) => {
            const el = node as any
            const embedType = el?.properties?.dataEmbed
            if (embedType === 'youtube') {
              return <YouTubeEmbed videoId={el.properties.dataId} />
            }
            if (embedType === 'twitter') {
              return <TwitterEmbed url={el.properties.dataUrl} />
            }
            if (embedType === 'reddit') {
              return <RedditEmbed url={el.properties.dataUrl} />
            }
            if (embedType === 'gist') {
              return <GistEmbed user={el.properties.dataUser} id={el.properties.dataId} />
            }
            if (embedType === 'codepen') {
              return <CodePenEmbed user={el.properties.dataUser} penId={el.properties.dataId} />
            }
            return <div {...props}>{children}</div>
          },

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#a855f7] hover:text-[#c084fc] underline underline-offset-2 transition-colors'
            >
              {children}
            </a>
          ),

          // iframes (for raw HTML embeds pasted by user)
          iframe: ({ ...props }) => (
            <div className='my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg'>
              <iframe {...props} className='w-full border-0' />
            </div>
          ),

          // Images
          img: ({ src, alt }) => (
            <figure className='my-6'>
              <img
                src={src}
                alt={alt || ''}
                className='w-full rounded-xl border border-white/10 shadow-lg'
                loading='lazy'
              />
              {alt && (
                <figcaption className='text-center text-sm text-[#dadada]/50 mt-2 italic'>
                  {alt}
                </figcaption>
              )}
            </figure>
          ),

          // Code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className

            if (isInline) {
              return (
                <code
                  className='bg-white/10 text-[#e879f9] px-1.5 py-0.5 rounded text-sm font-mono'
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <div className='my-4 rounded-xl overflow-hidden border border-white/10'>
                {match && (
                  <div className='bg-white/5 px-4 py-1.5 text-xs text-[#dadada]/50 font-mono border-b border-white/10'>
                    {match[1]}
                  </div>
                )}
                <SyntaxHighlighter
                  style={atomDark as any}
                  language={match?.[1] || 'text'}
                  PreTag='div'
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    fontSize: '0.875rem'
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            )
          },

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className='border-l-4 border-[#a855f7] pl-4 my-4 text-[#dadada]/70 italic'>
              {children}
            </blockquote>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className='list-disc list-inside space-y-1 mb-4 text-[#dadada]/90 ml-2'>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal list-inside space-y-1 mb-4 text-[#dadada]/90 ml-2'>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className='leading-relaxed'>{children}</li>,

          // Horizontal rule
          hr: () => <hr className='border-white/10 my-8' />,

          // Table
          table: ({ children }) => (
            <div className='overflow-x-auto my-4'>
              <table className='w-full border-collapse border border-white/10 rounded-xl overflow-hidden'>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className='bg-white/5'>{children}</thead>
          ),
          th: ({ children }) => (
            <th className='border border-white/10 px-4 py-2 text-left text-white font-semibold'>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className='border border-white/10 px-4 py-2 text-[#dadada]/90'>
              {children}
            </td>
          ),

          // Strong & Emphasis
          strong: ({ children }) => (
            <strong className='font-bold text-white'>{children}</strong>
          ),
          em: ({ children }) => (
            <em className='italic text-[#dadada]'>{children}</em>
          )
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
