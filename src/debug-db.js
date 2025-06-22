// Debug script to check database connection and admin users
import { supabase } from './lib/supabase.js'

async function debugDatabase() {
  console.log('=== Database Debug Information ===')
  
  // Check Supabase configuration
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('Supabase Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
  
  try {
    // Test basic connection
    console.log('\n=== Testing Database Connection ===')
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Database connection failed:', testError)
      return
    }
    
    console.log('Database connection: SUCCESS')
    
    // Check all admin users
    console.log('\n=== All Admin Users ===')
    const { data: allAdmins, error: allError } = await supabase
      .from('admins')
      .select('*')
    
    if (allError) {
      console.error('Failed to fetch admins:', allError)
      return
    }
    
    console.log('Total admin users:', allAdmins?.length || 0)
    allAdmins?.forEach(admin => {
      console.log(`- ${admin.email} (${admin.username}) - Active: ${admin.is_active}`)
    })
    
    // Check specific admin user
    console.log('\n=== Checking admin@quickcart.com ===')
    const { data: specificAdmin, error: specificError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@quickcart.com')
    
    if (specificError) {
      console.error('Failed to fetch specific admin:', specificError)
      return
    }
    
    console.log('Found admins with email admin@quickcart.com:', specificAdmin?.length || 0)
    specificAdmin?.forEach(admin => {
      console.log('Admin details:', {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role,
        is_active: admin.is_active,
        created_at: admin.created_at
      })
    })
    
    // Try to create admin user if it doesn't exist
    if (!specificAdmin || specificAdmin.length === 0) {
      console.log('\n=== Creating Admin User ===')
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert({
          email: 'admin@quickcart.com',
          username: 'admin',
          full_name: 'Default Administrator',
          role: 'super_admin',
          location: 'System',
          is_active: true
        })
        .select()
      
      if (createError) {
        console.error('Failed to create admin:', createError)
      } else {
        console.log('Created admin user:', newAdmin)
      }
    }
    
  } catch (error) {
    console.error('Debug script error:', error)
  }
}

// Run the debug function
debugDatabase()