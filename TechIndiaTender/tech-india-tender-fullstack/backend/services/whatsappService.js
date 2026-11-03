const BASE='https://graph.facebook.com/v20.0';

async function send(to,text){
 const id=process.env.WHATSAPP_PHONE_NUMBER_ID,token=process.env.WHATSAPP_ACCESS_TOKEN;
 if(!id||!token){console.log(`WhatsApp not configured. Message for ${to}: ${text}`);return}
 await fetch(`${BASE}/${id}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:text}})});
}

exports.sendOtpWhatsapp=async(phone,otp)=>send(phone,`Your Tech India Tender login OTP is ${otp}. It is valid for ${process.env.OTP_EXPIRES_MINUTES||10} minutes.`);
exports.sendTenderWhatsapp=async(phone,matches)=>send(phone,`🔔 Tech India Tender Alert\n${matches.length} new tender(s) matched your keywords:\n\n`+matches.map(t=>`• ${t.tender_number}\n${t.title}\nClosing: ${new Date(t.closing_date).toLocaleDateString('en-IN')}`).join('\n\n'));
