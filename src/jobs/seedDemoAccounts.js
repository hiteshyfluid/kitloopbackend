'use strict';

/**
 * Demo account seed for The Kit Loop.
 *
 * Usage: node src/jobs/seedDemoAccounts.js
 *
 * Creates 3 accounts (idempotent — safe to re-run):
 *   - Super Admin  wp@fluidlabs.co.uk
 *   - Demo Seller  seller.demo@fluidlabs.co.uk
 *   - Demo Buyer   buyer.demo@fluidlabs.co.uk
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const PASSWORD = 'Demo@KitLoop2026!';
const SALT_ROUNDS = 12;

const ACCOUNTS = [
  { email: 'wp@fluidlabs.co.uk', username: 'superadmin', displayName: 'Super Admin', role: 'admin' },
  { email: 'seller.demo@fluidlabs.co.uk', username: 'demo_seller', displayName: 'Demo Seller', role: 'seller' },
  { email: 'buyer.demo@fluidlabs.co.uk', username: 'demo_buyer', displayName: 'Demo Buyer', role: 'buyer' },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  console.log('\n══════════════════════════════════════════════');
  console.log('  The Kit Loop — Demo Accounts');
  console.log('══════════════════════════════════════════════\n');

  for (const def of ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: def.email },
      update: { role: def.role, accountStatus: 'active', emailVerified: true, passwordHash },
      create: {
        email: def.email,
        username: def.username,
        displayName: def.displayName,
        role: def.role,
        authProvider: 'email',
        emailVerified: true,
        accountStatus: 'active',
        passwordHash,
      },
    });
    console.log(`  ✓ ${def.role.padEnd(6)} ${def.email}`);
  }

  console.log('\n  Password (all accounts): ' + PASSWORD);
  console.log('══════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
