const router=require('express').Router();
const c=require('../controllers/tenderController');
const {protect}=require('../middleware/auth');

router.get('/',c.listTenders);
router.get('/:id',c.getTender);
router.post('/save',protect,c.saveTender);
router.get('/saved',protect,c.getSaved);
router.post('/keywords',protect,c.addKeyword);
router.get('/keywords',protect,c.getKeywords);
router.delete('/keywords/:id',protect,c.deleteKeyword);
module.exports=router;
