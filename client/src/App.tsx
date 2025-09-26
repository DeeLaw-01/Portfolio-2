import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Work from './components/Work'
import Contact from './components/Contact'
import Socials from './components/Socials'
import { ToastProvider } from './contexts/ToastContext'
import DitherWaleed from './assets/dither.webp'

export default function App () {
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [is4K, setIs4K] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300)
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsLargeScreen(width >= 1536 && height >= 900)
      setIs4K(width >= 2560 && height >= 1440) // 4K and ultrawide displays
      setIsMobile(width < 768) // Mobile breakpoint
    }

    handleResize() // Check initial size
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Intersection Observer for mobile animate-into-view
  useEffect(() => {
    if (!isMobile) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardId = entry.target.id
            if (cardId) {
              setVisibleCards(prev => new Set([...prev, cardId]))
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observe all cards
    const cardIds = [
      'hero',
      'profile',
      'about',
      'contact',
      'projects',
      'socials'
    ]
    cardIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [isMobile])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Helper function to get animation props based on mobile and visibility
  const getAnimationProps = (cardId: string, variants: any) => {
    if (!isMobile) {
      // Desktop: use normal framer-motion variants
      return { variants }
    } else {
      // Mobile: use intersection observer based animation
      const isVisible = visibleCards.has(cardId)
      return {
        initial: variants.hidden,
        animate: isVisible ? variants.visible : variants.hidden,
        variants: undefined // Don't use variants on mobile
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3, // Add initial delay so animations are visible
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
    <ToastProvider>
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
              delay: 0.1, // Small delay for header
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
                  id='hero'
                  {...getAnimationProps('hero', cardVariants.hero)}
                >
                  <Hero isLargeScreen={isLargeScreen} is4K={is4K} />
                </motion.div>

                {/* Profile Image */}
                <motion.div
                  className='md:col-span-1'
                  id='profile'
                  {...getAnimationProps('profile', cardVariants.profile)}
                >
                  <div
                    className={`w-full bg-gray-700 rounded-[20px] overflow-hidden relative group cursor-pointer ${
                      isLargeScreen ? 'h-full' : 'h-[355px]'
                    }`}
                  >
                    {/* Real Image - Always visible */}
                    <img
                      src={DitherWaleed}
                      alt='Waleed Ahmed - Full Stack Developer & UI/UX Designer'
                      className='w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500 ease-out'
                      loading='eager'
                      fetchPriority='high'
                      decoding='async'
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
                <motion.div
                  id='about'
                  {...getAnimationProps('about', cardVariants.about)}
                >
                  <About isLargeScreen={isLargeScreen} is4K={is4K} />
                </motion.div>

                {/* Contact Section */}
                <motion.div
                  id='contact'
                  {...getAnimationProps('contact', cardVariants.contact)}
                >
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
                id='projects'
                className={isLargeScreen ? 'flex-1' : ''}
                {...getAnimationProps('projects', cardVariants.work)}
              >
                <Work isLargeScreen={isLargeScreen} is4K={is4K} />
              </motion.div>

              {/* Socials Section */}
              <motion.div
                className='mb-8 md:mb-0'
                id='socials'
                {...getAnimationProps('socials', cardVariants.socials)}
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
    </ToastProvider>
  )
}
