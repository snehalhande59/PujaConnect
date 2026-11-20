/**
 * PujaConnect Safe Admin Seeder & Password Reset Script
 * Usage:
 *   node prisma/seed-admin.js
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from process.env or apps/api/.env
 * Performs a safe upsert in PostgreSQL without touching other records.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.argv[2] || process.env.ADMIN_PASSWORD;
  const adminEmail = (process.argv[3] || process.env.ADMIN_EMAIL || 'admin@pujaconnect.in').toLowerCase().trim();

  if (!rawPassword || rawPassword.length < 8) {
    console.error('❌ Error: Admin password must be at least 8 characters long.');
    console.error('You can provide it in two ways:');
    console.error('  1. Environment variable in apps/api/.env:');
    console.error('     ADMIN_EMAIL=admin@pujaconnect.in');
    console.error('     ADMIN_PASSWORD=YourStrongPasswordHere');
    console.error('     Then run: npm --prefix apps/api run seed:admin');
    console.error('  2. Pass as command-line argument:');
    console.error('     node apps/api/prisma/seed-admin.js "YourStrongPasswordHere" "admin@pujaconnect.in"');
    process.exit(1);
  }

  console.log(`🔐 Hashing password with bcrypt (10 rounds) for ${adminEmail}...`);
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isDeleted: false,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isDeleted: false,
    },
  });

  console.log('✅ Admin account configured successfully in PostgreSQL:');
  console.log(`   - ID: ${admin.id}`);
  console.log(`   - Email: ${admin.email}`);
  console.log(`   - Role: ${admin.role}`);
  console.log(`   - Active: ${admin.isActive}`);
  console.log(`   - Password Hash: ${admin.passwordHash.slice(0, 10)}... (60 chars bcrypt)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
