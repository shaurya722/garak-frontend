'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import api from '@/api/axios'
import { apiConfig } from '@/config/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

// Define your interfaces
export interface User {
  id: string
  email: string
  company?: string
  name?: string
  role?: string
}

export interface LoginCredentials {
  company: string
  email: string
  password: string
  rememberMe: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')

        if (token) {
          setUser({
            id: '1',
            email: 'user@example.com', 
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)

      const response = await api.post(apiConfig.endpoints.authCompanyLogin, {
        company: credentials.company,
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      })

      const accessToken =
        response.data.data?.accessToken || response.data.accessToken

      if (!accessToken) {
        throw new Error('No access token received')
      }

      const userData: User = {
        id: response.data.data?.id || response.data.id || '1',
        email: credentials.email,
        company: credentials.company,
        name: response.data.data?.name || response.data.name,
        role: response.data.data?.role || response.data.role,
      }

      localStorage.setItem('token', accessToken)
      setUser(userData)

      toast.success('Login successful')
      router.push('/')
    } catch (error: unknown) {
      console.error('Login failed:', error)
      let message = 'Login failed'
      if (error instanceof AxiosError) {
        message =
          error.response?.data?.message || error.message || 'Login failed'
      }
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
