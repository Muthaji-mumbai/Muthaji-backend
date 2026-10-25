const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tempUploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${uniqueSuffix}_${baseName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

module.exports = {
  upload
};

  