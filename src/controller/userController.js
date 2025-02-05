const User=require('../models/User.js')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')


const register=async (req,res)=>{
try
{  const {email,name,password}=req.body;
  const hashedPassword=await bcrypt.hash(password,10);
  const user=new User({
    email,
    name,
    password:hashedPassword
  })
  await user.save();
  res.status(201).json({message:"User registerd successfuly",User:user});
}catch(err){
  console.log("ERROR____",err)
  res.status(500).json({error:"Internal error while register"})
}
}

  const login=async (req,res)=>{
  try{ 
     const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user || !(await bcrypt.compare(password,user.password))){
      return res.status(401).json({error:"invalid credietnial"})
    }
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
      expiresIn:'2h'
    });

    res.json({token})
  }catch(err){
    console.log("Error ____".err)
    res.status(500).json({error:"Internal error while login"})
  }


}

module.exports ={register,login}