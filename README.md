# DekNek3D Full Stack Demo

A full stack web application built with Next.js, demonstrating authentication, database integration, and deployment on Vercel.

## Stack

- **Framework** - Next.js 16 (App Router)
- **Auth** - Better Auth (email/password + Google OAuth)
- **Database** - PostgreSQL via Supabase + Drizzle ORM
- **CSS Framework** - Tailwind CSS
- **Deployment on Vercel**

## Routes

| Route | Description |
|---|---|
| `/` | Home — session info, sign in/out |
| `/signin` | Sign in with email/password or Google |
| `/signup` | Create an account |
| `/database` | Notes CRUD demo — create, read, update, delete records in the database |

## Local Setup

Copy `.env.example` to `.env` and fill in the values:

```
BETTER_AUTH_SECRET=
DATABASE_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Database

Schema is managed with Drizzle Kit. To apply schema changes:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Use the Supabase **Transaction Pooler** URL in production environment variables.

