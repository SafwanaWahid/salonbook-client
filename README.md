# SalonBook Client

SalonBook is a responsive salon appointment booking platform. Customers can explore services, request appointments, track confirmations, and pay for confirmed visits. Salon administrators manage services, customers, bookings, and verified payment records.

## Features

- Responsive home page with featured services and category navigation
- Search, category filters, price sorting, shareable catalogue URLs, and a `Ctrl/⌘ + K` search shortcut
- Better Auth email/password and optional Google sign-in
- Protected service details and role-specific customer/admin dashboards
- Availability-aware appointment requests and customer cancellation of pending requests
- Customer appointment and transaction history, profile editing, and ImgBB profile uploads
- Admin service CRUD, service image uploads, appointment/customer search, blocking controls, and transaction review
- Stripe Checkout for confirmed appointments; payment success is confirmed only by the server webhook
- Loading, empty, error, and not-found states with toast feedback

## Technology

Next.js, React, TypeScript, Better Auth, Tailwind CSS, and the SalonBook Express API.

## Run locally

1. Start the server by following [the server setup](../salonbook-server/README.md).
2. Copy `.env.example` to `.env.local` and set the API and application URLs.
3. Install dependencies with `npm install`.
4. Start Next.js with `npm run dev` and open `http://localhost:3000`.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment.

## Environment variables

- `NEXT_PUBLIC_API_URL` — Express API base URL including `/api`
- `NEXT_PUBLIC_APP_URL` — client origin
- `NEXT_PUBLIC_AUTH_URL` — Better Auth server origin

Do not place private keys in `NEXT_PUBLIC_*` variables. Never commit `.env.local`.

## Deployment and submission links

- Live website: add after deployment
- Client repository: add after creating/pushing the GitHub repository
- Server repository: add after creating/pushing the GitHub repository
