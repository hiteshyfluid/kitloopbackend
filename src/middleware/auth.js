const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');

const SESSION_INACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
const SESSION_ABSOLUTE_CAP_MS = 90 * 24 * 60 * 60 * 1000; // 90 days from creation, hard cap

const requireAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  const session = await prisma.session.findUnique({ where: { id: decoded.sid } });
  const now = new Date();

  if (
    !session ||
    session.userId !== decoded.sub ||
    session.revokedAt ||
    session.expiresAt < now ||
    now - session.createdAt > SESSION_ABSOLUTE_CAP_MS
  ) {
    throw new AppError('Session expired or revoked', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || user.deletedAt) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  if (user.accountStatus !== 'active') {
    throw new AppError(`Account is ${user.accountStatus}`, 403, 'ACCOUNT_INACTIVE');
  }

  // Sliding expiry — every authenticated interaction extends the session another
  // 30 days, capped at 90 days from when the session was first created.
  const slidingExpiresAt = new Date(
    Math.min(now.getTime() + SESSION_INACTIVITY_WINDOW_MS, session.createdAt.getTime() + SESSION_ABSOLUTE_CAP_MS)
  );

  prisma.session
    .update({ where: { id: session.id }, data: { lastUsedAt: now, expiresAt: slidingExpiresAt } })
    .catch(() => {});

  req.user = user;
  req.sessionId = session.id;
  next();
});

// optionalAuth — same session validation as requireAuth but silently continues
// unauthenticated instead of throwing. Sets req.user = null when no valid token.
const optionalAuth = async (req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const session = await prisma.session.findUnique({ where: { id: decoded.sid } });
    const now = new Date();
    if (
      session &&
      session.userId === decoded.sub &&
      !session.revokedAt &&
      session.expiresAt >= now &&
      now.getTime() - session.createdAt.getTime() <= SESSION_ABSOLUTE_CAP_MS
    ) {
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (user && !user.deletedAt && user.accountStatus === 'active') {
        req.user = user;
      }
    }
  } catch {
    // silently continue unauthenticated
  }
  next();
};

module.exports = requireAuth;
module.exports.optionalAuth = optionalAuth;
