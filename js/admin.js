(function(){
const url=window.IMAN_SUPABASE_URL,key=window.IMAN_SUPABASE_KEY;
const cfg=document.getElementById('config-warning'), loginPanel=document.getElementById('login-panel'), app=document.getElementById('app-panel');
if(!url||url.startsWith('PASTE_')||!key||key.startsWith('PASTE_')){cfg.classList.remove('hidden');return;}
const sb=window.supabase.createClient(url,key);
const $=id=>document.getElementById(id), msg=(el,text,cls='')=>{el.textContent=text;el.className='notice '+cls;el.classList.remove('hidden')};
let selected=[];

async function refresh(){
 const {data:{session}}=await sb.auth.getSession();
 if(session){loginPanel.classList.add('hidden');app.classList.remove('hidden');$('user-email').textContent=session.user.email||'';}
 else {loginPanel.classList.remove('hidden');app.classList.add('hidden');}
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault(); const {error}=await sb.auth.signInWithPassword({email:$('email').value,password:$('password').value});
 if(error) msg($('login-msg'),'Log masuk gagal: '+error.message,'danger'); else $('login-msg').classList.add('hidden');
 await refresh();
});
$('logout').addEventListener('click',async()=>{await sb.auth.signOut();await refresh()});
sb.auth.onAuthStateChange(()=>refresh());

async function compress(file){
 const max=1800, quality=.78;
 return new Promise((resolve,reject)=>{
  const img=new Image(), reader=new FileReader();
  reader.onload=()=>{img.onload=()=>{
    let w=img.naturalWidth,h=img.naturalHeight, scale=Math.min(1,max/Math.max(w,h)); w=Math.round(w*scale);h=Math.round(h*scale);
    const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);
    c.toBlob(async blob=>{
      if(!blob){reject(new Error('Gagal memampatkan '+file.name));return;}
      // If still >1.5MB, reduce quality gradually.
      let q=.78, out=blob;
      while(out.size>1.5*1024*1024 && q>.45){
        q-=.08; out=await new Promise(r=>c.toBlob(r,'image/jpeg',q));
      }
      const base=(file.name.replace(/\.[^.]+$/,'')||'gambar').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,80);
      resolve(new File([out],base+'-'+Date.now()+'.jpg',{type:'image/jpeg'}));
    },'image/jpeg',quality);
  };img.onerror=()=>reject(new Error('Fail imej tidak boleh dibaca: '+file.name));img.src=reader.result;};
  reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);
 });
}
function renderPreviews(){
 const box=$('previews');box.innerHTML='';
 selected.forEach((f,i)=>{const d=document.createElement('div');d.className='preview';const u=URL.createObjectURL(f);d.innerHTML='<img src="'+u+'" alt=""><small>'+f.name+'<br>'+Math.round(f.size/1024)+' KB</small>';box.appendChild(d);});
}
$('photos').addEventListener('change',async e=>{
 const files=[...e.target.files]; if(!files.length)return;
 $('save-msg').classList.add('hidden'); selected=[];
 for(let i=0;i<files.length;i++){try{selected.push(await compress(files[i]));}catch(err){msg($('save-msg'),err.message,'danger');}}
 renderPreviews();
});
$('clear-btn').addEventListener('click',()=>{selected=[];$('photos').value='';$('previews').innerHTML='';$('event-form').reset();$('progress').style.width='0';$('save-msg').classList.add('hidden')});

$('event-form').addEventListener('submit',async e=>{
 e.preventDefault(); const btn=$('save-btn');btn.disabled=true;
 try{
  const {data:{user}}=await sb.auth.getUser(); if(!user) throw new Error('Sesi log masuk tamat.');
  if(!selected.length) throw new Error('Pilih sekurang-kurangnya satu gambar.');
  const title=$('title').value.trim(), date=$('event-date').value;
  const {data:event,error:ee}=await sb.from('events').insert({title,event_date:date,location:$('location').value.trim(),category:$('category').value,description:$('description').value.trim()}).select().single();
  if(ee) throw ee;
  let cover=null;
  for(let i=0;i<selected.length;i++){
   const f=selected[i], path='events/'+event.id+'/'+String(i+1).padStart(3,'0')+'-'+f.name;
   const {error:ue}=await sb.storage.from('activity-photos').upload(path,f,{cacheControl:'31536000',upsert:false,contentType:'image/jpeg'});
   if(ue) throw ue;
   const {error:pe}=await sb.from('event_photos').insert({event_id:event.id,file_path:path,caption:'',sort_order:i});
   if(pe) throw pe;
   if(!cover) cover=path; $('progress').style.width=Math.round(((i+1)/selected.length)*100)+'%';
  }
  const {error:ce}=await sb.from('events').update({cover_image:cover}).eq('id',event.id); if(ce) throw ce;
  msg($('save-msg'),'Program berjaya disimpan dan '+selected.length+' gambar telah dimuat naik.','success');
  $('event-form').reset();selected=[];$('photos').value='';$('previews').innerHTML='';
 }catch(err){console.error(err);msg($('save-msg'),'Gagal: '+(err.message||err),'danger')}
 finally{btn.disabled=false}
});
refresh();
})();