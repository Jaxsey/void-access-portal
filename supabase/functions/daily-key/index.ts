import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get or create daily key
    const { data, error } = await supabaseClient.rpc('get_or_create_daily_key')

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // The RPC function returns an array, get the first result
    const keyData = Array.isArray(data) ? data[0] : data
    
    if (!keyData) {
      throw new Error('No key data returned')
    }

    // Log the access
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    await supabaseClient.rpc('log_key_access', {
      ip_addr: ip,
      user_agent_val: userAgent
    })

    return new Response(
      JSON.stringify(keyData),
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