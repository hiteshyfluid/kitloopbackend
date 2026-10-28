const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { UAParser } = require('ua-parser-js');
const { generateSecret: generateTotpSecret, generateURI: generateTotpURI, verify: verifyTotp } = require('otplib');
const qrcode = require('qrcode');

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const SMS_CODE_EXPIRY_MS = 10 * 60 * 1000;
const TWO_FACTOR_ISSUER = 'Kit Loop';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const gmailTransporter = gmailUser && gmailPass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })
  : null;
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;
const appleJwksClient = jwksClient({ jwksUri: 'https://appleid.apple.com/auth/keys' });

// ─── Helpers ───

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateNumericCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function parseExpiry(str) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(String(str).trim());
  if (!match) return 90 * 24 * 60 * 60 * 1000;
  const unitMs = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * unitMs[match[2]];
}

function sanitizeUser(user) {
  const {
    passwordHash,
    twoFactorSecret,
    twoFactorTempSecret,
    twoFactorPendingPhone,
    twoFactorPendingCode,
    twoFactorPendingCodeExpires,
    emailVerificationToken,
    emailVerificationExpires,
    passwordResetToken,
    passwordResetExpires,
    ...safe
  } = user;
  return safe;
}

async function generateUniqueUsername(base) {
  const sanitizedBase = base.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'user';
  let candidate = sanitizedBase;
  let suffix = 0;

  // eslint-disable-next-line no-await-in-loop
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${sanitizedBase}${suffix}`.slice(0, 30);
  }

  return candidate;
}

function buildInactiveAccountError(user) {
  if (user.accountStatus === 'banned') {
    return new AppError(
      `Your account has been permanently banned from The Kit Loop. Reason: ${user.suspensionReason || 'policy violation'}. If you believe this is an error, contact support.`,
      403,
      'ACCOUNT_BANNED'
    );
  }

  if (user.accountStatus === 'suspended') {
    const endDate = user.suspensionEndDate ? user.suspensionEndDate.toISOString().slice(0, 10) : null;
    const daysLeft = user.suspensionEndDate
      ? Math.max(1, Math.ceil((user.suspensionEndDate.getTime() - Date.now()) / 86400000))
      : null;
    return new AppError(
      `Your account has been suspended${daysLeft ? ` for ${daysLeft} day(s)` : ''}. Reason: ${
        user.suspensionReason || 'policy violation'
      }.${endDate ? ` Your account will be reinstated on ${endDate}.` : ''} If you believe this is an error, contact support.`,
      403,
      'ACCOUNT_SUSPENDED',
      { reason: user.suspensionReason, suspensionEndDate: user.suspensionEndDate }
    );
  }

  return new AppError('This account is no longer active.', 403, 'ACCOUNT_INACTIVE');
}

// ─── Password hashing ───

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ─── JWT ───

function generateJWT(userId, extraClaims = {}) {
  return signToken({ sub: userId, ...extraClaims });
}

async function createSession(userId, meta = {}) {
  const expiresAt = new Date(Date.now() + parseExpiry(process.env.JWT_EXPIRES_IN || '90d'));
  const session = await prisma.session.create({
    data: {
      userId,
      userAgent: meta.userAgent || null,
      ipAddress: meta.ipAddress || null,
      expiresAt,
    },
  });

  const token = generateJWT(userId, { sid: session.id });
  return { token, session };
}

// ─── Email sending (Gmail SMTP, then Resend, then console) ───

async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM
    || (gmailUser ? `Kit Loop <${gmailUser}>` : 'Kit Loop <no-reply@kitloop.app>');

  if (gmailTransporter) {
    await gmailTransporter.sendMail({ from, to, subject, html });
    return;
  }

  if (resend) {
    await resend.emails.send({ from, to, subject, html });
    return;
  }

  console.log(`[email:dev] To: ${to} | Subject: ${subject}\n${html}`);
}

// Dev-only fallback — wire up a real SMS provider (e.g. Twilio) before production.
async function sendSms({ to, body }) {
  console.log(`[sms:dev] To: ${to} | ${body}`);
}

async function sendVerificationEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Kit Loop email',
    html: `<p>Welcome to Kit Loop! Click below to verify your email address. This link expires in 24 hours.</p><p><a href="${link}">${link}</a></p>`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Kit Loop password',
    html: `<p>We received a request to reset your password. This link expires in 1 hour. If you didn't request this, you can ignore this email.</p><p><a href="${link}">${link}</a></p>`,
  });
}

async function sendSecurityAlertEmail(email, subject, body) {
  await sendEmail({ to: email, subject, html: `<p>${body}</p>` });
}

// ─── Signup / Login (email) ───

async function signupWithEmail(email, password, username) {
  email = normalizeEmail(email);
  username = username.trim();

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    if (existing.email === email) {
      throw new AppError('An account with this email already exists — log in instead', 409, 'EMAIL_EXISTS');
    }
    throw new AppError('This username is already taken', 409, 'USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateRawToken();

  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName: username,
      authProvider: 'email',
      passwordHash,
      emailVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
    },
  });

  await sendVerificationEmail(user.email, verificationToken);

  return sanitizeUser(user);
}

async function registerFailedLogin(user) {
  const now = new Date();
  const withinWindow = user.lastFailedLoginAt && now - user.lastFailedLoginAt < LOGIN_ATTEMPT_WINDOW_MS;
  const attempts = (withinWindow ? user.failedLoginAttempts : 0) + 1;

  const data = { failedLoginAttempts: attempts, lastFailedLoginAt: now };

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    data.lockoutUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
    sendSecurityAlertEmail(
      user.email,
      'Kit Loop security alert: account locked',
      "Your account has been temporarily locked after 5 failed login attempts. If this wasn't you, reset your password once the lockout ends."
    ).catch((err) => console.error('Failed to send security alert email', err));
  }

  await prisma.user.update({ where: { id: user.id }, data });
}

async function loginWithEmail(email, password, code = null, meta = {}) {
  email = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.deletedAt) {
    throw new AppError('Incorrect email or password — please try again', 401, 'INVALID_CREDENTIALS');
  }

  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    throw new AppError(
      'Too many failed attempts — your account has been temporarily locked. Try again in 15 minutes.',
      423,
      'ACCOUNT_LOCKED'
    );
  }

  if (user.accountStatus !== 'active') {
    throw buildInactiveAccountError(user);
  }

  if (!user.passwordHash) {
    throw new AppError(
      `This account uses ${user.authProvider} sign-in. Please log in with ${user.authProvider}.`,
      400,
      'NO_PASSWORD_SET'
    );
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    await registerFailedLogin(user);
    throw new AppError('Incorrect email or password — please try again', 401, 'INVALID_CREDENTIALS');
  }

  if (user.twoFactorEnabled) {
    if (!code) {
      if (user.twoFactorMethod === 'sms') {
        await issueSmsTwoFactorCode(user.id, user.twoFactorPhone);
      }
      return { twoFactorRequired: true, method: user.twoFactorMethod };
    }

    const validCode =
      user.twoFactorMethod === 'sms'
        ? isSmsCodeValid(user, code)
        : (await verifyTotp({ secret: user.twoFactorSecret, token: code })).valid;

    if (!validCode) {
      throw new AppError('Invalid two-factor authentication code', 401, 'INVALID_2FA_CODE');
    }

    if (user.twoFactorMethod === 'sms') {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorPendingCode: null, twoFactorPendingCodeExpires: null },
      });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lastFailedLoginAt: null, lockoutUntil: null, lastActiveAt: new Date() },
  });

  const { token, session } = await createSession(user.id, meta);

  return { user: sanitizeUser(user), token, session: { id: session.id, expiresAt: session.expiresAt } };
}

// ─── Social sign-in ───

async function verifyGoogleToken(googleIdToken) {
  if (!googleClient) throw new AppError('Google sign-in is not configured', 500, 'GOOGLE_NOT_CONFIGURED');

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken: googleIdToken, audience: process.env.GOOGLE_CLIENT_ID });
  } catch (err) {
    throw new AppError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
  }

  return {
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.picture,
    providerId: payload.sub,
  };
}

function getAppleSigningKey(header, callback) {
  appleJwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

async function verifyAppleToken(appleIdentityToken) {
  if (!process.env.APPLE_CLIENT_ID) throw new AppError('Apple sign-in is not configured', 500, 'APPLE_NOT_CONFIGURED');

  let payload;
  try {
    payload = await new Promise((resolve, reject) => {
      jwt.verify(
        appleIdentityToken,
        getAppleSigningKey,
        { algorithms: ['RS256'], audience: process.env.APPLE_CLIENT_ID, issuer: 'https://appleid.apple.com' },
        (err, decoded) => (err ? reject(err) : resolve(decoded))
      );
    });
  } catch (err) {
    throw new AppError('Invalid Apple token', 401, 'INVALID_APPLE_TOKEN');
  }

  if (!payload || !payload.email) {
    throw new AppError('Invalid Apple token', 401, 'INVALID_APPLE_TOKEN');
  }

  return {
    email: payload.email,
    providerId: payload.sub,
  };
}

async function loginOrSignupWithSocial({ email, name, avatarUrl, provider }, meta = {}) {
  email = normalizeEmail(email);
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const username = await generateUniqueUsername(name || email.split('@')[0]);
    user = await prisma.user.create({
      data: {
        email,
        username,
        displayName: name || username,
        avatarUrl: avatarUrl || null,
        authProvider: provider,
        emailVerified: true,
      },
    });
  }

  if (user.accountStatus !== 'active') {
    throw buildInactiveAccountError(user);
  }

  user = await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });

  const { token, session } = await createSession(user.id, meta);
  return { user: sanitizeUser(user), token, session: { id: session.id, expiresAt: session.expiresAt }, isNewUser };
}

// ─── Email verification ───

async function verifyEmail(token) {
  const hashed = hashToken(token);
  const user = await prisma.user.findFirst({ where: { emailVerificationToken: hashed } });

  if (!user) {
    throw new AppError('This verification link is invalid', 400, 'TOKEN_INVALID');
  }
  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    throw new AppError('This verification link has expired', 400, 'TOKEN_EXPIRED');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
  });

  return { id: updated.id, emailVerified: updated.emailVerified };
}

async function resendVerificationEmail(email) {
  email = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified && user.authProvider === 'email') {
    const verificationToken = generateRawToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashToken(verificationToken),
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
      },
    });
    await sendVerificationEmail(user.email, verificationToken);
  }
}

// ─── Password reset ───

async function forgotPassword(email) {
  email = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.authProvider === 'email' && user.accountStatus === 'active') {
    const resetToken = generateRawToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashToken(resetToken),
        passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
      },
    });
    await sendPasswordResetEmail(user.email, resetToken);
  }
}

async function resetPassword(token, newPassword) {
  const hashed = hashToken(token);
  const user = await prisma.user.findFirst({ where: { passwordResetToken: hashed } });

  if (!user) {
    throw new AppError('This reset link is invalid', 400, 'TOKEN_INVALID');
  }
  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new AppError('This reset link has expired', 400, 'TOKEN_EXPIRED');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockoutUntil: null,
      },
    }),
    prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

async function changePassword(userId, currentPassword, newPassword, currentSessionId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    throw new AppError('This account has no password set. Use social login or reset your password.', 400, 'NO_PASSWORD_SET');
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('Current password is incorrect', 401, 'INCORRECT_PASSWORD');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.session.updateMany({
      where: { userId, revokedAt: null, NOT: { id: currentSessionId } },
      data: { revokedAt: new Date() },
    }),
  ]);

  await sendSecurityAlertEmail(
    user.email,
    'Your Kit Loop password was changed',
    'Your password was changed. If this was not you, contact support immediately.'
  ).catch((err) => console.error('Failed to send password-change security email', err));
}

// ─── Sessions ───

function formatDevice(userAgent) {
  if (!userAgent) return 'Unknown device';
  const { browser, os, device } = new UAParser(userAgent).getResult();
  const deviceName = device.vendor && device.model ? `${device.vendor} ${device.model}` : os.name || 'Unknown device';
  return `${deviceName} — ${browser.name || 'Unknown browser'}`;
}

// TODO: wire up a geo-IP provider (e.g. ipapi, MaxMind) for production — local/private
// IPs can never resolve to a real location, so this always returns 'Unknown location' for now.
function formatLocation(ipAddress) {
  return 'Unknown location';
}

async function logout(sessionId) {
  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } }).catch(() => {});
}

async function listSessions(userId, currentSessionId) {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((s) => ({
    sessionId: s.id,
    device: formatDevice(s.userAgent),
    approximateLocation: formatLocation(s.ipAddress),
    lastActiveAt: s.lastUsedAt || s.createdAt,
    isCurrentSession: s.id === currentSessionId,
  }));
}

async function revokeSession(userId, sessionId) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
  }
  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });

  await sendSecurityAlertEmail(
    (await prisma.user.findUnique({ where: { id: userId } })).email,
    'A Kit Loop session was revoked',
    'A session on one of your devices was just revoked. If this was not you, change your password immediately.'
  ).catch((err) => console.error('Failed to send session-revocation security email', err));
}

// ─── Two-factor authentication ───

async function issueSmsTwoFactorCode(userId, phone) {
  const code = generateNumericCode();
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorPendingCode: hashToken(code),
      twoFactorPendingCodeExpires: new Date(Date.now() + SMS_CODE_EXPIRY_MS),
    },
  });
  await sendSms({ to: phone, body: `Your Kit Loop verification code is ${code}. It expires in 10 minutes.` });
}

function isSmsCodeValid(user, code) {
  return Boolean(
    user.twoFactorPendingCode &&
      user.twoFactorPendingCodeExpires &&
      user.twoFactorPendingCodeExpires > new Date() &&
      user.twoFactorPendingCode === hashToken(code)
  );
}

async function enableTwoFactor(userId, userEmail, method, phoneNumber) {
  if (method === 'sms') {
    await prisma.user.update({ where: { id: userId }, data: { twoFactorPendingPhone: phoneNumber } });
    await issueSmsTwoFactorCode(userId, phoneNumber);
    return { method: 'sms' };
  }

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorTempSecret: secret } });

  const otpauth = generateTotpURI({ issuer: TWO_FACTOR_ISSUER, label: userEmail, secret });
  const qrCodeUrl = await qrcode.toDataURL(otpauth);

  return { method: 'authenticator_app', secretKey: secret, qrCodeUrl };
}

async function confirmTwoFactor(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user.twoFactorTempSecret) {
    const { valid } = await verifyTotp({ secret: user.twoFactorTempSecret, token: code });
    if (!valid) {
      throw new AppError('Invalid code — please check your authenticator app and try again', 400, 'INVALID_2FA_CODE');
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'authenticator_app',
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorTempSecret: null,
      },
    });
    return;
  }

  if (user.twoFactorPendingPhone) {
    if (!isSmsCodeValid(user, code)) {
      throw new AppError('Invalid code — please check your text messages and try again', 400, 'INVALID_2FA_CODE');
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'sms',
        twoFactorPhone: user.twoFactorPendingPhone,
        twoFactorPendingPhone: null,
        twoFactorPendingCode: null,
        twoFactorPendingCodeExpires: null,
      },
    });
    return;
  }

  throw new AppError('No pending two-factor setup. Call enable first.', 400, 'TWO_FACTOR_SETUP_NOT_STARTED');
}

async function disableTwoFactor(userId, currentPassword, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user.passwordHash) {
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('Current password is incorrect', 401, 'INCORRECT_PASSWORD');
    }
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 400, 'TWO_FACTOR_NOT_ENABLED');
  }

  if (!code) {
    if (user.twoFactorMethod === 'sms') {
      await issueSmsTwoFactorCode(userId, user.twoFactorPhone);
    }
    return { codeRequired: true, method: user.twoFactorMethod };
  }

  const validCode =
    user.twoFactorMethod === 'sms'
      ? isSmsCodeValid(user, code)
      : (await verifyTotp({ secret: user.twoFactorSecret, token: code })).valid;

  if (!validCode) {
    throw new AppError(
      'Invalid code — please enter a valid 2FA code to disable two-factor authentication',
      401,
      'INVALID_2FA_CODE'
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
      twoFactorTempSecret: null,
      twoFactorPhone: null,
      twoFactorPendingPhone: null,
      twoFactorPendingCode: null,
      twoFactorPendingCodeExpires: null,
    },
  });

  await sendSecurityAlertEmail(
    user.email,
    'Two-factor authentication disabled',
    'Two-factor authentication was just disabled on your Kit Loop account. If this was not you, contact support immediately.'
  ).catch((err) => console.error('Failed to send 2FA-disabled security email', err));

  return { codeRequired: false };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateJWT,
  signupWithEmail,
  loginWithEmail,
  verifyGoogleToken,
  verifyAppleToken,
  loginOrSignupWithSocial,
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  listSessions,
  revokeSession,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  sanitizeUser,
};
