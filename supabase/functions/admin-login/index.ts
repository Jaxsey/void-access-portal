import { serve } from "https://deno.land/std@0.220.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get admin user first
    const { data: adminUser, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Simple password verification - first try plaintext for debugging, then bcrypt
    let isValid = false;
    if (adminUser.password_hash === password) {
      // Plaintext match for debugging
      isValid = true;
    } else if (adminUser.password_hash.startsWith('$2a$')) {
      // Try bcrypt verification
      try {
        isValid = await compare(password, adminUser.password_hash);
      } catch (bcryptError) {
        console.error('Bcrypt error:', bcryptError);
        // Fallback to plaintext comparison
        isValid = adminUser.password_hash === password;
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Generate secure session token
    const sessionToken = crypto.randomUUID()
    
    // Get client IP and user agent for session tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Create session with 24 hour expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const { error: sessionError } = await supabaseClient
      .from('admin_sessions')
      .insert({
        admin_id: adminUser.id,
        session_token: sessionToken,
        expires_at: expiresAt,
        ip_address: ip,
        user_agent: userAgent
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Update last login time
    await supabaseClient
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        token: sessionToken,
        user: { id: adminUser.id, username: adminUser.username },
        expiresAt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})