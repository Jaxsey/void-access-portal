import { serve } from "https://deno.land/std@0.220.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate admin session
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate session
    const { data: sessionData, error: sessionError } = await supabaseClient.rpc('validate_admin_session', {
      token
    })

    if (sessionError) {
      console.error('Session validation error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Session validation failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const session = Array.isArray(sessionData) ? sessionData[0] : sessionData

    if (!session?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Get today's access count
    const { data: todayAccess, error: todayError } = await supabaseClient
      .from('key_access_logs')
      .select('id', { count: 'exact' })
      .gte('accessed_at', new Date().toISOString().split('T')[0])

    // Get total access count
    const { data: totalAccess, error: totalError } = await supabaseClient
      .from('key_access_logs')
      .select('id', { count: 'exact' })

    // Get recent accesses with details
    const { data: recentAccesses, error: recentError } = await supabaseClient
      .from('key_access_logs')
      .select('*')
      .order('accessed_at', { ascending: false })
      .limit(10)

    // Get all daily keys
    const { data: dailyKeys, error: keysError } = await supabaseClient
      .from('daily_keys')
      .select('*')
      .order('date', { ascending: false })

    // Get premium keys
    const { data: premiumKeys, error: premiumKeysError } = await supabaseClient
      .from('premium_keys')
      .select('license_key, expires_at, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Get admin keys
    const { data: adminKeys, error: adminKeysError } = await supabaseClient
      .from('admin_keys')
      .select('license_key, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (todayError || totalError || recentError || keysError || premiumKeysError || adminKeysError) {
      throw new Error('Failed to fetch stats')
    }

    return new Response(
      JSON.stringify({
        todayAccess: todayAccess?.length || 0,
        totalAccess: totalAccess?.length || 0,
        recentAccesses: recentAccesses || [],
        dailyKeys: dailyKeys || [],
        premiumKeys: premiumKeys || [],
        adminKeys: adminKeys || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Admin stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})