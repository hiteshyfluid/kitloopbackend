const express = require('express');

const requireAuth = require('../middleware/auth');
const cacheControl = require('../middleware/cacheControl');
const brandsController = require('../controllers/brandsController');

const router = express.Router();

router.get('/', cacheControl(300), brandsController.getBrands);
router.post('/', requireAuth, brandsController.createSellerBrand);

module.exports = router;
