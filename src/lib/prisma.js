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

const baseClient = new PrismaClient({ adapter });

// ─── Transient connection errors ──────────────────────────────────────────────
// P1001/P1002: the server could not be reached at all, so the query never ran
// and is safe to retry whatever it was. P1008/P1017 and raw socket errors can
// happen mid-query, so only reads are retried — a write may already have landed.
const UNREACHABLE_CODES = new Set(['P1001', 'P1002']);
const DROPPED_CODES = new Set(['P1008', 'P1017', 'P2024']);
const DROPPED_PATTERN =
  /Can't reach database server|Connection terminated|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|timeout exceeded when trying to connect|Server has closed the connection/i;
const READ_OPERATIONS = new Set([
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany',
  'count', 'aggregate', 'groupBy', '$queryRaw', '$queryRawUnsafe',
]);

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;

function isDbConnectionError(err) {
  if (!err) return false;
  if (typeof err.code === 'string' && (UNREACHABLE_CODES.has(err.code) || DROPPED_CODES.has(err.code))) return true;
  return DROPPED_PATTERN.test(err.message || '');
}

function isRetryable(err, operation) {
  if (typeof err?.code === 'string' && UNREACHABLE_CODES.has(err.code)) return true;
  return READ_OPERATIONS.has(operation) && isDbConnectionError(err);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prisma = baseClient.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await query(args);
        } catch (err) {
          if (attempt >= MAX_RETRIES || !isRetryable(err, operation)) throw err;
          const delay = BASE_DELAY_MS * 2 ** attempt;
          console.warn(
            `[db] ${model ? `${model}.` : ''}${operation} failed (${err.code || 'connection'}), retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`,
          );
          await sleep(delay);
        }
      }
    },
  },
});

// Ping until the database answers so the first requests after boot (or after
// the laptop wakes) don't hit a cold pool. Never throws.
async function connectWithRetry({ attempts = 5, delayMs = 2000 } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await baseClient.$queryRaw`SELECT 1`;
      console.log('[db] Connected');
      return true;
    } catch (err) {
      console.error(`[db] Connect attempt ${i}/${attempts} failed: ${err.message.split('\n').pop()}`);
      if (i < attempts) await sleep(delayMs);
    }
  }
  console.error('[db] Database unreachable at startup — requests will retry on demand');
  return false;
}

module.exports = prisma;
module.exports.isDbConnectionError = isDbConnectionError;
module.exports.connectWithRetry = connectWithRetry;
