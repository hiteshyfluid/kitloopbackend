const express = require('express');

const cacheControl = require('../middleware/cacheControl');
const brandsController = require('../controllers/brandsController');

const router = express.Router();

router.get('/', cacheControl(300), brandsController.getBrands);

module.exports = router;
