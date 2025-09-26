import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  is4K?: boolean
}

export default function Header ({ is4K = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [modalMessage, setModalMessage] = useState('')
  const [isDownloadingCV, setIsDownloadingCV] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const scrollToSection = (sectionId: string, customMessage?: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })

      // Show modal popup on desktop only, positioned above the clicked section
      if (window.innerWidth >= 768) {
        const rect = element.getBoundingClientRect()
        setModalPosition({
          x: rect.left + rect.width / 2, // Center horizontally on the section
          y: rect.top - 20 // 20px above the section
        })
        setModalMessage(customMessage || 'its right on the screen dumbass')
        setShowModal(true)
        setTimeout(() => setShowModal(false), 4000) // Hide after 4 seconds
      }
    }
    // Close mobile menu after clicking
    setIsMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    scrollToSection('profile', "yep that's me")
  }

  const handleDownloadCV = async () => {
    if (isDownloadingCV) return // Prevent multiple downloads

    setIsDownloadingCV(true)

    try {
      // Simulate a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create a link element and trigger download
      const link = document.createElement('a')
      link.href = '/cv/Waleed_Ahmed_CV.pdf' // You'll place your CV in public/cv/ folder
      link.download = 'Waleed_Ahmed_CV.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading CV:', error)
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsDownloadingCV(false)
      }, 1000)
    }
  }

  const navLinks = [
    { href: '#about', label: 'ABOUT', sectionId: 'about' },
    { href: '#contact', label: 'CONTACT', sectionId: 'contact' },
    { href: '#projects', label: 'PROJECTS', sectionId: 'projects' },
    { href: '#socials', label: 'SOCIALS', sectionId: 'socials' }
  ]

  return (
    <header
      className={`bg-white/[0.08] rounded-[20px] md:static sticky top-4 z-40 ${
        is4K ? 'px-8 py-8' : 'px-5 py-5'
      }`}
    >
      <nav className='flex justify-between items-center'>
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className={`italic font-normal text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer ${
            is4K ? 'text-[32px]' : 'text-[21px]'
          }`}
        >
          Waleed Ahmed
        </button>

        {/* Desktop Navigation Links */}
        <div
          className={`hidden md:flex items-center ${is4K ? 'gap-12' : 'gap-8'}`}
        >
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.sectionId)}
              className={`text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer ${
                is4K ? 'text-[20px]' : 'text-[14px]'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Download CV Button */}
          <button
            onClick={handleDownloadCV}
            disabled={isDownloadingCV}
            className={`transition-all duration-200 rounded-lg font-medium flex items-center justify-center ${
              isDownloadingCV
                ? 'bg-[#7203a9]/50 cursor-not-allowed'
                : 'bg-[#7203a9] hover:bg-[#8a1bb8] active:scale-95'
            } ${
              is4K
                ? 'px-6 py-3 text-[18px] min-w-[140px]'
                : 'px-4 py-2 text-[13px] min-w-[120px]'
            }`}
          >
            {isDownloadingCV ? (
              <div
                className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${
                  is4K ? 'w-5 h-5' : 'w-4 h-4'
                }`}
              />
            ) : (
              <span>Download CV</span>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className='md:hidden text-[#dadada] hover:text-[#7203a9] transition-colors p-2'
          aria-label='Toggle mobile menu'
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 z-40'
              onClick={toggleMobileMenu}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className='fixed top-0 right-0 h-full w-64 bg-[#0e0e14] border-l border-white/10 z-50 flex flex-col'
            >
              {/* Sidebar Header */}
              <div className='flex justify-between items-center p-5 border-b border-white/10'>
                <span className='text-[18px] text-[#dadada] font-medium'>
                  Menu
                </span>
                <button
                  onClick={toggleMobileMenu}
                  className='text-[#dadada] hover:text-[#7203a9] transition-colors p-2'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <div className='flex flex-col p-5 space-y-6'>
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.label}
                    onClick={() => scrollToSection(link.sectionId)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='text-[16px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer py-2 text-left'
                  >
                    {link.label}
                  </motion.button>
                ))}

                {/* Mobile Download CV Button */}
                <motion.button
                  onClick={handleDownloadCV}
                  disabled={isDownloadingCV}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className={`transition-all duration-200 rounded-lg font-medium px-4 py-3 text-[14px] text-left flex items-center justify-center min-w-[140px] ${
                    isDownloadingCV
                      ? 'bg-[#7203a9]/50 cursor-not-allowed'
                      : 'bg-[#7203a9] hover:bg-[#8a1bb8] active:scale-95'
                  }`}
                >
                  {isDownloadingCV ? (
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  ) : (
                    <span>Download CV</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='fixed z-50 hidden md:block'
            style={{
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className='bg-[#7203a9] text-white px-6 py-3 rounded-lg shadow-2xl border border-white/20 backdrop-blur-sm'>
              <p className='text-sm font-medium text-center'>
                "{modalMessage}"
              </p>
            </div>
            {/* Arrow pointing down */}
            <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#7203a9]'></div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
