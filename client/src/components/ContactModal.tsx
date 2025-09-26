import { useState } from 'react'
import { X, Send, Mail, Phone } from 'lucide-react'
import {
  contactService,
  type ContactFormData
} from '../services/contactService'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal ({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await contactService.sendContactForm(
        formData as ContactFormData
      )

      if (response.success) {
        setSubmitStatus('success')

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({ name: '', email: '', phone: '', message: '' })
          onClose()
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error sending contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-[#0e0e14] border border-[#7203a9]/20 rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl'>
        {/* Close Button */}
        <button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Close button clicked')
            onClose()
          }}
          className='absolute top-4 right-4 z-50 text-[#dadada] hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10 cursor-pointer'
          type='button'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
          {/* Left Column - Header */}
          <div className='flex flex-col justify-center lg:pr-4'>
            <h2 className='text-2xl sm:text-3xl font-bold text-[#dadada] mb-3 sm:mb-4'>
              Get In Touch
            </h2>
            <p className='text-[#dadada]/70 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6'>
              I'd love to hear from you! Whether you have a project in mind,
              want to collaborate, or just want to say hello, I'm always excited
              to connect with new people.
            </p>
            <div className='space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#dadada]/60'>
              <p>- I typically respond within 24-48 hours</p>
              <p>- Open to freelance and full-time opportunities</p>
              <p>- Let's build something amazing together!</p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Name and Email Row */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-[#dadada] mb-2'
                  >
                    Your Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.08] border border-white/[0.05] rounded-lg text-[#dadada] placeholder-[#dadada]/50 focus:outline-none focus:ring-2 focus:ring-[#7203a9] focus:border-transparent transition-all duration-200'
                    placeholder='John Doe'
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-[#dadada] mb-2'
                  >
                    <Mail className='w-4 h-4 inline mr-1' />
                    Email Address <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.08] border border-white/[0.05] rounded-lg text-[#dadada] placeholder-[#dadada]/50 focus:outline-none focus:ring-2 focus:ring-[#7203a9] focus:border-transparent transition-all duration-200'
                    placeholder='john@example.com'
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-[#dadada] mb-2'
                >
                  <Phone className='w-4 h-4 inline mr-1' />
                  Phone Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/[0.08] border border-white/[0.05] rounded-lg text-[#dadada] placeholder-[#dadada]/50 focus:outline-none focus:ring-2 focus:ring-[#7203a9] focus:border-transparent transition-all duration-200'
                  placeholder='+1 (555) 123-4567'
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor='message'
                  className='block text-sm font-medium text-[#dadada] mb-2'
                >
                  Message <span className='text-red-500'>*</span>
                </label>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className='w-full px-4 py-3 bg-white/[0.08] border border-white/[0.05] rounded-lg text-[#dadada] placeholder-[#dadada]/50 focus:outline-none focus:ring-2 focus:ring-[#7203a9] focus:border-transparent transition-all duration-200 resize-none'
                  placeholder='Hi Waleed, I found your portfolio and would love to connect...'
                />
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-[#7203a9]/50 cursor-not-allowed'
                    : 'bg-[#7203a9] hover:bg-[#8a1bb8] active:scale-95'
                } text-white text-sm sm:text-base`}
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className='text-green-400 text-sm text-center'>
                  ✅ Message sent successfully! I'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className='text-red-400 text-sm text-center'>
                  ❌ Failed to send message. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
