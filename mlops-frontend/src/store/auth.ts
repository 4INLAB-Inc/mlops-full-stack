import { create } from 'zustand'
import { authApi } from '@/services/api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: {
    email: string
    password: string
    name: string
    role: string
  }) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const { user, token } = await authApi.login(credentials)
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },
  register: async (userData) => {
    set({ isLoading: true })
    try {
      await authApi.register(userData)
    } finally {
      set({ isLoading: false })
    }
  },
  logout: () => {
    authApi.logout()
    set({ user: null, isAuthenticated: false })
  },
}))
