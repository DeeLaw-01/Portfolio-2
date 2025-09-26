import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header () {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [modalMessage, setModalMessage] = useState('')

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

  const navLinks = [
    { href: '#about', label: 'ABOUT', sectionId: 'about' },
    { href: '#contact', label: 'CONTACT', sectionId: 'contact' },
    { href: '#projects', label: 'PROJECTS', sectionId: 'projects' },
    { href: '#socials', label: 'SOCIALS', sectionId: 'socials' }
  ]

  return (
    <header className='bg-white/[0.08] rounded-[20px] px-5 py-5 md:static sticky top-4 z-40'>
      <nav className='flex justify-between items-center'>
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className='text-[21px] italic font-normal text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
        >
          Waleed Ahmed
        </button>

        {/* Desktop Navigation Links */}
        <div className='hidden md:flex gap-8'>
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.sectionId)}
              className='text-[14px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
            >
              {link.label}
            </button>
          ))}
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
