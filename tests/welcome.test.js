import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";

const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
const worker=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");

test("beranda berbeda dari layar peserta dan trainer",()=>{
 assert.match(app,/function welcomePage\(/);
 assert.match(app,/return \["trainer","lcd","peserta"\].includes\(path\)\?path:"welcome"/);
 assert.match(app,/href="\/lensa-muda\/peserta"/);
 assert.match(app,/href="\/lensa-muda\/trainer"/);
 assert.match(app,/showParticipantAuth\("signup"\)/);
});
test("brand tetap di header dengan aset resmi",()=>{
 assert.match(html,/brand-logo-kamisama/);
 assert.match(html,/brand-logo-zonautara/);
 assert.match(html,/\/lensa-muda\/assets\/brand\/kamisama.png/);
 assert.match(html,/\/lensa-muda\/assets\/brand\/zonautara.png/);
});
test("trainer dapat menampilkan LCD pembuka tanpa menghapus progres",()=>{
 assert.match(app,/trainer-show-welcome/);
 assert.match(app,/\/api\/welcome/);
 assert.match(app,/lcd-welcome-mode/);
 assert.match(app,/Ronny Adolof Buol/);
 assert.match(worker,/path==="\/api\/welcome"/);
 assert.match(worker,/json_set\(camera_json,'\$\.welcome'/);
 assert.match(app,/\/lensa-muda\/peserta/);
});

test("foto Hong Bit asli dan kedua logo tersedia lokal, bukan thumbnail",()=>{
 const image=statSync(new URL("../public/assets/brand/hong-bit.webp",import.meta.url));
 assert.ok(image.size>30000,"Foto hero harus resolusi layak proyektor");
 for(const name of ["kamisama.png","zonautara.png","peserta-qr.svg"]){
  assert.ok(statSync(new URL("../public/assets/brand/"+name,import.meta.url)).size>1000,name);
 }
 const qr=readFileSync(new URL("../public/assets/brand/peserta-qr.svg",import.meta.url),"utf8");
 assert.match(qr,/<svg/);
});
