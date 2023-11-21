const User = require('../models/user');

const sendRequest = async (req, res, next) => {
  const senderId = req.userId;
  const recipientId = req.params.recipientId;

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (sender._id === recipient._id) {
      return res.status(422).json({ message: 'Sender and receiver cannot be same.' });
    }

    // Check if a connection already exists
    const existingConnectionSender = sender.connections.find((conn) =>
      conn.user.equals(recipientId)
    );
    const existingConnectionRecipient = recipient.connections.find((conn) =>
      conn.user.equals(senderId)
    );

    if (existingConnectionSender || existingConnectionRecipient) {
      return res.status(400).json({ message: 'Connection already exists.' });
    }

    // Create a new connection request for sender and recipient
    sender.connections.push({
      user: recipientId,
      status: 'pending',
      initiatedBy: senderId,
      lastCommunication: new Date(),
    });

    recipient.connections.push({
      user: senderId,
      status: 'pending',
      initiatedBy: senderId,
      lastCommunication: new Date(),
    });

    await sender.save();
    await recipient.save();

    return res.status(200).json({ message: 'Connection request sent.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const approveRequest = async (req, res) => {
  const recipientId = req.userId;
  const senderId = req.params.senderId;

  try {
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the connection objects
    const connectionRecipient = recipient.connections.find((conn) => conn.user.equals(senderId));
    const connectionSender = sender.connections.find((conn) => conn.user.equals(recipientId));

    if (!connectionRecipient || !connectionSender) {
      return res.status(404).json({ message: 'Connection not found.' });
    }

    if (!connectionRecipient.initiatedBy.equals(recipientId)) {
      return res.status(403).json({ message: 'You are not authorized to accept this request.' });
    }

    connectionRecipient.status = 'accepted';
    connectionSender.status = 'accepted';

    await recipient.save();
    await sender.save();

    return res.status(200).json({ message: 'Connection request accepted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const listConnections = async (req, res) => {
  const userId = req.userId;

  try {
    // const user = await User.findById(userId).populate('connections.user');

    const user = await User.findById(userId).populate({
      path: 'connections.user',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const connections = user.connections.map((connection) => {
      console.log('connectoin', connection.user.personalInfo);
      return {
        connectionId: connection._id,
        userId: connection.user._id,
        status: connection.status,
        lastCommunication: connection.lastCommunication,

        // Other connection-related fields
      };
    });

    return res.status(200).json(connections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.sendRequest = sendRequest;
exports.approveRequest = approveRequest;
exports.listConnections = listConnections;
