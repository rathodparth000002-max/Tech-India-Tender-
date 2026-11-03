const pool=require('../config/db');

exports.listTenders=async(req,res)=>{
 try{
  const {keyword,state,category,status,department,page=1,limit=20}=req.query;
  const values=[];const where=[];
  const add=(cond,val)=>{values.push(val);where.push(cond.replace('?',`$${values.length}`))};
  if(keyword)add(`(tender_number ILIKE ? OR title ILIKE ? OR organisation ILIKE ? OR category ILIKE ?)`,`%${keyword}%`);
  if(state)add('state = ?',state);
  if(category)add('category = ?',category);
  if(status)add('status = ?',status);
  if(department)add('organisation ILIKE ?',`%${department}%`);
  const user=req.user;
  const isPaid=user&&user.role!=='customer'?true:false;
  const offset=(page-1)*limit;
  const q=`SELECT * FROM tenders ${where.length?'WHERE '+where.map(w=>w.replace(/\?/g,m=>m)).join(' AND '):''} ORDER BY closing_date ASC LIMIT $${values.length+1} OFFSET $${values.length+2}`;
  const {rows}=await pool.query(q,[...values,limit,offset]);
  const safe=rows.map(t=>isPaid?t:{...t,description:null,documents:null,official_link:t.official_link?'Login required':null});
  res.json({success:true,data:safe,page:Number(page),limit:Number(limit)});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.getTender=async(req,res)=>{
 try{
  const {rows}=await pool.query('SELECT * FROM tenders WHERE id=$1',[req.params.id]);
  if(!rows[0])return res.status(404).json({success:false,message:'Tender not found'});
  res.json({success:true,data:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.saveTender=async(req,res)=>{
 try{
  const {tender_id}=req.body;
  await pool.query('INSERT INTO saved_tenders(user_id,tender_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[req.user.id,tender_id]);
  res.json({success:true,message:'Tender saved.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.getSaved=async(req,res)=>{
 try{
  const {rows}=await pool.query(`SELECT t.* FROM saved_tenders s JOIN tenders t ON t.id=s.tender_id WHERE s.user_id=$1 ORDER BY s.created_at DESC`,[req.user.id]);
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.addKeyword=async(req,res)=>{
 try{
  const {keyword}=req.body;
  if(!keyword)return res.status(400).json({success:false,message:'Keyword is required'});
  await pool.query('INSERT INTO alert_keywords(user_id,keyword) VALUES($1,$2)',[req.user.id,keyword]);
  res.json({success:true,message:'Keyword alert added. You will receive email and WhatsApp alerts for matching tenders.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.getKeywords=async(req,res)=>{
 try{
  const {rows}=await pool.query('SELECT id,keyword,created_at FROM alert_keywords WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.deleteKeyword=async(req,res)=>{
 try{
  await pool.query('DELETE FROM alert_keywords WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);
  res.json({success:true,message:'Keyword removed.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
