const pool=require('../config/db');
const alertService=require('../services/alertService');

exports.dashboard=async(req,res)=>{
 try{
  const q=async sql=>(await pool.query(sql)).rows[0];
  const customers=await q('SELECT COUNT(*)::int AS total FROM users WHERE role=$1',['customer']);
  const active=await q("SELECT COUNT(*)::int AS total FROM users WHERE role='customer' AND is_active=true");
  const tenders=await q('SELECT COUNT(*)::int AS total FROM tenders');
  const live=await q("SELECT COUNT(*)::int AS total FROM tenders WHERE status='Live'");
  const closed=await q("SELECT COUNT(*)::int AS total FROM tenders WHERE status='Closed'");
  const enquiries=await q('SELECT COUNT(*)::int AS total FROM enquiries');
  res.json({success:true,data:{customers,active,tenders,live,closed,enquiries}});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.createTender=async(req,res)=>{
 try{
  const {tender_number,title,organisation,state,category,tender_value,emd,closing_date,status='Live',description,official_link}=req.body;
  const {rows}=await pool.query(`INSERT INTO tenders(tender_number,title,organisation,state,category,tender_value,emd,closing_date,status,description,official_link,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[tender_number,title,organisation,state,category,tender_value,emd,closing_date,status,description,official_link,req.user.id]);
  alertService.checkKeywordAlerts(rows[0]);
  res.status(201).json({success:true,message:'Tender published successfully.',data:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.updateTender=async(req,res)=>{
 try{
  const keys=['tender_number','title','organisation','state','category','tender_value','emd','closing_date','status','description','official_link'];
  const sets=[],values=[];
  keys.forEach(k=>{if(req.body[k]!==undefined){values.push(req.body[k]);sets.push(`${k}=$${values.length}`)}});
  values.push(req.params.id);
  const {rows}=await pool.query(`UPDATE tenders SET ${sets.join(',')} WHERE id=$${values.length} RETURNING *`,values);
  res.json({success:true,data:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.deleteTender=async(req,res)=>{
 try{
  await pool.query('DELETE FROM tenders WHERE id=$1',[req.params.id]);
  res.json({success:true,message:'Tender deleted.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.listCustomers=async(req,res)=>{
 try{
  const {rows}=await pool.query(`SELECT id,full_name,email,phone,business_name,business_type,role,is_active,is_verified,created_at FROM users ORDER BY created_at DESC`);
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.toggleCustomer=async(req,res)=>{
 try{
  const {rows}=await pool.query('UPDATE users SET is_active=NOT is_active WHERE id=$1 RETURNING id,is_active',[req.params.id]);
  res.json({success:true,data:rows[0]});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.enquiries=async(req,res)=>{
 try{
  const {rows}=await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
  res.json({success:true,data:rows});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};

exports.createEnquiry=async(req,res)=>{
 try{
  const {name,phone,email,service,message}=req.body;
  await pool.query('INSERT INTO enquiries(name,phone,email,service,message) VALUES($1,$2,$3,$4,$5)',[name,phone,email,service,message]);
  res.json({success:true,message:'Enquiry submitted successfully.'});
 }catch(e){res.status(500).json({success:false,message:e.message})}
};
