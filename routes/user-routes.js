const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');
const companyUpload = require('../helpers/company-upload');
const profileUpload = require('../helpers/profile-upload');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/user/logout/{userId}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - User
 *     description: Logout
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user.
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/logout/:uid', auth, userController.userLogout);

/**
 * @swagger
 * /api/v1/user/user-cards:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get user cards
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user-cards', auth, userController.getUserCards);

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register User
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            example:
 *              role: Lister
 *              firstName: Usama
 *              lastName: Bashir
 *              email: meetmrusama@gmail.com
 *              password: '12345678'
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/register',
  [
    check('role')
      .not()
      .isEmpty()
      .isIn(['Renter', 'Lister'])
      .withMessage('Role can be Renter or Lister'),
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email').isEmail(),
    check('password').not().isEmpty().isLength({ min: 8 }).withMessage('Password length must be 8'),
  ],
  userController.registerUser
);

/**
 * @swagger
 * /api/v1/user/company-profile:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add company profile
 *     tags: [Company Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              companyName:
 *                type: string
 *                example: Company
 *              DBAName:
 *                type: string
 *                example: DBA
 *              contactFirstName:
 *                type: string
 *                example: First Name
 *              contactLastName:
 *                type: string
 *                example: Last Name
 *              contactEmail:
 *                type: string
 *                example: contact@gmail.com
 *              phoneNo:
 *                type: integer
 *                example: '123456789'
 *              businessType:
 *                type: string
 *                example: Parking
 *              FEIN:
 *                type: string
 *                example: FEIN
 *              street:
 *                type: string
 *                example: Street
 *              city:
 *                type: string
 *                example: City
 *              state:
 *                type: string
 *                example: State
 *              zipCode:
 *                type: string
 *                example: zipCode
 *              USDOT:
 *                type: string
 *                example: USDOT
 *              employees:
 *                type: integer
 *                example: '4'
 *              drivers:
 *                type: integer
 *                example: '2'
 *              company_profile:
 *                type: string
 *                format: binary
 *              policy_doc:
 *                type: string
 *                format: binary
 *              providerName:
 *                type: string
 *                example: providerName
 *              providerPhone:
 *                type: string
 *                example: providerPhone
 *              policyNumber:
 *                type: string
 *                example: policyNumber
 *              policyStartDate:
 *                type: string
 *                example: 01-08-2023
 *              policyEndDate:
 *                type: string
 *                example: 01-08-2023
 *              policyStreetAddress:
 *                type: string
 *                example: policyStreetAddress
 *              policyCity:
 *                type: string
 *                example: policyCity
 *              policyState:
 *                type: string
 *                example: policyState
 *              policyZipCode:
 *                type: string
 *                example: policyZipCode
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/company-profile',
  auth,
  companyUpload.fields([
    { name: 'company_profile', maxCount: 1 },
    { name: 'policy_doc', maxCount: 1 },
  ]),
  [
    check('companyName').not().isEmpty(),
    check('DBAName').not().isEmpty(),
    check('contactFirstName').not().isEmpty(),
    check('contactLastName').not().isEmpty(),
    check('contactEmail').isEmail(),
    check('phoneNo').not().isEmpty(),
    check('businessType').not().isEmpty(),
    check('FEIN').not().isEmpty(),
    check('street').not().isEmpty(),
    check('city').not().isEmpty(),
    check('state').not().isEmpty(),
    check('zipCode').not().isEmpty(),
    check('USDOT').not().isEmpty(),
    check('employees').not().isEmpty(),
    check('drivers').not().isEmpty(),
    check('providerName').not().isEmpty(),
    check('providerPhone').not().isEmpty(),
    check('policyNumber').not().isEmpty(),
    check('policyStartDate')
      .not()
      .isEmpty()
      .isDate({ format: 'DD-MM-YYYY' })
      .withMessage('Date format must be DD-MM-YYYY'),
    check('policyEndDate')
      .not()
      .isEmpty()
      .isDate({ format: 'DD-MM-YYYY' })
      .withMessage('Date format must be DD-MM-YYYY'),
    check('policyStreetAddress').not().isEmpty(),
    check('policyCity').not().isEmpty(),
    check('policyState').not().isEmpty(),
    check('policyZipCode').not().isEmpty(),
  ],
  userController.companyProfile
);

/**
 * @swagger
 * /api/v1/user/personal-info:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add PersonalInfo
 *     tags: [Personal Info]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              gender:
 *                type: string
 *                example: Male
 *              firstName:
 *                type: string
 *                example: Usama
 *              lastName:
 *                type: string
 *                example: Bashir
 *              companyTitle:
 *                type: string
 *                example: companyTitle
 *              email:
 *                type: string
 *                example: meetmrusama@gmail.com
 *              phone:
 *                type: integer
 *                example: '123456789'
 *              language:
 *                type: string
 *                example: English
 *              street:
 *                type: string
 *                example: street
 *              city:
 *                type: string
 *                example: city
 *              state:
 *                type: string
 *                example: state
 *              zipCode:
 *                type: string
 *                example: zipCode
 *              bio:
 *                type: string
 *                example: bio
 *              emergencyFirstName:
 *                type: string
 *                example: emergencyFirstName
 *              emergencyLastName:
 *                type: string
 *                example: emergencyLastName
 *              emergencyPhone:
 *                type: string
 *                example: emergencyPhone
 *              emergencyEmail:
 *                type: string
 *                example: asd@asd.asd
 *              emergencyRelationship:
 *                type: string
 *                example: emergencyRelationship
 *              emergencyLanguage:
 *                type: string
 *                example: emergencyLanguage
 *              emergencyStreet:
 *                type: string
 *                example: emergencyStreet
 *              emergencyCity:
 *                type: string
 *                example: emergencyCity
 *              emergencyState:
 *                type: string
 *                example: emergencyState
 *              emergencyZipCode:
 *                type: string
 *                example: emergencyZipCode
 *              profile_pic:
 *                type: string
 *                format: binary
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/personal-info',
  auth,
  profileUpload.single('profile_pic'),
  [
    check('gender').not().isEmpty(),
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('companyTitle').not().isEmpty(),
    check('email').isEmail(),
    check('phone').not().isEmpty(),
    check('language').not().isEmpty(),
    check('street').not().isEmpty(),
    check('city').not().isEmpty(),
    check('state').not().isEmpty(),
    check('zipCode').not().isEmpty(),
    check('bio').not().isEmpty(),
    check('emergencyFirstName').not().isEmpty(),
    check('emergencyLastName').not().isEmpty(),
    check('emergencyPhone').not().isEmpty(),
    check('emergencyEmail').isEmail(),
    check('emergencyRelationship').not().isEmpty(),
    check('emergencyLanguage').not().isEmpty(),
    check('emergencyStreet').not().isEmpty(),
    check('emergencyCity').not().isEmpty(),
    check('emergencyState').not().isEmpty(),
    check('emergencyZipCode').not().isEmpty(),
  ],
  userController.addPersonalInfo
);

/**
 * @swagger
 * /api/v1/user/equipment:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add equipment
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            example:
 *              equipmentType: equipmentType
 *              equipmentIdentity: equipmentIdentity
 *              equipmentLength: equipmentLength
 *              equipmentUnitNo: equipmentUnitNo
 *              equipmentYear: equipmentYear
 *              equipmentMake: equipmentMake
 *              equipmentModel: equipmentModel
 *              equipmentColor: equipmentColor
 *              plateNo: plateNo
 *              plateState: plateState
 *              chassis: chassis
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/equipment',
  auth,
  [
    check('equipmentType').not().isEmpty(),
    check('equipmentIdentity').not().isEmpty(),
    check('equipmentLength').not().isEmpty(),
    check('equipmentUnitNo').not().isEmpty(),
    check('equipmentYear').not().isEmpty(),
    check('equipmentMake').not().isEmpty(),
    check('equipmentModel').not().isEmpty(),
    check('equipmentColor').not().isEmpty(),
    check('plateNo').not().isEmpty(),
    check('plateState').not().isEmpty(),
    check('chassis').not().isEmpty(),
  ],
  userController.addEquipment
);

/**
 * @swagger
 * /api/v1/user/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            example:
 *              email: meetmrusama@gmail.com
 *              otp: '895953'
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/verify-otp',
  [check('email').isEmail(), check('otp').not().isEmpty()],
  userController.userOtpVerify
);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            example:
 *              email: meetmrusama@gmail.com
 *              password: '12345678'
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/login',
  [check('email').isEmail(), check('password').not().isEmpty()],
  userController.userLogin
);

/**
 * @swagger
 * /api/v1/user/add-card:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add user card
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            example:
 *              cardNo: '4242424242424242'
 *              expMonth: 11
 *              expYear: 2028
 *              cvc: 123
 *              name: Usama Bashir
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/add-card',
  auth,
  [
    check('cardNo').not().isEmpty(),
    check('expMonth').isNumeric().not().isEmpty(),
    check('expYear').isNumeric().not().isEmpty(),
    check('cvc').not().isEmpty(),
    check('name').not().isEmpty(),
  ],
  userController.addUserCard
);

/**
 * @swagger
 * /api/v1/user/search-connected:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Search connected users in chat based on a query
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: The search query to match against connected users' firstName, lastName, or email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns connected users matching the search query
 *       500:
 *         description: Server error
 */
router.get('/search-connected', auth, userController.searchUserInChat);

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Fetch details of the logged-in user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/me', auth, userController.getLoggedInUserDetails);

/**
 * @swagger
 * /api/v1/user/user-conversations:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get user conversations
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user-conversations', auth, userController.getUserConversations);

module.exports = router;
