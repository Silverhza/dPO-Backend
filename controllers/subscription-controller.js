const Subscription = require('../models/subscription');
const crypto = require('crypto');

exports.createSubscription = async (req, res) => {
  try {
    const { email } = req.body;
    const existingSubscription = await Subscription.findOne({ email });
    if (!email) {
      return res.status(401).send('email required.');
    }

    if (existingSubscription) {
      return res.status(400).send({ error: 'Email already subscribed.' });
    }

    const timestamp = Date.now().toString();
    const hashedToken = crypto.createHash('sha256').update(timestamp).digest('hex');

    const subscription = new Subscription({ email, verificationToken: hashedToken });

    //todo: add email and verify token later once deployed.
    const saveresult = await subscription.save();

    return res.status(201).send(subscription);
  } catch (error) {
    return res.status(400).send(error);
  }
};
