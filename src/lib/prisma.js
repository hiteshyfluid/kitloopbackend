const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

// The Supabase pooler drops idle connections without warning. Bounded pool
// settings plus TCP keep-alive let pg recycle dead sockets instead of handing
// them to a request, and the error hooks log driver errors rather than letting
// them surface as an unhandled 'error' event that would take the process down.
const adapter = new PrismaPg(
  {
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  },
  {
    onPoolError: (err) => console.error('[db] Idle pool client error:', err.message),
    onConnectionError: (err) => console.error('[db] Connection error:', err.message),
  },
);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
