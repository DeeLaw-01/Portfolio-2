import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer ({
  content,
  className = ''
}: MarkdownRendererProps) {
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

          // Paragraph
          p: ({ children }) => (
            <p className='text-[#dadada]/90 leading-relaxed mb-4 text-base md:text-lg'>
              {children}
            </p>
          ),

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
        {content}
      </ReactMarkdown>
    </div>
  )
}
