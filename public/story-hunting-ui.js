// Hydrate participant-owned hunting photos on the Meja Editor and Caption Lab.
// Images never become public assets. Blob URLs stay scoped to the signed-in participant.
let owner=null,slots=null,loading=null;
const urls=new Map();
export function huntingSlotsFor(user){return user?.id===owner?slots:null}
export async function fetchHuntingSlots(user,base="/lensa-muda"){
 if(!user?.id||!user.token)throw Error("Masuk sebagai peserta terlebih dahulu");
 if(owner!==user.id){
  for(const url of urls.values())URL.revokeObjectURL(url);
  urls.clear();owner=user.id;slots=null;loading=null;
 }
 if(slots)return slots;
 if(loading)return loading;
 const id=user.id,token=user.token;
 loading=(async()=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(base+"/api/hunting/photos",{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:controller.signal});
   if(!response.ok)throw Error("Galeri foto hunting belum dapat dibaca");
   const result=await response.json();
   if(owner!==id)throw Error("Akun peserta telah berubah");
   slots=(result.photos||[]).map(p=>p.slot).filter(n=>Number.isInteger(n)&&n>=1&&n<=12);
   return slots;
  }finally{clearTimeout(timeout);loading=null}
 })();
 return loading;
}
export async function hydrateHuntingImages(user,root=document,base="/lensa-muda"){
 if(!user?.id||!user.token)return;
 const images=[...root.querySelectorAll("img[data-hunting-photo-slot]")];
 await Promise.all(images.map(async img=>{
  const slot=Number(img.dataset.huntingPhotoSlot),id=user.id;
  if(!Number.isInteger(slot)||slot<1||slot>12)return;
  try{
   if(!urls.has(slot)){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{
     const response=await fetch(base+"/api/hunting/photos/"+slot,{headers:{Authorization:"Bearer "+user.token},cache:"no-store",signal:controller.signal});
     if(!response.ok)throw Error("Pratinjau foto belum tersedia");
     const blob=await response.blob();
     if(owner!==id)return;
     urls.set(slot,URL.createObjectURL(blob));
    }finally{clearTimeout(timeout)}
   }
   if(owner!==id||!img.isConnected)return;
   img.src=urls.get(slot);img.hidden=false;
   img.closest(".hunting-photo-preview")?.classList.add("loaded");
  }catch{if(img.isConnected){img.alt="Foto "+slot+" belum dapat dimuat. Periksa koneksi.";}}
 }));
}
export function clearHuntingSlotCache(){
 slots=null;
}
