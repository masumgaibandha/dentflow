# DentFlow

DentFlow is a multi-tenant dental practice management SaaS. Clinics manage patients, dentists, appointments, treatments, and billing from a single dashboard, with a public marketing site for prospective clinics.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod
- **Backend:** Express.js, TypeScript, MongoDB (Mongoose), JWT authentication, bcrypt
- **Deployment:** Frontend and backend both on Vercel, database on MongoDB Atlas

## Repository layout

```
frontend/   Next.js application
backend/    Express API (deployed as Vercel serverless functions)
```

Each app has its own `package.json` and `tsconfig.json` and is run independently.

## Local development

### Backend

```
cd backend
cp .env.example .env   # fill in MONGODB_URI, etc.
npm install
npm run dev
```

Runs on `http://localhost:4000` by default. Health check: `GET /api/health`.

### Frontend

```
cd frontend
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Demo data

For grading/demo purposes, the backend includes an idempotent seed script that creates one
demo clinic with real, browsable content - no manual data entry required.

```
cd backend
npm run seed:demo
```

Safe to run repeatedly: it upserts by stable identity (clinic slug, user email, patient
clinic+email, treatment clinic+title) rather than creating duplicates, and never touches
unrelated clinics or accounts.

Requires `MONGODB_URI` (and the rest of `backend/.env`) to already be configured - the script
reuses the app's normal environment validation and fails with a clear error if it's missing.

**Demo clinic:** slug `dentflow-demo` ("DentFlow Dental Center"), with ~10 seeded dental
services and real weekly operating hours.

**Demo accounts** (seeded with normal bcrypt-hashed passwords through the standard auth flow -
not a special login path):

| Role    | Email                    | Password          |
|---------|--------------------------|--------------------|
| Admin   | `admin@dentflow.demo`    | `DemoAdmin123!`    |
| Staff   | `staff@dentflow.demo`    | `DemoStaff123!`    |
| Patient | `patient@dentflow.demo`  | `DemoPatient123!`  |

**These are public demonstration credentials for grading/showcasing the app only - never reuse
them for a real clinic, and never seed demo data against a production database.**

To make the public pages (`/`, `/items`, `/items/[id]`) resolve to the demo clinic by default
without requiring a `?clinic=` query parameter, set in `frontend/.env.local`:

```
NEXT_PUBLIC_DEFAULT_CLINIC_SLUG=dentflow-demo
```

## Deployment

- Frontend and backend are deployed as separate Vercel projects, each with its "Root Directory" set to `frontend/` or `backend/` respectively.
- Database: MongoDB Atlas, with network access configured to allow connections from anywhere (required for Vercel's serverless functions, which do not have static IPs).

Live URLs:
- Frontend: _TBD_
- Backend API: _TBD_

## Known trade-offs (deadline build)

- **Auth tokens are stored in `localStorage`** rather than an httpOnly cookie. This is a deliberate, temporary trade-off to avoid cross-origin cookie complexity between the two separate Vercel deployments under a tight deadline, and carries XSS exposure risk. Planned migration: move to httpOnly, `SameSite` cookie-based sessions post-submission.
- **Invoices support manual/offline payment marking only.** The schema is provider-ready (`payment.provider: 'manual' | 'stripe'`) but real Stripe integration (Payment Intents, webhooks) is deferred to a post-submission milestone.
