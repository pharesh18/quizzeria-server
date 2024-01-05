const { users } = require('../library/schema.js');
const { generateOtp, sendEmail, validateRequest, generateToken } = require('../library/functions.js');
const joi = require('joi');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/profiles');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const validateUserSchema = (req, res, next) => {
    const option = {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: false
    };

    const userSchema = joi.object({
        fname: joi.string().required().pattern(/^[a-zA-Z ]+$/).message('fname can only have alphabets').min(2).max(20).messages({
            'string.empty': "fname is a required field",
            'string.min': "fname must have atleast 2 characters",
            'string.max': "fname cannot have more than 20 characters"
        }),
        lname: joi.string().required().pattern(/^[a-zA-Z ]+$/).message('lname can only have alphabets').min(2).max(20).messages({
            'string.empty': "lname is a required field",
            'string.min': "lname must have atleast 2 characters",
            'string.max': "lname cannot have more than 20 characters"
        }),
        email: joi.string().required().email().messages({
            'any.required': "email is required field",
            'string.empty': "email is a required field",
            'string.email': "Please enter valid email"
        }),
        password: joi.string().required().min(6).max(16).pattern(/^[a-zA-Z0-9@#$%^&-=+()]+$/).message("Only use alphabets, numbers or special characters").messages({
            'string.empty': "password is a required field",
            'string.min': "password must have atleast 6 characters",
            'string.max': "password cannot have more than 20 characters"
        }),
    });

    const userProfileSchema = joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        size: joi.number().required(),
    });

    const { error: userSchemaError } = userSchema.validate(req.body, option);
    const { error: userProfileError } = userProfileSchema.validate(req.file, option);

    if (userSchemaError || userProfileError) {
        return res.send({ error: true, message: userSchemaError ? userSchemaError.message : userProfileError.message });
    } else {
        next();
    }
}

// const registerUser = async (req, res) => {
//     let otp = await generateOtp();

//     // cloudinary.config({
//     //     cloud_name: process.env.CLOUDINARY_NAME,
//     //     api_key: process.env.CLOUDINARY_API_KEY,
//     //     api_secret: process.env.CLOUDINARY_API_SECRET,
//     //     secure: true
//     // });

//     let data = {
//         fname: req.body.fname,
//         lname: req.body.lname,
//         email: req.body.email,
//         password: req.body.password,
//         otp,
//         is_verified: false,
//         created_date: new Date(),
//         is_admin: req.body.is_admin ? req.body.is_admin : false,
//     }

//     if (req.file) {
//         data.profile = req.file.filename;
//         data.path = req.file.path;
//     }

//     let userData = await users.findOne({ "email": data.email });
//     if (userData) {
//         if (userData.is_verified === false) {
//             await users.deleteOne({ "email": data.email, is_verified: false });
//         } else {
//             return res.send({ error: true, message: "Email already exists" });
//         }
//     }

//     let return_data = {
//         error: false,
//         message: 'success',
//         email: ''
//     };

//     let user = new users(data);
//     return await user.save().then(async () => {
//         let text = `Dear ${data.fname} ${data.lname}, Here is your OTP to register on File System is ${otp}`;
//         let result = await sendEmail(data.email, "OTP from File System", text);
//         console.log(result);
//         return_data.email = data.email;
//         res.send(return_data);
//     }).catch((error) => {
//         return_data.message = error.errors?.email ? 'duplicate_email' : 'something_broken';
//         return_data.error = true;
//         res.send(return_data);
//         console.log('error', error);
//     })
// };


const registerUser = async (req, res) => {
    let otp = await generateOtp();
    console.log(req.files);
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });

    let data = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        otp,
        is_verified: false,
        created_date: new Date(),
        is_admin: req.body.is_admin ? req.body.is_admin : false,
    }

    let userData = await users.findOne({ "email": data.email });
    if (userData) {
        if (userData.is_verified === false) {
            await users.deleteOne({ "email": data.email, is_verified: false });
        } else {
            return res.send({ error: true, message: "Email already exists" });
        }
    }

    let return_data = {
        error: false,
        message: 'success',
        email: ''
    };

    if (req.files) {
        // data.profile = req.file.filename;
        // data.path = req.file.path;
        cloudinary.uploader.upload(req.files?.profile?.tempFilePath, async (err, result) => {
            if (result) {
                data.profile_id = result.public_id;
                data.profile_name = req?.files?.profile?.name;
                data.profile_url = result.url;

                let user = new users(data);
                return await user.save().then(async () => {
                    let text = `Dear ${data.fname} ${data.lname}, Here is your OTP to register on Quizzeria Web Application is ${otp}`;
                    let result = await sendEmail(data.email, "OTP from Quizzeria Web Application", text);
                    // console.log(result);
                    return_data.email = data.email;
                    res.send(return_data);
                }).catch((error) => {
                    return_data.message = error.errors?.email ? 'duplicate_email' : 'something_broken';
                    return_data.error = true;
                    res.send(return_data);
                    console.log('error', error);
                })
            } else if (err) {
                return_data.error = true;
                return_data.message = "Something_broken! Please try again!!";
                res.send(return_data);
                console.log('error', err);
            }
        });
    } else {
        let user = new users(data);
        return await user.save().then(async () => {
            let text = `Dear ${data.fname} ${data.lname}, Here is your OTP to register on Quizzeria Web Application is ${otp}`;
            let result = await sendEmail(data.email, "OTP from Quiz Web Application", text);
            console.log(result);
            return_data.email = data.email;
            res.send(return_data);
        }).catch((error) => {
            return_data.message = error.errors?.email ? 'duplicate_email' : 'something_broken';
            return_data.error = true;
            res.send(return_data);
            console.log('error', error);
        })
    }
};


const validateOtpSchema = (req, res, next) => {
    const otpSchema = joi.object({
        // email: joi.string().required().email().messages({
        //     'any.required': "email is required field",
        //     'string.empty': "email is a required field",
        //     'string.email': "Please enter valid email"
        // }),
        // otp: joi.number().integer().min(1000).max(9999).required(),
        email: joi.string().required().email().messages({
            'any.required': "Something_broken! Please try again!!",
            'string.empty': "Something_broken! Please try again!!",
            'string.email': "Something_broken! Please try again!!"
        }),
        otp: joi.number().required().integer().min(1000).max(9999).messages({
            'any.required': "OTP is required",
            'number.min': "Invalid OTP",
            'number.max': "Invalid OTP",
        })
    });

    if (!validateRequest(req.body, res, next, otpSchema)) {
        return false;
    }
}

const userOtp = async (req, res) => {
    let return_data = {
        error: false,
        message: "OTP verified Successfully",
        data: {}
    };

    return await users.findOneAndUpdate({ email: req.body.email, otp: req.body.otp }, { is_verified: true }, { new: true })
        .then(data => {
            if (!data) {
                return_data.error = true;
                return_data.message = "Wrong OTP";
                res.send(return_data);
            } else {
                delete data._doc["password"];
                data._doc['accesstoken'] = generateToken(data._doc._id);
                return_data.data = data._doc;
                res.send(return_data);
                console.log(return_data);
            }
        }).catch(error => {
            return_data.error = true;
            return_data.message = "Something broken";
            res.send(return_data);
            console.log(error);
        });

}

const validateUserLogin = (req, res, next) => {
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

const userLogin = async (req, res) => {
    return await users.findOne({ email: req.body.email, is_verified: true }).exec().then(async (result) => {
        if (result && (await result.matchPassword(req.body.password))) {
            delete result._doc['password'];
            result._doc['accesstoken'] = generateToken(result._doc._id);
            res.send({ error: false, message: "Login Successfully", data: result._doc });
        } else {
            res.send({ error: true, message: "Invalid email or password" });
        }
    }).catch(error => {
        res.send({ error: true, message: "something_broken" });
        console.log(error);
    });
}

const validateForgetPassword = (req, res, next) => {
    const forgetPasswordSchema = joi.object({
        email: joi.string().required().email().messages({
            'any.required': "email is required field",
            'string.empty': "email is a required field",
            'string.email': "Please enter valid email"
        }),
    });

    if (!validateRequest(req.body, res, next, forgetPasswordSchema)) {
        return false;
    }
}

const forgetPassword = async (req, res) => {
    let otp = await generateOtp();
    return await users.findOneAndUpdate({ email: req.body.email, is_verified: true }, { otp: otp }, { new: true }).exec().then(async (data) => {
        if (data) {
            let text = `Dear ${data.fname} ${data.lname}, Here is your OTP to make a new passwrod on Quiz Web Application is ${otp}`;
            let result = await sendEmail(data.email, "OTP from Quiz Web Application", text);
            res.send({ error: false, message: "OTP sent on your Email" });
        } else {
            res.send({ error: true, message: "USER NOT FOUND" });
        }
    }).catch(error => {
        res.send({ error: true, message: 'something_broken' });
        console.log('error', error);
    })
}

const validateChangePassword = (req, res, next) => {
    const changePasswordSchema = joi.object({
        password: joi.string().required().messages({
            'string.empty': "password is a required field",
        }),
        npassword: joi.string().required().min(6).max(16).pattern(/^[a-zA-Z0-9@#$%^&-=+()]+$/).message("Only use alphabets, numbers or special characters").messages({
            'string.empty': "password is a required field",
            'string.min': "password must have atleast 6 characters",
            'string.max': "password cannot have more than 20 characters"
        }),
    });

    if (!validateRequest(req.body, res, next, changePasswordSchema)) {
        return false;
    }
}

const changePassword = async (req, res) => {
    const salt = await bcrypt.genSalt(parseInt((process.env.SALT)));
    const pass = await bcrypt.hash(req.body.npassword, salt);

    return await users.findOne({ _id: req.headers._id, is_verified: true }).exec().then(async (result) => {
        if (!result) {
            res.send({ error: true, message: 'USER NOT FOUND' });
        } else if (result && (await result.matchPassword(req.body.password))) {
            await users.findOneAndUpdate({ _id: req.headers._id, is_verified: true }, { password: pass }, { new: true }).then((data) => {
                if (!data) {
                    res.send({ error: true, message: 'USER NOT FOUND' });
                } else {
                    delete data._doc['password'];
                    data._doc['accesstoken'] = generateToken(data._doc._id);
                    res.send({ error: false, message: 'Password Changed Successfully', data: data });
                }
            }).catch(error => {
                res.send({ error: true, message: "something_broken" });
                console.log(error);
            });
        } else {
            res.send({ error: true, message: "wrong password" });
        }
    }).catch(error => {
        res.send({ error: true, message: 'something_broken' });
        console.log(error);
    });
}


const validateSetPassword = (req, res, next) => {
    const setPasswordSchema = joi.object({
        email: joi.string().required().email().messages({
            'any.required': "Something_broken! Please try again!!",
            'string.empty': "Something_broken! Please try again!!",
            'string.email': "Something_broken! Please try again!!",
        }),
        otp: joi.number().required().integer().min(1000).max(9999).messages({
            'any.required': "Something_broken! Please try again!!",
            'number.min': "Something_broken! Please try again!!",
            'number.max': "Something_broken! Please try again!!",
        }),
        password: joi.string().required().min(6).max(16).pattern(/^[a-zA-Z0-9@#$%^&-=+()]+$/).message("Only use alphabets, numbers or special characters").messages({
            'string.empty': "password is a required field",
            'string.min': "password must have atleast 6 characters",
            'string.max': "password cannot have more than 20 characters"
        }),
    });

    if (!validateRequest(req.body, res, next, setPasswordSchema)) {
        return false;
    }
}

const setPassword = async (req, res) => {
    const salt = await bcrypt.genSalt(parseInt((process.env.SALT)));
    const pass = await bcrypt.hash(req.body.password, salt);

    return await users.findOne({ email: req.body.email, is_verified: true }).exec().then(async (result) => {
        if (!result) {
            res.send({ error: true, message: 'USER NOT FOUND' });
        } else {
            await users.findOneAndUpdate({ email: req.body.email, otp: req.body.otp, is_verified: true }, { password: pass }, { new: true }).then((data) => {
                if (!data) {
                    res.send({ error: true, message: 'USER NOT FOUND' });
                } else {
                    delete data._doc['password'];
                    data._doc['accesstoken'] = generateToken(data._doc._id);
                    res.send({ error: false, message: 'Password changed Successfully', data: data });
                }
            }).catch(error => {
                res.send({ error: true, message: "something_broken" });
                console.log(error);
            });
        }
    }).catch(error => {
        res.send({ error: true, message: 'something_broken' });
        console.log(error);
    });
}

const validateUploadProfile = (req, res, next) => {
    console.log(req.file);
    const uploadProfileSchema = joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        size: joi.number().required(),
    });

    if (!validateRequest(req.file, res, next, uploadProfileSchema)) {
        return false;
    }
}

const uploadProfile = async (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });

    return await users.findOne({ _id: req.headers._id, is_verified: true }).exec().then(async (data) => {
        if (data) {
            await cloudinary.uploader.upload(req.files?.profile.tempFilePath, async (error, result) => {
                if (result) {
                    if (data.profile_id) {
                        await cloudinary.uploader.destroy(data.profile_id);
                    }
                    const response = await users.findOneAndUpdate({ _id: req.headers._id, is_verified: true }, { profile_url: result?.url, profile_id: result?.public_id, profile_name: req?.files?.profile?.name }, { new: true });
                    delete response._doc['password'];
                    delete response._doc['profile_id'];
                    response._doc['accesstoken'] = generateToken(response._doc._id);
                    console.log(response);
                    res.send({ error: false, message: 'success', data: response });
                }
            }).catch(error => {
                console.log(error);
                res.send({ error: true, message: 'something_broken' });
            })
        } else {
            res.send({ error: true, message: "User not found" });
        }
    }).catch(error => {
        console.log(error);
        res.send({ error: true, message: "something_broken" });
    });



    // return await users.findOneAndUpdate({ _id: req.headers._id, is_verified: true }, { profile: req.file.filename, path: req.file.path }, { new: true }).then((data) => {
    //     if (data) {
    //         delete data._doc['password'];
    //         data._doc['accesstoken'] = generateToken(data._doc._id);
    //         console.log(data);
    //         res.send({ error: false, message: 'Profile Updated Successfully', data: data });
    //     } else {
    //         res.send({ error: true, message: "User not found" });
    //     }
    // }).catch((error) => {
    //     console.log(error);
    //     res.send({ error: true, message: "something_broken" });
    // });
}

const validateEditProfileSchema = (req, res, next) => {
    const userSchema = joi.object({
        fname: joi.string().required().pattern(/^[a-zA-Z ]+$/).message('fname can only have alphabets').min(2).max(20).messages({
            'string.empty': "fname is a required field",
            'string.min': "fname must have atleast 2 characters",
            'string.max': "fname cannot have more than 20 characters"
        }),
        lname: joi.string().required().pattern(/^[a-zA-Z ]+$/).message('lname can only have alphabets').min(2).max(20).messages({
            'string.empty': "lname is a required field",
            'string.min': "lname must have atleast 2 characters",
            'string.max': "lname cannot have more than 20 characters"
        }),
    });

    if (!validateRequest(req.body, res, next, userSchema)) {
        return false;
    }
}

const editProfile = async (req, res) => {
    return await users.findOneAndUpdate({ _id: req.headers._id }, { fname: req.body.fname, lname: req.body.lname }, { new: true }).then((data) => {
        if (data) {
            delete data._doc["password"];
            delete data._doc["profile_id"];
            data._doc['accesstoken'] = generateToken(data._doc._id);
            res.send({ error: false, message: "Profile updated successfully!!", data: data });
        } else {
            res.send({ error: true, message: "Something went wrong" });
        }
    }).catch(err => {
        console.log(err);
        res.send({ error: true, message: "Something_broken" });
    });
}

const getAllUsers = async (req, res) => {
    return await users.find().then((data) => {
        res.send({ error: false, message: 'success', data: data });
    }).catch(err => {
        res.send({ error: true, message: 'something_broken' });
    });
}

module.exports = {
    upload,
    validateUserSchema,
    registerUser,
    validateOtpSchema,
    userOtp,
    validateUserLogin,
    userLogin,
    validateForgetPassword,
    forgetPassword,
    validateChangePassword,
    changePassword,
    validateSetPassword,
    setPassword,
    validateUploadProfile,
    uploadProfile,
    getAllUsers,
    validateEditProfileSchema,
    editProfile
};
