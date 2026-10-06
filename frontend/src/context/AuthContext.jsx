import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

// How often an open tab re-checks that it wasn't logged out from another device
const SESSION_CHECK_INTERVAL_MS = 60 * 1000

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on every page load / refresh
  useEffect(() => {
    const stored = authService.getStoredUser()
    const token  = authService.getToken()
    if (stored && token) setUser(stored)
    setIsLoading(false)
  }, [])

  // While logged in, ask the server if this session is still valid: on load, every minute
  // while the tab is visible, and whenever the user comes back to the tab/window.
  // After "Logout all devices" elsewhere the server answers 401 → apiClient sends us to /login.
  useEffect(() => {
    if (!user) return
    let lastCheck = 0
    const checkSession = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastCheck < 5000) return // focus + visibilitychange fire together
      lastCheck = Date.now()
      authService.verifySession().catch(() => {}) // 401 handled by apiClient; ignore network errors
    }
    checkSession()
    const timer = setInterval(checkSession, SESSION_CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', checkSession)
    window.addEventListener('focus', checkSession)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', checkSession)
      window.removeEventListener('focus', checkSession)
    }
  }, [user])

  // Logging out in one tab logs out the other open tabs of this browser immediately
  useEffect(() => {
    const onStorage = (e) => {
      if ((e.key === 'authToken' || e.key === null) && !authService.getToken()) setUser(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = async (userId, code) => {
    try{
      const { user: u } = await authService.login(userId, code)
      setUser(u)
      return u
    } catch (error){
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Logout from every device. If the request fails, the user stays logged in (so they can retry).
  const logoutAll = async () => {
    const result = await authService.logoutAll()
    setUser(null)
    return result
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        logoutAll,
        isAdmin:    user?.role === 'admin',
        isEmployee: user?.role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}