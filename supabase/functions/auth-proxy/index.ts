const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXTERNAL_SUPABASE_URL = 'https://aewesxrdohkoskuycfww.supabase.co'
const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld2VzeHJkb2hrb3NrdXljZnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTgwMzAsImV4cCI6MjA5MDEzNDAzMH0.Aize-fcNvoXi_mqj8zQld_yyEZpdVRc2TSNugxn78KQ'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Try to authenticate against the external platform
    const externalAuthResponse = await fetch(
      `${EXTERNAL_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EXTERNAL_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      }
    )

    if (!externalAuthResponse.ok) {
      const errorData = await externalAuthResponse.json()
      console.log('External auth failed:', errorData)
      return new Response(JSON.stringify({ error: 'Email ou senha incorretos no painel externo' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const externalUser = await externalAuthResponse.json()
    console.log('External auth success for:', email)

    // 2. Now sign in or create the user locally
    const localSupabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(localSupabaseUrl, serviceRoleKey)

    // Check if user exists locally
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const localUser = existingUsers?.users?.find(u => u.email === email)

    if (localUser) {
      // User exists locally - update password to match external and sign in
      await supabase.auth.admin.updateUserById(localUser.id, { password })

      // Generate a session for the user
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

      // Use direct token generation
      const localAnon = Deno.env.get('SUPABASE_ANON_KEY')!
      const signInResponse = await fetch(
        `${localSupabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': localAnon,
          },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!signInResponse.ok) {
        console.error('Local sign-in failed after password update')
        return new Response(JSON.stringify({ error: 'Erro interno ao sincronizar login' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const session = await signInResponse.json()
      return new Response(JSON.stringify({ session, isNew: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // User doesn't exist locally - create them
      const fullName = externalUser.user?.user_metadata?.full_name || 
                       externalUser.user?.user_metadata?.name || 
                       email.split('@')[0]

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })

      if (createError) {
        console.error('Failed to create local user:', createError)
        return new Response(JSON.stringify({ error: 'Erro ao criar conta local' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Sign in the new user
      const localAnon = Deno.env.get('SUPABASE_ANON_KEY')!
      const signInResponse = await fetch(
        `${localSupabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': localAnon,
          },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!signInResponse.ok) {
        console.error('Local sign-in failed for new user')
        return new Response(JSON.stringify({ error: 'Erro interno ao fazer login' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const session = await signInResponse.json()
      return new Response(JSON.stringify({ session, isNew: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Auth proxy error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
