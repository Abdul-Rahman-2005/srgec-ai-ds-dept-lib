# Migration Guide: Lovable Cloud to Self-Hosted Supabase

This guide will help you migrate your library management system from Lovable's cloud database to your own Supabase instance.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com if you don't have one)
2. Node.js installed on your machine
3. Access to your current Lovable project (if you need to export existing data)

## Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - **Name**: AI-DS-Dept-Library (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Select Free tier (or paid if needed)
4. Wait for the project to be created (usually 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key**: Copy this (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
   ```

## Step 4: Run Database Migrations

You have two options:

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (You can find your project ref in the project URL or settings)

4. Run the migration:
   ```bash
   supabase db push
   ```

### Option B: Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20251214064346_8f9d89e2-506c-4a5b-960a-f43951371cb7.sql`
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

## Step 5: Set Up Storage Bucket (for CSP Files)

The migration includes a storage bucket creation, but you may need to verify:

1. Go to **Storage** in your Supabase dashboard
2. Check if the `csp-files` bucket exists
3. If not, create it:
   - Click "New bucket"
   - Name: `csp-files`
   - Public: ✅ (checked)
   - Click "Create bucket"

## Step 6: Verify Database Schema

After running the migration, verify that all tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users`
   - `books`
   - `borrows`
   - `magazines`
   - `journals`
   - `csp_project_files`

3. Verify the functions exist:
   - Go to **Database** → **Functions**
   - Check for:
     - `get_current_user_id()`
     - `is_active_user()`
     - `is_librarian()`

## Step 7: Configure Authentication

**⚠️ IMPORTANT**: Authentication requires special setup! See the detailed guide:

👉 **[AUTHENTICATION_MIGRATION.md](./AUTHENTICATION_MIGRATION.md)** - Complete authentication setup guide

Key points:
- Configure email confirmation settings
- Set up redirect URLs
- Create librarian account (auto-creates on first login)
- Users will need to re-register (passwords cannot be migrated)

## Step 8: Migrate Existing Data (If Applicable)

If you have existing data in your Lovable cloud database, you'll need to export and import it:

### Exporting from Lovable (if possible)

1. Check if Lovable provides a data export feature
2. Export data from each table: users, books, borrows, magazines, journals, csp_project_files

### Importing to Supabase

1. Use the Supabase dashboard **Table Editor** to manually import CSV files, OR
2. Use the SQL Editor to run INSERT statements, OR
3. Use the provided migration script (see `scripts/migrate-data.ts` if created)

**Important Notes:**
- User passwords cannot be migrated (users will need to reset passwords)
- Auth users need to be recreated in your new Supabase project
- File uploads (CSP files) need to be re-uploaded to the new storage bucket

## Step 9: Update Configuration Files

1. Update `supabase/config.toml` (if you're using Supabase CLI):
   ```toml
   project_id = "your-new-project-id"
   ```

2. Or remove `supabase/config.toml` if you're not using Supabase CLI locally

## Step 10: Test the Application

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test the following:
   - ✅ User registration
   - ✅ User login
   - ✅ Viewing books
   - ✅ Creating a book (as librarian)
   - ✅ Borrowing a book
   - ✅ Viewing borrows

## Step 11: Update Production Environment Variables

If you're deploying to production (Vercel, Netlify, etc.):

1. Go to your hosting platform's environment variables settings
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase anon key
3. Redeploy your application

## Troubleshooting

### Issue: "Invalid API key"
- **Solution**: Double-check your `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`
- Make sure you're using the `anon` key, not the `service_role` key

### Issue: "Failed to fetch" or CORS errors
- **Solution**: Check your Supabase project URL is correct
- Verify your Supabase project is active and not paused

### Issue: RLS policies blocking access
- **Solution**: The migration includes RLS policies. Make sure:
  - Users are properly authenticated
  - User profiles exist in the `users` table
  - User status is set to 'active' for non-librarian operations

### Issue: Storage bucket not found
- **Solution**: Manually create the `csp-files` bucket in Storage settings
- Make sure it's set to public

## Security Notes

- ⚠️ Never commit your `.env` file to version control
- ⚠️ The `anon` key is safe for client-side use
- ⚠️ Keep your `service_role` key secret (server-side only)
- ⚠️ Review RLS policies to ensure they match your security requirements

## Next Steps

After successful migration:

1. ✅ Test all features thoroughly
2. ✅ Update any documentation with new Supabase URLs
3. ✅ Inform users about the migration (if applicable)
4. ✅ Set up database backups in Supabase
5. ✅ Monitor your Supabase project usage and billing

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub: https://github.com/supabase/supabase

