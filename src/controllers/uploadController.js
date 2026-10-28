const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const photoMW = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only JPG, PNG, WEBP images accepted'), { code: 'INVALID_FILE_TYPE' }));
    }
  },
}).single('photo');

const videoMW = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') cb(null, true);
    else cb(Object.assign(new Error('Only MP4 video accepted'), { code: 'INVALID_FILE_TYPE' }));
  },
}).single('video');

function wrapMulter(mw) {
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
          code: err.code || 'UPLOAD_ERROR',
        });
      }
      next();
    });
  };
}

const uploadPhotoHandler = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No photo provided', 400, 'NO_PHOTO');
  const url = await cloudinaryService.uploadPhoto(req.file);
  sendSuccess(res, 200, { url });
});

const uploadVideoHandler = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No video provided', 400, 'NO_VIDEO');
  const url = await cloudinaryService.uploadVideo(req.file);
  sendSuccess(res, 200, { url });
});

module.exports = {
  handlePhotoUpload: [wrapMulter(photoMW), uploadPhotoHandler],
  handleVideoUpload: [wrapMulter(videoMW), uploadVideoHandler],
};
