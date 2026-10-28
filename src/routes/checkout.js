const express = require('express');
const requireAuth = require('../middleware/auth');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

router.post('/initiate',                          requireAuth, checkoutController.initiateCheckout);
router.post('/cart/initiate',                     requireAuth, checkoutController.initiateCartCheckout);
router.get('/:session_id',                        requireAuth, checkoutController.getCheckoutSession);
router.post('/:session_id/address',               requireAuth, checkoutController.submitAddress);
router.post('/:session_id/payment-intent',        requireAuth, checkoutController.createPaymentIntent);
router.post('/:session_id/confirm',               requireAuth, checkoutController.confirmOrder);

module.exports = router;
