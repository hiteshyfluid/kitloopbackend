const express = require('express');
const requireAuth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/balance',                              requireAuth, paymentController.getSellerBalance);
router.get('/transactions',                         requireAuth, paymentController.getTransactionHistory);
router.post('/payout',                              requireAuth, paymentController.requestPayout);

router.get('/cards',                                requireAuth, paymentController.getSavedCards);
router.post('/cards',                               requireAuth, paymentController.addCard);
router.delete('/cards/:payment_method_id',          requireAuth, paymentController.removeCard);

router.post('/bank-account',                        requireAuth, paymentController.addBankAccount);
router.delete('/bank-account',                      requireAuth, paymentController.removeBankAccount);

module.exports = router;
