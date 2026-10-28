const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function streamUpload(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function uploadPhoto(file) {
  const result = await streamUpload(file.buffer, {
    folder: 'kit-loop/listings/photos',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return result.secure_url;
}

async function uploadVideo(file) {
  const result = await streamUpload(file.buffer, {
    folder: 'kit-loop/listings/videos',
    resource_type: 'video',
    allowed_formats: ['mp4'],
  });
  return result.secure_url;
}

// Transforms a Cloudinary image URL to a 1200×630 Open Graph crop.
// Uses URL-based transformations — no re-upload needed.
function generateOgImage(photoUrl) {
  const marker = '/upload/';
  const idx = photoUrl.indexOf(marker);
  if (idx === -1) return photoUrl;
  const base = photoUrl.slice(0, idx + marker.length);
  const rest = photoUrl.slice(idx + marker.length).replace(/\.[^.]+$/, '');
  return `${base}c_fill,w_1200,h_630,g_auto,q_auto,f_auto/${rest}.jpg`;
}

module.exports = { uploadPhoto, uploadVideo, generateOgImage };
