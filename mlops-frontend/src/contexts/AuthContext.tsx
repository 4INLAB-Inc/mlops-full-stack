'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsAuthenticated(status === 'authenticated')

    if (status === 'unauthenticated' && pathname?.startsWith('/dashboard')) {
      router.push('/login')
    }
  }, [status, pathname])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        console.error('Login error:', result.error)
        return false  // Đảm bảo luôn trả về false khi có lỗi
      }

      return result?.ok ?? false  // Trả về true nếu ok, nếu không trả về false
    } catch (error) {
      console.error('Login error:', error)
      return false  // Trả về false nếu gặp lỗi
    }
  }

  const logout = async (): Promise<void> => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
