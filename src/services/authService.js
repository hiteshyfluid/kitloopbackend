const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { UAParser } = require('ua-parser-js');
const { generateSecret: generateTotpSecret, generateURI: generateTotpURI, verify: verifyTotp } = require('otplib');
const qrcode = require('qrcode');

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const emailTemplates = require('../templates/emailTemplates');
const { sendEmail, getEmailLogoUrl, clientUrl } = require('./emailService');

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const EMAIL_OTP_EXPIRY_MS = 10 * 60 * 1000;
const EMAIL_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_EMAIL_OTP_ATTEMPTS = 5;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const SMS_CODE_EXPIRY_MS = 10 * 60 * 1000;
const TWO_FACTOR_ISSUER = 'The Kit Loop';

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
  return String(crypto.randomInt(100000, 1000000));
}

// Salted with the user id so a 6-digit code can never be looked up on its own
// (e.g. through the legacy ?token= link endpoint) across every account.
function hashEmailCode(userId, code) {
  return hashToken(`${userId}:${code}`);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// Wrong-code attempts per user, reset whenever a new code is issued. In memory
// is enough: a restart only gives an attacker 5 more guesses at a 1-in-a-million
// code that expires in 10 minutes, and the route is IP rate-limited as well.
const emailOtpAttempts = new Map();

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

// Dev-only fallback — wire up a real SMS provider (e.g. Twilio) before production.
async function sendSms({ to, body }) {
  console.log(`[sms:dev] To: ${to} | ${body}`);
}

async function sendVerificationEmail(user, code) {
  const params = new URLSearchParams({ email: user.email, code });
  const message = emailTemplates.verificationEmail({
    name: user.displayName || user.username,
    code,
    verifyUrl: `${clientUrl()}/verify-email?${params}`,
    expiresInMinutes: EMAIL_OTP_EXPIRY_MS / 60000,
    logoUrl: await getEmailLogoUrl(),
  });
  await sendEmail({ to: user.email, ...message });
}

async function sendPasswordResetEmail(user, token) {
  const message = emailTemplates.passwordResetEmail({
    name: user.displayName || user.username,
    resetUrl: `${clientUrl()}/reset-password?token=${token}`,
    expiresInMinutes: PASSWORD_RESET_EXPIRY_MS / 60000,
    logoUrl: await getEmailLogoUrl(),
  });
  await sendEmail({ to: user.email, ...message });
}

async function sendSecurityAlertEmail(email, subject, body) {
  const message = emailTemplates.securityAlertEmail({ subject, body, logoUrl: await getEmailLogoUrl() });
  await sendEmail({ to: email, ...message });
}

// Stores a fresh 6-digit code (replacing any earlier one) and emails it.
async function issueEmailVerificationCode(user) {
  const code = generateNumericCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashEmailCode(user.id, code),
      emailVerificationExpires: new Date(Date.now() + EMAIL_OTP_EXPIRY_MS),
    },
  });
  emailOtpAttempts.delete(user.id);
  await sendVerificationEmail(user, code);
}

// A code was sent less than a minute ago — don't flood the inbox
function isWithinResendCooldown(user) {
  if (!user.emailVerificationExpires) return false;
  const issuedAt = user.emailVerificationExpires.getTime() - EMAIL_OTP_EXPIRY_MS;
  return Date.now() - issuedAt < EMAIL_OTP_RESEND_COOLDOWN_MS;
}

// ─── Signup / Login (email) ───

async function signupWithEmail(email, password, username) {
  email = normalizeEmail(email);
  username = username.trim();

  const [emailOwner, usernameOwner] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  // Signed up before but never entered the code — nobody has proven they own
  // this inbox yet, so let them start over rather than locking the email out.
  const resumable = emailOwner
    && !emailOwner.emailVerified
    && emailOwner.authProvider === 'email'
    && !emailOwner.deletedAt;

  if (emailOwner && !resumable) {
    throw new AppError('An account with this email already exists — log in instead', 409, 'EMAIL_EXISTS');
  }
  if (usernameOwner && usernameOwner.id !== emailOwner?.id) {
    throw new AppError('This username is already taken', 409, 'USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(password);

  const user = resumable
    ? await prisma.user.update({
        where: { id: emailOwner.id },
        data: { username, displayName: username, passwordHash },
      })
    : await prisma.user.create({
        data: {
          email,
          username,
          displayName: username,
          authProvider: 'email',
          passwordHash,
          emailVerified: false,
        },
      });

  // A code that went out moments ago is still valid — don't send a second one
  if (resumable && isWithinResendCooldown(emailOwner)) {
    return sanitizeUser(user);
  }

  // The account exists now either way. If the mail provider hiccups, the user
  // can still hit "Resend code" instead of being stuck with EMAIL_EXISTS.
  await issueEmailVerificationCode(user).catch((err) =>
    console.error('[auth] Failed to send verification code on signup:', err.message)
  );

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
      'The Kit Loop security alert: account locked',
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

  // Password is right but the address was never confirmed — send a code
  // (unless one just went out) and let the client show the code screen.
  if (!user.emailVerified && user.authProvider === 'email') {
    if (!isWithinResendCooldown(user)) {
      await issueEmailVerificationCode(user).catch((err) =>
        console.error('[auth] Failed to send verification code on login:', err.message)
      );
    }
    throw new AppError(
      'Please verify your email — we’ve sent a 6-digit code to your inbox.',
      403,
      'EMAIL_NOT_VERIFIED',
      { email: user.email }
    );
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

// Checks a 6-digit code and, on success, signs the user straight in.
async function verifyEmailCode(email, code, meta = {}) {
  email = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.deletedAt) {
    throw new AppError('That code isn’t right — check it and try again', 400, 'CODE_INVALID');
  }
  if (user.emailVerified) {
    throw new AppError('This email is already verified — please log in', 400, 'ALREADY_VERIFIED');
  }
  if (!user.emailVerificationToken || !user.emailVerificationExpires) {
    throw new AppError('This code is no longer valid — request a new one', 400, 'CODE_EXPIRED');
  }
  if (user.emailVerificationExpires < new Date()) {
    throw new AppError('This code has expired — request a new one', 400, 'CODE_EXPIRED');
  }

  if (!safeEqual(user.emailVerificationToken, hashEmailCode(user.id, code))) {
    const attempts = (emailOtpAttempts.get(user.id) || 0) + 1;
    if (attempts >= MAX_EMAIL_OTP_ATTEMPTS) {
      emailOtpAttempts.delete(user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken: null, emailVerificationExpires: null },
      });
      throw new AppError('Too many incorrect attempts — request a new code', 429, 'CODE_LOCKED');
    }
    emailOtpAttempts.set(user.id, attempts);
    const left = MAX_EMAIL_OTP_ATTEMPTS - attempts;
    throw new AppError(
      `That code isn’t right — ${left} attempt${left === 1 ? '' : 's'} left`,
      400,
      'CODE_INVALID'
    );
  }

  emailOtpAttempts.delete(user.id);

  if (user.accountStatus !== 'active') {
    throw buildInactiveAccountError(user);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      lastActiveAt: new Date(),
    },
  });

  const { token, session } = await createSession(updated.id, meta);
  return { user: sanitizeUser(updated), token, session: { id: session.id, expiresAt: session.expiresAt } };
}

// Legacy ?token= links from emails sent before the switch to 6-digit codes.
async function verifyEmail(token) {
  if (!/^[0-9a-f]{64}$/i.test(token)) {
    throw new AppError('This verification link is invalid', 400, 'TOKEN_INVALID');
  }
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

  // Silent no-op for unknown/verified addresses so this can't be used to probe accounts
  if (user && !user.emailVerified && user.authProvider === 'email' && !isWithinResendCooldown(user)) {
    await issueEmailVerificationCode(user);
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
    await sendPasswordResetEmail(user, resetToken);
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
    'Your password for The Kit Loop was changed',
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
    'A session on The Kit Loop was revoked',
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
  await sendSms({ to: phone, body: `Your verification code for The Kit Loop is ${code}. It expires in 10 minutes.` });
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
    'Two-factor authentication was just disabled on your account with The Kit Loop. If this was not you, contact support immediately.'
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
  verifyEmailCode,
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
