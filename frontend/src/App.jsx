import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AddEditEmployeePage from './pages/admin/AddEditEmployeePage'
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage'

// ── Protected route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e4a5f' }}>
        <span className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

// ── Route tree ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user, isLoading } = useAuth()
  if (isLoading) return null

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          !user
            ? <LoginPage />
            : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
        }
      />

      {/* Admin */}
      <Route path="/admin/dashboard"       element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/employee/add"    element={<ProtectedRoute role="admin"><AddEditEmployeePage mode="add" /></ProtectedRoute>} />
      <Route path="/admin/employee/edit/:id" element={<ProtectedRoute role="admin"><AddEditEmployeePage mode="edit" /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/employee/dashboard"    element={<ProtectedRoute role="employee"><EmployeeDashboardPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}