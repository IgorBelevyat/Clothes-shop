const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config.js'); 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: {
    folder: 'products', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] 
  },
});

const upload = multer({ storage: storage });

module.exports = upload;