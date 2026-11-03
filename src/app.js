const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRouter = require('./routes/auth');
const sportsRouter = require('./routes/sports');
const brandsRouter = require('./routes/brands');
const listingsRouter = require('./routes/listings');
const uploadRouter = require('./routes/upload');
const checkoutRouter = require('./routes/checkout');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const webhooksRouter = require('./routes/webhooks');
const { offersRouter, counterOffersRouter } = require('./routes/offers');
const disputesRouter      = require('./routes/disputes');
const reviewsRouter       = require('./routes/reviews');
const usersRouter         = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const adminRouter         = require('./routes/admin');
const integrationSettingsRouter = require('./routes/integrationSettings');
const configRouter        = require('./routes/config');
const { toSnakeCase } = require('./utils/caseConvert');

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
// Express 5 leaves req.body undefined when a request has no body (e.g. DELETE /admin/sports/:id).
// Validators expect an object, as Express 4 provided, so default it here once for every route.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please try again shortly.', code: 'RATE_LIMITED' },
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/counter-offers', counterOffersRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/sellers', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
// Super-admin integration keys (Stripe/Moov) — must be mounted before the general admin router
app.use('/api/admin/settings/integrations', integrationSettingsRouter);
app.use('/api/admin',         adminRouter);
app.use('/api/config',        configRouter);
app.use('/api', listingsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found', code: 'NOT_FOUND' });
});

// Prisma error codes that describe a bad request rather than a server fault.
// See https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERRORS = {
  P2002: { status: 409, code: 'ALREADY_EXISTS', message: 'This record already exists' },
  P2003: { status: 400, code: 'INVALID_REFERENCE', message: 'A referenced record does not exist' },
  P2025: { status: 404, code: 'NOT_FOUND', message: 'Record not found' },
};

function normalizeError(err) {
  if (err.message === 'Not allowed by CORS') {
    return { status: 403, code: 'CORS_BLOCKED', message: err.message };
  }
  // Malformed JSON or an oversized body from express.json()
  if (err.type === 'entity.parse.failed') {
    return { status: 400, code: 'INVALID_JSON', message: 'Request body is not valid JSON' };
  }
  if (err.type === 'entity.too.large') {
    return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' };
  }
  if (typeof err.code === 'string' && PRISMA_ERRORS[err.code]) {
    return PRISMA_ERRORS[err.code];
  }
  if (err.name === 'PrismaClientValidationError') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid request data' };
  }
  return null;
}

app.use((err, req, res, next) => {
  const known = normalizeError(err);
  if (known) {
    if (res.headersSent) return next(err);
    return res.status(known.status).json({ success: false, error: known.message, code: known.code });
  }

  const status = err.status || 500;
  // 4xx are expected client mistakes — only server faults need a stack trace
  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);
  if (res.headersSent) return next(err);
  res.status(status).json({
    success: false,
    error:
      status === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    code: err.code || (status === 500 ? 'INTERNAL_ERROR' : undefined),
    ...(err.details ? toSnakeCase({ details: err.details }) : {}),
  });
});

module.exports = app;
