const express = require('express');
const router = express.Router();

const { addQuestions, getQuestions } = require('../controller/questionController');

router.post('/add', addQuestions);
router.post('/get', getQuestions)

module.exports = router;