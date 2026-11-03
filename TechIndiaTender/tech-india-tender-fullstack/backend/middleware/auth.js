const jwt=require('jsonwebtoken');
const pool=require('../config/db');

exports.protect=async(req,res,next)=>{
 try{
  const header=req.headers.authorization||'';
  const token=header.startsWith('Bearer ')?header.slice(7):req.cookies?.token;
  if(!token)return res.status(401).json({success:false,message:'Please login to continue'});
  const decoded=jwt.verify(token,process.env.JWT_SECRET);
  const {rows}=await pool.query('SELECT id,full_name,email,phone,role,is_active FROM users WHERE id=$1',[decoded.id]);
  if(!rows[0]||!rows[0].is_active)return res.status(401).json({success:false,message:'Account is inactive or not found'});
  req.user=rows[0];next();
 }catch(e){return res.status(401).json({success:false,message:'Invalid or expired session'})}
};

exports.adminOnly=(req,res,next)=>{
 if(req.user?.role!=='admin')return res.status(403).json({success:false,message:'Admin access required'});
 next();
};
