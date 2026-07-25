const express = require('express');
const requireAuth = require('../middleware/auth');
const { handlePhotoUpload, handleVideoUpload } = require('../controllers/uploadController');

const router = express.Router();

router.post('/photo', requireAuth, ...handlePhotoUpload);
router.post('/video', requireAuth, ...handleVideoUpload);

module.exports = router;
