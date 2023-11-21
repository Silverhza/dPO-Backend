const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

const profileUpload = multer({
  limits: 500000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profile');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + '.' + ext);
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      console.log(MIME_TYPE_MAP[file.mimetype]);
      cb(error, isValid);
    },
  }),
});

module.exports = profileUpload;
