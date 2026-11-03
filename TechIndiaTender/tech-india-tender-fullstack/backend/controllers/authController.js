const bcrypt=require('bcryptjs');
const validator=require('validator');
const pool=require('../config/db');
const otpService=require('../services/otpService');
const {signToken}=require('../utils/tokens');

exports.register=async(req,res)=>{
 try{
  const {full_name,email,phone,password,business_name,business_type}=req.body;
  const exists=await pool.query('SELECT id FROM users WHERE email=$1 OR phone=$2',[email,phone]);
  if(exists.rows[0])return res.status(409).json({success:false,message:'An account already exists with this email or mobile number'});
  const hash=await bcrypt.hash(password,12);
  const {rows}=await pool.query(`INSERT INTO users(full_name,email,phone,password_hash,business_name,business_type,role) VALUES($1,$2,$3,$4,$5,$6,'customer') RETURNING id,full_name,email,phone,role`,[full_name,email.toLowerCase(),phone,hash,business_name,business_type]);
  const user=rows[0];
  const otp=await otpService.createOtp(user,'registration');
  res.status(201).json({success:true,message:'Registration successful. OTP sent to your mobile and email.',user,otp});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.verifyRegistration=async(req,res)=>{
 try{
  const {user_id,otp}=req.body;
  const result=await otpService.verifyOtp(user_id,otp,'registration');
  if(!result.success)return res.status(400).json(result);
  await pool.query('UPDATE users SET is_verified=true WHERE id=$1',[user_id]);
  const {rows}=await pool.query('SELECT id,full_name,email,phone,role FROM users WHERE id=$1',[user_id]);
  res.json({success:true,message:'Mobile and email verified successfully.',token:signToken(rows[0]),user:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.login=async(req,res)=>{
 try{
  const {identifier,password}=req.body;
  const {rows}=await pool.query('SELECT * FROM users WHERE email=$1 OR phone=$2',[identifier?.toLowerCase(),identifier]);
  const user=rows[0];
  if(!user||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({success:false,message:'Invalid email/mobile or password'});
  if(!user.is_active)return res.status(403).json({success:false,message:'Your account is deactivated'});
  const otp=await otpService.createOtp(user,'login');
  res.json({success:true,message:'OTP sent to your registered mobile number and email.',user_id:user.id,masked_phone:user.phone?.replace(/^(\d{2})\d+(\d{2})$/,'$1******$2'),masked_email:user.email?.replace(/^(.).*(@.*)$/,'$1*****$2')});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.verifyLogin=async(req,res)=>{
 try{
  const {user_id,otp}=req.body;
  const result=await otpService.verifyOtp(user_id,otp,'login');
  if(!result.success)return res.status(400).json(result);
  const {rows}=await pool.query('SELECT id,full_name,email,phone,role,is_verified FROM users WHERE id=$1',[user_id]);
  res.json({success:true,message:'Login successful.',token:signToken(rows[0]),user:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.resendOtp=async(req,res)=>{
 try{
  const {user_id}=req.body;
  const {rows}=await pool.query('SELECT id,full_name,email,phone FROM users WHERE id=$1',[user_id]);
  if(!rows[0])return res.status(404).json({success:false,message:'User not found'});
  await otpService.createOtp(rows[0],'login');
  res.json({success:true,message:'A new OTP has been sent.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.getProfile=async(req,res)=>res.json({success:true,user:req.user});

exports.updateProfile=async(req,res)=>{
 try{
  const {full_name,business_name,business_type}=req.body;
  const {rows}=await pool.query('UPDATE users SET full_name=COALESCE($1,full_name),business_name=COALESCE($2,business_name),business_type=COALESCE($3,business_type) WHERE id=$4 RETURNING id,full_name,email,phone,business_name,business_type',[full_name,business_name,business_type,req.user.id]);
  res.json({success:true,user:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.changePassword=async(req,res)=>{
 try{
  const {current_password,new_password}=req.body;
  const {rows}=await pool.query('SELECT password_hash FROM users WHERE id=$1',[req.user.id]);
  if(!(await bcrypt.compare(current_password,rows[0].password_hash)))return res.status(400).json({success:false,message:'Current password is incorrect'});
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2',[await bcrypt.hash(new_password,12),req.user.id]);
  res.json({success:true,message:'Password updated successfully.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
