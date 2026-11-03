const crypto=require('crypto');
const pool=require('../config/db');
const emailService=require('./emailService');
const smsService=require('./smsService');

exports.createOtp=async(user,purpose='login')=>{
 const otp=String(crypto.randomInt(100000,999999));
 const expires=new Date(Date.now()+(process.env.OTP_EXPIRES_MINUTES||10)*60*1000);
 await pool.query('UPDATE otp_codes SET used=true WHERE user_id=$1 AND purpose=$2',[user.id,purpose]);
 await pool.query('INSERT INTO otp_codes(user_id,code,purpose,expires_at) VALUES($1,$2,$3,$4)',[user.id,otp,purpose,expires]);
 await emailService.sendOtpEmail(user.email,otp);
 if(user.phone)await smsService.sendOtpSms(user.phone,otp);
 return {otp_sent:true,expires_at:expires};
};

exports.verifyOtp=async(userId,code,purpose='login')=>{
 const {rows}=await pool.query(`SELECT * FROM otp_codes WHERE user_id=$1 AND purpose=$2 AND used=false AND expires_at>NOW() ORDER BY created_at DESC LIMIT 1`,[userId,purpose]);
 const record=rows[0];
 if(!record)return {success:false,message:'OTP expired or not found. Please request a new OTP.'};
 if(record.code!==String(code))return {success:false,message:'Incorrect OTP. Please try again.'};
 await pool.query('UPDATE otp_codes SET used=true WHERE id=$1',[record.id]);
 return {success:true};
};
