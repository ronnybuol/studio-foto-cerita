import {createHuntingUploader} from "./photo-hunting.js";
const escapeHtml=text=>String(text||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let manager=null,ownerId=null,previewUrls=[];
const clearPreviews=()=>{for(const url of previewUrls)URL.revokeObjectURL(url);previewUrls=[]};
const status=(message)=>{const el=document.querySelector("#hunting-upload-status");if(el)el.textContent=message};
export function huntingPanelHTML(){
 return `<section class="card hunting-uploader" id="hunting-upload-panel">
 <span class="eyebrow">TAHAP 03 · GALERI HUNTING</span>
 <h2>Kumpulkan foto hasil hunting</h2>
 <p>Pilih maksimal 12 foto dari galeri HP. Aplikasi membuat salinan WebP yang lebih ringan; foto asli tetap di galeri HP.</p>
 <div class="hunting-upload-actions">
 <label class="btn primary" for="hunting-select-photos">+ Pilih foto dari HP</label>
 <input id="hunting-select-photos" type="file" accept="image/*" multiple>
 <button class="btn subtle" id="hunting-retry-photos" type="button">↻ Unggah tertunda / Perbarui</button>
 </div>
 <p class="small-note" id="hunting-upload-status" role="status" aria-live="polite">Memeriksa galeri foto…</p>
 <div id="hunting-photo-gallery" class="hunting-photo-gallery" aria-label="Foto hunting milikmu"></div>
 <p class="small-note">Foto baru aman di server setelah status <strong>Tersimpan di server</strong>. Jika koneksi terputus, salinan antrean dijaga di browser ini; jangan hapus data browser atau foto asli.</p>
 </section>`;
}
export function bindHuntingUI({getUser,getOnline,onNotice=()=>{}}){
 const panel=document.querySelector("#hunting-upload-panel");
 if(!panel||!getUser()?.id)return;
 if(ownerId!==getUser().id){
   ownerId=getUser().id;
   clearPreviews();
   manager=createHuntingUploader({
     base:"/lensa-muda",getUser,getOnline,
     onUpdate:({status:next,slot,error})=>{
      const msg={queued:"disimpan dalam antrean perangkat",uploading:"sedang dikirim",saved:"tersimpan di server",failed:"gagal dikirim"}[next]||next;
      status("Foto "+slot+" "+msg+(error?": "+error:"")+".");
     }
   });
 }
 const uploader=manager,owner=ownerId;
 let known=[];
 async function renderGallery(){
   if(!panel.isConnected||getUser()?.id!==owner)return;
   clearPreviews();
   const gallery=document.querySelector("#hunting-photo-gallery");
   if(!gallery)return;
   let photos=[];
   if(getOnline()){
    try{photos=await uploader.list()}
    catch(error){status("Belum dapat membaca galeri server: "+error.message)}
   }
   if(!panel.isConnected||getUser()?.id!==owner)return;
   known=photos;
   const pending=await uploader.pending();
   if(!panel.isConnected||getUser()?.id!==owner)return;
   const confirmed=new Set(photos.map(p=>p.slot));
   gallery.innerHTML=Array.from({length:12},(_,i)=>{
      const slot=i+1,match=photos.find(p=>p.slot===slot),waiting=pending.find(p=>p.slot===slot);
      const label=match?"Tersimpan di server":waiting?"Menunggu unggah":"Slot kosong";
      return `<div class="hunting-photo-card"><div class="hunting-photo-frame" id="hunting-photo-${slot}">
       <span>${match||waiting?"Memuat foto…":"+"}</span></div>
       <b>Foto ${slot}</b><small>${escapeHtml(label)}</small>
       ${match?`<small>${(match.bytes/1024).toFixed(0)} KB</small>`:""}
       </div>`;
   }).join("");
   for(const item of pending){
     if(confirmed.has(item.slot))continue;
     const node=document.querySelector("#hunting-photo-"+item.slot);
     if(!node)continue;
     const url=URL.createObjectURL(item.blob);previewUrls.push(url);
     node.innerHTML=`<img src="${url}" alt="Foto ${item.slot} menunggu unggah">`;
   }
   await Promise.all(photos.map(async photo=>{
     try{
      const blob=await uploader.preview(photo.slot);
      if(!panel.isConnected||getUser()?.id!==owner)return;
      const node=document.querySelector("#hunting-photo-"+photo.slot);
      if(!node)return;
      const url=URL.createObjectURL(blob);previewUrls.push(url);
      node.innerHTML=`<img src="${url}" alt="Foto hunting ${photo.slot} sudah tersimpan">`;
     }catch{
      const node=document.querySelector("#hunting-photo-"+photo.slot);
      if(node)node.textContent="Pratinjau belum tersedia";
     }
   }));
   if(!panel.isConnected||getUser()?.id!==owner)return;
   status(photos.length+" dari 12 foto tersimpan di server"+(pending.length?" · "+pending.length+" foto dalam antrean perangkat":"")+".");
 }
 const select=panel.querySelector("#hunting-select-photos");
 select.onchange=async()=>{
  const files=[...select.files];select.value="";
  if(!files.length)return;
  select.disabled=true;
  try{
   status("Mengoptimalkan "+files.length+" foto; jangan tutup halaman…");
   // Read fresh server slots to avoid overwriting an upload from another tab.
   if(getOnline())known=await uploader.list();
   await uploader.queue(files,known);
   status("Salinan WebP sudah disimpan dalam antrean perangkat. Memulai unggah…");
   if(getOnline()){
     const result=await uploader.flush();
     if(result.error)onNotice("Sebagian foto menunggu kirim ulang: "+result.error.message);
   }
   await renderGallery();
  }catch(error){status("Foto belum diproses: "+error.message);onNotice(error.message)}
  finally{select.disabled=false}
 };
 const retry=panel.querySelector("#hunting-retry-photos");
 retry.onclick=async()=>{
  retry.disabled=true;
  try{
   if(getOnline()){
    const result=await uploader.flush();
    if(result.error)onNotice(result.error.message);
   }
   await renderGallery();
  }catch(error){status("Belum berhasil: "+error.message)}
  finally{retry.disabled=false}
 };
 void renderGallery();
}
