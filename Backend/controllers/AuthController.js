const bcrypt =  require('bcrypt');
const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken')


const Signup = async(req, res) => {
    try {
        const { userName, email, phone, password } = req.body;

        if (!userName || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userExist = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExist) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashPass = await bcrypt.hash(password, 10);

        let profilePictureFile = null;
        let profilePictureUrl = null;

        if (req.file) {
            profilePictureFile = req.file.filename;
            profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/${profilePictureFile}`;
        }

        const newUser = await User.create({
            userName,
            email: email.toLowerCase().trim(),
            phone,
            password: hashPass,
            profilePicture: profilePictureFile
        });

        res.status(201).json({
            message: "Signup successful",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                phone: newUser.phone,
                profilePicture: profilePictureUrl
            }
        });

    } catch (error) {
        console.log("Signup Error:", error);
        res.status(400).json({ message: 'Error during signup', error: error.message });
    }
};



//...........login

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie("userToken", token, {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
        });

        const profilePictureUrl = user.profilePicture
            ? `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`
            : null;

        res.status(200).json({
            message: "Login is successful",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phone: user.phone,
                profilePicture: profilePictureUrl
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};





module.exports={
    Signup,
    Login
}