# ApartmentHunt - Development Progress

## Phase 0 - Bootstrap ✅

**Completed:** May 15, 2026

### What was built

1. **Project initialization**
   - Created Next.js 14 app with TypeScript, Tailwind CSS, and App Router
   - Installed all required dependencies:
     - Prisma + @prisma/client for database ORM
     - next-auth@beta (v5) for authentication
     - @auth/prisma-adapter for NextAuth/Prisma integration
     - @anthropic-ai/sdk for Claude AI (Phase 2+)
     - googleapis for Gmail/Calendar (Phase 3+)
     - @supabase/supabase-js for storage
     - zod for validation
     - shadcn/ui component library

2. **Database schema (Prisma)**
   - Created Phase 1 models: User, Apartment, ApartmentAmenity, Ranking, Note
   - Configured Supabase PostgreSQL connection (pooled + direct URLs)
   - Set up Prisma Client singleton pattern for proper Next.js usage

3. **Authentication system**
   - Configured NextAuth v5 with Google OAuth provider
   - Implemented user email allowlist (3 authorized users):
     - christianbarnard00@gmail.com
     - charlespackard11@gmail.com
     - ianmurray2019@gmail.com
   - Set up JWT session strategy
   - Configured Google OAuth scopes for Gmail (readonly) and Calendar (readonly)
   - Stores Google refresh tokens for future integrations

4. **Application structure**
   - Landing page (`/`) with "Sign in with Google" button
   - Protected dashboard page (`/dashboard`) with auth check
   - App layout with navigation shell (Dashboard, Inbox, Rankings, Settings)
   - Sign-out functionality in navigation

5. **Constants and utilities**
   - Created amenity constants (13 amenities with labels)
   - Created apartment status constants (8 statuses)
   - TypeScript type definitions for NextAuth

6. **Environment configuration**
   - `.env.example` with all required variables documented
   - Generated `NEXTAUTH_SECRET` and `CRON_SECRET`
   - Prepared placeholders for Supabase, Google OAuth, Anthropic API

7. **Seed data**
   - Created comprehensive seed script with:
     - 3 users matching the allowlist
     - 5 sample apartments across different neighborhoods and statuses
     - Sample amenities, rankings, and notes
   - Configured package.json to run seed via tsx

### Deviations from plan

None. Phase 0 completed according to specification.

### Next steps

**Before starting Phase 1, you need to:**

1. **Set up Supabase:**
   - Create a Supabase project at supabase.com
   - Get connection strings and add to `.env`:
     - `DATABASE_URL` (pooled connection)
     - `DIRECT_URL` (direct connection for migrations)
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Create a storage bucket named `apartment-assets` with public read access

2. **Set up Google Cloud OAuth:**
   - Create a Google Cloud project
   - Enable APIs: Gmail API, Google Calendar API, People API
   - Create OAuth 2.0 credentials (web application)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - Production URL (after Vercel deployment)
   - Add the three roommate emails as test users in OAuth consent screen
   - Add credentials to `.env`:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`

3. **Get Anthropic API key:**
   - Visit console.anthropic.com
   - Create API key and add to `.env`: `ANTHROPIC_API_KEY`

4. **Run database migration:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Test locally:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Test sign-in with all three Google accounts
   - Verify redirect to dashboard

6. **Deploy to Vercel:**
   - Connect GitHub repo to Vercel
   - Add all environment variables to Vercel project settings
   - Update `NEXTAUTH_URL` to production URL
   - Update Google OAuth redirect URIs with production URL
   - Verify all three roommates can sign in to production

### Ready for Phase 1

Once the above setup is complete and tested, Phase 1 can begin. Phase 1 will add:
- Dashboard with apartment list and filters
- Single-pane apartment detail view
- Manual apartment entry
- Rankings system
- Notes functionality
