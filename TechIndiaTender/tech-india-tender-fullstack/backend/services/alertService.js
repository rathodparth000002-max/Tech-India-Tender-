const pool=require('../config/db');
const emailService=require('./emailService');
const whatsappService=require('./whatsappService');
const smsService=require('./smsService');

exports.checkKeywordAlerts=async(newTender)=>{
 const text=`${newTender.tender_number} ${newTender.title} ${newTender.organisation||''} ${newTender.category||''} ${newTender.state||''}`.toLowerCase();
 const {rows:keywords}=await pool.query(`SELECT k.keyword,k.user_id,u.full_name,u.email,u.phone FROM alert_keywords k JOIN users u ON u.id=k.user_id WHERE u.is_active=true`);
 const matched={};
 for(const k of keywords){
  if(text.includes(k.keyword.toLowerCase())){
   (matched[k.user_id]??=({user:null,items:[]}));
   matched[k.user_id].items.push(newTender);
  }
 }
 for(const [userId,data] of Object.entries(matched)){
  const {rows}=await pool.query('SELECT full_name,email,phone FROM users WHERE id=$1',[userId]);
  const user=rows[0];if(!user)continue;
  await emailService.sendTenderAlert(user.email,user.full_name,data.items);
  await whatsappService.sendTenderWhatsapp(user.phone,data.items);
  await smsService.sendTenderSms(user.phone,`${data.items.length} new tender matches found.`);
  await pool.query('INSERT INTO notifications(user_id,title,message,type) VALUES($1,$2,$3,$4)',[userId,'New tender match',`${data.items.length} tender(s) matched your keywords.`,'tender_alert']);
 }
};
