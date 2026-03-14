import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute ({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#0e0e14] via-[#0e0e14] to-[#1a0b2e] flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-[#7203a9] border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/admin/login' replace />
  }

  return <>{children}</>
}
