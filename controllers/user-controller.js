const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const HttpError = require('../helpers/http-error');
const User = require('../models/user');
const CompanyProfile = require('../models/company-profile');
const Equipment = require('../models/equipment');
const PersonalInfo = require('../models/personal-info');
const Message = require('../models/message');
const factoryHandler = require('./factory-controller');
const sendEmail = require('../helpers/email');
const { generateOtp } = require('../helpers/sendOtp');

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  const { email } = req.body;
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResult(User, { email });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (existingUser) {
    return next(new HttpError('Email already registered', 401));
  }

  const otpDetails = await generateOtp();

  let customer;
  try {
    customer = await stripe.customers.create({
      description:
        'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error.message, 500));
  }

  const newUser = new User({
    ...req.body,
    otp: otpDetails.otpHash,
    otpExpiry: otpDetails.otpExpiry,
    customerId: customer.id,
  });

  try {
    await sendEmail({
      email: email,
      subject: 'Your Verify Account otp (valid for 10 mint)',
      message: `Your account OTP code is: ${otpDetails.rawOtp}`, // use raw otp here
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error sending email', 500));
  }

  try {
    newUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.log({ error });
    return next(new HttpError('Error creating new user', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: email, role: req.body.role },
      process.env.JWT_KEY,
      {
        expiresIn: process.env.JWT_EXPRISE_IN,
      }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(201)
    .json({ message: 'User registered successfully, verify your account' });
};

const userOtpVerify = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  const { email, otp } = req.body;

  const existingUser = await factoryHandler.getOneResult(User, { email });

  if (!existingUser) {
    return next(new HttpError('Invalid email', 404));
  }

  if (!(await existingUser.verifyOtp(otp, existingUser.otp))) {
    return next(new HttpError('Incorrect OTP', 422));
  }

  if (existingUser.otpExpiry < Date.now()) {
    return next(new HttpError('OTP expired', 422));
  }

  existingUser.verified = true;
  existingUser.otp = undefined; // clear the OTP after verification
  existingUser.otpExpiry = undefined; // clear the OTP expiry after verification

  try {
    await existingUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.log({ error });
    return next(new HttpError('Error verifying user', 500));
  }

  res.json({ message: 'OTP verification successful' });
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid email!', 404);
    return next(error);
  }

  if (!existingUser.active) {
    return next(new HttpError('Your account is not active', 401));
  }

  if (!existingUser.verified) {
    return next(new HttpError('Your account is not verified', 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      401
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid password!', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
    console.log(token);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        active: existingUser.active,
        role: existingUser.role,
        verified: existingUser.verified,
        token: token,
      },
    });
};

const userLogout = async (req, res, next) => {
  const uid = req.params.uid;

  if (req.userId !== uid) {
    return next(new HttpError('Authentication failed', 401));
  }

  res.clearCookie('access_token').status(200).json({ message: 'User logout successful' });
};

const updateUserData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  let existingUser;
  try {
    existingUser = await User.findByIdAndUpdate(req.params.userId, req.body);
  } catch (error) {
    return next(new HttpError('Error updating user data', 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found', 404));
  }

  res.json({ message: 'User data saved successfully' });
};

const companyProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  if (!req.files.company_profile) {
    return next(new HttpError('Company profile image is required', 403));
  }

  if (!req.files.policy_doc) {
    return next(new HttpError('Insurance doc is required', 403));
  }

  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found!', 404));
  }

  const newCompanyProfile = new CompanyProfile({
    ...req.body,
    userId: req.userId,
    companyPic: req.files.company_profile[0].path,
    insuranceDoc: req.files.policy_doc[0].path,
  });

  try {
    await newCompanyProfile.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error saving details', 500));
  }

  res.status(201).json({ message: 'Company profile saved successfully' });
};

const addEquipment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found!', 404));
  }

  const newEquipment = new Equipment({
    ...req.body,
    userId: req.userId,
  });

  try {
    await newEquipment.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error saving details', 500));
  }

  res.status(201).json({ message: 'Equipment details saved successfully' });
};

const addPersonalInfo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  if (!req.file) {
    return next(new HttpError('Profile image is required', 403));
  }

  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found!', 404));
  }

  const newPersonalInfo = new PersonalInfo({
    ...req.body,
    profilePic: req.file.path,
    userId: req.userId,
  });

  try {
    await newPersonalInfo.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding personal info!', 500));
  }

  res.status(201).json({ message: 'Personal info added successfully' });
};

const addUserCard = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching user', 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found', 404));
  }

  let token;
  try {
    token = await stripe.tokens.create({
      card: {
        number: req.body.cardNo,
        exp_month: req.body.expMonth,
        exp_year: req.body.expYear,
        cvc: req.body.cvc,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error creating token', 500));
  }

  let card;
  try {
    card = await stripe.customers.createSource(existingUser.customerId, {
      source: token.id,
    });
  } catch (error) {
    console.log(error.message);
    return next(new HttpError('Cannot save card', 500));
  }

  res.status(201).json({ message: 'User card saved successfully' });
};

const getUserCards = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching user', 500));
  }

  if (!existingUser) {
    return next(new HttpError('No user found', 404));
  }

  let cards;
  try {
    cards = await stripe.customers.listSources(existingUser.customerId, { object: 'card' });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching cards', 500));
  }

  res.json({ cards });
};

const searchUserInChat = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching user', 500));
  }
  if (!existingUser) {
    return next(new HttpError('No user found', 404));
  }
  try {
    const query = req.query.query;
    const currentUserId = req.userId;

    // Find the current user and their connections
    const currentUser = await User.findById(currentUserId).populate('connections.user');

    // Filter connected users based on the search query
    const matchedUsers = currentUser.connections
      .map((connection) => connection.user)
      .filter((user) => {
        return (
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      });

    return res.status(200).json({ users: matchedUsers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getUserConversations = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching user', 500));
  }
  if (!existingUser) {
    return next(new HttpError('No user found', 404));
  }

  const userId = req.userId;

  let messages;
  try {
    messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate('sender receiver'); // Populating to get details of sender and receiver
  } catch (error) {
    console.log(error);
    return next(new HttpError('Fetching messages failed, please try again later.', 500));
  }

  if (!messages || messages.length === 0) {
    return next(new HttpError('No messages found.', 404));
  }

  // Grouping messages by the other party (either sender or receiver)
  const conversations = {};
  for (let msg of messages) {
    const otherUserId =
      msg.sender && msg.sender._id.toString() === userId
        ? msg.receiver
          ? msg.receiver._id.toString()
          : null
        : msg.sender
        ? msg.sender._id.toString()
        : null;
    if (!conversations[otherUserId]) {
      conversations[otherUserId] = [];
    }
    conversations[otherUserId].push(msg);
  }

  res.json({ conversations });
};

const getLoggedInUserDetails = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select('-password'); // Excluding the password field
  } catch (error) {
    console.log(error);
    return next(new HttpError('Fetching user failed, please try again later.', 500));
  }

  if (!user) {
    return next(new HttpError('User not found.', 404));
  }

  let userPersonalInfo;
  try {
    userPersonalInfo = await PersonalInfo.findOne({ userId: req.userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching personal info!', 500));
  }

  if (!userPersonalInfo) {
    return next(new HttpError('No personal info found for the user!', 404));
  }
  user.personalInfo = userPersonalInfo; //Adding the personalInfo field;

  res.json({ user }); // Send the user details including personalInfo as response
};

exports.registerUser = registerUser;
exports.userOtpVerify = userOtpVerify;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.updateUserData = updateUserData;
exports.companyProfile = companyProfile;
exports.addEquipment = addEquipment;
exports.addPersonalInfo = addPersonalInfo;
exports.addUserCard = addUserCard;
exports.getUserCards = getUserCards;
exports.searchUserInChat = searchUserInChat;
exports.getUserConversations = getUserConversations;
exports.getLoggedInUserDetails = getLoggedInUserDetails;
