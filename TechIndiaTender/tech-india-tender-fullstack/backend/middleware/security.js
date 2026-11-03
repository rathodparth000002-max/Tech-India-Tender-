const validator=require('validator');

exports.validateRegistration=(req,res,next)=>{
 const {full_name,email,phone,password}=req.body;
 if(!full_name||!email||!phone||!password)return res.status(400).json({success:false,message:'All required fields must be provided'});
 if(!validator.isEmail(email))return res.status(400).json({success:false,message:'Invalid email address'});
 if(!/^[6-9]\d{9}$/.test(phone))return res.status(400).json({success:false,message:'Enter a valid 10-digit Indian mobile number'});
 if(password.length<8)return res.status(400).json({success:false,message:'Password must be at least 8 characters'});
 next();
};

exports.validateTender=(req,res,next)=>{
 const {tender_number,title,closing_date}=req.body;
 if(!tender_number||!title||!closing_date)return res.status(400).json({success:false,message:'Tender number, title and closing date are required'});
 next();
};
