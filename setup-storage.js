#!/usr/bin/env node

/**
 * Emergency Supabase Storage Setup Script
 * This script will create the photos bucket and apply necessary policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Starting Supabase storage setup...\n');

  try {
    // Step 1: Check if photos bucket exists
    console.log('1️⃣ Checking for photos bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message);
      return false;
    }

    const photosBucket = buckets.find(bucket => bucket.name === 'photos');
    
    if (photosBucket) {
      console.log('✅ Photos bucket already exists');
    } else {
      // Step 2: Create photos bucket
      console.log('📦 Creating photos bucket...');
      const { error: createError } = await supabase.storage.createBucket('photos', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        return false;
      }
      console.log('✅ Photos bucket created successfully');
    }

    // Step 3: Apply storage policies
    console.log('2️⃣ Setting up storage policies...');
    
    const policies = [
      {
        id: 'photos-upload',
        name: 'Authenticated users can upload photos',
        definition: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`,
        command: 'INSERT',
        roles: ['authenticated']
      },
      {
        id: 'photos-read',
        name: 'Public can read photos',
        definition: `bucket_id = 'photos'`,
        command: 'SELECT',
        roles: ['public']
      },
      {
        id: 'photos-delete',
        name: 'Users can delete own photos',
        definition: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`,
        command: 'DELETE',
        roles: ['authenticated']
      },
      {
        id: 'photos-update',
        name: 'Users can update own photos',
        definition: `bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text`,
        command: 'UPDATE',
        roles: ['authenticated']
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('create_storage_policy', {
          bucket_name: 'photos',
          policy_name: policy.name,
          definition: policy.definition,
          command: policy.command,
          roles: policy.roles
        });

        if (error) {
          console.warn(`⚠️ Policy ${policy.name} may already exist:`, error.message);
        } else {
          console.log(`✅ Created policy: ${policy.name}`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not create policy ${policy.name}:`, err.message);
      }
    }

    // Step 4: Verify setup
    console.log('3️⃣ Verifying setup...');
    
    // Test upload
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload('test/setup-test.txt', testFile);

    if (uploadError) {
      console.warn('⚠️ Upload test failed:', uploadError.message);
      console.log('📝 You may need to create policies manually in Supabase Dashboard');
    } else {
      console.log('✅ Upload test successful');
      
      // Clean up test file
      await supabase.storage.from('photos').remove(['test/setup-test.txt']);
    }

    console.log('\n🎉 Storage setup completed!');
    console.log('📱 Your app should now be able to upload photos.');
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run the setup
setupStorage().then(success => {
  if (success) {
    console.log('\n✅ All done! Try uploading photos in your app now.');
  } else {
    console.log('\n❌ Setup incomplete. Please check the errors above.');
    console.log('💡 You may need to create the bucket manually in Supabase Dashboard.');
  }
});