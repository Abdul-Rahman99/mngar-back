const multer = require('multer');
const fs = require('fs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, 'uploads/'); // Specify the destination directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Define the filename (timestamp + original filename)
  },
});

const uploadProfilePictureMiddleware = multer({ storage: storage }).single('image');

module.exports = { uploadProfilePictureMiddleware };