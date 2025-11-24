const express = require('express')
const router = express.Router();
const upload = require('../Utils/multer') //multer instance
const AuthController  = require('../controllers/AuthController')


router.post('/signup',upload.single('profilePicture'),AuthController.Signup);
router.post('/login',AuthController.Login)

module.exports = router;