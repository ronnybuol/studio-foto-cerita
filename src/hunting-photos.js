// Adiditif, tidak mengubah sesi, peserta, atau jawaban modul yang sudah ada.
const SQL=`CREATE TABLE IF NOT EXISTS hunting_photos (
 participant_id TEXT NOT NULL,
 slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 12),
 object_key TEXT NOT NULL,
 bytes INTEGER NOT NULL,
 width INTEGER NOT NULL,
 height INTEGER NOT NULL,
 uploaded_at TEXT NOT NULL,
 PRIMARY KEY(participant_id,slot),
 FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
)`;
export const MAX_HUNTING_PHOTOS=12;
export const MAX_HUNTING_BYTES=2*1024*1024;
export const huntingKey=(session,participant,slot)=>`hunting/${session}/${participant}/${slot}.webp`;
export function validWebP(bytes){
 if(bytes.length<16)return false;
 const chars=(start,end)=>String.fromCharCode(...bytes.slice(start,end));
 return chars(0,4)==="RIFF"&&chars(8,12)==="WEBP"&&["VP8 ","VP8L","VP8X"].includes(chars(12,16));
}
export async function ensureHuntingSchema(DB){
 // The D1 table is new and standalone. Existing course records are untouched.
 await DB.prepare(SQL).run();
}
export function huntingAccess({stage,locked,participant,storage}){
 if(!participant)return {error:"Sesi peserta tidak valid",status:401};
 if(locked)return {error:"Kelas telah dikunci trainer",status:423};
 if(stage<3)return {error:"Hunting baru dibuka saat Modul 03",status:403};
 if(!storage)return {error:"Penyimpanan foto belum terhubung di Cloudflare",status:503};
 return null;
}
export function slotFromPath(path){
 const found=/^\/api\/hunting\/photos\/([1-9]|1[0-2])$/.exec(path);
 return found?Number(found[1]):null;
}
