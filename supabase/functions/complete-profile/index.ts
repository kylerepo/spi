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
      .select('*')
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

    // Validate that all required fields are filled
    const requiredFields = [
      'display_name',
      'age',
      'gender',
      'sexuality',
      'relationship_status',
      'headline',
      'bio',
      'city',
      'state',
      'country'
    ]

    const missingFields = requiredFields.filter(field => !profile[field])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Profile incomplete', 
          missing_fields: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For couple accounts, check if couple profile exists
    if (profile.account_type === 'couple') {
      const { data: coupleProfile, error: coupleError } = await supabaseClient
        .from('couple_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .single()

      if (coupleError || !coupleProfile) {
        return new Response(
          JSON.stringify({ error: 'Couple profile information missing' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Validate couple profile required fields
      const coupleRequiredFields = [
        'partner1_name',
        'partner1_gender',
        'partner1_sexuality',
        'partner1_bio',
        'partner2_name',
        'partner2_gender',
        'partner2_sexuality',
        'partner2_bio'
      ]

      const missingCoupleFields = coupleRequiredFields.filter(field => !coupleProfile[field])
      
      if (missingCoupleFields.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Couple profile incomplete', 
            missing_fields: missingCoupleFields 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Mark profile as complete and visible
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        is_profile_complete: true,
        is_visible: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: updatedProfile,
        message: 'Profile completed successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error completing profile:', error)
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