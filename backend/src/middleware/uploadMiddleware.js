const multer = require('multer');

// Configure Multer to use memory storage since we will stream the buffer to Cloudinary
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
  // Accepted MIME types for both images and videos
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP, MP4, WEBM, and QuickTime videos are allowed.'), false);
  }
};

// Configure limits and export the middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size to accommodate videos
  },
});

module.exports = upload;
