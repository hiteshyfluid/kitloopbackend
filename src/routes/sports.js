const express = require('express');

const cacheControl = require('../middleware/cacheControl');
const sportsController = require('../controllers/sportsController');

const router = express.Router();

router.get('/', cacheControl(300), sportsController.getSports);
router.get('/:sport_id/sub-categories', cacheControl(300), sportsController.getSubCategories);
router.get('/:sport_id/sub-categories/:sub_category_id/variant-options', cacheControl(300), sportsController.getVariantOptions);

module.exports = router;
