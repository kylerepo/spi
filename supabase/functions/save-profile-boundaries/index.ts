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
      boundaries = [],
      custom_boundaries
    } = body

    // Check if boundaries already exist
    const { data: existingBoundaries } = await supabaseClient
      .from('profile_boundaries')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    let boundariesData

    if (existingBoundaries) {
      // Update existing boundaries
      const { data, error } = await supabaseClient
        .from('profile_boundaries')
        .update({
          boundaries,
          custom_boundaries: custom_boundaries || null,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profile.id)
        .select()
        .single()

      if (error) throw error
      boundariesData = data
    } else {
      // Create new boundaries
      const { data, error } = await supabaseClient
        .from('profile_boundaries')
        .insert({
          profile_id: profile.id,
          boundaries,
          custom_boundaries: custom_boundaries || null
        })
        .select()
        .single()

      if (error) throw error
      boundariesData = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        boundaries: boundariesData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error saving profile boundaries:', error)
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