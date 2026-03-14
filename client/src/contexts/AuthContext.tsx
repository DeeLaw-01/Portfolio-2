import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type Admin } from '../services/authService'

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      setIsLoading(false)
      return
    }
    try {
      const res = await authService.getMe()
      if (res.success && res.admin) {
        setAdmin(res.admin)
      }
    } catch {
      authService.removeToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    if (res.success && res.admin) {
      setAdmin(res.admin)
    }
    return { success: res.success, message: res.message }
  }

  const logout = () => {
    authService.logout()
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
