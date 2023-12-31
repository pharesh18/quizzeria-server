const { sign, verify } = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const generateOtp = (length = 4) => {
    let otp = String(Math.ceil(Math.random() * 10000));
    return otp.length === length ? otp : generateOtp();
}

const sendEmail = async (to, subject, text) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.OTP_MAIL, pass: process.env.OTP_PASSWORD, }
    });
    let mailOptions = { from: process.env.OTP_MAIL, to, subject, text }
    return transporter.sendMail(mailOptions);
}

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(process.env.SALT);
    return await bcrypt.hash(password, salt);
}


const validateRequest = (reqSchema, res, next, schema) => {
    const option = {
        abortEarly: true,
        allowUnKnown: true,
        stripUnknown: false
    };

    const { error, value } = schema.validate(reqSchema, option);
    console.log(error);
    if (error) {
        res.send({ error: true, message: error.message });
        return false;
    } else {
        reqSchema = value;
        next();
    }
}

const generateToken = (_id) => {
    return sign({ _id }, process.env.JWTKEY);
}

const verifyToken = (_id, token) => {
    let result = false;
    verify(token, process.env.JWTKEY, (err, decoded) => {
        if (err) return false;
        if (decoded._id === _id)
            result = true;
    })
    return result;
}

module.exports = { validateRequest, generateToken, verifyToken, generateOtp, sendEmail, encryptPassword };