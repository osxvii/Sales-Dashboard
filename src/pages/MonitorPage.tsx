import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  Users
} from 'lucide-react'
import { dbService } from '../lib/supabase'
import { aiMonitoringService } from '../services/aiMonitoringService'
import { formatCurrency, formatDateTime } from '../utils/format'
import type { ErrorLog, Product, Transaction } from '../lib/supabase'

interface MonitoringStats {
  totalScans: number
  anomaliesDetected: number
  resolvedIssues: number
  accuracyRate: number
  lastScanTime: string
}

interface AnomalyAlert {
  id: string
  type: 'stock_mismatch' | 'price_anomaly' | 'sales_pattern' | 'inventory_discrepancy'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  product?: Product
  expectedValue?: number
  actualValue?: number
  confidence: number
  timestamp: string
  resolved: boolean
}

export const MonitorPage: React.FC = () => {
  const [stats, setStats] = useState<MonitoringStats>({
    totalScans: 0,
    anomaliesDetected: 0,
    resolvedIssues: 0,
    accuracyRate: 0,
    lastScanTime: new Date().toISOString()
  })
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    loadMonitoringData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMonitoringData = async () => {
    try {
      const [errorLogs, products, transactions] = await Promise.all([
        dbService.getErrorLogs(),
        dbService.getProducts(),
        dbService.getRecentTransactions(100)
      ])

      // Convert error logs to anomaly alerts
      const anomalyAlerts: AnomalyAlert[] = errorLogs.map(error => ({
        id: error.id,
        type: error.error_type as any,
        severity: error.severity as any,
        title: getAlertTitle(error.error_type),
        description: error.description,
        product: error.product,
        expectedValue: error.expected_value || undefined,
        actualValue: error.actual_value || undefined,
        confidence: calculateConfidence(error),
        timestamp: error.created_at,
        resolved: error.resolved
      }))

      setAlerts(anomalyAlerts)

      // Calculate monitoring stats
      const totalScans = Math.floor(Math.random() * 1000) + 500 // Simulated
      const anomaliesDetected = errorLogs.length
      const resolvedIssues = errorLogs.filter(e => e.resolved).length
      const accuracyRate = anomaliesDetected > 0 ? (resolvedIssues / anomaliesDetected) * 100 : 95

      setStats({
        totalScans,
        anomaliesDetected,
        resolvedIssues,
        accuracyRate,
        lastScanTime: new Date().toISOString()
      })

      // Generate AI insights
      const aiInsights = await aiMonitoringService.generateInsights(products, transactions, errorLogs)
      setInsights(aiInsights)

    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAIScan = async () => {
    setIsScanning(true)
    try {
      const results = await aiMonitoringService.runComprehensiveScan()
      
      // Refresh data after scan
      await loadMonitoringData()
      
      // Show scan results
      alert(`AI Scan Complete!\n\nNew anomalies detected: ${results.newAnomalies}\nIssues resolved: ${results.resolvedIssues}\nAccuracy: ${results.accuracy}%`)
      
    } catch (error) {
      console.error('AI scan failed:', error)
      alert('AI scan failed. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const getAlertTitle = (type: string): string => {
    switch (type) {
      case 'stock_mismatch': return 'Stock Discrepancy Detected'
      case 'price_anomaly': return 'Price Anomaly Alert'
      case 'sales_pattern': return 'Unusual Sales Pattern'
      case 'inventory_discrepancy': return 'Inventory Mismatch'
      default: return 'System Alert'
    }
  }

  const calculateConfidence = (error: ErrorLog): number => {
    // Simple confidence calculation based on discrepancy amount
    if (!error.discrepancy_amount) return 85
    const discrepancy = Math.abs(error.discrepancy_amount)
    if (discrepancy > 1000) return 95
    if (discrepancy > 500) return 90
    if (discrepancy > 100) return 85
    return 80
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return Activity
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 text-quickcart-600 mr-3" />
            AI Monitoring System
          </h1>
          <p className="text-gray-600 mt-1">Intelligent anomaly detection and business insights</p>
        </div>
        <Button
          onClick={runAIScan}
          disabled={isScanning}
          className="flex items-center"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run AI Scan
            </>
          )}
        </Button>
      </div>

      {/* Monitoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.anomaliesDetected}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedIssues}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accuracyRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-quickcart-50 rounded-lg">
                  <Zap className="h-5 w-5 text-quickcart-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No insights available. Run an AI scan to generate intelligent recommendations.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Anomaly Alerts
            </span>
            <span className="text-sm font-normal text-gray-600">
              Last scan: {formatDateTime(stats.lastScanTime)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map(alert => {
                const SeverityIcon = getSeverityIcon(alert.severity)
                return (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <SeverityIcon className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {alert.confidence}% confidence
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          
                          {alert.product && (
                            <p className="text-sm text-gray-500">
                              Product: <span className="font-medium">{alert.product.name}</span> (SKU: {alert.product.sku})
                            </p>
                          )}
                          
                          {alert.expectedValue && alert.actualValue && (
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-gray-600">
                                Expected: <span className="font-medium">{formatCurrency(alert.expectedValue)}</span>
                              </span>
                              <span className="text-gray-600">
                                Actual: <span className="font-medium">{formatCurrency(alert.actualValue)}</span>
                              </span>
                              <span className="text-red-600">
                                Difference: <span className="font-medium">{formatCurrency(Math.abs(alert.expectedValue - alert.actualValue))}</span>
                              </span>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Detected: {formatDateTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.resolved ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolved
                          </span>
                        ) : (
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <p>No anomalies detected. Your system is running smoothly!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}