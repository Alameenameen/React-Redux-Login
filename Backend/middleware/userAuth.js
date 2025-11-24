
const jwt = require('jsonwebtoken')

const protect =(req,res,next)=>{
    const token = req.cookies.userToken
    console.log('Token from cookiee', token);

    if(!token){
        return res.status(401).json({message:'No token is available, authorization has debied'})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        
        req.user = { id: decoded.userId };

        console.log('Decoded token:', decoded);

        next()
    } catch (error) {
        res.status(400).json({message:'Token is not valid'})
    }
}

module.exports ={
    protect
}