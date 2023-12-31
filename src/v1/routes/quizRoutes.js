const express = require('express');
const router = express.Router();
const { addQuiz, getQuizzes, getLeaderboardData } = require('../controller/quizController');

router.post('/add', addQuiz);
router.get('/getall', getQuizzes);
router.post('/get/leaderboard', getLeaderboardData);

module.exports = router;