const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const HttpError = require('../helpers/http-error');
const User = require('../models/user');
const CompanyProfile = require('../models/company-profile');
const Equipment = require('../models/equipment');
const PersonalInfo = require('../models/personal-info');
const Message = require('../models/message');
const factoryHandler = require('./factory-controller');
const sendEmail = require('../helpers/email');
const { generateOtp } = require('../helpers/sendOtp');
const Support = require('../models/support');

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Support.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const getQuestionByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const questions = await Support.find({ tag: tag });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions by tag' });
  }
};

const searchQuestionByTitle = async (req, res) => {
  try {
    const searchTerm = req.query.title;
    const questions = await Support.find({ title: new RegExp(searchTerm, 'i') });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search questions by title' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { title, tag, body } = req.body;
    const newQuestion = new Support({ title, tag, body });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Support.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

exports.getAllQuestions = getAllQuestions;
exports.getQuestionByTag = getQuestionByTag;
exports.searchQuestionByTitle = searchQuestionByTitle;
exports.addQuestion = addQuestion;
exports.deleteQuestion = deleteQuestion;
