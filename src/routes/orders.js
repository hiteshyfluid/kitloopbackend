const express = require('express');
const requireAuth = require('../middleware/auth');
const orderController   = require('../controllers/orderController');
const disputeController = require('../controllers/disputeController');
const reviewController  = require('../controllers/reviewController');

const router = express.Router();

// Static routes before parameterised /:id to prevent "purchases"/"sales" being
// matched as an order ID.
router.get('/purchases',               requireAuth, orderController.getMyPurchases);
router.get('/sales',                   requireAuth, orderController.getMySales);

router.get('/:id',                     requireAuth, orderController.getOrder);
router.post('/:id/dispatch',           requireAuth, orderController.dispatchOrder);
router.post('/:id/confirm-delivery',   requireAuth, orderController.confirmDelivery);
router.post('/:id/dispute',            requireAuth, disputeController.raiseDispute);
router.post('/:id/review',             requireAuth, reviewController.submitReview);

module.exports = router;
