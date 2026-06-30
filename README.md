# B2B Wholesale Electronics Marketplace - Frontend

> React + TypeScript + Vite frontend for B2B wholesale electronics marketplace. Similar to Moglix, IndiaMart, Udaan.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| UI | Radix UI + shadcn/ui |
| State | TanStack React Query |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Animations | Framer Motion |

---

## Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── banners/             # Hero banners
│   ├── categories/          # Category images
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── address/         # Address modal
│   │   ├── charts/          # Dashboard charts
│   │   ├── common/          # Shared components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── WholesaleTierDisplay.tsx
│   │   │   ├── ProductInfoSection.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ...
│   │   ├── home/            # Homepage sections
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── ProductCarousel.tsx
│   │   │   └── ...
│   │   ├── layout/          # Layout components
│   │   │   ├── MarketplaceLayout.tsx
│   │   │   ├── BuyerLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   └── MegaMenu.tsx
│   │   ├── seo/             # SEO landing page components
│   │   └── ui/              # Reusable UI components
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── AddressContext.tsx
│   │   ├── AuthRedirectContext.tsx
│   │   └── QueryProvider.tsx
│   │
│   ├── hooks/               # Custom hooks
│   ├── services/            # API service layer
│   ├── types/               # TypeScript types
│   ├── pages/
│   │   ├── public/          # Public pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── SEOLandingPage.tsx
│   │   │   ├── auth/
│   │   │   └── product/
│   │   ├── buyer/           # Buyer dashboard pages
│   │   ├── seller/          # Seller dashboard pages
│   │   └── admin/           # Admin dashboard pages
│   ├── routes/              # Route components
│   ├── lib/                 # Utilities & constants
│   ├── config/              # API config
│   └── App.tsx              # Root component
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Backend API running (see backend README)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/gitmanhimanshu/b2b-frontend.git
cd b2b-frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

The dev server proxies `/api` requests to `http://127.0.0.1:8000` (configured in `vite.config.ts`).

---

## Environment Variables

Create `.env` file in root:

```env
# Backend API URL (required for production)
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

> In development, API calls go through Vite proxy (`/api/v1` → `localhost:8000`), so no env var needed.

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run Oxlint
```

---

## Features

- **Homepage**: Hero banner carousel, categories, featured products, brands
- **Product Listing**: Filters, search, pagination, sort
- **Product Detail**: Images, wholesale pricing tiers, seller comparison
- **Auth**: Login, register, JWT token management, auth redirect
- **Buyer Dashboard**: Orders, cart, wishlist, profile, addresses
- **Seller Dashboard**: Products, pricing, inventory, orders
- **Admin Dashboard**: Users, sellers, approvals, analytics
- **SEO Landing Pages**: Auto-generated category/brand/city pages
- **Responsive**: Mobile-first design, works on all devices

---

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Initial commit"
git push origin master
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import `gitmanhimanshu/b2b-frontend`
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **"Deploy"**

### Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.vercel.app/api/v1` |

> Replace `your-backend.vercel.app` with your actual backend Vercel URL.

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"**

### Your frontend is live at:
```
https://your-project-name.vercel.app
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes (production) |

---

## Project Architecture

```
Browser → Vercel CDN (Frontend)
              │
              │ /api/v1/*
              ▼
         Vercel Serverless (Backend)
              │
              ▼
         Supabase PostgreSQL
```

### API Communication
- Dev: Vite proxy (`/api/v1` → `localhost:8000`)
- Prod: Direct backend URL via `VITE_API_BASE_URL`

### Auth Flow
1. User logs in → JWT access + refresh tokens stored in localStorage
2. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
3. On 401 → auto-refresh token → retry request
4. On refresh failure → redirect to login

### Auth Redirect (Amazon-style)
1. Guest clicks "Buy Now" → saves pending action + current URL to sessionStorage
2. Redirects to login page
3. After login → GuestRoute reads sessionStorage → restores original URL + executes pending action

---

## Post-Deployment Checklist

- [ ] Homepage loads with all sections
- [ ] Product listing works with filters
- [ ] Product detail page shows wholesale tiers
- [ ] Login/Register works
- [ ] Cart add/remove works
- [ ] API calls reach backend (check Network tab)
- [ ] Mobile responsive
- [ ] SEO pages load (`/laptops/delhi` etc.)

---

## Important Notes

- `VITE_API_BASE_URL` is **baked into the build** at build time
- If you change the backend URL, you must **redeploy** the frontend
- The frontend uses relative `/api/v1` in dev (Vite proxy), but absolute URL in production
