import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300) // Allow animation to complete
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-400' />
      case 'error':
        return <XCircle className='w-5 h-5 text-red-400' />
      case 'warning':
        return <AlertCircle className='w-5 h-5 text-yellow-400' />
      case 'info':
        return <AlertCircle className='w-5 h-5 text-blue-400' />
      default:
        return <AlertCircle className='w-5 h-5 text-gray-400' />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[#0e0e14] border-green-500/30'
      case 'error':
        return 'bg-[#0e0e14] border-red-500/30'
      case 'warning':
        return 'bg-[#0e0e14] border-yellow-500/30'
      case 'info':
        return 'bg-[#0e0e14] border-blue-500/30'
      default:
        return 'bg-[#0e0e14] border-[#7203a9]/30'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          className={`relative max-w-sm w-full ${getBackgroundColor()} border rounded-lg p-4 shadow-2xl backdrop-blur-md overflow-hidden`}
        >
          {/* Subtle gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none'></div>
          <div className='relative z-10 flex items-start space-x-3'>
            <div className='flex-shrink-0'>{getIcon()}</div>

            <div className='flex-1 min-w-0'>
              <h4 className='text-sm font-medium text-[#dadada] mb-1'>
                {toast.title}
              </h4>
              {toast.message && (
                <p className='text-xs text-[#dadada]/70 leading-relaxed'>
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={handleRemove}
              className='flex-shrink-0 text-[#dadada]/50 hover:text-[#dadada] transition-colors duration-200 p-1 rounded-full hover:bg-white/10'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Progress bar */}
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-lg overflow-hidden'>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: (toast.duration || 5000) / 1000,
                ease: 'linear'
              }}
              className='h-full bg-[#7203a9]'
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ToastComponent
