const { Schema, model, Mongoose } = require('mongoose')
// const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const schema = {};

schema.users = Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profile_id: {
        type: String,
    },
    profile_name: {
        type: String,
    },
    profile_url: {
        type: String,
    },
    otp: {
        type: Number,
        required: true,
    },
    is_verified: {
        type: Boolean,
        required: true,
    },
    created_date: {
        type: Date,
        required: true,
    },
    is_admin: {
        type: Boolean,
        default: false
    },
});

schema.questions = Schema({
    category: {
        type: String,
        required: true,
    },
    correct_answer: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    choices: {
        type: Array,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});

schema.quiz = Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    total_questions: {
        type: Number,
        required: true,
    },
    quiz: {
        type: Array,
        required: true,
    },
});


// schema.users.plugin(uniqueValidator);   // validator for unique email

schema.users.methods.matchPassword = async function (pass) {
    return await bcrypt.compare(pass, this.password);
};

schema.users.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const users = model('users', schema.users);
const questions = model('questions', schema.questions);
const quizzes = model('quizzes', schema.quiz);

module.exports = { users, questions, quizzes };