# Merume Next Migration

This folder contains the incremental migration of the original HTML/CSS/JS storefront into Next.js App Router.

## Phase Status

- Phase 1: completed
	Next.js + TypeScript + Tailwind setup.
- Phase 2: completed
	UI/components migrated while preserving the storefront look and core interactions.
- Phase 3: completed
	Prisma + PostgreSQL schema, seed script, API routes, admin dashboard, and checkout persistence to database.

## Implemented Scope

- Next.js App Router storefront in `src/components/storefront.tsx`.
- Prisma schema in `prisma/schema.prisma` with required tables:
	- `categories`
	- `products`
	- `product_variants`
	- `product_images`
	- `customers`
	- `orders`
	- `order_items`
- Product seed script in `prisma/seed.ts`.
- API routes:
	- `GET /api/products`
	- `POST /api/orders`
	- `GET /api/admin/orders`
	- `PATCH /api/admin/orders/[id]`
	- `GET /api/admin/products`
- Admin dashboard at `/admin`:
	- orders list + details + status update
	- products list (read-only)
- Checkout now creates a real order in DB, then opens WhatsApp with server-generated order message.
- Storefront no longer uses localStorage for cart/order persistence.

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Set your `DATABASE_URL` in `.env`.

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Run migrations:

```bash
npm run db:migrate
```

6. Seed products:

```bash
npm run db:seed
```

7. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/admin`.

## Admin Access

- Admin pages and admin APIs are protected by middleware.
- Set these variables in `.env`:
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
	- `ADMIN_SESSION_TOKEN`
- Default local values currently used:
	- username: `admin`
	- password: `change-me`

After login from `/admin/login`, a secure `httpOnly` session cookie is used.

## Validation

- `npm run lint` passes with warnings only (image optimization warnings).
- `npm run build` passes.
