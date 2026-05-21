# ApartmentHunt

A shared workspace for three roommates managing an NYC apartment search.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** NextAuth v5 with Google OAuth
- **Storage:** Supabase Storage
- **LLM:** Claude Sonnet 4.6 (Anthropic)
- **Email/Calendar:** Gmail & Google Calendar APIs
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel

## Current Status

**Phase 0 (Bootstrap)** - ✅ Complete

The project foundation is built. Before you can run the app, you need to configure external services.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection strings from Settings → Database
3. Create a storage bucket:
   - Go to Storage in Supabase dashboard
   - Create new bucket named `apartment-assets`
   - Set to **Public** with read access
4. Copy `.env.example` to `.env` and add:
   - `DATABASE_URL` (Transaction pooler, connection string)
   - `DIRECT_URL` (Session pooler, direct connection)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Google Cloud OAuth

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable APIs:
   - Gmail API
   - Google Calendar API
   - People API
3. Create OAuth 2.0 credentials:
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - Add production URL after deploying to Vercel
4. OAuth consent screen:
   - Add the three roommate email addresses as test users
   - Request scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/calendar.readonly`
5. Add to `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 4. Get Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env`: `ANTHROPIC_API_KEY`

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Test Authentication

Sign in with each of the three authorized Google accounts:
- christianbarnard00@gmail.com
- charlespackard11@gmail.com
- ianmurray2019@gmail.com

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env`
4. Update `NEXTAUTH_URL` to your production URL (e.g., `https://apartment-hunt.vercel.app`)
5. Update Google OAuth authorized redirect URIs to include production callback URL
6. Deploy
7. Test sign-in with all three accounts in production

## Project Structure

```
apartment-hunt/
├── app/
│   ├── (app)/              # Protected app routes
│   │   ├── dashboard/      # Main dashboard
│   │   └── layout.tsx      # App shell with nav
│   ├── api/
│   │   └── auth/           # NextAuth routes
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # shadcn components
│   ├── AppNav.tsx
│   └── SignInButton.tsx
├── lib/
│   ├── auth/
│   │   └── allowlist.ts    # Authorized users
│   ├── constants/
│   │   ├── amenities.ts
│   │   └── statuses.ts
│   └── prisma.ts           # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
├── types/
│   └── next-auth.d.ts      # TypeScript definitions
└── auth.ts                 # NextAuth configuration
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and run migrations
- `npx prisma db seed` - Seed database with sample data

## Next Steps

See `PROGRESS.md` for detailed implementation progress and next phase details.

Phase 1 will add:
- Apartment list with filters and sorting
- Single-pane apartment detail view
- Manual apartment entry
- Rankings system
- Notes functionality
