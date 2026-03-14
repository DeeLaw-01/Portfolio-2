import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AdminLoginPage () {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await login(email, password)
      if (res.success) {
        navigate('/admin')
      } else {
        setError(res.message || 'Login failed. Skill issue.')
      }
    } catch {
      setError('Something broke. Not my fault though.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0e0e14] via-[#0e0e14] to-[#1a0b2e] flex items-center justify-center px-4'>
      {/* Background effects */}
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
      <div className='absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#7203a9]/10 to-transparent rounded-full blur-3xl animate-pulse' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative z-10 w-full max-w-md'
      >
        <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-8'>
          {/* Back to blogs button - top left */}
          <button
            onClick={() => navigate('/blog')}
            className='flex items-center gap-2 text-sm text-[#dadada]/50 hover:text-[#7203a9] transition-colors mb-6 group'
          >
            <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
            Back to blogs
          </button>

          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-[#7203a9]/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Lock className='w-8 h-8 text-[#7203a9]' />
            </div>
            <h1 className='text-2xl font-bold text-white mb-1'>Welcome back</h1>
            <p className='text-sm text-[#dadada]/40'>
              Dude, you better be me...
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#dadada]/30' />
              <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className='w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50 transition-colors'
              />
            </div>

            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#dadada]/30' />
              <input
                type={showPassword ? 'text' : 'zpassword'}
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className='w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-[#dadada] placeholder-[#dadada]/30 focus:outline-none focus:border-[#7203a9]/50 transition-colors'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-[#dadada]/30 hover:text-[#dadada]/60'
              >
                {showPassword ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-red-400 text-sm text-center'
              >
                {error}
              </motion.p>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#7203a9] hover:bg-[#8a1bb8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center'
            >
              {isLoading ? (
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
