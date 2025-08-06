import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    if (todayError || totalError || recentError || keysError) {
      throw new Error('Failed to fetch stats')
    }

    return new Response(
      JSON.stringify({
        todayAccess: todayAccess?.length || 0,
        totalAccess: totalAccess?.length || 0,
        recentAccesses: recentAccesses || [],
        dailyKeys: dailyKeys || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})