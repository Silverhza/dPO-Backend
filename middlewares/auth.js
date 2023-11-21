const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const factoryHandler = require('../controllers/factory-controller');
dotenv.config();

const HttpError = require('../helpers/http-error');

module.exports = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  let token = req.cookies.access_token;

  // If no token in cookies, check the Authorization header for Bearer token
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization.split(' '); // Splitting by space
    if (authHeader[0].toLowerCase() === 'bearer') {
      token = authHeader[1];
    }
  }
  if (!token) {
    return next(new HttpError('Authentication failed', 401));
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    req.role = decodedToken.role;
    next();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Authentication failed', 401));
  }
};
