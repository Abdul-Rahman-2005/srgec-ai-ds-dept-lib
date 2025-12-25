# Data Migration Script Guide

If you need to migrate existing data from Lovable cloud to your new Supabase instance, follow these steps.

## Prerequisites

- Access to your old Lovable database (if possible)
- Your new Supabase project set up and running
- Node.js installed

## Option 1: Manual CSV Import (Easiest)

1. **Export data from Lovable** (if available):
   - Export each table as CSV: users, books, borrows, magazines, journals, csp_project_files

2. **Import to Supabase**:
   - Go to Supabase Dashboard → Table Editor
   - Select each table
   - Click "Insert" → "Import data from CSV"
   - Upload your CSV file
   - Map columns correctly
   - Import

## Option 2: SQL Script Import

If you have SQL dumps or can generate INSERT statements:

1. Go to Supabase Dashboard → SQL Editor
2. Paste your INSERT statements
3. Run the script

**Important**: Make sure to:
- Handle foreign key relationships in the correct order
- Update UUIDs if needed
- Handle timestamps correctly

## Option 3: Programmatic Migration (Advanced)

Create a migration script using the Supabase client:

```typescript
// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js';

// Old Lovable database (if you have access)
const oldSupabase = createClient(
  'OLD_LOVABLE_URL',
  'OLD_LOVABLE_KEY'
);

// New Supabase instance
const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

async function migrateData() {
  // 1. Migrate users (without auth_id initially)
  const { data: oldUsers } = await oldSupabase.from('users').select('*');
  if (oldUsers) {
    for (const user of oldUsers) {
      const { id, auth_id, ...userData } = user;
      await newSupabase.from('users').insert({
        ...userData,
        // auth_id will be set when users sign up again
      });
    }
  }

  // 2. Migrate books
  const { data: oldBooks } = await oldSupabase.from('books').select('*');
  if (oldBooks) {
    await newSupabase.from('books').insert(oldBooks);
  }

  // 3. Migrate magazines
  const { data: oldMagazines } = await oldSupabase.from('magazines').select('*');
  if (oldMagazines) {
    await newSupabase.from('magazines').insert(oldMagazines);
  }

  // 4. Migrate journals
  const { data: oldJournals } = await oldSupabase.from('journals').select('*');
  if (oldJournals) {
    await newSupabase.from('journals').insert(oldJournals);
  }

  // 5. Migrate borrows (update user_id and book_id references)
  // Note: You'll need to map old IDs to new IDs
  const { data: oldBorrows } = await oldSupabase.from('borrows').select('*');
  // ... handle ID mapping and insert

  console.log('Migration complete!');
}

migrateData().catch(console.error);
```

## Important Notes

### User Authentication
- **Passwords cannot be migrated** - users will need to:
  1. Sign up again with the same email
  2. Or use password reset functionality
- The `auth_id` in the `users` table will be automatically linked when users authenticate

### File Storage
- CSP project files need to be manually re-uploaded
- Download files from old storage and upload to new `csp-files` bucket

### Data Integrity
- Verify foreign key relationships after migration
- Check that all enum values match (user_role, user_status, borrow_status)
- Ensure timestamps are preserved correctly

## Verification Checklist

After migration, verify:

- [ ] All users migrated (count matches)
- [ ] All books migrated
- [ ] All borrows migrated with correct relationships
- [ ] All magazines migrated
- [ ] All journals migrated
- [ ] CSP files bucket is accessible
- [ ] RLS policies are working correctly
- [ ] Database functions are working


