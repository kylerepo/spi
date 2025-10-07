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
      seeking_genders = [],
      seeking_account_types = [],
      age_range_min = 18,
      age_range_max = 100
    } = body

    // Validate age range
    if (age_range_min < 18 || age_range_max > 100 || age_range_min > age_range_max) {
      return new Response(
        JSON.stringify({ error: 'Invalid age range' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if preferences already exist
    const { data: existingPreferences } = await supabaseClient
      .from('profile_preferences')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    let preferencesData

    if (existingPreferences) {
      // Update existing preferences
      const { data, error } = await supabaseClient
        .from('profile_preferences')
        .update({
          seeking_genders,
          seeking_account_types,
          age_range_min,
          age_range_max,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profile.id)
        .select()
        .single()

      if (error) throw error
      preferencesData = data
    } else {
      // Create new preferences
      const { data, error } = await supabaseClient
        .from('profile_preferences')
        .insert({
          profile_id: profile.id,
          seeking_genders,
          seeking_account_types,
          age_range_min,
          age_range_max
        })
        .select()
        .single()

      if (error) throw error
      preferencesData = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        preferences: preferencesData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error saving profile preferences:', error)
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