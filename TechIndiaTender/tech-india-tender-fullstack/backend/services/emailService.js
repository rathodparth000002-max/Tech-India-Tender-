const nodemailer=require('nodemailer');

const transporter=nodemailer.createTransport({
 host:process.env.SMTP_HOST||'smtp.gmail.com',
 port:process.env.SMTP_PORT||587,
 secure:String(process.env.SMTP_SECURE)==='true',
 auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}
});

exports.sendOtpEmail=async(to,otp)=>{
 if(!process.env.SMTP_USER)return console.log('SMTP not configured. OTP:',otp);
 await transporter.sendMail({from:process.env.EMAIL_FROM,to,subject:'Tech India Tender - Login OTP',html:`<h2>Your OTP</h2><p>Your Tech India Tender login OTP is:</p><h1 style="letter-spacing:6px">${otp}</h1><p>This OTP is valid for ${process.env.OTP_EXPIRES_MINUTES||10} minutes.</p>`});
};

exports.sendTenderAlert=async(to,name,matches)=>{
 if(!process.env.SMTP_USER)return console.log('SMTP not configured. Tender alert skipped.');
 const list=matches.map(t=>`<li><b>${t.tender_number}</b> - ${t.title}<br>Closing: ${new Date(t.closing_date).toLocaleDateString('en-IN')}</li>`).join('');
 await transporter.sendMail({from:process.env.EMAIL_FROM,to,subject:`${matches.length} new tender match(es) for your keywords`,html:`<p>Hello ${name},</p><p>New tenders matched your saved keywords:</p><ul>${list}</ul><p>Login to your Tech India Tender dashboard for details.</p>`});
};

exports.sendPaymentReceipt=async(to,name,amount,plan)=>{
 if(!process.env.SMTP_USER)return console.log('SMTP not configured. Payment receipt skipped.');
 await transporter.sendMail({from:process.env.EMAIL_FROM,to,subject:'Payment Successful - Tech India Tender',html:`<p>Hello ${name},</p><p>Your payment of <b>₹${amount}</b> for the <b>${plan}</b> plan was successful.</p>`});
};
