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
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const webhooksRouter = require('./routes/webhooks');
const { offersRouter, counterOffersRouter } = require('./routes/offers');
const disputesRouter      = require('./routes/disputes');
const reviewsRouter       = require('./routes/reviews');
const usersRouter         = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const adminRouter         = require('./routes/admin');
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
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/counter-offers', counterOffersRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/sellers', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin',         adminRouter);
app.use('/api', listingsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found', code: 'NOT_FOUND' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
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
