import { supabase } from '@/integrations/supabase/client'

export interface DailyKey {
  license_key: string
  url_path: string
  date: string
}

export interface AdminStats {
  todayAccess: number
  totalAccess: number
  recentAccesses: any[]
  dailyKeys: any[]
  premiumKeys: any[]
  adminKeys: any[]
}

export const getDailyKey = async (): Promise<DailyKey | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('daily-key')
    
    if (error) {
      console.error('Supabase function error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error fetching daily key:', error)
    return null
  }
}

export const adminLogin = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-login', {
      body: { username, password }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

export const validateAdminSession = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error validating session:', error)
    throw error
  }
}

export const adminLogout = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-logout', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

export const getAdminStats = async (token: string): Promise<AdminStats | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}

export const regenerateDailyKey = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('regenerate-daily-key', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error regenerating daily key:', error)
    throw error
  }
}

export const generatePremiumKey = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-premium-key', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error generating premium key:', error)
    throw error
  }
}

export const generateAdminKey = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-admin-key', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error generating admin key:', error)
    throw error
  }
}