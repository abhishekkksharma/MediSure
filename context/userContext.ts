'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  bloodGroup?: string
  isBloodDonorAvailable?: boolean
  gender?: string
  location?: {
    address?: string
    city?: string
    state?: string
  }
}

interface UserContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  loginWithToken: (newToken: string, initialUser?: AuthUser | null) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'medisure_token'
const USER_KEY = 'medisure_user'

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const fetchCurrentUser = useCallback(
    async (authToken: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (res.status === 401 || res.status === 403) {
          clearAuth()
          return
        }

        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
          }
        }
      } catch {
        // Keep cached user if backend is temporarily unreachable
      }
    },
    [clearAuth]
  )

  useEffect(() => {
    let active = true

    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserRaw = localStorage.getItem(USER_KEY)

      if (!storedToken) {
        if (active) setLoading(false)
        return
      }

      if (active) {
        setToken(storedToken)
        if (storedUserRaw) {
          try {
            setUser(JSON.parse(storedUserRaw) as AuthUser)
          } catch {
            localStorage.removeItem(USER_KEY)
          }
        }
      }

      await fetchCurrentUser(storedToken)
      if (active) setLoading(false)
    }

    void initAuth()

    return () => {
      active = false
    }
  }, [fetchCurrentUser])

  const loginWithToken = useCallback(
    async (newToken: string, initialUser?: AuthUser | null) => {
      localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)

      if (initialUser) {
        setUser(initialUser)
        localStorage.setItem(USER_KEY, JSON.stringify(initialUser))
      } else {
        await fetchCurrentUser(newToken)
      }
    },
    [fetchCurrentUser]
  )

  const refreshUser = useCallback(async () => {
    const activeToken = token || localStorage.getItem(TOKEN_KEY)
    if (!activeToken) return
    await fetchCurrentUser(activeToken)
  }, [token, fetchCurrentUser])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const value: UserContextValue = {
    user,
    token,
    loading,
    loginWithToken,
    refreshUser,
    logout,
  }

  return React.createElement(UserContext.Provider, { value }, children)
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

