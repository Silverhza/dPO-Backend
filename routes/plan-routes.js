const express = require('express');
const { check } = require('express-validator');

const planController = require('../controllers/plan-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/plan/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get plans
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', planController.getPlans);

/**
 * @swagger
 * /api/v1/plan/:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Create plan
 *     tags: [Plan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: 2 months
 *               price: 18.99
 *               interval: month
 *               interval_count: 1
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/',
  auth,
  [
    check('name').not().isEmpty(),
    check('price').not().isEmpty(),
    check('interval')
      .isString()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Invalid interval')
      .not()
      .isEmpty(),
    check('interval_count').isInt().not().isEmpty(),
  ],
  planController.createPlan
);

/**
 * @swagger
 * /api/v1/plan/update-plan:
 *   patch:
 *     security:
 *       - BearerAuth: []
 *     summary: Update plan
 *     tags: [Plan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               planId: 64bebe2426ba0a95e43a8d79
 *               name: 2 months
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch(
  '/update-plan',
  auth,
  [
    check('planId').not().isEmpty(),
    check('name').optional({ checkFalsy: true }).not().isEmpty(),
    check('price').optional({ checkFalsy: true }).not().isEmpty(),
    check('interval')
      .optional({ checkFalsy: true })
      .isString()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Invalid interval')
      .not()
      .isEmpty(),
    check('interval_count').optional({ checkFalsy: true }).isInt().not().isEmpty(),
  ],
  planController.updatePlan
);

/**
 * @swagger
 * /api/v1/plan/{planId}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: Delete plan
 *     tags: [Plan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the plan.
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/:planId', auth, planController.deletePlan);

module.exports = router;
