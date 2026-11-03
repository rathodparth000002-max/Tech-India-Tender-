const router=require('express').Router();
const c=require('../controllers/authController');
const {protect}=require('../middleware/auth');
const {validateRegistration}=require('../middleware/security');

router.post('/register',validateRegistration,c.register);
router.post('/verify-registration',c.verifyRegistration);
router.post('/login',c.login);
router.post('/verify-login',c.verifyLogin);
router.post('/resend-otp',c.resendOtp);
router.get('/profile',protect,c.getProfile);
router.put('/profile',protect,c.updateProfile);
router.put('/change-password',protect,c.changePassword);
module.exports=router;
