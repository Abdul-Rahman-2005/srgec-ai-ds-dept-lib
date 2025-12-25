# Automated Migration Setup

I've created automated scripts to help you migrate! Here's how to use them:

## 🚀 Quick Start (Automated)

### Option 1: Run Everything (Recommended)

```bash
npm run migrate:all
```

This interactive script guides you through:
1. ✅ Environment setup
2. ✅ Database migration
3. ✅ Storage bucket creation
4. ✅ Auth configuration
5. ✅ Librarian account creation

### Option 2: Step by Step

#### Step 1: Setup Supabase Credentials
```bash
npm run setup:supabase
```
- Prompts for your Supabase URL and API key
- Creates `.env` file automatically
- Updates `supabase/config.toml`

#### Step 2: Run Database Migration
```bash
npm run migrate:run
```
- Shows migration options
- Can copy SQL to clipboard
- Or save to file for manual execution

#### Step 3: Create Librarian Account
```bash
npm run migrate:librarian
```
- Automatically creates librarian auth account
- Creates librarian profile in database
- Sets up login credentials

## 📋 What Each Script Does

### `setup-supabase.js`
- ✅ Prompts for Supabase credentials
- ✅ Creates `.env` file
- ✅ Updates `supabase/config.toml`
- ✅ Validates input

### `run-migration.js`
- ✅ Loads migration SQL file
- ✅ Provides options to run migration
- ✅ Can copy to clipboard (Windows/Mac/Linux)
- ✅ Or save to file

### `create-librarian.js`
- ✅ Creates auth account for librarian
- ✅ Creates profile in `users` table
- ✅ Sets status to 'active'
- ✅ Handles existing accounts

### `migrate-all.js`
- ✅ Runs complete migration workflow
- ✅ Interactive prompts
- ✅ Validates each step
- ✅ Creates librarian account

## 🔧 Manual Steps Still Required

These scripts automate what they can, but you still need to:

1. **Create Supabase Project** (one-time)
   - Go to https://app.supabase.com
   - Create new project
   - Get credentials

2. **Run Migration SQL** (one-time)
   - Use `npm run migrate:run` to get SQL
   - Paste in Supabase Dashboard → SQL Editor
   - Or use Supabase CLI

3. **Create Storage Bucket** (one-time)
   - Supabase Dashboard → Storage
   - Create bucket: `csp-files` (public)

4. **Configure Auth Settings** (one-time)
   - Disable email confirmation (for testing)
   - Set redirect URLs

## 🎯 Complete Workflow

```bash
# 1. Install dependencies (if not already)
npm install

# 2. Run automated setup
npm run migrate:all

# 3. Follow the prompts - it will guide you through everything!

# 4. Test your app
npm run dev
```

## 🆘 Troubleshooting

### Scripts not found
```bash
# Make sure you're in the project root
cd ai-ds-dept-lib-main

# Check if scripts exist
ls scripts/
```

### Permission errors (Linux/Mac)
```bash
chmod +x scripts/*.js
```

### .env file issues
```bash
# Recreate .env
npm run setup:supabase
```

### Librarian creation fails
- Make sure database migration ran first
- Check Supabase Auth settings
- Try manual creation: See AUTHENTICATION_MIGRATION.md

## 📚 Next Steps After Migration

1. ✅ Test librarian login
2. ✅ Test student signup
3. ✅ Test book management
4. ✅ Verify RLS policies
5. ✅ Check storage bucket

## 💡 Tips

- **First time?** Use `npm run migrate:all` - it's the easiest!
- **Already have .env?** Scripts will detect and ask before overwriting
- **Need help?** Check the detailed guides:
  - `MIGRATION_GUIDE.md` - Full migration steps
  - `AUTHENTICATION_MIGRATION.md` - Auth details
  - `QUICK_START.md` - Quick reference


