const sendEmail = require('../helpers/email');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

const endpointSecret = process.env.ENDPOINT_LISTEN;

const webhookListen = async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload, 'payload');
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = await stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️ error :: `, err.message);
      return res.sendStatus(400);
    }

    // @TO DO : get email from the event based on the response of event
    let email = event['data']['object']['metadata']['email'];
    console.log('email : ', email);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;

        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        if (email) {
          await sendEmail({
            email: email,
            subject: 'Payment Succeeded',
            message: `Payment with ID ${paymentIntent.id} was successful.`,
          });
        }
        //  @TO DO : update the dataBase as per the requirements
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;

        console.log('PaymentIntent failed:', failedPaymentIntent);

        if (email) {
          await sendEmail({
            email: email,
            subject: 'Payment Failed',
            message: `Payment with ID ${failedPaymentIntent.id} has failed.`,
          });
        }

        //if payment failed then create the refund
        const refund = await stripe.refunds.create({
          payment_intent: failedPaymentIntent.id,
        });

        if (email) {
          await sendEmail({
            email: email,
            subject: 'Payment Refunded create',
            message: `Refund with ID ${refund.id} has created with amount : ${refund.amount} ${refund.currency} .`,
          });
        }
        break;

      case 'payment_intent.canceled':
        const cancelPaymentIntent = event.data.object;
        console.log(`PaymentIntent for ${cancelPaymentIntent.amount} was successful!`);
        if (email) {
          await sendEmail({
            email: email,
            subject: 'Payment Canceled .',
            message: `Payment with ID ${cancelPaymentIntent.id} was Canceled.`,
          });
        }
        break;

      case 'charge.refunded':
        // Handle payment intents that have been refunded
        const refundedPaymentIntent = event.data.object;

        console.log('PaymentIntent was refunded:', refundedPaymentIntent);

        if (email) {
          await sendEmail({
            email: email,
            subject: 'Payment refund',
            message: `Payment with ID ${refundedPaymentIntent.id} has refunded.`,
          });
        }
        break;

      case 'subscription_schedule.created':
        const subscription = event.data.object;

        console.log('subscription created:', subscription);

        if (email) {
          await sendEmail({
            email: email,
            subject: 'subscription create',
            message: `Subscription created with ID ${subscription.id} .`,
          });
          break;
        }

      case 'customer.subscription.updated':
        //  subscription
        const subscriptionUpdated = event.data.object;

        console.log('subscription updated:', subscriptionUpdated);

        if (email) {
          await sendEmail({
            email: email,
            subject: 'subscription updated',
            message: `Subscription updated with ID ${subscriptionUpdated.id} .`,
          });
          break;
        }

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object;

        console.log('subscription deleted:', subscriptionDeleted);

        if (email) {
          await sendEmail({
            email: email,
            subject: 'subscription deleted',
            message: `Subscription deleted with ID ${subscriptionDeleted.id} .`,
          });
          break;
        }

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    res.json({ received: true });
  } catch (e) {
    console.log('ERROR :: ', e.message);
  }
};

exports.webhookListen = webhookListen;
