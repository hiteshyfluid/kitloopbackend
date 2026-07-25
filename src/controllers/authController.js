const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const {
  signupSchema,
  loginSchema,
  googleSchema,
  appleSchema,
  emailSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  changePasswordSchema,
  twoFactorEnableSchema,
  twoFactorCodeSchema,
  twoFactorDisableSchema,
} = require('../validators/authValidators');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request body', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

function getRequestMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || null,
    ipAddress: req.ip || req.socket?.remoteAddress || null,
  };
}

// POST /auth/signup/email
const signupEmail = catchAsync(async (req, res) => {
  const { email, password, username } = validate(signupSchema, req.body);
  const user = await authService.signupWithEmail(email, password, username);
  sendSuccess(res, 201, {
    user: { id: user.id, email: user.email, username: user.username, emailVerified: user.emailVerified, role: user.role },
    message: 'Verification email sent. Please verify your email to start buying or selling.',
  });
});

// GET /auth/verify-email
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = validate(verifyEmailSchema, req.query);
  const user = await authService.verifyEmail(token);
  sendSuccess(res, 200, { message: 'Email verified successfully.', user });
});

// POST /auth/resend-verification
const resendVerification = catchAsync(async (req, res) => {
  const { email } = validate(emailSchema, req.body);
  await authService.resendVerificationEmail(email);
  sendSuccess(res, 200, { message: 'Verification email resent.' });
});

// POST /auth/google
const googleAuth = catchAsync(async (req, res) => {
  const { google_id_token: googleIdToken } = validate(googleSchema, req.body);
  const profile = await authService.verifyGoogleToken(googleIdToken);
  const { user, token, isNewUser } = await authService.loginOrSignupWithSocial(
    { ...profile, provider: 'google' },
    getRequestMeta(req)
  );
  sendSuccess(res, isNewUser ? 201 : 200, { isNewUser, token, user });
});

// POST /auth/apple
const appleAuth = catchAsync(async (req, res) => {
  const {
    apple_identity_token: appleIdentityToken,
    display_name: displayName,
  } = validate(appleSchema, req.body);
  const profile = await authService.verifyAppleToken(appleIdentityToken);
  const { user, token, isNewUser } = await authService.loginOrSignupWithSocial(
    { ...profile, name: displayName, provider: 'apple' },
    getRequestMeta(req)
  );
  sendSuccess(res, isNewUser ? 201 : 200, { isNewUser, token, user });
});

// POST /auth/login/email
const loginEmail = catchAsync(async (req, res) => {
  const { email, password, code } = validate(loginSchema, req.body);
  const result = await authService.loginWithEmail(email, password, code, getRequestMeta(req));

  if (result.twoFactorRequired) {
    return sendSuccess(res, 200, {
      twoFactorRequired: true,
      method: result.method,
      message: 'Two-factor authentication code required.',
    });
  }

  sendSuccess(res, 200, { token: result.token, user: result.user });
});

// POST /auth/forgot-password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = validate(emailSchema, req.body);
  await authService.forgotPassword(email);
  sendSuccess(res, 200, { message: 'If an account exists with this email, a reset link has been sent.' });
});

// POST /auth/reset-password
const resetPassword = catchAsync(async (req, res) => {
  const { token, new_password: newPassword } = validate(resetPasswordSchema, req.body);
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, 200, { message: 'Password updated. Please log in with your new password.' });
});

// GET /auth/me
const me = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { user: authService.sanitizeUser(req.user) });
});

// POST /auth/logout
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.sessionId);
  sendSuccess(res, 200, { message: 'Logged out successfully.' });
});

// GET /auth/sessions
const getSessions = catchAsync(async (req, res) => {
  const sessions = await authService.listSessions(req.user.id, req.sessionId);
  sendSuccess(res, 200, { sessions });
});

// DELETE /auth/sessions/:session_id
const deleteSession = catchAsync(async (req, res) => {
  await authService.revokeSession(req.user.id, req.params.session_id);
  sendSuccess(res, 200, { message: 'Session revoked.' });
});

// POST /auth/2fa/enable
const enableTwoFactor = catchAsync(async (req, res) => {
  const { method, phone_number: phoneNumber } = validate(twoFactorEnableSchema, req.body);
  const result = await authService.enableTwoFactor(req.user.id, req.user.email, method, phoneNumber);
  sendSuccess(res, 200, result);
});

// POST /auth/2fa/confirm
const confirmTwoFactor = catchAsync(async (req, res) => {
  const { code } = validate(twoFactorCodeSchema, req.body);
  await authService.confirmTwoFactor(req.user.id, code);
  sendSuccess(res, 200, { twoFactorEnabled: true });
});

// POST /auth/2fa/disable
const disableTwoFactor = catchAsync(async (req, res) => {
  const { current_password: currentPassword, code } = validate(twoFactorDisableSchema, req.body);
  const result = await authService.disableTwoFactor(req.user.id, currentPassword, code);
  sendSuccess(res, 200, { twoFactorEnabled: result.codeRequired ? undefined : false, ...result });
});

// POST /auth/change-password
const changePassword = catchAsync(async (req, res) => {
  const {
    current_password: currentPassword,
    new_password: newPassword,
  } = validate(changePasswordSchema, req.body);
  await authService.changePassword(req.user.id, currentPassword, newPassword, req.sessionId);
  sendSuccess(res, 200, { message: 'Password updated successfully.' });
});

module.exports = {
  signupEmail,
  verifyEmail,
  resendVerification,
  googleAuth,
  appleAuth,
  loginEmail,
  forgotPassword,
  resetPassword,
  me,
  logout,
  getSessions,
  deleteSession,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  changePassword,
};
