import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'

interface BlogLayoutProps {
  children: ReactNode
}

export default function BlogLayout ({ children }: BlogLayoutProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0e0e14] via-[#0e0e14] to-[#1a0b2e] text-[#dadada] relative'>
      {/* Subtle background pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #7203a9 1px, transparent 1px),
                         radial-gradient(circle at 75% 75%, #7203a9 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating gradient orbs */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#7203a9]/10 to-transparent rounded-full blur-3xl animate-pulse' />
      <div
        className='absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#7203a9]/5 to-transparent rounded-full blur-3xl animate-pulse'
        style={{ animationDelay: '2s' }}
      />

      <div className='relative z-10 px-4 py-3'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] as any }}
        >
          <Header />
        </motion.div>

        <motion.main
          className='mt-6 max-w-5xl mx-auto pb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0.0, 0.2, 1] as any
          }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
