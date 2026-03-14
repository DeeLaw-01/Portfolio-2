const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
}

interface Admin {
  _id: string
  email: string
  name: string
}

interface AuthResponse {
  success: boolean
  token?: string
  admin?: Admin
  message?: string
}

class AuthService {
  private getToken(): string | null {
    return localStorage.getItem('admin_token')
  }

  setToken(token: string): void {
    localStorage.setItem('admin_token', token)
  }

  removeToken(): void {
    localStorage.removeItem('admin_token')
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (json.success && json.token) {
      this.setToken(json.token)
    }
    return json
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (json.success && json.token) {
      this.setToken(json.token)
    }
    return json
  }

  async getMe(): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: this.getAuthHeaders()
    })
    if (!res.ok) {
      this.removeToken()
      return { success: false, message: 'Not authenticated' }
    }
    return res.json()
  }

  logout(): void {
    this.removeToken()
  }
}

export const authService = new AuthService()
export type { Admin, AuthResponse, LoginData, RegisterData }
