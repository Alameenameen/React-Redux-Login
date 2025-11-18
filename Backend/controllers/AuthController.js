const bcrypt =  require('bcrypt');
const User = require('../models/UserSchema');
const { info } = require('console');


const Signup = async(req, res) => {
    try {
        // console.log("📦 Request body:", req.body);
        // console.log("📁 Request file:", req.file);
        // console.log("📋 Form field names:", Object.keys(req.body));
        
        const {userName, email, phone, password} = req.body;

        // validation from backend
        if(!userName || !email || !phone || !password){
            return res.status(400).json({message:'All fields are required'});
        }

        // Email duplicate checking
        const userExist = await User.findOne({email:email.toLowerCase().trim()});
        if(userExist) {
            return res.status(400).json({message:'user with this email already exists'})
        }

        const hashPass = await bcrypt.hash(password, 10);

        let profilePicturePath = null;
        if(req.file){
            profilePicturePath = `/uploads/${req.file.filename}`;
        }

        const newUser = new User({
            userName,
            email: email.toLowerCase().trim(),
            phone,
            password: hashPass,
            profilePicture: profilePicturePath  // ⚠️ Check your schema!
        })

        await newUser.save();

        // return user info
        res.status(201).json({
            message: "Signup successfull",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                phone: newUser.phone,
                profilePicture: newUser.profilePicture
            }
        })
    } catch (error) {
        console.log("Signup Error:", error)
        res.status(400).json({message:'Error occured during signup', error: error.message})
    }
}


module.exports={
    Signup
}