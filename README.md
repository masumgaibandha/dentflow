# DentFlow

## Overview

DentFlow is a multi-tenant dental clinic management application. Each clinic gets its own
isolated workspace - patients, dentists, appointments, treatments, invoices, and medical
records are always scoped to the clinic that owns them. The app pairs a public marketing/
booking site with an authenticated dashboard for clinic staff and a separate portal for
patients.

## Live Links

- **Frontend:** https://dentflow-eight.vercel.app
- **Backend API:** https://dentflow-api.vercel.app
- **Backend health check:** https://dentflow-api.vercel.app/api/health
- **GitHub repository:** https://github.com/masumgaibandha/dentflow

Both applications are hosted on Vercel (two separate projects from this same monorepo:
`dentflow` for the frontend, `dentflow-api` for the backend). The database remains
MongoDB Atlas, and Stripe remains in test mode.

## Main Features

- Multi-tenant clinic registration
- JWT authentication
- Role-based Admin, Staff, and Patient access
- Patient management
- Dentist management
- Appointment management
- Treatment/service catalog
- Invoices
- Stripe test-mode patient payments
- Dashboard analytics with Recharts
- Clinical medical records
- Controlled patient-record visibility
- Patient portal
- Responsive navigation
- Contact form
- Demo data

## Roles and Permissions

**Admin** - full clinic administration:
- Services (treatment catalog)
- Patients
- Dentists
- Appointments
- Invoices
- Settings
- Staff

**Staff** - permitted operational pages only:
- Patients
- Dentists
- Appointments

Staff cannot access Services, Invoices, Settings, or Staff management.

**Patient** - own data only, via the patient portal:
- Own appointments
- Own invoices and payments
- Medical records the clinic has explicitly marked as shared with the patient

**Note:** Dentist is currently a clinical profile record (used for scheduling and
attribution), not a separate authentication role. Dentists do not log in.

## Technology Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Query,
  React Hook Form + Zod, Recharts
- **Backend:** Express.js, TypeScript, MongoDB (Mongoose), JWT authentication, bcrypt
- **Payments:** Stripe (test mode)
- **Testing:** Vitest on both apps; Supertest + mongodb-memory-server on the backend;
  React Testing Library on the frontend
- **Deployment targets:** Vercel (frontend), Render or an equivalent Node host (backend),
  MongoDB Atlas (database)

## Local Setup

### Prerequisites

- Node.js (see `.nvmrc` - currently `22`)
- npm
- A MongoDB connection string (MongoDB Atlas recommended - a free-tier cluster works)

### Clone

```
git clone https://github.com/masumgaibandha/dentflow.git
cd dentflow
```

### Backend install

```
cd backend
npm install
```

### Frontend install

```
cd frontend
npm install
```

### Environment setup

```
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, etc. - see Environment Variables below

cd ../frontend
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL, etc.
```

### Demo seed

```
cd backend
npm run seed:demo
```

### Starting backend

```
cd backend
npm run dev
```

Runs on `http://localhost:4000`. Health check: `GET /api/health`.

### Starting frontend

```
cd frontend
npm run dev
```

Runs on `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No (defaults to `development`) | `development`, `production`, or `test` |
| `PORT` | No (defaults to `4000`) | Port the Express server listens on locally |
| `MONGODB_URI` | Yes | MongoDB Atlas (or other MongoDB) connection string |
| `CORS_ORIGIN` | Yes | The single frontend origin allowed to call this API (e.g. `http://localhost:3000` locally, or the deployed frontend URL in production) |
| `JWT_SECRET` | Yes | Signing secret for JWTs, minimum 32 characters. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No (defaults to `7d`) | JWT expiry, e.g. `7d` |
| `STRIPE_SECRET_KEY` | No (only needed to accept payments) | Stripe **test-mode** secret key, backend-only, from https://dashboard.stripe.com/test/apikeys |

### Frontend (`frontend/.env.local.example`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API, e.g. `http://localhost:4000` locally |
| `NEXT_PUBLIC_DEFAULT_CLINIC_SLUG` | No (defaults to `dentflow-demo`) | Clinic slug the public pages (`/`, `/items`, `/items/[id]`) fall back to when there's no `?clinic=` param and the visitor isn't logged in - set to the seeded demo clinic so grading doesn't depend on knowing a slug ahead of time |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (only needed to accept payments) | Stripe **test-mode** publishable key, safe to expose to the browser, from https://dashboard.stripe.com/test/apikeys |

No real secrets are committed anywhere in this repository - both `.env.example` files
contain placeholders only.

## Demo Data

```
cd backend
npm run seed:demo
```

Idempotent - safe to run repeatedly. It upserts by stable identity (clinic slug, user
email, patient clinic+email, treatment clinic+title) rather than creating duplicates, and
never touches unrelated clinics or accounts.

**Demo clinic:** slug `dentflow-demo` ("DentFlow Dental Center"), with 10 seeded dental
services and real weekly operating hours.

**Demo accounts** (seeded with normal bcrypt-hashed passwords through the standard auth
flow - not a special login path):

| Role    | Email                    | Password          |
|---------|--------------------------|--------------------|
| Admin   | `admin@dentflow.demo`    | `DemoAdmin123!`    |
| Staff   | `staff@dentflow.demo`    | `DemoStaff123!`    |
| Patient | `patient@dentflow.demo`  | `DemoPatient123!`  |

**These are public demonstration credentials for grading/showcasing the app only - never
reuse them for a real clinic, and never seed demo data against a production database.**

## Stripe Test Payment

Stripe **test-mode** patient invoice payment is implemented - patients can pay an invoice
from the portal using Stripe's hosted card element. No real money is ever charged.

To test a payment, use Stripe's standard test card:

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- Postal code: any valid postal code

Live Stripe (real charges), webhooks, refunds, and subscriptions are out of scope for this
project.

## Available Scripts

### Backend (`cd backend`)

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `tsx watch src/server.ts` | Local dev server with auto-reload |
| `npm run build` | `tsc -p tsconfig.json` | Type-checked production build to `dist/` |
| `npm start` | `node dist/server.js` | Run the built production server |
| `npm run typecheck` | `tsc --noEmit` | Type-check without emitting |
| `npm test` | `vitest run` | Run the backend test suite |
| `npm run lint` | `eslint src --max-warnings=0` | Lint the backend source |
| `npm run seed:demo` | `tsx src/scripts/runSeedDemo.ts` | Seed/refresh the demo clinic |

### Frontend (`cd frontend`)

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev --webpack` | Local dev server |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Run the built production server |
| `npm run lint` | `eslint` | Lint the frontend source |
| `npm test` | `vitest run` | Run the frontend test suite |

The frontend has no dedicated `typecheck` script. Type-check it directly with:

```
npx tsc --noEmit
```

## Important Routes

**Public:**
- `/`
- `/items`
- `/items/[id]`
- `/about`
- `/contact`
- `/login`
- `/register`

**Protected - Admin/Staff:**
- `/dashboard`
- `/patients`
- `/dentists`
- `/appointments`
- `/invoices`
- `/items/add`
- `/items/manage`
- `/settings`
- `/settings/users`

**Patient portal:**
- `/portal`
- `/portal/appointments`
- `/portal/invoices`
- `/portal/medical-records`

## API Overview

All endpoints are namespaced under `/api`. Grouped by module:

- **`/api/auth`** - registration and login, JWT issuance
- **`/api/treatments`** - public + admin service catalog CRUD (search/filter/sort/paginate)
- **`/api/patients`** - patient records (admin/staff)
- **`/api/dentists`** - dentist profiles (admin/staff)
- **`/api/appointments`** - appointment scheduling (admin/staff)
- **`/api/invoices`** - invoicing and payment status (admin)
- **`/api/dashboard`** - aggregate stats for the admin dashboard
- **`/api/clinics`** - clinic settings (admin)
- **`/api/users`** - staff/user management (admin)
- **`/api/portal`** - patient-facing endpoints (own appointments, invoices, Stripe payment,
  booking)
- **`/api/medical-records`** - clinical records, draft/finalize/amendment workflow, and
  controlled patient visibility
- **`/api/contact`** - public contact form submissions
- **`/api/health`** - health check (no auth)

## Testing

### Backend

```
cd backend
npm run typecheck
npm test
npm run lint
npm run build
```

### Frontend

```
cd frontend
npx tsc --noEmit
npm test
npm run lint
npm run build
```

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds) - never stored in plaintext
- Authentication uses JWTs, verified against a live, non-deactivated user record on every
  request
- All backend queries are tenant-scoped by `clinicId` - one clinic can never read or write
  another clinic's data
- Role-based authorization middleware (`requireAuth` + `requireRole`) gates every
  protected route
- The patient portal enforces patient-ownership checks on top of role checks - a patient
  can only ever see their own appointments, invoices, and shared medical records
- Stripe payments are verified server-side; the frontend never trusts a client-reported
  payment status
- Finalized medical records are immutable - corrections must go through the amendment
  workflow, not an edit of the original
- All secrets (JWT signing key, Stripe secret key, database credentials) are kept in
  environment variables, never committed to source control
- Demo accounts are public, well-known credentials intended for grading/demonstration
  only and must never be reused for a real clinic or production deployment

This project has not been certified for and does not claim full HIPAA or GDPR compliance.

## Deployment

Intended deployment shape:

- **Frontend:** Vercel
- **Backend:** Render, or an equivalent Node host (the backend also ships a Vercel
  serverless adapter under `backend/api/`, so either works)
- **Database:** MongoDB Atlas, with network access configured to allow connections from
  anywhere (required for serverless/managed hosts without static IPs)

Required production environment variables are the same as listed under
[Environment Variables](#environment-variables) above, with two points to double check:

- `CORS_ORIGIN` (backend) must exactly match the deployed frontend's URL
- `NEXT_PUBLIC_API_URL` (frontend) must point at the deployed backend's URL

Stripe remains in **test mode** for this assignment - no production Stripe keys are used
or required.

## Known Limitations

- Stripe integration is test-mode only; no live charges
- No webhooks, refunds, or subscriptions
- No dedicated dentist login role - dentists are clinical profile records, not accounts
- No full medical-record access audit trail (who viewed what, when)
- The shared development MongoDB database currently contains accumulated data from
  browser-based verification during development (test clinics/users created while
  manually exercising registration and other flows), in addition to the demo clinic
- Development, automated browser/E2E verification, and production should use separate
  logical databases (e.g. `dentflow-dev`, `dentflow-e2e`, `dentflow-production`) rather
  than sharing one, to avoid this kind of accumulation going forward
