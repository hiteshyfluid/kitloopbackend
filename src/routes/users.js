const express    = require('express');
const requireAuth = require('../middleware/auth');
const userCtrl   = require('../controllers/userController');

const router = express.Router();

// Static own-user routes — must come before /:id to avoid shadowing
router.get('/profile',                    requireAuth, userCtrl.getOwnProfile);
router.put('/profile',                    requireAuth, userCtrl.updateProfile);
router.put('/settings/notifications',     requireAuth, userCtrl.updateNotificationSettings);
router.put('/settings/privacy',           requireAuth, userCtrl.updatePrivacySettings);
router.put('/settings/postage',           requireAuth, userCtrl.updatePostageSettings);
router.put('/holiday-mode',               requireAuth, userCtrl.toggleHolidayMode);
router.get('/balance',                    requireAuth, userCtrl.getBalance);
router.delete('/account',                 requireAuth, userCtrl.requestAccountDeletion);

// Public profile routes
router.get('/:id/profile',                userCtrl.getPublicProfile);
router.get('/:id/reviews',                userCtrl.getSellerReviews);

module.exports = router;
