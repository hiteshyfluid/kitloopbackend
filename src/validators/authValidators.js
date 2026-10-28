const { z } = require('zod');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character')
  .max(72)
  .regex(/[A-Z]/, 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character')
  .regex(/[0-9]/, 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character')
  .regex(/[^A-Za-z0-9]/, 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character');

const signupSchema = z.object({
  email: z.string().trim().email(),
  password,
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 30 characters')
    .max(30, 'Username must be between 3 and 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Please enter your password'),
  code: z.string().trim().optional(),
});

const googleSchema = z.object({
  google_id_token: z.string().min(1, 'google_id_token is required'),
});

const appleSchema = z.object({
  apple_identity_token: z.string().min(1, 'apple_identity_token is required'),
  apple_user_id: z.string().trim().optional(),
  display_name: z.string().trim().optional(),
});

const emailSchema = z.object({
  email: z.string().trim().email(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'token is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'token is required'),
  new_password: password,
});

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'current_password is required'),
    new_password: password,
    confirm_password: z.string().min(1, 'confirm_password is required'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const twoFactorEnableSchema = z
  .object({
    method: z.enum(['authenticator_app', 'sms']),
    phone_number: z.string().trim().optional(),
  })
  .refine((data) => data.method !== 'sms' || !!data.phone_number, {
    message: 'Please enter a valid UK mobile number',
    path: ['phone_number'],
  });

const twoFactorCodeSchema = z.object({
  code: z.string().trim().min(6).max(8),
});

const twoFactorDisableSchema = z.object({
  current_password: z.string().min(1, 'current_password is required'),
  code: z.string().trim().optional(),
});

module.exports = {
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
};
