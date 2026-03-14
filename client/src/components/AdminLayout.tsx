import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Tags,
  LogOut,
  PenSquare,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function AdminLayout ({
  children,
  title,
  subtitle
}: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { admin, logout } = useAuth()

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      label: 'Posts',
      path: '/admin/blogs',
      icon: FileText
    },
    {
      label: 'New Post',
      path: '/admin/blogs/new',
      icon: PenSquare
    },
    {
      label: 'Tags',
      path: '/admin/tags',
      icon: Tags
    },
    {
      label: 'Comments',
      path: '/admin/comments',
      icon: MessageCircle
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0e0e14] via-[#0e0e14] to-[#1a0b2e] text-[#dadada]'>
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

      <div className='relative z-10 flex min-h-screen'>
        {/* Sidebar */}
        <aside className='w-64 bg-white/[0.04] border-r border-white/[0.05] flex flex-col fixed h-full'>
          <div className='p-6 border-b border-white/[0.05]'>
            <button
              onClick={() => navigate('/')}
              className='text-lg italic text-[#dadada] hover:text-[#a855f7] transition-colors'
            >
              Waleed Ahmed
            </button>
            <p className='text-xs text-[#dadada]/30 mt-1'>
              Admin Panel — {admin?.name || 'Ghost'}
            </p>
          </div>

          <nav className='flex-1 p-4 space-y-1'>
            {navItems.map(item => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' &&
                  location.pathname.startsWith(item.path))
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-[#7203a9]/20 text-[#a855f7] font-medium'
                      : 'text-[#dadada]/60 hover:bg-white/[0.06] hover:text-[#dadada]'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className='p-4 border-t border-white/[0.05] space-y-2'>
            <button
              onClick={() => navigate('/blog')}
              className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#dadada]/60 hover:bg-white/[0.06] hover:text-[#dadada] transition-all'
            >
              <ArrowLeft className='w-4 h-4' />
              View Blog
            </button>
            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all'
            >
              <LogOut className='w-4 h-4' />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 ml-64 p-8'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-white'>{title}</h1>
              {subtitle && (
                <p className='text-[#dadada]/40 mt-1'>{subtitle}</p>
              )}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
