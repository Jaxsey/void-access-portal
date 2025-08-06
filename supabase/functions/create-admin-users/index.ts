import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

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

    // Hash passwords for the two admin users
    const jaxePasswordHash = await hash('Jax2003!', 10)
    const skolPasswordHash = await hash('simingay', 10)

    // Insert admin users
    const { error: jaxeError } = await supabaseClient
      .from('admin_users')
      .upsert({
        username: 'Jaxe',
        password_hash: jaxePasswordHash
      }, { onConflict: 'username' })

    const { error: skolError } = await supabaseClient
      .from('admin_users')
      .upsert({
        username: 'skol',
        password_hash: skolPasswordHash
      }, { onConflict: 'username' })

    if (jaxeError || skolError) {
      console.error('Error creating admin users:', { jaxeError, skolError })
      return new Response(
        JSON.stringify({ error: 'Failed to create admin users' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({ message: 'Admin users created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Create admin users error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})