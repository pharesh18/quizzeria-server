const joi = require('joi');
const { validateRequest, verifyToken } = require('./functions');

const open_access_apis = [
    '/api/users/register', '/api/users/login', '/api/users/forgetpassword', '/api/users/otp', '/api/users/setpassword'
];

const validateSchema = (req, res, next) => {
    if (open_access_apis.indexOf(req.url) > -1) {
        next();
        return true;
    }

    // const schema = joi.object({
    //     _id: joi.string().required(),
    //     accesstoken: joi.string().required()
    // });

    const schema = joi.object({
        _id: joi.string().required().messages({
            'any.required': "Something_broken! Please try again!!",
            'string.empty': "Something_broken! Please try again!!",
        }),
        accesstoken: joi.string().required().messages({
            'any.required': "Something_broken! Please try again!!",
            'string.empty': "Something_broken! Please try again!!",
        }),
    });

    if (!validateRequest(req.headers, res, next, schema)) {
        return false;
    }
}

const checkAccess = (req, res, next) => {
    if (open_access_apis.indexOf(req.url) > -1) {
        next();
        return true;
    }

    if (verifyToken(req.headers._id, req.headers.accesstoken)) {
        next();
        return true;
    } else {
        res.send({ error: true, message: "ACCESS_DENIED_PLEASE_RELOGIN" });
        return false;
    }
}

module.exports = { validateSchema, checkAccess };