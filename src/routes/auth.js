const express = require('express');
const rateLimit = require('express-rate-limit');

const requireAuth = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
});

// Public routes
router.post('/signup/email', authLimiter, authController.signupEmail);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/apple', authLimiter, authController.appleAuth);
router.post('/login/email', authLimiter, authController.loginEmail);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Authenticated routes
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);
router.get('/sessions', requireAuth, authController.getSessions);
router.delete('/sessions/:session_id', requireAuth, authController.deleteSession);
router.post('/2fa/enable', requireAuth, authController.enableTwoFactor);
router.post('/2fa/confirm', requireAuth, authController.confirmTwoFactor);
router.post('/2fa/disable', requireAuth, authController.disableTwoFactor);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
