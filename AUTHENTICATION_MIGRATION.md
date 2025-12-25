# Authentication Migration Guide

This guide covers everything you need to know about migrating authentication from Lovable cloud to your own Supabase instance.

## 🔐 How Authentication Works in This App

The app uses a **two-table system**:

1. **`auth.users`** (Supabase Auth) - Stores email/password, managed by Supabase
2. **`public.users`** (Custom profiles) - Stores user details (name, role, status, etc.)
   - Linked via `auth_id` → `auth.users.id`

### Authentication Flow

1. **Sign Up**: Creates account in `auth.users` + profile in `public.users` with status `pending`
2. **Sign In**: Authenticates via Supabase Auth, then fetches profile from `public.users`
3. **Email Format**: `{identifier}@library.edu` (e.g., `23481a54k9@library.edu`)
4. **Librarian**: Special hardcoded account that auto-creates on first login

## ⚙️ Supabase Auth Configuration

After creating your Supabase project, configure these settings:

### 1. Email Confirmation Settings

**Option A: Disable Email Confirmation (Recommended for Testing)**

1. Go to **Authentication** → **Settings** → **Email Auth**
2. **Disable** "Enable email confirmations"
3. This allows users to sign in immediately without email verification

**Option B: Enable Email Confirmation (Production)**

1. Keep "Enable email confirmations" **enabled**
2. Configure email templates in **Authentication** → **Email Templates**
3. Set up SMTP or use Supabase's default email service
4. Update redirect URLs (see below)

### 2. Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:8080` (for development)
   - **Redirect URLs**: 
     - `http://localhost:8080/**`
     - `https://your-production-domain.com/**` (when deployed)

### 3. Email Templates (Optional)

If using email confirmation, customize templates:
- **Authentication** → **Email Templates**
- Templates available: Confirm signup, Magic Link, Change Email Address, Reset Password

## 🚀 Setting Up Authentication After Migration

### Step 1: Run Database Migration

The migration file already includes:
- ✅ `users` table with `auth_id` foreign key
- ✅ RLS policies that use `auth.uid()`
- ✅ Functions: `get_current_user_id()`, `is_active_user()`, `is_librarian()`

### Step 2: Configure Auth Settings

Follow the configuration steps above (email confirmation, redirect URLs).

### Step 3: Create Librarian Account

The app will auto-create the librarian account on first login, but you can also create it manually:

**Option A: Auto-Create (Easiest)**
1. Start your app: `npm run dev`
2. Go to login page
3. Select "Librarian" role
4. Enter credentials:
   - Username: `AI&DSDEPTLIB@123`
   - Password: `AI&DSLibrarian@123`
5. The account will be created automatically

**Option B: Manual Creation (SQL)**

Run this in Supabase SQL Editor:

```sql
-- Create librarian auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'librarian@library.edu',
  crypt('AI&DSLibrarian@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create librarian profile
INSERT INTO public.users (
  auth_id,
  name,
  role,
  roll_or_faculty_id,
  phone,
  status
)
SELECT 
  id,
  'AI&DS Department Librarian',
  'librarian',
  'AI&DSDEPTLIB@123',
  '0000000000',
  'active'
FROM auth.users
WHERE email = 'librarian@library.edu'
ON CONFLICT (roll_or_faculty_id) DO NOTHING;
```

**Note**: The password hash above might not work. Use Option A instead, or use Supabase Dashboard to create the user.

**Option C: Via Supabase Dashboard**

1. Go to **Authentication** → **Users** → **Add User**
2. Email: `librarian@library.edu`
3. Password: `AI&DSLibrarian@123`
4. Auto Confirm User: ✅ (checked)
5. Click "Create User"
6. Copy the User UID
7. Go to **Table Editor** → `users` table
8. Insert row:
   - `auth_id`: (paste the User UID)
   - `name`: `AI&DS Department Librarian`
   - `role`: `librarian`
   - `roll_or_faculty_id`: `AI&DSDEPTLIB@123`
   - `phone`: `0000000000`
   - `status`: `active`

### Step 4: Test Authentication

1. **Test Librarian Login**:
   - Role: Librarian
   - Username: `AI&DSDEPTLIB@123`
   - Password: `AI&DSLibrarian@123`

2. **Test Student Signup**:
   - Go to Signup page
   - Fill in form with valid roll number (e.g., `23481A54K9`)
   - Submit registration
   - Check `users` table - should have status `pending`

3. **Test Student Login** (after approval):
   - Librarian approves user in dashboard
   - Student logs in with roll number and password

## 🔄 Migrating Existing Users

### ⚠️ Important: Passwords Cannot Be Migrated

Supabase stores passwords as **hashed** values that cannot be extracted or migrated. Users will need to:

1. **Re-register** with the same roll number/faculty ID, OR
2. **Use password reset** (if you set up email)

### Migration Process

1. **Export user data** from Lovable (if possible):
   - Export `users` table (without passwords)
   - Get: name, role, roll_or_faculty_id, phone, status

2. **Users re-register**:
   - Users sign up again with their roll number/faculty ID
   - Creates new auth account + profile
   - Status starts as `pending` (librarian needs to approve)

3. **Bulk approve** (if needed):
   ```sql
   -- Approve all pending users (use carefully!)
   UPDATE public.users 
   SET status = 'active' 
   WHERE status = 'pending';
   ```

### Alternative: Pre-create Auth Users

If you have access to create users programmatically:

```typescript
// scripts/create-users.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY! // Use service role key
);

// For each user, create auth account + profile
async function createUser(identifier: string, password: string, userData: any) {
  const email = `${identifier.toLowerCase()}@library.edu`;
  
  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm
  });
  
  if (authError) {
    console.error(`Error creating auth user for ${identifier}:`, authError);
    return;
  }
  
  // Create profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      auth_id: authUser.user.id,
      ...userData,
      status: 'active', // or 'pending' if you want to approve manually
    });
  
  if (profileError) {
    console.error(`Error creating profile for ${identifier}:`, profileError);
  }
}
```

**⚠️ Security Note**: This requires the `service_role` key. Never expose this key in client-side code!

## 🔒 Security Considerations

### Row Level Security (RLS)

The migration includes RLS policies that:
- ✅ Users can only view their own profile (or librarians can view all)
- ✅ Only librarians can manage books, borrows, etc.
- ✅ Public read access for books, magazines, journals
- ✅ Users can only view their own borrows

**Verify RLS is enabled**:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Auth Functions

The migration creates these functions that RLS policies use:

- `get_current_user_id()` - Returns user's profile ID from `auth.uid()`
- `is_active_user()` - Checks if current user has active status
- `is_librarian()` - Checks if current user is a librarian

These functions use `auth.uid()` which comes from Supabase Auth session.

## 🐛 Troubleshooting

### Issue: "User profile not found"
- **Cause**: User authenticated but no profile in `public.users`
- **Solution**: Check that `auth_id` in `public.users` matches `auth.users.id`

### Issue: "Invalid login credentials"
- **Cause**: User doesn't exist in `auth.users` or wrong password
- **Solution**: User needs to sign up again

### Issue: "Account is pending approval"
- **Cause**: User profile exists but status is `pending`
- **Solution**: Librarian needs to approve in dashboard

### Issue: RLS blocking access
- **Cause**: RLS policies not working correctly
- **Solution**: 
  1. Verify user is authenticated: `SELECT auth.uid();`
  2. Check RLS policies are enabled
  3. Verify `auth_id` matches in `public.users`

### Issue: Email confirmation required
- **Cause**: Email confirmation is enabled but email not sent/received
- **Solution**: 
  1. Disable email confirmation for testing, OR
  2. Check Supabase email logs, OR
  3. Use "Resend confirmation email" in Auth dashboard

## ✅ Authentication Checklist

After migration, verify:

- [ ] Supabase Auth is configured (email settings, redirect URLs)
- [ ] Librarian account can log in
- [ ] New users can sign up
- [ ] User profiles are created correctly
- [ ] RLS policies are working
- [ ] Users can only access their own data
- [ ] Librarians can manage all data
- [ ] Email confirmation works (if enabled)

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)


