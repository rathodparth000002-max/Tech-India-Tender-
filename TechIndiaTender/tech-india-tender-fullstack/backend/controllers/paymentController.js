const pool=require('../config/db');
const emailService=require('../services/emailService');

exports.createOrder=async(req,res)=>{
 try{
  const {plan_id}=req.body;
  const {rows}=await pool.query('SELECT * FROM subscription_plans WHERE id=$1 AND is_active=true',[plan_id]);
  const plan=rows[0];
  if(!plan)return res.status(404).json({success:false,message:'Plan not found'});
  if(!process.env.RAZORPAY_KEY_ID)return res.status(400).json({success:false,message:'Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'});
  res.json({success:true,message:'Razorpay order creation endpoint ready.',plan,razorpay_key_id:process.env.RAZORPAY_KEY_ID});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.verifyPayment=async(req,res)=>{
 try{
  const {plan_id,razorpay_order_id,razorpay_payment_id}=req.body;
  const {rows}=await pool.query('SELECT * FROM subscription_plans WHERE id=$1',[plan_id]);
  const plan=rows[0];if(!plan)return res.status(404).json({success:false,message:'Plan not found'});
  const expiry=new Date(Date.now()+plan.duration_days*24*60*60*1000);
  await pool.query('UPDATE users SET subscription_plan_id=$1,subscription_expires_at=$2 WHERE id=$3',[plan_id,expiry,req.user.id]);
  await pool.query('INSERT INTO payments(user_id,plan_id,amount,provider,provider_payment_id,status) VALUES($1,$2,$3,$4,$5,$6)',[req.user.id,plan_id,plan.price,'razorpay',razorpay_payment_id,'success']);
  await emailService.sendPaymentReceipt(req.user.email,req.user.full_name,plan.price,plan.name);
  res.json({success:true,message:'Subscription activated successfully.',expires_at:expiry});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.paymentHistory=async(req,res)=>{
 try{
  const {rows}=await pool.query(`SELECT p.*,sp.name AS plan_name FROM payments p LEFT JOIN subscription_plans sp ON sp.id=p.plan_id WHERE p.user_id=$1 ORDER BY p.created_at DESC`,[req.user.id]);
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
