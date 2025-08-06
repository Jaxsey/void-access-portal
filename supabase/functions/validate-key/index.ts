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

    const { license_key } = await req.json()

    if (!license_key) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'License key is required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if the license key exists and is for today
    const { data, error } = await supabaseClient
      .from('daily_keys')
      .select('license_key, date')
      .eq('license_key', license_key)
      .eq('date', new Date().toISOString().split('T')[0]) // Today's date in YYYY-MM-DD format
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Database error' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Log the validation attempt
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    await supabaseClient.rpc('log_key_access', {
      ip_addr: ip,
      user_agent_val: userAgent
    })

    const isValid = data !== null

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        expires_at: isValid ? `${data.date}T23:59:59Z` : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Validation error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})