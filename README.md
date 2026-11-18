# PujaConnect Platform (Phase 1 Foundation)
**Independent Online Puja Booking, Pandit Marketplace & Puja Samagri E-commerce Platform**

PujaConnect is an independent enterprise web application inspired by the concept of Speedy Pandit, built for authentic Hindu rituals, verified Gurukul-trained priests, and pure temple-grade puja samagri.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Monorepo** | pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`) |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod |
| **Backend** | NestJS 10, Node.js 20, TypeScript, Prisma ORM, Passport, JWT, Swagger |
| **Database** | PostgreSQL 15+ (with UUIDs, soft deletion, indexing, relations) |
| **Payments** | Razorpay Gateway (Test Mode ready, backend signature validation) |
| **Ports** | Frontend: `http://localhost:3000` • Backend: `http://localhost:3001` |

---

## 📁 Monorepo Structure

```
PujaConnect/
  apps/
    web/                           # Next.js 14 Frontend Application (Port 3000)
      src/
        app/
          (public)/                # Public discovery (Pujas, Pandits, Store, About, Contact)
          customer/                # Customer Devotee Portal
          pandit/                  # Pandit Scheduling, Availabilities & Earnings
          admin/                   # Enterprise Control Console
          support/                 # Support Staff Helpdesk
          booking/                 # Multi-step Booking Flow
          checkout/                # Secure Razorpay Checkout
        components/                # Layout, Navbar, Footer, UI components
        lib/                       # Tailwind merge & utilities
    api/                           # NestJS Backend API Service (Port 3001)
      prisma/
        schema.prisma              # Complete PostgreSQL schema (20+ entities)
      src/
        auth/                      # JWT authentication & role-based guards
        health/                    # System health-check endpoint
        users/, customers/, pandits/
        categories/, pujas/, availability/
        bookings/, payments/, products/
        cart/, orders/, reviews/, notifications/
        support/, admin/
        main.ts
  packages/
    shared/                        # Shared types, Zod schemas, constants, and enums
  docs/                            # Architecture and database documentation
  .env.example                     # Environment template
  package.json                     # Root monorepo configuration
  pnpm-workspace.yaml              # Workspace definition
```

---

## 🚀 Running the Platform Locally

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Generate Prisma Client
```bash
pnpm prisma:generate
```

### 3. Start Backend & Frontend in Parallel
```bash
pnpm dev
```
Or individually:
```bash
# Start NestJS API on http://localhost:3001
pnpm dev:api

# Start Next.js Web on http://localhost:3000
pnpm dev:web
```

---

## 🩺 Endpoints

- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Health Check:** [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
- **Swagger Documentation:** [http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)
