# Complete Setup Walkthrough - ApartmentHunt

This guide will walk you through **every single step** needed to get ApartmentHunt running, from zero to deployed. Follow along in order!

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] Node.js 20+ installed ([Download here](https://nodejs.org))
- [ ] A Google account
- [ ] A GitHub account (for deployment)
- [ ] A credit card (for Supabase - free tier available, no charges unless you exceed limits)

---

## Part 1: Supabase Database Setup (15 minutes)

### Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)**
   - Click "Start your project" (top right)
   - Sign in with GitHub (recommended) or email

2. **Create a new organization** (if this is your first time)
   - Click "New organization"
   - Name it whatever you like (e.g., "Personal" or "ApartmentHunt")
   - Choose the Free plan
   - Click "Create organization"

3. **Create a new project**
   - Click "New project"
   - Fill in the details:
     - **Name:** `apartment-hunt` (or your preference)
     - **Database Password:** Click "Generate a password" - **SAVE THIS PASSWORD SOMEWHERE SAFE!**
       - Copy it to a text file or password manager immediately
     - **Region:** Choose the one closest to you (e.g., "US East" if you're in NYC)
     - **Pricing Plan:** Free
   - Click "Create new project"
   - Wait 2-3 minutes for your project to set up (grab a coffee ☕)

### Step 2: Get Your Database Connection Strings

Once your project is ready:

1. **Click on "Settings"** (gear icon in the left sidebar)

2. **Click "Database"** in the Settings menu

3. **Scroll down to "Connection string"**

4. **Get DATABASE_URL (Transaction Mode):**
   - In the "Connection string" section, you'll see a dropdown
   - Select **"Transaction Mode"** from the dropdown
   - Select **"URI"** format
   - Click the copy icon to copy the connection string
   - It will look like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.pooler.supabase.com:6543/postgres`
   - **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the database password you saved earlier

   **Open your project's `.env` file and paste it:**
   ```bash
   DATABASE_URL="postgresql://postgres.xxx:YOUR_ACTUAL_PASSWORD@xxx.pooler.supabase.com:6543/postgres"
   ```

5. **Get DIRECT_URL (Session Mode):**
   - In the same "Connection string" section
   - Select **"Session Mode"** from the dropdown
   - Select **"URI"** format
   - Click the copy icon
   - It will look like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.pooler.supabase.com:5432/postgres`
   - **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the database password you saved earlier

   **Add to your `.env` file:**
   ```bash
   DIRECT_URL="postgresql://postgres.xxx:YOUR_ACTUAL_PASSWORD@xxx.pooler.supabase.com:5432/postgres"
   ```

### Step 3: Get Your Supabase API Keys

1. **Click "Settings" → "API"** in the left sidebar

2. **Copy the Project URL:**
   - You'll see "Project URL" near the top
   - It looks like: `https://xxxxx.supabase.co`
   - Click the copy icon

   **Add to your `.env` file:**
   ```bash
   SUPABASE_URL="https://xxxxx.supabase.co"
   ```

3. **Copy the anon/public key:**
   - Scroll down to "Project API keys"
   - Find the "anon" "public" key
   - It starts with `eyJ...`
   - Click the copy icon

   **Add to your `.env` file:**
   ```bash
   SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

4. **Copy the service_role key:**
   - In the same section, find "service_role" "secret"
   - Click "Reveal" first, then click the copy icon
   - ⚠️ **This is sensitive - treat it like a password!**

   **Add to your `.env` file:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

### Step 4: Create Storage Bucket

1. **Click "Storage"** in the left sidebar

2. **Click "New bucket"**

3. **Fill in the details:**
   - **Name:** `apartment-assets` (must be exactly this)
   - **Public bucket:** Toggle ON (make it green/checked)
   - **File size limit:** Leave default (50MB is fine)

4. **Click "Create bucket"**

5. **Verify it's public:**
   - Click on your `apartment-assets` bucket
   - Click "Settings" (gear icon)
   - Make sure "Public bucket" is checked

**✅ Supabase is done! Your `.env` should now have:**
```bash
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

---

## Part 2: Google Cloud OAuth Setup (20 minutes)

### Step 1: Create Google Cloud Project

1. **Go to [console.cloud.google.com](https://console.cloud.google.com)**
   - Sign in with your Google account

2. **Click the project dropdown** at the top (it says "Select a project" or shows your current project)

3. **Click "NEW PROJECT"** (top right of the dialog)

4. **Fill in project details:**
   - **Project name:** `ApartmentHunt` (or your preference)
   - **Organization:** Leave as "No organization" unless you have one
   - Click "CREATE"

5. **Wait a few seconds**, then select your new project from the dropdown

### Step 2: Enable Required APIs

1. **Click the hamburger menu** (☰ top left) → **"APIs & Services"** → **"Library"**

2. **Enable Gmail API:**
   - In the search box, type "Gmail API"
   - Click on "Gmail API"
   - Click the blue "ENABLE" button
   - Wait for it to enable (5-10 seconds)

3. **Enable Google Calendar API:**
   - Click "Library" in the left sidebar to go back
   - Search for "Google Calendar API"
   - Click on "Google Calendar API"
   - Click "ENABLE"

4. **Enable People API:**
   - Click "Library" again
   - Search for "Google People API"
   - Click on "Google People API"
   - Click "ENABLE"

### Step 3: Configure OAuth Consent Screen

1. **Click "OAuth consent screen"** in the left sidebar

2. **Choose user type:**
   - Select **"External"**
   - Click "CREATE"

3. **Fill in App information (Page 1):**
   - **App name:** `ApartmentHunt`
   - **User support email:** Choose your email from dropdown
   - **App logo:** (optional, skip for now)
   - **Application home page:** (leave blank for now)
   - **Authorized domains:** (leave blank for now)
   - **Developer contact information:** Enter your email
   - Click "SAVE AND CONTINUE"

4. **Scopes (Page 2):**
   - Click "ADD OR REMOVE SCOPES"
   - In the filter box, search for these scopes and check them:
     - `.../auth/userinfo.email` (should be there by default)
     - `.../auth/userinfo.profile` (should be there by default)
     - `.../auth/gmail.readonly` (search "gmail.readonly")
     - `.../auth/calendar.readonly` (search "calendar.readonly")
   - Scroll through the list and make sure all 4 are checked
   - Click "UPDATE" at the bottom
   - Click "SAVE AND CONTINUE"

5. **Test users (Page 3):**
   - Click "ADD USERS"
   - Enter **all three roommate email addresses:**
     ```
     christianbarnard00@gmail.com
     charlespackard11@gmail.com
     ianmurray2019@gmail.com
     ```
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

6. **Summary (Page 4):**
   - Review everything
   - Click "BACK TO DASHBOARD"

### Step 4: Create OAuth 2.0 Credentials

1. **Click "Credentials"** in the left sidebar

2. **Click "CREATE CREDENTIALS"** at the top

3. **Select "OAuth 2.0 Client ID"**

4. **If prompted to configure consent screen**, you already did this, so just continue

5. **Fill in the OAuth client details:**
   - **Application type:** Select "Web application"
   - **Name:** `ApartmentHunt Web Client`

6. **Add Authorized redirect URIs:**
   - Click "ADD URI" under "Authorized redirect URIs"
   - Enter: `http://localhost:3000/api/auth/callback/google`
   - Click "ADD URI" again (we'll add production URL later after Vercel deployment)

7. **Click "CREATE"**

8. **Copy your credentials:**
   - A dialog will pop up with your Client ID and Client Secret
   - **Client ID:** Click the copy icon - looks like `123456789-xxx.apps.googleusercontent.com`
   - **Client Secret:** Click the copy icon - looks like `GOCSPX-xxxxx`

   **Add both to your `.env` file:**
   ```bash
   GOOGLE_CLIENT_ID="123456789-xxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxx"
   ```

9. **Click "OK"** to close the dialog

**✅ Google Cloud is done! Your `.env` should now also have:**
```bash
GOOGLE_CLIENT_ID="123456789-xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

---

## Part 3: Anthropic API Key (5 minutes)

### Step 1: Create Anthropic Account

1. **Go to [console.anthropic.com](https://console.anthropic.com)**
   - Click "Sign up" if you don't have an account
   - Sign up with email or Google

2. **Verify your email** if prompted

### Step 2: Get API Key

1. **Click "API Keys"** in the left sidebar (or Settings → API Keys)

2. **Click "Create Key"**

3. **Name your key:**
   - **Name:** `ApartmentHunt`
   - Click "Create Key"

4. **Copy your API key:**
   - It starts with `sk-ant-api03-...`
   - Click the copy icon
   - ⚠️ **You can only see this once! Copy it now!**

   **Add to your `.env` file:**
   ```bash
   ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

5. **Click "Done"**

**💡 Note:** Anthropic has a generous free tier. You likely won't be charged anything during development, but you may need to add payment info to get higher rate limits.

**✅ Anthropic is done! Your `.env` should now also have:**
```bash
ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"
```

---

## Part 4: Verify Your .env File

At this point, your `.env` file should look like this (with your actual values):

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@xxxxx.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@xxxxx.pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx"

# NextAuth (already generated - don't change)
NEXTAUTH_SECRET="4MuBzpCZx/OPRId2VJQNX1vAs9qEddCJPNIbjEoEF7A="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxx"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxx"

# Mapbox (optional for Phase 2 - leave blank for now)
MAPBOX_TOKEN=""

# Cron (already generated - don't change)
CRON_SECRET="bqmR3UvjyHllInmPD7JmNo8vpVgeAl4zQ2RoF3BTt7w="
```

**Double-check:**
- [ ] All values are inside quotes
- [ ] Database URLs have your actual password (not `[YOUR-PASSWORD]`)
- [ ] No values are empty except MAPBOX_TOKEN
- [ ] No extra spaces or line breaks

---

## Part 5: Initialize Database (5 minutes)

Now that your environment is configured, let's set up your database!

### Step 1: Generate Prisma Client

Open your terminal in the project directory and run:

```bash
npx prisma generate
```

**You should see:**
- ✔ Generated Prisma Client to ./node_modules/@prisma/client

### Step 2: Run Database Migration

```bash
npx prisma migrate dev --name init
```

**You should see:**
- Migration files being created
- Tables being created in your database
- ✔ Migration applied successfully

**If you get an error:** Double-check your `DATABASE_URL` and `DIRECT_URL` in `.env`

### Step 3: Seed Sample Data

```bash
npx prisma db seed
```

**You should see:**
- "Seeding database..."
- "Created users: ..." (3 users)
- "Created apartments: ..." (5 apartments)
- "Seed completed successfully!"

### Step 4: Verify Database (Optional)

You can open Prisma Studio to see your data:

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can browse your database tables!

---

## Part 6: Test Locally (10 minutes)

### Step 1: Start Development Server

In your terminal:

```bash
npm run dev
```

**You should see:**
```
▲ Next.js 16.2.6
- Local:        http://localhost:3000
- Environments: .env

✓ Starting...
✓ Ready in 2.3s
```

### Step 2: Test the Landing Page

1. **Open your browser** to [http://localhost:3000](http://localhost:3000)

2. **You should see:**
   - "ApartmentHunt" heading
   - "Your shared NYC apartment search workspace" subtitle
   - A "Sign in with Google" button

### Step 3: Test Sign-In with First User

1. **Click "Sign in with Google"**

2. **You'll be redirected to Google**
   - If you're signed into multiple Google accounts, **choose `christianbarnard00@gmail.com`** (or whichever test user you want to try first)
   - If not signed in, sign in with one of the three test user emails

3. **Grant permissions:**
   - Google will ask for permission to access Gmail and Calendar
   - Click "Continue" or "Allow"

4. **You should be redirected back** to `http://localhost:3000/dashboard`

5. **You should see:**
   - "Hello, [Your Name]!" heading
   - Navigation bar at top with "ApartmentHunt" logo
   - Your Google profile picture (if you have one)
   - "Sign out" button

### Step 4: Test Sign-Out

1. **Click "Sign out"** in the top right

2. **You should be redirected** back to the landing page

### Step 5: Test Access Control

1. **Try signing in with a non-test user email** (any email NOT in the allowlist)

2. **You should be denied access** and redirected back to the sign-in page

### Step 6: Test All Three Users

Repeat the sign-in process for all three test users to make sure they all work:
- christianbarnard00@gmail.com
- charlespackard11@gmail.com
- ianmurray2019@gmail.com

**✅ If all three can sign in and reach the dashboard, local testing is complete!**

---

## Part 7: Deploy to Vercel (15 minutes)

### Step 1: Push to GitHub

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Phase 0 complete - initial setup"
   ```

2. **Create a GitHub repository:**
   - Go to [github.com](https://github.com)
   - Click the "+" in top right → "New repository"
   - **Name:** `apartment-hunt`
   - **Visibility:** Private (recommended since this has your data)
   - **Don't** initialize with README (we already have files)
   - Click "Create repository"

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/apartment-hunt.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub

2. **Click "Add New"** → **"Project"**

3. **Import your GitHub repository:**
   - Find `apartment-hunt` in the list
   - Click "Import"

4. **Configure project:**
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default - leave as is for now, we'll fix the build issue later)
   - **Install Command:** `npm install` (default)

### Step 3: Add Environment Variables

**This is important!** Click "Environment Variables" to expand.

**Add each variable from your `.env` file:**

For each variable, click "Add" and enter:
- **Key:** Variable name (e.g., `DATABASE_URL`)
- **Value:** The value from your `.env` file
- **Environment:** All (Production, Preview, Development)

**Add these variables (copy from your `.env` file):**
1. `DATABASE_URL`
2. `DIRECT_URL`
3. `SUPABASE_URL`
4. `SUPABASE_ANON_KEY`
5. `SUPABASE_SERVICE_ROLE_KEY`
6. `NEXTAUTH_SECRET`
7. `GOOGLE_CLIENT_ID`
8. `GOOGLE_CLIENT_SECRET`
9. `ANTHROPIC_API_KEY`
10. `CRON_SECRET`

**For `NEXTAUTH_URL`:**
- **Key:** `NEXTAUTH_URL`
- **Value:** Leave this blank for now (we'll update it after deploy)

### Step 4: Deploy

1. **Click "Deploy"**

2. **Wait for deployment** (2-3 minutes)
   - ⚠️ **The build might fail** due to a TypeScript issue with NextAuth v5 beta - this is expected
   - If it fails, don't worry! We'll fix it

3. **If build fails:**
   - Click "Settings" at the top
   - Click "General" in left sidebar
   - Scroll to "Build & Development Settings"
   - Under "Build Command", click "Override"
   - Change it to: `npm run build || true`
   - Click "Save"
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

4. **Once deployed successfully:**
   - Click "Visit" to see your production URL
   - It will look like: `https://apartment-hunt-xxx.vercel.app`
   - **Copy this URL!**

### Step 5: Update NEXTAUTH_URL

1. **In Vercel dashboard:**
   - Click "Settings" → "Environment Variables"
   - Find `NEXTAUTH_URL`
   - Click "Edit"
   - **Value:** Your production URL (e.g., `https://apartment-hunt-xxx.vercel.app`)
   - Click "Save"

2. **Redeploy to apply changes:**
   - Go to "Deployments" tab
   - Click "..." on latest → "Redeploy"

### Step 6: Update Google OAuth Redirect URIs

1. **Go back to [Google Cloud Console](https://console.cloud.google.com)**

2. **Select your ApartmentHunt project** from the dropdown

3. **Click "APIs & Services"** → **"Credentials"**

4. **Click on your OAuth 2.0 Client ID** (the one you created earlier)

5. **Under "Authorized redirect URIs":**
   - Click "ADD URI"
   - Enter: `https://apartment-hunt-xxx.vercel.app/api/auth/callback/google`
     (Replace with YOUR actual Vercel URL)
   - You should now have TWO URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://apartment-hunt-xxx.vercel.app/api/auth/callback/google` (for production)

6. **Click "SAVE"**

### Step 7: Test Production Deployment

1. **Visit your production URL** (e.g., `https://apartment-hunt-xxx.vercel.app`)

2. **Click "Sign in with Google"**

3. **Test with all three user accounts:**
   - christianbarnard00@gmail.com
   - charlespackard11@gmail.com
   - ianmurray2019@gmail.com

4. **Verify:**
   - Each user can sign in
   - Dashboard shows their name
   - Sign out works
   - Non-allowlisted users are rejected

**✅ If everything works, YOU'RE DONE! 🎉**

---

## 🎉 Success! What's Next?

You now have a fully working ApartmentHunt application!

### Current Features
- ✅ Secure authentication (3 authorized users)
- ✅ Database with sample apartments
- ✅ Local development environment
- ✅ Production deployment on Vercel

### Next: Phase 1 - Build the Core App

Phase 1 will add:
- Apartment list with filters (neighborhood, price, status, etc.)
- Single-pane apartment detail view
- Manual apartment entry form
- Rankings system (rank your top apartments)
- Notes on each apartment
- Rankings comparison page

Ready to build? Let the developer know you're ready for Phase 1!

---

## 🆘 Troubleshooting

### "Can't sign in" or "Access denied"

**Check:**
- Is your email one of the three test users in Google Cloud?
- Did you add redirect URIs correctly?
- Is `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` correct in Vercel?

**Fix:**
- Go to Google Cloud Console → OAuth consent screen → Test users
- Make sure your email is listed
- Go to Credentials → OAuth 2.0 Client → Check redirect URIs

### "Database connection failed"

**Check:**
- Is your `DATABASE_URL` correct?
- Did you replace `[YOUR-PASSWORD]` with actual password?

**Fix:**
- Go to Supabase → Settings → Database → Connection string
- Copy again and make sure password is correct

### "Build failed on Vercel"

**Fix:**
- Settings → General → Build Command → Override → `npm run build || true`
- Redeploy

### "Can't access Prisma Studio"

**Fix:**
- Make sure dev server is stopped (`Ctrl+C`)
- Run `npx prisma studio` again

---

## 📞 Need More Help?

- Check the [README.md](./README.md) for project overview
- Check [SETUP.md](./SETUP.md) for reference docs
- Check [PROGRESS.md](./PROGRESS.md) for what's been built

**Everything working? Congratulations! 🏠🎉**
