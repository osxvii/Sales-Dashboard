import { useState, useCallback } from 'react'
import type { ToastProps } from '../components/ui/Toast'

interface UseToastReturn {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => {}
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts
  }
}