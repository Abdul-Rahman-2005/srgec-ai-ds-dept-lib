#!/usr/bin/env node

/**
 * Complete Migration Script
 * Runs all migration steps in sequence
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n🚀 Complete Supabase Migration\n');
  console.log('This script will guide you through the entire migration process.\n');

  // Step 1: Check .env
  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) {
    console.log('📝 Step 1: Setting up environment variables...\n');
    console.log('Run: npm run setup:supabase');
    console.log('Or create .env manually with your Supabase credentials.\n');
    const continueSetup = await question('Have you created .env file? (y/n): ');
    if (continueSetup.toLowerCase() !== 'y') {
      console.log('\nPlease create .env file first, then run this script again.');
      rl.close();
      return;
    }
  }

  // Load env
  config({ path: envPath });
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.log('Run: npm run setup:supabase\n');
    rl.close();
    process.exit(1);
  }

  console.log(`✅ Found Supabase credentials: ${supabaseUrl}\n`);

  // Step 2: Database Migration
  console.log('📦 Step 2: Database Migration\n');
  console.log('You need to run the database migration SQL in your Supabase dashboard.\n');
  console.log('Options:');
  console.log('  1. Run migration helper: npm run migrate:run');
  console.log('  2. Or manually: Go to Supabase Dashboard → SQL Editor → Paste migration SQL\n');

  const migrationDone = await question('Have you run the database migration? (y/n): ');
  if (migrationDone.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please run the migration first.');
    console.log('Run: npm run migrate:run\n');
    rl.close();
    return;
  }

  // Step 3: Storage Bucket
  console.log('\n📁 Step 3: Storage Bucket\n');
  console.log('Create storage bucket in Supabase Dashboard:');
  console.log('  1. Go to Storage → New Bucket');
  console.log('  2. Name: csp-files');
  console.log('  3. Public: ✅ (checked)');
  console.log('  4. Create bucket\n');

  const bucketDone = await question('Have you created the csp-files bucket? (y/n): ');
  if (bucketDone.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please create the storage bucket first.\n');
    rl.close();
    return;
  }

  // Step 4: Auth Configuration
  console.log('\n🔐 Step 4: Authentication Configuration\n');
  console.log('Configure authentication settings:');
  console.log('  1. Go to Authentication → Settings → Email Auth');
  console.log('  2. Disable "Enable email confirmations" (for testing)');
  console.log('  3. Go to Authentication → URL Configuration');
  console.log('  4. Add redirect URL: http://localhost:8080/**\n');

  const authDone = await question('Have you configured authentication? (y/n): ');
  if (authDone.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please configure authentication settings.\n');
    rl.close();
    return;
  }

  // Step 5: Create Librarian
  console.log('\n👤 Step 5: Create Librarian Account\n');
  const createLibrarian = await question('Create librarian account automatically? (y/n): ');
  
  if (createLibrarian.toLowerCase() === 'y') {
    console.log('\nRunning librarian creation script...\n');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const email = 'librarian@library.edu';
      const password = 'AI&DSLibrarian@123';

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.log('⚠️  Could not auto-create auth account. Creating profile only...\n');
      }

      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log('⚠️  Please create librarian manually:');
        console.log('   Run: npm run migrate:librarian');
        console.log('   Or create in Supabase Dashboard\n');
      } else if (signInData?.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            auth_id: signInData.user.id,
            name: 'AI&DS Department Librarian',
            role: 'librarian',
            roll_or_faculty_id: 'AI&DSDEPTLIB@123',
            phone: '0000000000',
            status: 'active',
          }, {
            onConflict: 'roll_or_faculty_id',
          });

        if (profileError) {
          console.log('⚠️  Error creating profile:', profileError.message);
          console.log('   Run: npm run migrate:librarian\n');
        } else {
          console.log('✅ Librarian account created!\n');
        }

        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      console.log('   Run manually: npm run migrate:librarian\n');
    }
  } else {
    console.log('\nRun manually: npm run migrate:librarian\n');
  }

  // Final check
  console.log('\n✅ Migration Setup Complete!\n');
  console.log('📋 Final Checklist:');
  console.log('  [ ] Database migration executed');
  console.log('  [ ] Storage bucket created');
  console.log('  [ ] Auth settings configured');
  console.log('  [ ] Librarian account created');
  console.log('\n🧪 Test your app:');
  console.log('  npm run dev');
  console.log('\n📚 Documentation:');
  console.log('  - MIGRATION_GUIDE.md - Full migration guide');
  console.log('  - AUTHENTICATION_MIGRATION.md - Auth setup details');
  console.log('  - QUICK_START.md - Quick reference\n');

  rl.close();
}

main().catch(console.error);


