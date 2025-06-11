import React, { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { SalesChart } from '../components/dashboard/SalesChart'
import { dbService } from '../lib/supabase'
import { formatCurrency } from '../utils/format'

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTransactions: 0,
    activeAdmins: 0,
    unresolvedErrors: 0,
    totalRevenue: 0,
    todaysSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, recentTransactions] = await Promise.all([
          dbService.getDashboardStats(),
          dbService.getRecentTransactions(100)
        ])

        // Calculate revenue metrics
        const totalRevenue = recentTransactions.reduce((sum, t) => sum + t.total_amount, 0)
        const today = new Date().toDateString()
        const todaysSales = recentTransactions
          .filter(t => new Date(t.transaction_time).toDateString() === today)
          .reduce((sum, t) => sum + t.total_amount, 0)

        setStats({
          ...dashboardStats,
          totalRevenue,
          todaysSales
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to your QuickCart sales dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={ShoppingCart}
          color="green"
        />
        <StatsCard
          title="Active Admins"
          value={stats.activeAdmins}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Unresolved Errors"
          value={stats.unresolvedErrors}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Today's Sales"
          value={formatCurrency(stats.todaysSales)}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <RecentTransactions />
      </div>
    </div>
  )
}