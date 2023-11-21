const { validationResult } = require('express-validator');

const factoryHandler = require('./factory-controller');
const HttpError = require('../helpers/http-error');
const User = require('../models/user');
const Space = require('../models/space');
const getCoordsOfAddress = require('../helpers/location');

const addSpace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid data received', 422));
  }

  if (!req.files) {
    return next(new HttpError('Space images are required', 422));
  }

  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  let addressCoords;
  try {
    addressCoords = await getCoordsOfAddress(req.body.address);
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  const imagesPath = req.files.map((spaceFile) => spaceFile.path);

  const newSpace = new Space({
    ...req.body,
    userId: req.userId,
    location: {
      type: 'Point',
      coordinates: [addressCoords.lng, addressCoords.lat],
      address: req.body.address,
    },
    images: imagesPath,
  });

  try {
    await newSpace.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error saving space', 500));
  }

  res.status(201).json({ message: 'Space uploaded successfully' });
};

const getSpaces = async (req, res, next) => {
  let existingSpaces;
  try {
    existingSpaces = await factoryHandler.getAllResults(Space);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  res.json({ spaces: existingSpaces });
};

exports.addSpace = addSpace;
exports.getSpaces = getSpaces;
