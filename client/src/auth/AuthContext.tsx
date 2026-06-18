import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import apiClient from '../api/client'

type LoginResponse = {
  access_token: string
  token_type: string
  admin_id: number
  email: string
}

type AuthUser = {
  adminId: number
  email: string
}

type LoginCredentials = {
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AUTH_TOKEN_KEY = 'hermes_token'
const AUTH_EMAIL_KEY = 'hermes_admin_email'
const AUTH_ADMIN_ID_KEY = 'hermes_admin_id'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const email = localStorage.getItem(AUTH_EMAIL_KEY)
  const adminId = Number(localStorage.getItem(AUTH_ADMIN_ID_KEY) ?? '0')

  if (!token || !email || Number.isNaN(adminId) || adminId <= 0) {
    return { token: null, user: null }
  }

  return {
    token,
    user: {
      adminId,
      email,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const session = loadStoredSession()
    setToken(session.token)
    setUser(session.user)
    setIsReady(true)
  }, [])

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>('/login', {
      email,
      password,
    })

    const session = response.data

    localStorage.setItem(AUTH_TOKEN_KEY, session.access_token)
    localStorage.setItem(AUTH_EMAIL_KEY, session.email)
    localStorage.setItem(AUTH_ADMIN_ID_KEY, String(session.admin_id))

    setToken(session.access_token)
    setUser({ adminId: session.admin_id, email: session.email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_EMAIL_KEY)
    localStorage.removeItem(AUTH_ADMIN_ID_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isReady,
      login,
      logout,
    }),
    [isReady, login, logout, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
