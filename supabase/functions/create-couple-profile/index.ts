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
      .select('id, account_type')
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

    if (profile.account_type !== 'couple') {
      return new Response(
        JSON.stringify({ error: 'Profile is not a couple account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const {
      partner1_name,
      partner1_gender,
      partner1_gender_other,
      partner1_sexuality,
      partner1_sexuality_other,
      partner1_bio,
      partner2_name,
      partner2_gender,
      partner2_gender_other,
      partner2_sexuality,
      partner2_sexuality_other,
      partner2_bio
    } = body

    // Validate required fields
    if (!partner1_name || !partner1_gender || !partner1_sexuality || !partner1_bio ||
        !partner2_name || !partner2_gender || !partner2_sexuality || !partner2_bio) {
      return new Response(
        JSON.stringify({ error: 'Missing required partner information' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if couple profile already exists
    const { data: existingCoupleProfile } = await supabaseClient
      .from('couple_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    let coupleProfileData

    if (existingCoupleProfile) {
      // Update existing couple profile
      const { data, error } = await supabaseClient
        .from('couple_profiles')
        .update({
          partner1_name,
          partner1_gender,
          partner1_gender_other: partner1_gender_other || null,
          partner1_sexuality,
          partner1_sexuality_other: partner1_sexuality_other || null,
          partner1_bio,
          partner2_name,
          partner2_gender,
          partner2_gender_other: partner2_gender_other || null,
          partner2_sexuality,
          partner2_sexuality_other: partner2_sexuality_other || null,
          partner2_bio,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profile.id)
        .select()
        .single()

      if (error) throw error
      coupleProfileData = data
    } else {
      // Create new couple profile
      const { data, error } = await supabaseClient
        .from('couple_profiles')
        .insert({
          profile_id: profile.id,
          partner1_name,
          partner1_gender,
          partner1_gender_other: partner1_gender_other || null,
          partner1_sexuality,
          partner1_sexuality_other: partner1_sexuality_other || null,
          partner1_bio,
          partner2_name,
          partner2_gender,
          partner2_gender_other: partner2_gender_other || null,
          partner2_sexuality,
          partner2_sexuality_other: partner2_sexuality_other || null,
          partner2_bio
        })
        .select()
        .single()

      if (error) throw error
      coupleProfileData = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        couple_profile: coupleProfileData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating/updating couple profile:', error)
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