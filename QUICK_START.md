# Quick Start: Migrate to Your Own Supabase

## 🚀 Fast Track (5 minutes)

1. **Create Supabase Project**
   - Go to https://app.supabase.com → New Project
   - Note your Project URL and anon key from Settings → API

2. **Set Environment Variables**
   ```bash
   # Create .env file in project root
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

3. **Run Database Migration**
   - Option A: Supabase Dashboard → SQL Editor → Paste migration file content → Run
   - Option B: Use Supabase CLI: `supabase db push`

4. **Create Storage Bucket**
   - Storage → New Bucket → Name: `csp-files` → Public: ✅

5. **Test**
   ```bash
   npm install
   npm run dev
   ```

## 📋 Full Details

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete step-by-step instructions.

## 🔑 Where to Find Your Credentials

1. **Project URL**: `https://app.supabase.com/project/_/settings/api`
   - Look for "Project URL"

2. **Anon Key**: Same page, look for "anon public" key
   - ⚠️ Use the `anon` key, NOT the `service_role` key

## ✅ Verification Checklist

- [ ] `.env` file created with correct values
- [ ] Database migration executed successfully
- [ ] All tables visible in Table Editor
- [ ] Storage bucket `csp-files` created
- [ ] App runs without errors
- [ ] Can register/login
- [ ] Can view books

## 🆘 Common Issues

**"Invalid API key"**
→ Check `.env` file has correct anon key (not service_role)

**"Failed to fetch"**
→ Verify Project URL is correct in `.env`

**RLS Policy errors**
→ Make sure migration ran completely, check SQL Editor for errors

## 📚 Next Steps

- Read full guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Authentication setup**: [AUTHENTICATION_MIGRATION.md](./AUTHENTICATION_MIGRATION.md) ⚠️ **Important!**
- Data migration: [scripts/migrate-data.md](./scripts/migrate-data.md)

