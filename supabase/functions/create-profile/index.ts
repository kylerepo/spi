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

    // Parse request body
    const body = await req.json()
    const {
      display_name,
      age,
      gender,
      gender_other,
      sexuality,
      sexuality_other,
      relationship_status,
      relationship_status_other,
      headline,
      bio,
      city,
      state,
      country,
      account_type = 'single',
      profile_type = 'single_profile'
    } = body

    // Validate required fields
    if (!display_name || !age || !gender || !sexuality || !relationship_status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let profileData

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabaseClient
        .from('profiles')
        .update({
          display_name,
          age,
          gender,
          gender_other: gender_other || null,
          sexuality,
          sexuality_other: sexuality_other || null,
          relationship_status,
          relationship_status_other: relationship_status_other || null,
          headline: headline || null,
          bio: bio || null,
          city: city || null,
          state: state || null,
          country: country || null,
          account_type,
          profile_type,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      profileData = data
    } else {
      // Create new profile
      const { data, error } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name,
          age,
          gender,
          gender_other: gender_other || null,
          sexuality,
          sexuality_other: sexuality_other || null,
          relationship_status,
          relationship_status_other: relationship_status_other || null,
          headline: headline || null,
          bio: bio || null,
          city: city || null,
          state: state || null,
          country: country || null,
          account_type,
          profile_type,
          is_profile_complete: false,
          is_visible: false,
          verification_status: 'unverified'
        })
        .select()
        .single()

      if (error) throw error
      profileData = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: profileData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating/updating profile:', error)
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