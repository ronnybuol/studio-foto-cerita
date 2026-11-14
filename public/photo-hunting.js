// Personal, durable upload queue. Photo bytes remain in IndexedDB until R2 confirms.
const DB_NAME="lm26-hunting-queue-v1";
const STORE="pending";
const MAX_BYTES=2*1024*1024;
function database(){
 return new Promise((resolve,reject)=>{
   if(typeof indexedDB==="undefined")return reject(Error("Browser tidak mendukung penyimpanan foto offline"));
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:"key"});
   req.onerror=()=>reject(req.error);
   req.onsuccess=()=>resolve(req.result);
 });
}
async function storeAction(mode,command){
 const db=await database();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,mode);
   let value;
   tx.oncomplete=()=>resolve(value);
   tx.onerror=()=>reject(tx.error);
   tx.onabort=()=>reject(tx.error||Error("Penyimpanan lokal dibatalkan"));
   const req=command(tx.objectStore(STORE));
   if(req){req.onsuccess=()=>{value=req.result};req.onerror=()=>reject(req.error)}
  });
 }finally{db.close()}
}
const queued=async(owner)=>(await storeAction("readonly",store=>store.getAll())).filter(item=>item.owner===owner).sort((a,b)=>a.slot-b.slot);
const saveQueue=item=>storeAction("readwrite",store=>store.put(item));
const deleteQueue=(owner,slot)=>storeAction("readwrite",store=>store.delete(owner+":"+slot));
export async function optimizeHuntingPhoto(file){
 if(!file?.type.startsWith("image/"))throw Error("Pilih file foto dari galeri atau kamera");
 if(file.size>30*1024*1024)throw Error("Foto asal terlalu besar (maksimal 30 MB)");
 const bitmap=await createImageBitmap(file);
 try{
  const side=Math.max(bitmap.width,bitmap.height);
  const dimension=Math.min(1600,side);
  const scale=dimension/side;
  const width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)throw Error("Browser tidak dapat mengoptimalkan foto");
  ctx.drawImage(bitmap,0,0,width,height);
  const toBlob=(quality)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error("Konversi WebP gagal")),"image/webp",quality));
  let blob=await toBlob(.78);
  for(const q of [.68,.55,.42]){if(blob.size<=MAX_BYTES)break;blob=await toBlob(q)}
  if(blob.type!=="image/webp"||blob.size>MAX_BYTES)throw Error("Foto terlalu besar setelah dikompresi; pilih foto lain");
  return {blob,width,height};
 }finally{bitmap.close()}
}
export function createHuntingUploader({base,getUser,getOnline,onUpdate=()=>{}}){
 let busy=false;
 const auth=()=>{const user=getUser();if(!user?.id||!user.token)throw Error("Masuk sebagai peserta terlebih dahulu");return user};
 const call=async(path,{method="GET",blob,headers={}}={})=>{
  const owner=auth();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(base+path,{method,headers:{Authorization:"Bearer "+owner.token,...headers},body:blob,cache:"no-store",signal:controller.signal});
   if(!response.ok){
    let message;try{message=(await response.json()).error}catch{}
    const error=Object.assign(new Error(message||"Gagal menghubungi server foto"),{status:response.status});
    throw error;
   }
   return response;
  }finally{clearTimeout(timer)}
 };
 const list=async()=> (await (await call("/api/hunting/photos")).json()).photos||[];
 const preview=async(slot)=> (await call("/api/hunting/photos/"+slot)).blob();
 async function queue(files,existing=[]){
  const owner=auth().id;
  const pending=await queued(owner);
  const occupied=new Set([...existing.map(x=>x.slot),...pending.map(x=>x.slot)]);
  const available=Array.from({length:12},(_,i)=>i+1).filter(slot=>!occupied.has(slot));
  if(files.length>available.length)throw Error("Slot foto tersisa "+available.length+". Maksimal 12 foto per peserta.");
  const result=[];
  for(const file of files){
   const photo=await optimizeHuntingPhoto(file);
   const slot=available.shift();
   await saveQueue({key:owner+":"+slot,owner,slot,...photo,createdAt:new Date().toISOString(),fileName:file.name});
   result.push(slot);
   onUpdate({status:"queued",slot});
  }
  return result;
 }
 async function flush(){
  const owner=auth().id;
  if(busy)return {busy:true};
  if(!getOnline())return {pending:(await queued(owner)).length,offline:true};
  busy=true;
  let sent=0,error=null;
  try{
   for(const item of await queued(owner)){
    if(auth().id!==owner)break;
    try{
     onUpdate({status:"uploading",slot:item.slot});
     const response=await call("/api/hunting/photos/"+item.slot,{method:"PUT",blob:item.blob,
       headers:{"Content-Type":"image/webp","X-Photo-Width":String(item.width),"X-Photo-Height":String(item.height)}});
     if(response.status!==201)throw Error("Server belum mengonfirmasi penyimpanan");
     await deleteQueue(owner,item.slot);
     sent++;
     onUpdate({status:"saved",slot:item.slot});
    }catch(failed){
     // A timeout can occur after R2 and D1 have committed; verify slot before retry.
     if(failed.status===409){
      try{if((await list()).some(photo=>photo.slot===item.slot)){await deleteQueue(owner,item.slot);sent++;continue}}catch{}
     }
     error=failed;onUpdate({status:"failed",slot:item.slot,error:failed.message});break;
    }
   }
  }finally{busy=false}
  return {sent,pending:(await queued(owner)).length,error};
 }
 return {list,preview,queue,flush,pending:()=>queued(auth().id),get busy(){return busy}};
}
