'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { requireSuperAdmin } = require('../middleware/requireRole');
const ctrl = require('../controllers/integrationSettingsController');

const router = Router();

const limited = (windowMs, max) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: { success: false, error: 'Too many requests — please try again shortly.', code: 'RATE_LIMITED' },
});

const settingsLimiter = limited(15 * 60 * 1000, 60);
const testLimiter     = limited(60 * 1000, 5);

// Super admin only. Mounted at /api/admin/settings/integrations, before the
// general admin router.
router.use(requireSuperAdmin, settingsLimiter, (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/',                 ctrl.list);
router.put('/:provider/mode',   ctrl.setMode);
router.post('/:provider/test',  testLimiter, ctrl.testConnection);
router.put('/:provider',        ctrl.update);

module.exports = router;
