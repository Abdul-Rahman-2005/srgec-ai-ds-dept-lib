#!/usr/bin/env node

/**
 * Database Migration Runner
 * Helps run the migration SQL file on your Supabase instance
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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

async function main() {
  console.log('\n📦 Database Migration Helper\n');

  // Read migration file
  const migrationPath = join(rootDir, 'supabase', 'migrations', '20251214064346_8f9d89e2-506c-4a5b-960a-f43951371cb7.sql');
  
  let migrationSQL;
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8');
  } catch (error) {
    console.error('❌ Could not read migration file:', error.message);
    process.exit(1);
  }

  console.log('✅ Migration file loaded\n');
  console.log('📋 Migration includes:');
  console.log('  - Tables: users, books, borrows, magazines, journals, csp_project_files');
  console.log('  - Enums: user_role, user_status, borrow_status');
  console.log('  - Functions: get_current_user_id(), is_active_user(), is_librarian()');
  console.log('  - RLS Policies for all tables');
  console.log('  - Storage bucket: csp-files\n');

  console.log('🔧 Choose migration method:\n');
  console.log('1. Copy SQL to clipboard (paste in Supabase Dashboard SQL Editor)');
  console.log('2. Save SQL to file (run manually)');
  console.log('3. Use Supabase CLI (if installed)\n');

  const choice = await question('Enter choice (1-3): ');

  if (choice === '1') {
    // Try to copy to clipboard (Windows/Linux/Mac)
    const { exec } = await import('child_process');
    const platform = process.platform;
    
    let command;
    if (platform === 'win32') {
      // Windows
      const { spawn } = await import('child_process');
      const proc = spawn('clip', []);
      proc.stdin.write(migrationSQL);
      proc.stdin.end();
      console.log('\n✅ SQL copied to clipboard!');
      console.log('Go to Supabase Dashboard → SQL Editor → Paste and Run\n');
    } else if (platform === 'darwin') {
      // macOS
      exec('pbcopy', (error) => {
        if (error) {
          console.log('\n⚠️  Could not copy to clipboard automatically.');
          console.log('Please copy the SQL manually from the file.\n');
        } else {
          console.log('\n✅ SQL copied to clipboard!');
          console.log('Go to Supabase Dashboard → SQL Editor → Paste and Run\n');
        }
      });
    } else {
      // Linux
      exec('xclip -selection clipboard', (error) => {
        if (error) {
          console.log('\n⚠️  Could not copy to clipboard automatically.');
          console.log('Please copy the SQL manually from the file.\n');
        } else {
          console.log('\n✅ SQL copied to clipboard!');
          console.log('Go to Supabase Dashboard → SQL Editor → Paste and Run\n');
        }
      });
    }
  } else if (choice === '2') {
    const outputPath = join(rootDir, 'migration-output.sql');
    const fs = await import('fs');
    fs.writeFileSync(outputPath, migrationSQL);
    console.log(`\n✅ SQL saved to: ${outputPath}`);
    console.log('Copy this file content and paste in Supabase Dashboard → SQL Editor\n');
  } else if (choice === '3') {
    console.log('\n📝 To use Supabase CLI:\n');
    console.log('1. Install: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Link project: supabase link --project-ref YOUR_PROJECT_REF');
    console.log('4. Push migration: supabase db push\n');
    console.log('Or run: supabase db push --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"');
  } else {
    console.log('Invalid choice');
  }

  rl.close();
}

main().catch(console.error);


