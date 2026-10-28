const multer = require('multer');

const PHOTO_MAX_SIZE = 10 * 1024 * 1024; // 10MB per photo
const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB for video

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: VIDEO_MAX_SIZE, files: 11 }, // 10 photos + 1 video
  fileFilter(req, file, cb) {
    if (file.fieldname === 'photos') {
      if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) return cb(null, true);
      return cb(Object.assign(new Error('Photos must be JPG or PNG'), { code: 'INVALID_FILE_TYPE' }), false);
    }
    if (file.fieldname === 'video') {
      if (file.mimetype === 'video/mp4') return cb(null, true);
      return cb(Object.assign(new Error('Video must be MP4'), { code: 'INVALID_FILE_TYPE' }), false);
    }
    cb(Object.assign(new Error('Unexpected field name'), { code: 'UNEXPECTED_FIELD' }), false);
  },
}).fields([
  { name: 'photos', maxCount: 10 },
  { name: 'video', maxCount: 1 },
]);

function listingUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
        code: err.code || (err instanceof multer.MulterError ? 'UPLOAD_ERROR' : 'UPLOAD_ERROR'),
      });
    }

    // Enforce per-photo 10MB limit (global limit is set to 50MB for video)
    const photos = req.files?.photos || [];
    const oversized = photos.find((f) => f.size > PHOTO_MAX_SIZE);
    if (oversized) {
      return res.status(400).json({ success: false, error: 'Each photo must be under 10MB', code: 'PHOTO_TOO_LARGE' });
    }

    next();
  });
}

module.exports = listingUpload;
