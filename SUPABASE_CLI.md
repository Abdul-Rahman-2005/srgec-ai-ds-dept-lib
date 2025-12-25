# Supabase CLI Usage Guide

Supabase CLI is now installed locally in this project! Use it via npm scripts.

## 🚀 Quick Commands

### Login to Supabase
```bash
npm run supabase:login
```
Opens browser to authenticate with Supabase.

### Link Your Project
```bash
npm run supabase:link
```
Links your local project to your Supabase project. You'll need:
- Project reference ID (from your Supabase project URL)
- Database password

### Push Database Migrations
```bash
npm run supabase:db:push
```
Pushes all migrations from `supabase/migrations/` to your linked Supabase project.

### Reset Database (⚠️ Destructive)
```bash
npm run supabase:db:reset
```
Resets your database and runs all migrations from scratch.

### Check Status
```bash
npm run supabase:status
```
Shows the status of your linked Supabase project.

## 📋 Complete Migration Workflow with CLI

### Option 1: Using CLI (Recommended)

```bash
# 1. Set up environment variables
npm run setup:supabase

# 2. Login to Supabase
npm run supabase:login

# 3. Link your project
npm run supabase:link

# 4. Push migrations
npm run supabase:db:push

# 5. Create librarian account
npm run migrate:librarian

# 6. Start your app
npm run dev
```

### Option 2: Manual (Dashboard)

```bash
# 1. Set up environment variables
npm run setup:supabase

# 2. Run migration helper
npm run migrate:run
# (Copy SQL and paste in Supabase Dashboard → SQL Editor)

# 3. Create librarian account
npm run migrate:librarian

# 4. Start your app
npm run dev
```

## 🔧 Advanced CLI Commands

### Direct CLI Access
```bash
# Use npx to run any Supabase CLI command
npx supabase <command>

# Examples:
npx supabase db diff
npx supabase db pull
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Generate TypeScript Types
```bash
# Generate types from your Supabase database
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Create New Migration
```bash
# Create a new migration file
npx supabase migration new migration_name
```

### Diff Database Changes
```bash
# See differences between local and remote
npx supabase db diff
```

## 📚 Useful CLI Commands

| Command | Description |
|---------|-------------|
| `npm run supabase:login` | Authenticate with Supabase |
| `npm run supabase:link` | Link to your Supabase project |
| `npm run supabase:db:push` | Push migrations to remote |
| `npm run supabase:db:reset` | Reset and re-run migrations |
| `npm run supabase:status` | Check project status |
| `npx supabase db diff` | Compare local vs remote |
| `npx supabase gen types` | Generate TypeScript types |

## 🆘 Troubleshooting

### "Not logged in" error
```bash
npm run supabase:login
```

### "Project not linked" error
```bash
npm run supabase:link
```

### Migration conflicts
```bash
# Check status first
npm run supabase:status

# Reset if needed (⚠️ deletes all data)
npm run supabase:db:reset
```

### Update types after schema changes
```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

## 💡 Tips

- **Always link before pushing**: Make sure you've run `supabase:link` first
- **Check status**: Use `supabase:status` to verify your connection
- **Backup first**: Before resetting, export your data if needed
- **Generate types**: After schema changes, regenerate TypeScript types

## 📖 More Info

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

