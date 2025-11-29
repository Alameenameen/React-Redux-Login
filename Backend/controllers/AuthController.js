// controllers/AuthController.js
const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken');

const makeProfileUrl = (req, storedValue) => {
  if (!storedValue) return null;
  const filename = String(storedValue).split('/').pop();
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

const Signup = async (req, res) => {
  try {
    const { userName, email, phone, password } = req.body;

    if (!userName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashPass = await bcrypt.hash(password, 10);

    let profilePictureFile = null;
    let profilePictureUrl = null;

    if (req.file) {
      // store only filename in DB
      profilePictureFile = req.file.filename;
      // build the public URL for response
      profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/${profilePictureFile}`;
    }

    const newUser = await User.create({
      userName,
      email: normalizedEmail,
      phone,
      password: hashPass,
      profilePicture: profilePictureFile // filename only
    });

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        phone: newUser.phone,
        profilePicture: profilePictureUrl // full url for frontend
      }
    });
  } catch (error) {
    console.log('Signup Error:', error);
    res.status(400).json({ message: 'Error during signup', error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    email = email.toLowerCase().trim(); // normalize incoming email

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('userToken', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    // Build a safe profile picture URL from whatever is stored in DB
    const profilePictureUrl = makeProfileUrl(req, user.profilePicture);

    res.status(200).json({
      message: 'Login is successful',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        profilePicture: profilePictureUrl
      }
    });
  } catch (error) {
    console.log('Login Error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

const logOut = (req, res) => {
  res.clearCookie("userToken");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { 
    Signup
    , Login ,
    logOut
};
