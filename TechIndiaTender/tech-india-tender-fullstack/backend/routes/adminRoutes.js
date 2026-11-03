const router=require('express').Router();
const c=require('../controllers/adminController');
const {protect,adminOnly}=require('../middleware/auth');
const {validateTender}=require('../middleware/security');

router.use(protect,adminOnly);
router.get('/dashboard',c.dashboard);
router.post('/tenders',validateTender,c.createTender);
router.put('/tenders/:id',c.updateTender);
router.delete('/tenders/:id',c.deleteTender);
router.get('/customers',c.listCustomers);
router.patch('/customers/:id/toggle',c.toggleCustomer);
router.get('/enquiries',c.enquiries);
router.post('/enquiries',c.createEnquiry);
module.exports=router;
