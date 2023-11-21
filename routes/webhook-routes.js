const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook-controller');

// webhook stripe events listener
router.post('/', express.raw({ type: 'application/json' }), webhookController.webhookListen);

module.exports = router;
