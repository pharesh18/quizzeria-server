const express = require('express');
const router = express.Router();

const { validateUserSchema, registerUser, validateOtpSchema, userOtp, validateUserLogin, userLogin, validateForgetPassword, forgetPassword, validateChangePassword, changePassword, uploadProfile, validateUploadProfile, upload, getAllUsers, validateSetPassword, setPassword, validateEditProfileSchema, editProfile } = require('../controller/userController.js');

// router.post('/register', upload.single('profile'), validateUserSchema, registerUser);
router.post('/register', validateUserSchema, registerUser);
router.post('/otp', validateOtpSchema, userOtp);
router.post('/login', validateUserLogin, userLogin);
router.post('/forgetpassword', validateForgetPassword, forgetPassword);
router.post('/changepassword', validateChangePassword, changePassword);
router.post('/setpassword', validateSetPassword, setPassword);
// router.post('/uploadprofile', upload.single('profile'), validateUploadProfile, uploadProfile);
router.post('/uploadprofile', validateUploadProfile, uploadProfile);
router.put('/editprofile', validateEditProfileSchema, editProfile);
router.get('/getAll', getAllUsers);

module.exports = router;