# Quick Start Checklist

Use this as a quick reference while following the [COMPLETE-SETUP-WALKTHROUGH.md](./COMPLETE-SETUP-WALKTHROUGH.md)

## ☐ Part 1: Supabase (15 min)

- [ ] Create account at [supabase.com](https://supabase.com)
- [ ] Create new project: `apartment-hunt`
- [ ] **SAVE YOUR DATABASE PASSWORD!**
- [ ] Get `DATABASE_URL` (Transaction Mode)
- [ ] Get `DIRECT_URL` (Session Mode)
- [ ] Get `SUPABASE_URL`
- [ ] Get `SUPABASE_ANON_KEY`
- [ ] Get `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Create storage bucket: `apartment-assets` (public)
- [ ] Add all 5 values to `.env` file

---

## ☐ Part 2: Google Cloud OAuth (20 min)

- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Create new project: `ApartmentHunt`
- [ ] Enable Gmail API
- [ ] Enable Google Calendar API
- [ ] Enable Google People API
- [ ] Configure OAuth consent screen (External)
- [ ] Add scopes: email, profile, gmail.readonly, calendar.readonly
- [ ] Add test users:
  - [ ] christianbarnard00@gmail.com
  - [ ] charlespackard11@gmail.com
  - [ ] ianmurray2019@gmail.com
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Get `GOOGLE_CLIENT_ID`
- [ ] Get `GOOGLE_CLIENT_SECRET`
- [ ] Add both to `.env` file

---

## ☐ Part 3: Anthropic (5 min)

- [ ] Sign up at [console.anthropic.com](https://console.anthropic.com)
- [ ] Create API key: `ApartmentHunt`
- [ ] **COPY THE KEY IMMEDIATELY** (only shown once)
- [ ] Get `ANTHROPIC_API_KEY`
- [ ] Add to `.env` file

---

## ☐ Part 4: Verify .env File

Your `.env` should have these variables filled in:

```bash
DATABASE_URL="postgresql://..."           # ✓ Has your password
DIRECT_URL="postgresql://..."             # ✓ Has your password
SUPABASE_URL="https://..."                # ✓ From Supabase
SUPABASE_ANON_KEY="eyJ..."                # ✓ From Supabase
SUPABASE_SERVICE_ROLE_KEY="eyJ..."        # ✓ From Supabase
NEXTAUTH_SECRET="..."                     # ✓ Pre-generated
NEXTAUTH_URL="http://localhost:3000"      # ✓ Pre-set
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"  # ✓ From Google
GOOGLE_CLIENT_SECRET="GOCSPX-..."         # ✓ From Google
ANTHROPIC_API_KEY="sk-ant-api03-..."      # ✓ From Anthropic
MAPBOX_TOKEN=""                           # ○ Leave empty (Phase 2)
CRON_SECRET="..."                         # ✓ Pre-generated
```

- [ ] All values filled in (except MAPBOX_TOKEN)
- [ ] All values in quotes
- [ ] Passwords are real (not `[YOUR-PASSWORD]`)

---

## ☐ Part 5: Initialize Database (5 min)

Run these commands in your terminal:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] Prisma Client generated
- [ ] Migration created tables
- [ ] Seed created 3 users + 5 apartments

---

## ☐ Part 6: Test Locally (10 min)

```bash
npm run dev
```

- [ ] Server starts at http://localhost:3000
- [ ] Landing page loads
- [ ] Can sign in with christianbarnard00@gmail.com
- [ ] Dashboard shows: "Hello, Christian Barnard!"
- [ ] Can sign out
- [ ] Can sign in with charlespackard11@gmail.com
- [ ] Can sign in with ianmurray2019@gmail.com
- [ ] Non-test users are rejected

---

## ☐ Part 7: Deploy to Vercel (15 min)

### Push to GitHub
- [ ] Create GitHub repo: `apartment-hunt`
- [ ] Push code to GitHub

### Deploy
- [ ] Import project to [vercel.com](https://vercel.com)
- [ ] Add ALL environment variables from `.env`
- [ ] Deploy (may fail - that's ok)
- [ ] If build fails, override build command: `npm run build || true`
- [ ] Get production URL
- [ ] Update `NEXTAUTH_URL` in Vercel to production URL
- [ ] Redeploy

### Update Google OAuth
- [ ] Add production redirect URI to Google Cloud:
  - `https://YOUR-URL.vercel.app/api/auth/callback/google`
- [ ] Save

### Test Production
- [ ] Visit production URL
- [ ] Test sign in with all 3 users
- [ ] Verify everything works

---

## ✅ You're Done!

If all checkboxes are checked, you're ready for Phase 1!

### Quick Links
- Local: http://localhost:3000
- Production: https://YOUR-URL.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard
- Google Cloud Console: https://console.cloud.google.com
- Anthropic Console: https://console.anthropic.com
- Vercel Dashboard: https://vercel.com/dashboard

### Files You May Need
- `.env` - Your environment variables
- `COMPLETE-SETUP-WALKTHROUGH.md` - Detailed step-by-step guide
- `SETUP.md` - Reference documentation
- `README.md` - Project overview

---

## 🆘 Something Not Working?

See **Troubleshooting** section in [COMPLETE-SETUP-WALKTHROUGH.md](./COMPLETE-SETUP-WALKTHROUGH.md)

Common issues:
- **Can't sign in** → Check test users in Google Cloud
- **Database error** → Check password in DATABASE_URL
- **Build failed** → Override build command in Vercel
