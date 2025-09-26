import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Work from './components/Work'
import Contact from './components/Contact'
import Socials from './components/Socials'
import DitherWaleed from './assets/dither.png'

export default function App () {
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [is4K, setIs4K] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300)
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsLargeScreen(width >= 1536 && height >= 900)
      setIs4K(width >= 2560 && height >= 1440) // 4K and ultrawide displays
    }

    handleResize() // Check initial size
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hero: {
      hidden: { opacity: 0, y: -20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    },
    profile: {
      hidden: { opacity: 0, x: 20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    },
    about: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    },
    contact: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    },
    work: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    },
    socials: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1] as any
        }
      }
    }
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#0e0e14] via-[#0e0e14] to-[#1a0b2e] text-[#dadada] relative ${
        isLargeScreen ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Subtle background pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #7203a9 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #7203a9 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Floating gradient orbs */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#7203a9]/10 to-transparent rounded-full blur-3xl animate-pulse'></div>
      <div
        className='absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#7203a9]/5 to-transparent rounded-full blur-3xl animate-pulse'
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className={`h-full w-full px-4 py-3 relative z-10 ${
          isLargeScreen ? 'flex flex-col' : ''
        }`}
      >
        {/* Header - Full width */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1] as any
          }}
        >
          <Header is4K={is4K} />
        </motion.div>

        {/* Main Content - Responsive Grid Layout */}
        <motion.div
          className={`mt-4 grid grid-cols-1 lg:grid-cols-[70%_28.9%] gap-4 ${
            isLargeScreen ? 'flex-1' : ''
          }`}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {/* Left Column */}
          <div
            className={`flex flex-col gap-4 ${isLargeScreen ? 'h-full' : ''}`}
          >
            {/* First Row - Hero and Profile */}
            <div
              className={`grid grid-cols-1 md:grid-cols-[70%_28.5%] gap-4 ${
                isLargeScreen ? 'flex-1' : ''
              }`}
            >
              {/* Hero Section */}
              <motion.div
                className='md:col-span-1'
                variants={cardVariants.hero}
              >
                <Hero isLargeScreen={isLargeScreen} is4K={is4K} />
              </motion.div>

              {/* Profile Image */}
              <motion.div
                className='md:col-span-1'
                variants={cardVariants.profile}
                id='profile'
              >
                <div
                  className={`w-full bg-gray-700 rounded-[20px] overflow-hidden relative group cursor-pointer ${
                    isLargeScreen ? 'h-full' : 'h-[355px]'
                  }`}
                >
                  {/* Real Image - Always visible */}
                  <img
                    src={DitherWaleed}
                    alt='Waleed Ahmed'
                    className='w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500 ease-out'
                  />
                  {/* Hover overlay */}
                  <div className='absolute inset-0 bg-gradient-to-br from-[#7203a9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>
              </motion.div>
            </div>

            {/* Second Row - About and Contact */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isLargeScreen ? 'flex-1' : ''
              }`}
            >
              {/* About Section */}
              <motion.div variants={cardVariants.about} id='about'>
                <About isLargeScreen={isLargeScreen} is4K={is4K} />
              </motion.div>

              {/* Contact Section */}
              <motion.div variants={cardVariants.contact} id='contact'>
                <Contact isLargeScreen={isLargeScreen} is4K={is4K} />
              </motion.div>
            </div>
          </div>

          {/* Right Column - Work and Socials */}
          <div
            className={`flex flex-col gap-4 ${isLargeScreen ? 'h-full' : ''}`}
          >
            {/* Work Section */}
            <motion.div
              variants={cardVariants.work}
              id='projects'
              className={isLargeScreen ? 'flex-1' : ''}
            >
              <Work isLargeScreen={isLargeScreen} is4K={is4K} />
            </motion.div>

            {/* Socials Section */}
            <motion.div
              variants={cardVariants.socials}
              className='mb-8 md:mb-0'
              id='socials'
            >
              <Socials />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button - Mobile Only */}
      {showScrollToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 z-50 md:hidden bg-[#7203a9] text-white p-3 rounded-full shadow-lg hover:bg-[#8a1bb8] transition-colors duration-200'
        >
          <ArrowUp className='w-5 h-5' />
        </motion.button>
      )}
    </div>
  )
}
