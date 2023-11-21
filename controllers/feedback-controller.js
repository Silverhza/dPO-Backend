const Feedback = require('../models/feedback');
const factoryHandler = require('./factory-controller');
const User = require('../models/user');

exports.createFeedback = async (req, res) => {
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
  try {
    const { subject, details } = req.body;

    const feedback = new Feedback({
      subject,
      details,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback successfully created',
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
