exports.sendOtpSms=async(phone,otp)=>{
 if(!process.env.SMS_API_URL){console.log(`SMS provider not configured. OTP for ${phone}: ${otp}`);return}
 // Integrate your Indian SMS provider here, e.g. MSG91, Textlocal, Kaleyra.
 console.log(`SMS OTP sent to ${phone}`);
};

exports.sendTenderSms=async(phone,message)=>{
 if(!process.env.SMS_API_URL){console.log(`SMS provider not configured. Alert for ${phone}: ${message}`);return}
 console.log(`Tender SMS sent to ${phone}`);
};
