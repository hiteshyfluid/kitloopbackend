const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const paymentService = require('../services/paymentService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const paginationSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
});

const addCardSchema = z.object({
  payment_method_id: z.string().min(1, 'payment_method_id is required'),
});

const bankAccountSchema = z.object({
  bank_account_token: z.string().min(1, 'bank_account_token is required'),
});

// GET /api/payments/balance
const getSellerBalance = catchAsync(async (req, res) => {
  const balance = await paymentService.getSellerBalance(req.user.id);
  sendSuccess(res, 200, { balance });
});

// GET /api/payments/transactions
const getTransactionHistory = catchAsync(async (req, res) => {
  const { page, page_size } = validate(paginationSchema, req.query);
  const result = await paymentService.getTransactionHistory(req.user.id, {
    page,
    pageSize: page_size,
  });
  sendSuccess(res, 200, result);
});

// POST /api/payments/payout
const requestPayout = catchAsync(async (req, res) => {
  const result = await paymentService.requestPayout(req.user.id);
  sendSuccess(res, 200, result);
});

// GET /api/payments/cards
const getSavedCards = catchAsync(async (req, res) => {
  const result = await paymentService.getSavedCards(req.user.id);
  sendSuccess(res, 200, result);
});

// POST /api/payments/cards
const addCard = catchAsync(async (req, res) => {
  const { payment_method_id } = validate(addCardSchema, req.body);
  const card = await paymentService.addCard(req.user.id, payment_method_id);
  sendSuccess(res, 201, { card });
});

// DELETE /api/payments/cards/:payment_method_id
const removeCard = catchAsync(async (req, res) => {
  const result = await paymentService.removeCard(req.user.id, req.params.payment_method_id);
  sendSuccess(res, 200, result);
});

// POST /api/payments/bank-account
const addBankAccount = catchAsync(async (req, res) => {
  const { bank_account_token } = validate(bankAccountSchema, req.body);
  const result = await paymentService.addBankAccount(req.user.id, bank_account_token);
  sendSuccess(res, 201, result);
});

// DELETE /api/payments/bank-account
const removeBankAccount = catchAsync(async (req, res) => {
  const result = await paymentService.removeBankAccount(req.user.id);
  sendSuccess(res, 200, result);
});

module.exports = {
  getSellerBalance,
  getTransactionHistory,
  requestPayout,
  getSavedCards,
  addCard,
  removeCard,
  addBankAccount,
  removeBankAccount,
};
