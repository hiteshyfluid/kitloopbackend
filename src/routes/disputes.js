const express = require('express');
const requireAuth = require('../middleware/auth');
const disputeController = require('../controllers/disputeController');

const router = express.Router();

router.get('/:id',          requireAuth, disputeController.getDisputeDetail);
router.post('/:id/respond', requireAuth, disputeController.submitSellerResponse);

module.exports = router;
