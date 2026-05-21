# Where to Find Your Credentials - Visual Guide

Quick reference for where to find each credential in each service.

---

## 🗄️ Supabase Credentials

### Where: [supabase.com/dashboard](https://supabase.com/dashboard)

**Select your project** → Then navigate as shown:

### DATABASE_URL & DIRECT_URL
```
Project → ⚙️ Settings (sidebar) → Database → Connection string section
├─ Select "Transaction Mode" + "URI" → Copy → DATABASE_URL
└─ Select "Session Mode" + "URI" → Copy → DIRECT_URL
```
**Don't forget to replace `[YOUR-PASSWORD]` with your database password!**

### SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```
Project → ⚙️ Settings (sidebar) → API
├─ Project URL → Copy → SUPABASE_URL
├─ Project API keys → anon public → Copy → SUPABASE_ANON_KEY
└─ Project API keys → service_role secret → Reveal → Copy → SUPABASE_SERVICE_ROLE_KEY
```

### Storage Bucket
```
Project → 🗄️ Storage (sidebar) → New bucket
├─ Name: apartment-assets
├─ Public: ✅ ON
└─ Create bucket
```

---

## 🔑 Google Cloud Credentials

### Where: [console.cloud.google.com](https://console.cloud.google.com)

**Select your project** → Then navigate as shown:

### Enable APIs
```
☰ Menu → APIs & Services → Library
├─ Search "Gmail API" → Enable
├─ Search "Google Calendar API" → Enable
└─ Search "Google People API" → Enable
```

### OAuth Consent Screen
```
☰ Menu → APIs & Services → OAuth consent screen
├─ User Type: External → Create
├─ App info: Fill in name, email
├─ Scopes: Add email, profile, gmail.readonly, calendar.readonly
└─ Test users: Add all 3 roommate emails
```

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
```
☰ Menu → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
├─ Application type: Web application
├─ Name: ApartmentHunt Web Client
├─ Authorized redirect URIs:
│  ├─ http://localhost:3000/api/auth/callback/google
│  └─ (Add production URL later)
├─ Create → Copy Client ID → GOOGLE_CLIENT_ID
└─ Copy Client Secret → GOOGLE_CLIENT_SECRET
```

**After Vercel deployment, come back here and add:**
```
Same Credentials page → Click your OAuth client → Edit
└─ Add URI: https://YOUR-URL.vercel.app/api/auth/callback/google
```

---

## 🤖 Anthropic Credentials

### Where: [console.anthropic.com](https://console.anthropic.com)

### ANTHROPIC_API_KEY
```
Dashboard → 🔑 API Keys (sidebar) → Create Key
├─ Name: ApartmentHunt
├─ Create Key
└─ ⚠️ COPY IMMEDIATELY (shown only once) → ANTHROPIC_API_KEY
```

---

## 🚀 Vercel Setup

### Where: [vercel.com](https://vercel.com)

### Import & Deploy
```
Dashboard → Add New → Project
├─ Import Git Repository → Select apartment-hunt
├─ Configure:
│  ├─ Framework: Next.js (auto-detected)
│  └─ Environment Variables: Add all from .env
└─ Deploy
```

### Environment Variables to Add
```
Project Settings → Environment Variables → Add each:
├─ DATABASE_URL
├─ DIRECT_URL
├─ SUPABASE_URL
├─ SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
├─ NEXTAUTH_SECRET
├─ NEXTAUTH_URL (update after first deploy)
├─ GOOGLE_CLIENT_ID
├─ GOOGLE_CLIENT_SECRET
├─ ANTHROPIC_API_KEY
└─ CRON_SECRET
```

### After First Deploy
```
Deployments → Copy production URL
└─ Settings → Environment Variables → Edit NEXTAUTH_URL
   └─ Change to: https://YOUR-URL.vercel.app
```

---

## 📋 Your .env File Structure

Copy this template and fill in your values:

```bash
# ==========================================
# DATABASE (from Supabase)
# ==========================================
DATABASE_URL="postgresql://postgres.XXXXX:YOUR_PASSWORD@XXXXX.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.XXXXX:YOUR_PASSWORD@XXXXX.pooler.supabase.com:5432/postgres"

# ==========================================
# SUPABASE (from Supabase → Settings → API)
# ==========================================
SUPABASE_URL="https://XXXXX.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXX"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXX"

# ==========================================
# NEXTAUTH (pre-generated, don't change)
# ==========================================
NEXTAUTH_SECRET="4MuBzpCZx/OPRId2VJQNX1vAs9qEddCJPNIbjEoEF7A="
NEXTAUTH_URL="http://localhost:3000"

# ==========================================
# GOOGLE OAUTH (from Google Cloud Console)
# ==========================================
GOOGLE_CLIENT_ID="123456789-XXXXX.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-XXXXXXXXXXXXX"

# ==========================================
# ANTHROPIC (from Anthropic Console)
# ==========================================
ANTHROPIC_API_KEY="sk-ant-api03-XXXXXXXXXXXXXXXXXXXXX"

# ==========================================
# MAPBOX (optional, for Phase 2)
# ==========================================
MAPBOX_TOKEN=""

# ==========================================
# CRON (pre-generated, don't change)
# ==========================================
CRON_SECRET="bqmR3UvjyHllInmPD7JmNo8vpVgeAl4zQ2RoF3BTt7w="
```

---

## 🎯 Quick Navigation

| Service | Dashboard URL | What You Get |
|---------|---------------|--------------|
| **Supabase** | [supabase.com/dashboard](https://supabase.com/dashboard) | Database URLs, API keys, Storage |
| **Google Cloud** | [console.cloud.google.com](https://console.cloud.google.com) | OAuth Client ID & Secret |
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com) | API Key |
| **Vercel** | [vercel.com/dashboard](https://vercel.com/dashboard) | Production URL, Deployments |
| **GitHub** | [github.com](https://github.com) | Code repository |

---

## ✅ Checklist

Use this to verify you have everything:

- [ ] **Supabase** (5 values)
  - [ ] DATABASE_URL (has your password)
  - [ ] DIRECT_URL (has your password)
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] Storage bucket `apartment-assets` created

- [ ] **Google Cloud** (2 values)
  - [ ] GOOGLE_CLIENT_ID (ends with .apps.googleusercontent.com)
  - [ ] GOOGLE_CLIENT_SECRET (starts with GOCSPX-)
  - [ ] Gmail API enabled
  - [ ] Calendar API enabled
  - [ ] People API enabled
  - [ ] OAuth consent screen configured
  - [ ] 3 test users added
  - [ ] Redirect URI added for localhost

- [ ] **Anthropic** (1 value)
  - [ ] ANTHROPIC_API_KEY (starts with sk-ant-api03-)

- [ ] **Pre-generated** (3 values - don't change)
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] CRON_SECRET

---

## 🆘 Common Mistakes

### ❌ Database URLs
**Wrong:** `postgresql://postgres.xxx:[YOUR-PASSWORD]@...`
**Right:** `postgresql://postgres.xxx:MyActualPass123@...`

### ❌ Missing Quotes
**Wrong:** `DATABASE_URL=postgresql://...`
**Right:** `DATABASE_URL="postgresql://..."`

### ❌ Extra Spaces
**Wrong:** `GOOGLE_CLIENT_ID = "123..." `
**Right:** `GOOGLE_CLIENT_ID="123..."`

### ❌ Wrong Redirect URI
**Wrong:** `http://localhost:3000/api/auth/google/callback`
**Right:** `http://localhost:3000/api/auth/callback/google`

---

## 🎉 Done?

If you have all checkboxes checked and values in your `.env` file, you're ready to:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

See [COMPLETE-SETUP-WALKTHROUGH.md](./COMPLETE-SETUP-WALKTHROUGH.md) for full step-by-step instructions!
