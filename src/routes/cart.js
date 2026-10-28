const express = require('express');
const requireAuth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/',              requireAuth, cartController.getCart);
router.post('/',             requireAuth, cartController.addItem);
router.delete('/',           requireAuth, cartController.clearCart);
router.delete('/:listing_id', requireAuth, cartController.removeItem);

module.exports = router;
