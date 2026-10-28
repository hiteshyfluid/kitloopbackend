'use strict';

/**
 * Promote an existing user to super_admin.
 *
 * Usage: npm run make-super-admin -- <email>
 *
 * There is deliberately no API or UI for granting super_admin. The account
 * must already exist (sign up first, or run seedDemoAccounts.js).
 */

require('dotenv').config();
const prisma = require('../lib/prisma');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-super-admin -- <email>');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, deletedAt: true } });
  if (!user || user.deletedAt) {
    console.error(`No active user with email ${email}`);
    process.exitCode = 1;
    return;
  }
  if (user.role === 'super_admin') {
    console.log(`${email} is already a super admin.`);
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: 'super_admin' } });
  console.log(`${email}: ${user.role} → super_admin`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
