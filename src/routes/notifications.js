const express     = require('express');
const requireAuth  = require('../middleware/auth');
const notifCtrl   = require('../controllers/notificationController');

const router = express.Router();

// Static route before /:id to prevent "read-all" being caught by /:id/read
router.patch('/read-all',    requireAuth, notifCtrl.markAllRead);

router.get('/',              requireAuth, notifCtrl.getNotifications);
router.patch('/:id/read',   requireAuth, notifCtrl.markRead);

module.exports = router;
