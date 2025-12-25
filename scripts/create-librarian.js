#!/usr/bin/env node

/**
 * Create Librarian Account Script
 * Creates the librarian account in your Supabase instance
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
config({ path: join(rootDir, '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n👤 Librarian Account Setup\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.log('Run: node scripts/setup-supabase.js first\n');
    rl.close();
    process.exit(1);
  }

  console.log(`✅ Using Supabase: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if librarian already exists
  const { data: existingLibrarian } = await supabase
    .from('users')
    .select('*')
    .eq('roll_or_faculty_id', 'AI&DSDEPTLIB@123')
    .maybeSingle();

  if (existingLibrarian) {
    console.log('ℹ️  Librarian account already exists in database.\n');
    const recreate = await question('Recreate auth account? (y/n): ');
    if (recreate.toLowerCase() !== 'y') {
      console.log('Skipping. Librarian can log in with existing credentials.');
      rl.close();
      return;
    }
  }

  const email = 'librarian@library.edu';
  const password = 'AI&DSLibrarian@123';

  console.log('Creating librarian account...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);

  // Try to sign up (will fail if exists, that's okay)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.VITE_SITE_URL || 'http://localhost:8080'}/`,
    },
  });

  if (signUpError && !signUpError.message.includes('already registered')) {
    console.error('❌ Error creating auth account:', signUpError.message);
    console.log('\n💡 Alternative: Create manually in Supabase Dashboard:');
    console.log('   1. Go to Authentication → Users → Add User');
    console.log(`   2. Email: ${email}`);
    console.log(`   3. Password: ${password}`);
    console.log('   4. Auto Confirm: ✅');
    console.log('   5. Then run this script again to create the profile\n');
    rl.close();
    return;
  }

  // Sign in to get the user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('❌ Error signing in:', signInError.message);
    console.log('\n💡 Please create the auth user manually in Supabase Dashboard first.\n');
    rl.close();
    return;
  }

  if (!signInData.user) {
    console.error('❌ No user returned from sign in');
    rl.close();
    return;
  }

  const userId = signInData.user.id;
  console.log(`✅ Auth account created/found. User ID: ${userId}\n`);

  // Create or update profile
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      auth_id: userId,
      name: 'AI&DS Department Librarian',
      role: 'librarian',
      roll_or_faculty_id: 'AI&DSDEPTLIB@123',
      phone: '0000000000',
      status: 'active',
    }, {
      onConflict: 'roll_or_faculty_id',
    });

  if (profileError) {
    console.error('❌ Error creating profile:', profileError.message);
    rl.close();
    return;
  }

  console.log('✅ Librarian account setup complete!\n');
  console.log('Login credentials:');
  console.log('  Username: AI&DSDEPTLIB@123');
  console.log('  Password: AI&DSLibrarian@123\n');

  // Sign out
  await supabase.auth.signOut();

  rl.close();
}

main().catch(console.error);


