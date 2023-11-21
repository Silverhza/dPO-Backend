const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const HttpError = require('../helpers/http-error');
const Plan = require('../models/plan');

const createPlan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid data received', 422));
  }

  let product;
  try {
    product = await stripe.products.create({
      name: req.body.name,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error creating product', 500));
  }

  let price;
  try {
    price = await stripe.plans.create({
      amount: Math.round(req.body.price * 100),
      currency: 'usd',
      interval: req.body.interval,
      interval_count: req.body.interval_count,
      product: product.id,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error creating price', 500));
  }

  const newPlan = new Plan({
    ...req.body,
    productId: product.id,
    priceId: price.id,
  });

  try {
    await newPlan.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error creating plan', 500));
  }

  res.status(201).json({ message: 'Plan created successfully' });
};

const getPlans = async (req, res, next) => {
  let existingPlans;
  try {
    existingPlans = await Plan.find({});
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error getting plans', 500));
  }

  res.json({ plans: existingPlans });
};

const deletePlan = async (req, res, next) => {
  let existingPlan;
  try {
    existingPlan = await Plan.findById(req.params.planId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error getting plan', 500));
  }

  if (!existingPlan) {
    return next(new HttpError('No plan found', 404));
  }

  let deletedPrice;
  try {
    deletedPrice = await stripe.plans.del(existingPlan.priceId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error deleting price', 500));
  }

  let deleted;
  try {
    deleted = await stripe.products.del(existingPlan.productId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error deleting product', 500));
  }

  try {
    await existingPlan.deleteOne();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error deleting plan', 500));
  }

  res.json({ message: 'Product deleted successfully' });
};

const updatePlan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid data received', 422));
  }

  let existingPlan;
  try {
    existingPlan = await Plan.findById(req.body.planId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error fetching plan', 500));
  }

  if (!existingPlan) {
    return next(new HttpError('No plan found', 404));
  }

  if (req.body.name) {
    try {
      const product = await stripe.products.update(existingPlan.productId, { name: req.body.name });
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error updating plan', 500));
    }

    existingPlan.name = req.body.name;
  }

  if (req.body.price || req.body.interval || req.body.interval_count) {
    try {
      const deleted = await stripe.plans.del(existingPlan.priceId);
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error updating plan', 500));
    }

    let plan;
    try {
      plan = await stripe.plans.create({
        amount: Math.round((req.body.price || existingPlan.price) * 100),
        currency: 'usd',
        interval: req.body.interval || existingPlan.interval,
        interval_count: req.body.interval_count || existingPlan.interval_count,
        product: existingPlan.productId,
      });
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error updating plan', 500));
    }

    existingPlan.price = req.body.price || existingPlan.price;
    existingPlan.priceId = plan.id;
    existingPlan.interval = req.body.interval || existingPlan.interval;
    existingPlan.interval_count = req.body.interval_count || existingPlan.interval_count;
  }

  try {
    await existingPlan.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error updating plan', 500));
  }

  res.json({ message: 'Plan updated successfully' });
};

exports.createPlan = createPlan;
exports.deletePlan = deletePlan;
exports.getPlans = getPlans;
exports.updatePlan = updatePlan;
