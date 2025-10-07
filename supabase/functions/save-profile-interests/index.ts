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
      interests = [],
      custom_interests
    } = body

    // Delete existing interests for this profile
    await supabaseClient
      .from('profile_interests')
      .delete()
      .eq('profile_id', profile.id)

    // Insert new interests
    if (interests.length > 0) {
      const interestInserts = interests.map((interest: string) => ({
        profile_id: profile.id,
        interest_name: interest
      }))

      const { error: interestsError } = await supabaseClient
        .from('profile_interests')
        .insert(interestInserts)

      if (interestsError) throw interestsError
    }

    // Insert custom interests if provided
    if (custom_interests && custom_interests.trim()) {
      const { error: customError } = await supabaseClient
        .from('profile_interests')
        .insert({
          profile_id: profile.id,
          interest_name: 'Custom',
          custom_interest: custom_interests.trim()
        })

      if (customError) throw customError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Interests saved successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error saving profile interests:', error)
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