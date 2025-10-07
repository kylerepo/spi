import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://hvafquyruidsvteerdwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWZxdXlydWlkc3Z0ZWVyZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ3ODcsImV4cCI6MjA3NTExMDc4N30.Eu74Afz66mSLrEJK1B2g4WG3OoOTL4dT55LABL_Eu0s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndCreateStorage() {
  console.log('🔍 Checking storage configuration...');
  
  try {
    // Check if photos bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Cannot access storage:', listError.message);
      return;
    }
    
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    const photosBucket = buckets.find(bucket => bucket.name === 'photos');
    
    if (!photosBucket) {
      console.log('❌ Photos bucket missing!');
      console.log('🛠️ Attempting to create photos bucket...');
      
      // Try to create the bucket
      const { error: createError } = await supabase.storage.createBucket('photos', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        console.log('📋 MANUAL ACTION REQUIRED:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Storage');
        console.log('4. Click "New bucket"');
        console.log('5. Name: "photos"');
        console.log('6. ✅ Check "Public bucket"');
        console.log('7. Click Create');
      } else {
        console.log('✅ Photos bucket created successfully!');
      }
    } else {
      console.log('✅ Photos bucket exists');
      console.log('📊 Bucket info:', photosBucket);
    }
    
    // Test upload
    console.log('🧪 Testing upload...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload('test/upload-test.txt', testFile);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      
      if (uploadError.message.includes('not found')) {
        console.log('🚨 BUCKET DOES NOT EXIST - CREATE IT MANUALLY');
      } else if (uploadError.message.includes('policy')) {
        console.log('🚨 STORAGE POLICIES MISSING - APPLY POLICIES');
      }
    } else {
      console.log('✅ Upload test successful!');
      // Clean up
      await supabase.storage.from('photos').remove(['test/upload-test.txt']);
    }
    
  } catch (error) {
    console.error('❌ Storage check failed:', error.message);
  }
}

// Run the check
checkAndCreateStorage();