# ApartmentHunt - Setup Guide

This guide walks you through setting up all required external services for ApartmentHunt.

## Prerequisites

- Node.js 20+ installed
- npm installed
- A Google account
- Credit card for Supabase (free tier available)

---

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose an organization (or create one)
4. Fill in project details:
   - **Name:** apartment-hunt (or your preference)
   - **Database Password:** Generate a strong password and save it securely
   - **Region:** Choose closest to your location
5. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Database Credentials

1. Once project is ready, go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy these connection strings to your `.env` file:

   **For `DATABASE_URL`:**
   - Select "Transaction Mode"
   - Copy the URI format
   - Replace `[YOUR-PASSWORD]` with your database password

   **For `DIRECT_URL`:**
   - Select "Session Mode"
   - Copy the URI format
   - Replace `[YOUR-PASSWORD]` with your database password

4. Go to **Settings** → **API**
5. Copy these values to your `.env`:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

### 1.3 Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `apartment-assets`
4. Make it **Public**
5. Click "Create bucket"

---

## Step 2: Google Cloud OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top-left) → "New Project"
3. Name it: "ApartmentHunt" (or your preference)
4. Click "Create"
5. Select your new project from the dropdown

### 2.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable each of these:
   - **Gmail API**
   - **Google Calendar API**
   - **Google People API**

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click "Create"
4. Fill in required fields:
   - **App name:** ApartmentHunt
   - **User support email:** Your email
   - **Developer contact:** Your email
5. Click "Save and Continue"
6. On **Scopes** page, click "Add or Remove Scopes"
7. Add these scopes:
   - `openid`
   - `email`
   - `profile`
   - `/auth/gmail.readonly`
   - `/auth/calendar.readonly`
8. Click "Update" → "Save and Continue"
9. On **Test users** page, click "Add Users"
10. Add all three roommate emails:
    - `christianbarnard00@gmail.com`
    - `charlespackard11@gmail.com`
    - `ianmurray2019@gmail.com`
11. Click "Save and Continue" → "Back to Dashboard"

### 2.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: "ApartmentHunt Web Client"
5. **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
6. Click "Create"
7. Copy the credentials:
   - **Client ID** → `GOOGLE_CLIENT_ID` in `.env`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET` in `.env`
8. Click "OK"

> **Note:** After deploying to Vercel, you'll need to add your production URL to authorized redirect URIs (e.g., `https://apartment-hunt.vercel.app/api/auth/callback/google`)

---

## Step 3: Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or sign in
3. Go to **API Keys**
4. Click "Create Key"
5. Name it: "ApartmentHunt"
6. Copy the key → `ANTHROPIC_API_KEY` in `.env`

> **Important:** This key is secret. Never commit it to git.

---

## Step 4: Initialize Database

Now that all environment variables are set, initialize your database:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

You should see:
- Migration applied successfully
- 3 users created
- 5 sample apartments created
- Sample notes added

---

## Step 5: Test Locally

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Test Sign-In

Test with each roommate email:
1. Click "Sign in with Google"
2. Select/sign in with: `christianbarnard00@gmail.com`
3. Accept permissions
4. You should land on `/dashboard` showing: "Hello, Christian Barnard!"
5. Click "Sign out"
6. Repeat with the other two emails

If sign-in works for all three, you're good to go!

---

## Step 6: Deploy to Vercel

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Phase 0 complete - Bootstrap"
git push origin main
```

### 6.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
5. **Environment Variables:** Add all variables from your `.env` file
   - Copy/paste each key-value pair
   - **Important:** Update `NEXTAUTH_URL` to your production URL (you'll get this after first deploy)
6. Click "Deploy"

### 6.3 Update NEXTAUTH_URL

1. After first deploy, copy your production URL (e.g., `https://apartment-hunt-abc123.vercel.app`)
2. In Vercel dashboard, go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and edit it to your production URL
4. Redeploy (go to **Deployments** → click "..." on latest → "Redeploy")

### 6.4 Update Google OAuth Redirect URIs

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://your-production-url.vercel.app/api/auth/callback/google`
5. Click "Save"

### 6.5 Test Production

1. Visit your production URL
2. Test sign-in with all three roommate accounts
3. Verify dashboard loads correctly

---

## Troubleshooting

### Database connection fails
- Check DATABASE_URL and DIRECT_URL are correct
- Ensure password is URL-encoded if it contains special characters
- Verify Supabase project is running (not paused)

### Google sign-in fails
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify redirect URIs match exactly (no trailing slashes)
- Ensure user email is added as test user in OAuth consent screen
- Check that all required APIs are enabled

### "Access denied" during sign-in
- Email not in allowlist (`lib/auth/allowlist.ts`)
- Only these emails can sign in:
  - christianbarnard00@gmail.com
  - charlespackard11@gmail.com
  - ianmurray2019@gmail.com

### Build errors
- Run `npx prisma generate` to regenerate Prisma Client
- Check all dependencies are installed: `npm install`
- Verify TypeScript has no errors: `npm run build`

---

## Next Steps

Once everything is working:

1. Review `PROGRESS.md` for what was built
2. Explore the codebase
3. Ready for Phase 1? Check the implementation plan!

---

## Quick Reference: .env Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# NextAuth (secrets already generated)
NEXTAUTH_SECRET="4MuBzpCZx/OPRId2VJQNX1vAs9qEddCJPNIbjEoEF7A="
NEXTAUTH_URL="http://localhost:3000"  # Update for production

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-xxx"

# Cron (already generated)
CRON_SECRET="bqmR3UvjyHllInmPD7JmNo8vpVgeAl4zQ2RoF3BTt7w="
```
