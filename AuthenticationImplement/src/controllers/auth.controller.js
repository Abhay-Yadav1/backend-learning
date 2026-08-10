const userModel=require('../model/user_model');
const jwt=require('jsonwebtoken');
async function registerUser(req,res){
    const {username,email,password}=req.body;
    const user=await userModel.create({
        username,email,password
    })

    const isUserAlreadyExists=await userModel.findOne({email:email});

    if(isUserAlreadyExists){
        return res.status(409).json({
            message:"User already exists"
        })
    }

    const token=jwt.sign({
        id:user._id
    },process.env.JWT_SECRET
    )

    res.cookie('token',token)

    res.status(201).json({
        message:"User registered successfully",
        user:user,
        token:token
    })

}



module.exports={registerUser};