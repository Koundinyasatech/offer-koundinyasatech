import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
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