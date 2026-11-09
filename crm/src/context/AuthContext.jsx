import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  loginUser,
  forgotPasswordUser,
  resetPasswordUser,
  fetchCurrentUser,
} from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ce_crm_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ce_crm_token') || null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  // Login handler
  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginUser(email, password)
      if (data.success && data.user) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('ce_crm_user', JSON.stringify(data.user))
        localStorage.setItem('ce_crm_token', data.token)
        return data.user
      }
      throw new Error(data.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Logout handler
  const logout = () => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('ce_crm_user')
      localStorage.removeItem('ce_crm_token')
    } catch (_) {}
  }

  // Forgot password request
  const forgotPassword = async (email) => {
    return await forgotPasswordUser(email)
  }

  // Reset password submit
  const resetPassword = async (payload) => {
    return await resetPasswordUser(payload)
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    logout,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

