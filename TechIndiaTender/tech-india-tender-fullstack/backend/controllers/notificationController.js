const pool=require('../config/db');
exports.myNotifications=async(req,res)=>{
 try{
  const {rows}=await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[req.user.id]);
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
exports.markRead=async(req,res)=>{
 try{
  await pool.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);
  res.json({success:true});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
