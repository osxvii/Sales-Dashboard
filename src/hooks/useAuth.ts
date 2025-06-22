import { useState, useEffect } from 'react'
import { supabase, type Admin } from '../lib/supabase'
import { detectLocation, getCurrentUTCTime } from '../utils/location'

interface AuthState {
  admin: Admin | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    admin: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const savedAdmin = localStorage.getItem('quickcart_admin')
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin)
        setAuthState({ admin, loading: false, error: null })
      } catch (error) {
        localStorage.removeItem('quickcart_admin')
        setAuthState({ admin: null, loading: false, error: null })
      }
    } else {
      setAuthState({ admin: null, loading: false, error: null })
    }
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 1. First ensure admin exists
      const { error: upsertError } = await supabase
        .from('admins')
        .upsert({
          id: '770e8400-e29b-41d4-a716-446655440000',
          email: 'admin@quickcart.com',
          username: 'admin',
          full_name: 'System Administrator',
          role: 'super_admin',
          location: 'System',
          is_active: true,
          updated_at: getCurrentUTCTime()
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })

      if (upsertError) throw upsertError

      // 2. Create mock admin object
      const mockAdmin: Admin = {
        id: '770e8400-e29b-41d4-a716-446655440000',
        email: 'admin@quickcart.com',
        username: 'admin',
        full_name: 'System Administrator',
        role: 'super_admin',
        location: 'System',
        is_active: true,
        last_login: getCurrentUTCTime(),
        created_at: getCurrentUTCTime(),
        updated_at: getCurrentUTCTime()
      };

      // 3. Detect location
      const location = await detectLocation()

      // 4. Log the access
      const { error: logError } = await supabase.from('access_logs').insert({
        admin_id: mockAdmin.id,
        email: email,
        login_time: getCurrentUTCTime(),
        location: `${location.city}, ${location.country}`,
        ip_address: location.ip,
        user_agent: navigator.userAgent,
        success: true
      })

      if (logError) throw logError

      // 5. Update last login
      await supabase
        .from('admins')
        .update({ last_login: getCurrentUTCTime() })
        .eq('id', mockAdmin.id)

      // 6. Save to localStorage
      localStorage.setItem('quickcart_admin', JSON.stringify(mockAdmin))
      
      setAuthState({ admin: mockAdmin, loading: false, error: null })
      return mockAdmin
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      
      // Log failed access attempt
      try {
        const location = await detectLocation()
        await supabase.from('access_logs').insert({
          email: email,
          login_time: getCurrentUTCTime(),
          location: `${location.city}, ${location.country}`,
          ip_address: location.ip,
          user_agent: navigator.userAgent,
          success: false
        })
      } catch (logError) {
        console.error('Failed to log access attempt:', logError)
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('quickcart_admin')
    setAuthState({ admin: null, loading: false, error: null })
  }

  return {
    ...authState,
    login,
    logout
  }
}