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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const {
      practices = [],
      custom_practices
    } = body

    // Check if safe sex practices already exist
    const { data: existingSafeSex } = await supabaseClient
      .from('profile_safe_sex')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    let safeSexData

    if (existingSafeSex) {
      // Update existing safe sex practices
      const { data, error } = await supabaseClient
        .from('profile_safe_sex')
        .update({
          practices,
          custom_practices: custom_practices || null,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profile.id)
        .select()
        .single()

      if (error) throw error
      safeSexData = data
    } else {
      // Create new safe sex practices
      const { data, error } = await supabaseClient
        .from('profile_safe_sex')
        .insert({
          profile_id: profile.id,
          practices,
          custom_practices: custom_practices || null
        })
        .select()
        .single()

      if (error) throw error
      safeSexData = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        safe_sex: safeSexData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error saving profile safe sex practices:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})