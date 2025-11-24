const bcrypt =  require('bcrypt');
const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken')


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



//...........login

const Login = async (req,res) => {
    try {
        const {email,password}=req.body;

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:'User not found'})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:'Invalid Credentials'})
        }

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{
            expiresIn:'1h',
        });

        res.cookie('userToken',token,{
            httpOnly:true,
            secure:false,
            maxAge:24*60*60*1000,
            sameSite:'strict'
        })

        res.status(200).json({
            message:'Login Is Successfull',
            user:{
                id:user._id,
                userName:user.userName,
                email:user.email,
                phone:user.phone
            }
        })

    } catch (error) {
        res.status(500).json({message:'Error occured during the login', error:error.message})
    }
}




module.exports={
    Signup,
    Login
}