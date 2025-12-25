#!/usr/bin/env node

/**
 * Link Supabase Project and Run Migrations
 * Interactive script to link your project and push migrations
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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
  console.log('\n🔗 Link Supabase Project & Run Migrations\n');

  // Check if .env exists
  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('Run: npm run setup:supabase\n');
    rl.close();
    process.exit(1);
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL not found in .env');
    rl.close();
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!projectRefMatch) {
    console.error('❌ Invalid Supabase URL format');
    console.log('Expected format: https://xxxxx.supabase.co');
    rl.close();
    process.exit(1);
  }

  const projectRef = projectRefMatch[1];
  console.log(`📋 Detected project reference: ${projectRef}\n`);

  // Check if already linked
  const configPath = join(rootDir, 'supabase', 'config.toml');
  let configContent = '';
  if (existsSync(configPath)) {
    configContent = readFileSync(configPath, 'utf-8');
    if (configContent.includes(projectRef)) {
      console.log('✅ Project already linked!\n');
    }
  }

  // Step 1: Login check
  console.log('Step 1: Checking Supabase login...\n');
  try {
    execSync('npx supabase projects list', { stdio: 'ignore' });
    console.log('✅ Already logged in!\n');
  } catch (error) {
    console.log('⚠️  Not logged in. Please login first:\n');
    console.log('   npm run supabase:login');
    console.log('   (This will open your browser)\n');
    
    const continueLogin = await question('Have you completed the login? (y/n): ');
    if (continueLogin.toLowerCase() !== 'y') {
      console.log('\nPlease login first, then run this script again.');
      rl.close();
      return;
    }
  }

  // Step 2: Link project
  console.log('\nStep 2: Linking project...\n');
  console.log(`Project Reference: ${projectRef}`);
  
  const dbPassword = await question('Enter your database password (from Supabase project settings): ');
  if (!dbPassword) {
    console.error('❌ Database password required');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('\nLinking project (this may take a moment)...\n');
    execSync(`npx supabase link --project-ref ${projectRef} --password "${dbPassword}"`, {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('\n✅ Project linked successfully!\n');
  } catch (error) {
    console.error('\n❌ Failed to link project');
    console.error('Error:', error.message);
    console.log('\n💡 Try manually: npm run supabase:link\n');
    rl.close();
    process.exit(1);
  }

  // Step 3: Push migrations
  console.log('Step 3: Pushing database migrations...\n');
  const pushMigrations = await question('Push migrations to remote database? (y/n): ');
  
  if (pushMigrations.toLowerCase() === 'y') {
    try {
      console.log('\nPushing migrations...\n');
      execSync('npx supabase db push', {
        stdio: 'inherit',
        cwd: rootDir
      });
      console.log('\n✅ Migrations pushed successfully!\n');
    } catch (error) {
      console.error('\n❌ Failed to push migrations');
      console.error('Error:', error.message);
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('\nSkipping migration push.');
    console.log('Run manually: npm run supabase:db:push\n');
  }

  console.log('✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Create storage bucket: csp-files (in Supabase Dashboard)');
  console.log('  2. Configure auth settings (see AUTHENTICATION_MIGRATION.md)');
  console.log('  3. Create librarian: npm run migrate:librarian');
  console.log('  4. Test app: npm run dev\n');

  rl.close();
}

main().catch(console.error);

