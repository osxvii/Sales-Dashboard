import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { EcommercePage } from './pages/EcommercePage'
import { MonitorPage } from './pages/MonitorPage'
import { ErrorLogsPage } from './pages/ErrorLogsPage'
import { ProductsPage } from './pages/ProductsPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CategoriesPage } from './pages/CategoriesPage'
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
            <Route path="products" element={<ProductsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="monitor" element={<MonitorPage />} />
            <Route path="errors" element={<ErrorLogsPage />} />
            {/* Placeholder routes for remaining pages */}
            <Route path="analytics" element={<div className="p-6">Analytics Page - Coming Soon</div>} />
            <Route path="admins" element={<div className="p-6">Admins Page - Coming Soon</div>} />
            <Route path="access-logs" element={<div className="p-6">Access Logs Page - Coming Soon</div>} />
            <Route path="chat" element={<div className="p-6">Chat (Stella) Page - Coming Soon</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App