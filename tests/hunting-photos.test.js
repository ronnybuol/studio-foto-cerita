import test from "node:test";
import assert from "node:assert/strict";
import {MAX_HUNTING_PHOTOS,MAX_HUNTING_BYTES,huntingKey,huntingAccess,slotFromPath,validWebP} from "../src/hunting-photos.js";
test("slot hanya 1–12 dan jalur path tepat",()=>{
 assert.equal(MAX_HUNTING_PHOTOS,12);
 assert.equal(MAX_HUNTING_BYTES,2*1024*1024);
 for(let i=1;i<=12;i++)assert.equal(slotFromPath("/api/hunting/photos/"+i),i);
 for(const p of ["/api/hunting/photos/0","/api/hunting/photos/13","/api/hunting/photos/01","/api/hunting/photos/1/other"])
  assert.equal(slotFromPath(p),null);
});
test("foto terikat ke ID sesi dan peserta, bukan file publik",()=>{
 const key=huntingKey("sesi","peserta-1",8);
 assert.equal(key,"hunting/sesi/peserta-1/8.webp");
 assert.notEqual(key,huntingKey("sesi","peserta-2",8));
});
test("validasi WebP harus punya RIFF, WEBP dan VP8",()=>{
 const b=Uint8Array.from(Buffer.from("RIFF1234WEBPVP8 sample","ascii"));
 assert.equal(validWebP(b),true);
 for(const input of ["RIFF1234WEBPJUNKs","RIFF1234PNG!VP8 sample","WEBP1234RIFFVP8 sample"])
  assert.equal(validWebP(Buffer.from(input,"ascii")),false);
});
test("peserta tidak boleh masuk sebelum tahap 03, setelah kunci atau tanpa R2",()=>{
 const base={stage:3,locked:false,participant:{id:"id"},storage:{}};
 assert.equal(huntingAccess(base),null);
 assert.equal(huntingAccess({...base,stage:2}).status,403);
 assert.equal(huntingAccess({...base,locked:true}).status,423);
 assert.equal(huntingAccess({...base,participant:null}).status,401);
 assert.equal(huntingAccess({...base,storage:null}).status,503);
});
test("UI membedakan berkas lokal yang mengantre dan unggahan yang dikonfirmasi server",async()=>{
 const fs=await import("node:fs");
 const ui=fs.readFileSync(new URL("../public/hunting-ui.js",import.meta.url),"utf8");
 const app=fs.readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const uploader=fs.readFileSync(new URL("../public/photo-hunting.js",import.meta.url),"utf8");
 assert.match(app,/huntingPanelHTML\(\)/);
 assert.match(app,/bindHuntingUI\(/);
 assert.match(ui,/Tersimpan di server/);
 assert.match(ui,/Menunggu unggah/);
 assert.match(uploader,/indexedDB\.open/);
 assert.match(uploader,/createImageBitmap\(file\)/);
 assert.match(uploader,/image\/webp/);
 assert.match(uploader,/if\(response\.status!==201\)/); // R2 ack required before queue deletion
 assert.match(uploader,/await deleteQueue\(owner,item\.slot\)/);
});
