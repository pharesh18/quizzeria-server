const { questions } = require('../library/schema.js');
const { validateRequest } = require('../library/functions.js');
const joi = require('joi');

const validateAddQuestions = (req, res, next) => {
    const loginSchema = joi.object({
        email: joi.string().required().email().messages({
            'any.required': "email is required field",
            'string.empty': "email is a required field",
            'string.email': "Please enter valid email"
        }),
        password: joi.string().required().messages({
            'string.empty': "password is a required field",
        }),
    });

    if (!validateRequest(req.body, res, next, loginSchema)) {
        return false;
    }
}


const addQuestions = async (req, res) => {
    let data = {
        category: req.body.category,
        correct_answer: req.body.correct_answer,
        difficulty: req.body.difficulty,
        choices: req.body.choices,
        question: req.body.question,
        type: req.body.type,
    }

    let question = new questions(data);
    return await question.save().then(async (data) => {
        console.log(data);
        res.send({ error: false, message: 'success', data: data });
    }).catch((err) => {
        console.log(err);
        res.send({ err: true, message: 'something_broken' });
    });
};

const getQuestions = async (req, res) => {
    return await questions.find({ category: req.body.category, difficulty: req.body.difficulty, type: req.body.type }).limit(req.body.amount_of_questions).then((data) => {
        res.send({ error: false, message: 'success', data: data });
    }).catch(err => {
        console.log(err);
        res.send({ error: true, message: 'something_broken' });
    });
}

module.exports = { validateAddQuestions, addQuestions, getQuestions };