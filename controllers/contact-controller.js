const Contact = require('../models/contact');
const factoryHandler = require('./factory-controller');
const User = require('../models/user');

// Create a new contact
exports.createContact = async (req, res) => {
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneById(User, req.userId);
  } catch (error) {
    console.log(error);
    return new HttpError(error, 500);
  }
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send(contact);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get a single contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send();
    }
    res.send(contact);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.send(contacts);
  } catch (error) {
    res.status(500).send(error);
  }
};
