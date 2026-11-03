const API=location.origin.includes(':8000')?'http://localhost:5000/api':'/api';
const token=()=>localStorage.getItem('tit_token');
const headers=()=>({'Content-Type':'application/json',...(token()?{Authorization:`Bearer ${token()}`}:{})});

async function api(path,options={}){
 const res=await fetch(API+path,{...options,headers:{...headers(),...(options.headers||{})}});
 const data=await res.json().catch(()=>({success:false,message:'Server response error'}));
 if(!res.ok)throw new Error(data.message||'Request failed');
 return data;
}

function tenderRow(t){
 return `<tr><td><strong>${t.tender_number}</strong><br><small>${t.category||''}</small></td><td><strong>${t.title}</strong><br><small>${t.organisation||''}</small></td><td>${t.state||'—'}</td><td>${t.tender_value||'—'}</td><td>${t.emd||'—'}</td><td>${t.closing_date||'—'}</td><td><span class="badge ${t.status==='Live'?'badge-live':'badge-closed'}">${t.status}</span></td><td><a class="btn btn-white" href="/tender-details.html?id=${t.id}">View</a></td></tr>`;
}

async function loadTenders(){
 try{
  const params=new URLSearchParams(new FormData(document.getElementById('tenderFilters')||undefined)).toString();
  const data=await api('/tenders?'+params);
  document.getElementById('tenderRows').innerHTML=data.data.map(tenderRow).join('')||'<tr><td colspan="8">No tenders found</td></tr>';
 }catch(e){
  document.getElementById('tenderRows').innerHTML=`<tr><td colspan="8">${e.message}</td></tr>`;
 }
}

document.addEventListener('DOMContentLoaded',()=>{
 document.getElementById('tenderFilters')?.addEventListener('submit',e=>{e.preventDefault();loadTenders()});
 if(document.getElementById('tenderRows'))loadTenders();

 document.getElementById('loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const identifier=loginForm.identifier.value,password=loginForm.password.value;
   const r=await api('/auth/login',{method:'POST',body:JSON.stringify({identifier,password})});
   localStorage.setItem('tit_pending_user',r.user_id);
   document.getElementById('otpStep').classList.remove('hidden');
   document.getElementById('loginStep').classList.add('hidden');
   document.getElementById('otpInfo').textContent=`OTP sent to ${r.masked_phone} and ${r.masked_email}`;
  }catch(err){alert(err.message)}
 });

 document.getElementById('otpForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const user_id=localStorage.getItem('tit_pending_user');
   const r=await api('/auth/verify-login',{method:'POST',body:JSON.stringify({user_id,otp:otpForm.otp.value})});
   localStorage.setItem('tit_token',r.token);
   localStorage.removeItem('tit_pending_user');
   location.href='/customer/dashboard.html';
  }catch(err){alert(err.message)}
 });

 document.getElementById('registerForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const body=Object.fromEntries(new FormData(registerForm));
   const r=await api('/auth/register',{method:'POST',body:JSON.stringify(body)});
   localStorage.setItem('tit_pending_user',r.user.id);
   document.getElementById('registerStep').classList.add('hidden');
   document.getElementById('verifyStep').classList.remove('hidden');
   alert('OTP sent to your mobile and email.');
  }catch(err){alert(err.message)}
 });

 document.getElementById('verifyForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const user_id=localStorage.getItem('tit_pending_user');
   const r=await api('/auth/verify-registration',{method:'POST',body:JSON.stringify({user_id,otp:verifyForm.otp.value})});
   localStorage.setItem('tit_token',r.token);
   location.href='/customer/dashboard.html';
  }catch(err){alert(err.message)}
 });

 document.getElementById('addTenderForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const body=Object.fromEntries(new FormData(addTenderForm));
   await api('/admin/tenders',{method:'POST',body:JSON.stringify(body)});
   alert('Tender published successfully!');
   addTenderForm.reset();loadAdminTenders();
  }catch(err){alert(err.message)}
 });

 if(document.getElementById('adminTenderRows'))loadAdminTenders();
 if(document.getElementById('profileBox'))loadDashboard();
 if(document.getElementById('keywordList'))loadKeywords();
});

async function loadAdminTenders(){
 try{
  const data=await api('/tenders?limit=100');
  document.getElementById('adminTenderRows').innerHTML=data.data.map(t=>`<tr><td>${t.tender_number}</td><td>${t.title}</td><td>${t.state||''}</td><td>${t.tender_value||''}</td><td>${t.closing_date}</td><td><span class="badge ${t.status==='Live'?'badge-live':'badge-closed'}">${t.status}</span></td><td><button class="btn btn-white" onclick="deleteTender(${t.id})">Delete</button></td></tr>`).join('');
 }catch(e){document.getElementById('adminTenderRows').innerHTML=`<tr><td colspan="7">${e.message}</td></tr>`}
}

async function deleteTender(id){
 if(!confirm('Delete this tender?'))return;
 try{await api('/admin/tenders/'+id,{method:'DELETE'});loadAdminTenders()}catch(e){alert(e.message)}
}

async function loadDashboard(){
 try{
  const [profile,saved,keywords,notifs]=await Promise.all([api('/auth/profile'),api('/tenders/saved'),api('/tenders/keywords'),api('/notifications')]);
  document.getElementById('profileBox').innerHTML=`<h3>${profile.user.full_name}</h3><p>${profile.user.email}<br>${profile.user.phone}</p>`;
  document.getElementById('savedTenders').innerHTML=saved.data.map(tenderRow).join('')||'<tr><td colspan="8">No saved tenders</td></tr>';
  document.getElementById('keywordList').innerHTML=keywords.data.map(k=>`<span class="badge badge-gold">${k.keyword} <button onclick="removeKeyword(${k.id})">×</button></span>`).join(' ');
  document.getElementById('notificationList').innerHTML=notifs.data.map(n=>`<div class="card" style="margin-bottom:10px"><strong>${n.title}</strong><p>${n.message}</p></div>`).join('')||'<p>No notifications yet.</p>';
 }catch(e){document.getElementById('profileBox').innerHTML=`<p>Please <a href="/customer/login.html">login</a> to view dashboard.</p>`}
}

async function addKeyword(event){
 event.preventDefault();
 try{
  const keyword=event.target.keyword.value;
  await api('/tenders/keywords',{method:'POST',body:JSON.stringify({keyword})});
  event.target.reset();loadKeywords();
 }catch(e){alert(e.message)}
}

async function removeKeyword(id){
 try{await api('/tenders/keywords/'+id,{method:'DELETE'});loadKeywords()}catch(e){alert(e.message)}
}

async function loadKeywords(){
 try{
  const r=await api('/tenders/keywords');
  document.getElementById('keywordList').innerHTML=r.data.map(k=>`<span class="badge badge-gold">${k.keyword} <button onclick="removeKeyword(${k.id})">×</button></span>`).join(' ')||'<span class="mini">No keywords added.</span>';
 }catch(e){document.getElementById('keywordList').textContent=e.message}
}
