import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-ref.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
}

export const getDailyKey = async (): Promise<DailyKey | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('daily-key')
    
    if (error) throw error
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

export const getAdminStats = async (): Promise<AdminStats | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-stats')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}