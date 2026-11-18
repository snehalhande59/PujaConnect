# PujaConnect Setup Guide

## Prerequisites

1. **Node.js**: v20+ (`node -v`)
2. **pnpm**: v9+ or v12+ (`pnpm -v`)
3. **PostgreSQL**: PostgreSQL 15+ running on localhost port 5432

---

## PostgreSQL Configuration Instructions

1. Ensure the PostgreSQL service is running:
   ```powershell
   Get-Service *postgres*
   ```
2. Log into PostgreSQL with `psql` or pgAdmin:
   ```bash
   psql -U postgres -h localhost -p 5432
   ```
3. Create the `pujaconnect` database:
   ```sql
   CREATE DATABASE pujaconnect;
   ```
4. Copy the environment variables:
   ```powershell
   Copy-Item .env.example .env
   ```
5. Update `DATABASE_URL` in `.env` with your actual postgres password:
   ```env
   DATABASE_URL="postgresql://postgres:<YOUR_PASSWORD>@localhost:5432/pujaconnect?schema=public"
   ```
6. Run Prisma migrations / database push:
   ```bash
   pnpm --filter @pujaconnect/api prisma db push
   ```

---

## Ports Configuration

- **Next.js Web Frontend**: Port 3000 (`http://localhost:3000`)
- **NestJS API Backend**: Port 3001 (`http://localhost:3001/api/v1`)
- **PostgreSQL**: Port 5432
