const User = require('../models/user');
const CompanyProfile = require('../models/company-profile');
const PersonalInfo = require('../models/personal-info');
const factoryHandler = require('./factory-controller');
const HttpError = require('../helpers/http-error');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const overviewHeader = async (req, res, next) => {
  console.log('[*] overviewHeader', req.params);
  let { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError('No such user', 422));
    }
    const userCompany = await factoryHandler.getOneResult(CompanyProfile, { userId: user._id });
    const userPersonlInfo = await factoryHandler.getOneResult(PersonalInfo, { userId: user._id });

    return res.send({
      profilePic: userPersonlInfo?.profilePic,
      firstName: user.firstName,
      lastName: user.lastName,
      verified: user.verified,
      role: user.role,
      companyName: userCompany?.companyName,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
};

const overviewInfo = async (req, res) => {
  try {
    // Query user information
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('personalInfo')
      .exec();

    // Query user's personal info (already populated in previous step)
    const personalInfo = await factoryHandler.getOneResult(PersonalInfo, { userId: user._id });

    // Query user's connections
    const connections = user.connections.filter((connection) => connection.status === 'accepted');

    // Query user's bookings
    const bookings = await Booking.find({ renter: req.params.userId }).exec();

    // Fetch user card details from Stripe
    let cardInfo = {};
    if (user.customerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.customerId,
        type: 'card',
      });
      cardInfo = paymentMethods.data;
    }

    // Combine all the information to return
    const profileOverview = {
      userInfo: user,
      personalInfo: personalInfo,
      connections: connections,
      bookings: bookings,
      cardInfo: cardInfo,
    };

    res.json(profileOverview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while fetching profile overview.' });
  }
};

const getRenterProfile = async (req, res) => {
  try {
    // Query user information
    const user = await User.findById(req.params.userId);
    if (user.role != 'Renter') {
      return res.status(500).json({ message: 'User role must be Renter.' });
    }

    // Query user's personal info (already populated in previous step)
    const personalInfo = await factoryHandler.getOneResult(PersonalInfo, { userId: user._id });

    if (personalInfo == null) {
      return res.status(500).json({ message: 'User personalInfo is null.' });
    }

    // Query user's reviews
    const reviews = user.reviews;

    const contactInfo = {
      phone: personalInfo.phone,
      email: personalInfo.email,
      addr: personalInfo.street + ', ' + personalInfo.city + ', ' + personalInfo.state,
    };
    // Combine all the information to return
    const RenterProfile = {
      about: personalInfo.bio,
      contactInfo: contactInfo,
      reviews: reviews,
    };

    res.json(RenterProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while fetching renter profile.' });
  }
};

exports.overviewInfo = overviewInfo;
exports.overviewHeader = overviewHeader;
exports.getRenterProfile = getRenterProfile;
