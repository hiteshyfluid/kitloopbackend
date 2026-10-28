const express = require('express');

const cacheControl = require('../middleware/cacheControl');
const sportsController = require('../controllers/sportsController');

const router = express.Router();

router.get('/', cacheControl(300), sportsController.getSports);
router.get('/:sport_id/sub-categories', cacheControl(300), sportsController.getSubCategories);

module.exports = router;
