const express = require('express');
const requireAuth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// GET /api/sellers/:id/reviews — mounted at /api/sellers
router.get('/:id/reviews', reviewController.getSellerReviews);

module.exports = router;
