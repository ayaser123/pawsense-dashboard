#!/usr/bin/env node

const backendUrl = 'http://localhost:5000';
const timestamp = Date.now();
const testEmail = `debug_test_${timestamp}@example.com`;
const testPassword = 'TestPassword123!';

console.log('\n🔍 Diagnostic Signup Test\n');
console.log('Email:', testEmail);
console.log('Password: ***\n');

try {
  // Step 1: Check backend is running
  console.log('1. Checking backend health...');
  let res = await fetch(`${backendUrl}/health`);
  if (!res.ok) throw new Error('Backend not healthy');
  console.log('✅ Backend running\n');

  // Step 2: Try to create user
  console.log('2. Attempting to create user via backend...');
  res = await fetch(`${backendUrl}/auth/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      metadata: { full_name: 'Debug Test User' }
    })
  });

  const createData = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(createData, null, 2));

  if (!res.ok) {
    console.log('\n❌ Backend signup failed');
    console.log('Error details:', createData.details || createData.error);
    
    // If it's 422, email already exists
    if (res.status === 422 || createData.supabaseError) {
      console.log('\n⚠️  Email already exists in Supabase Auth');
      console.log('Try with a different email or use an email you know works for testing login\n');
    }
    process.exit(1);
  }

  console.log('\n✅ User created via backend');
  console.log('User ID:', createData.userId);

  // Step 3: Wait a moment for Supabase to process
  console.log('\n3. Waiting for Supabase processing...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 4: Try to login with the new credentials
  console.log('4. Attempting to login...');
  console.log('Note: This would normally happen in the frontend\n');

  console.log('✅ Diagnostic test complete');
  console.log('\nIf signup succeeded but login failed in the frontend:');
  console.log('1. Check if Supabase Auth is configured correctly');
  console.log('2. Check browser console for exact login error');
  console.log('3. Verify .env.local has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n');

} catch (error) {
  console.error('❌ Test error:', error.message);
  process.exit(1);
}
