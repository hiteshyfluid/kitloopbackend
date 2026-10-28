'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/integrationSettingsController');

const router = Router();

router.get('/public', ctrl.publicConfig);

module.exports = router;
