import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { EcommercePage } from './pages/EcommercePage'
import { useAuth } from './hooks/useAuth'
import './index.css'

function App() {
  const { admin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/store" element={<EcommercePage />} />
          <Route path="/login" element={!admin ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected Admin Routes */}
          <Route path="/" element={admin ? <DashboardLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* Placeholder routes for other pages */}
            <Route path="products" element={<div className="p-6">Products Page - Coming Soon</div>} />
            <Route path="transactions" element={<div className="p-6">Transactions Page - Coming Soon</div>} />
            <Route path="companies" element={<div className="p-6">Companies Page - Coming Soon</div>} />
            <Route path="categories" element={<div className="p-6">Categories Page - Coming Soon</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics Page - Coming Soon</div>} />
            <Route path="admins" element={<div className="p-6">Admins Page - Coming Soon</div>} />
            <Route path="errors" element={<div className="p-6">Error Logs Page - Coming Soon</div>} />
            <Route path="access-logs" element={<div className="p-6">Access Logs Page - Coming Soon</div>} />
            <Route path="monitor" element={<div className="p-6">AI Monitor Page - Coming Soon</div>} />
            <Route path="chat" element={<div className="p-6">Chat (Stella) Page - Coming Soon</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App