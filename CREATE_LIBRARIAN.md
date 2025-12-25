# Create Librarian Account - Manual Steps

The automatic creation failed due to email validation. Follow these steps:

## Step 1: Create Auth User in Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com/project/myfbaamuxomkbkuivbkz
2. Navigate to **Authentication** → **Users**
3. Click **Add User** (or **Invite User**)
4. Fill in:
   - **Email**: `librarian@library.edu`
   - **Password**: `AI&DSLibrarian@123`
   - **Auto Confirm User**: ✅ (check this box)
   - **Send Invite Email**: ❌ (uncheck this)
5. Click **Create User**

## Step 2: Get the User ID

After creating the user:
1. Find the user in the list
2. Click on the user
3. Copy the **User UID** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

## Step 3: Create Profile

Once you have the User UID, run this command (replace USER_ID with the actual UUID):

```bash
node -e "const { createClient } = require('@supabase/supabase-js'); require('dotenv').config(); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY); supabase.from('users').upsert({ auth_id: 'USER_ID_HERE', name: 'AI&DS Department Librarian', role: 'librarian', roll_or_faculty_id: 'AI&DSDEPTLIB@123', phone: '0000000000', status: 'active' }, { onConflict: 'roll_or_faculty_id' }).then(r => console.log('✅ Profile created!', r)).catch(e => console.log('❌ Error:', e.message));"
```

Or tell me the User UID and I'll create the profile for you!

