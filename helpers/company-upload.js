const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

const companyUpload = multer({
  limits: 500000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'company_profile') {
        cb(null, 'uploads/company');
      } else {
        cb(null, 'uploads/policy');
      }
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

module.exports = companyUpload;
