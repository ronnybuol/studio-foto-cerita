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
 assert.match(app,/welcome-projector/);
 assert.match(app,/welcomePage\(true,count\)/);
 assert.match(app,/welcomePage\(false\)/);
 assert.match(app,/welcome-class-join/);
 assert.match(app,/welcome-join-qr/);
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

test("beranda dan LCD menggunakan hero Hong Bit yang sama, hanya aksi yang berbeda",()=>{
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.match(app,/function welcomePage\(lcd=false,count=0\)/);
 assert.match(app,/const action=lcd/);
 assert.match(css,/\.welcome-shared-hero/);
 assert.match(css,/\.welcome-projector \.welcome-shared-hero/);
 assert.match(css,/\.welcome-shared-hero \.welcome-portrait/);
 assert.match(html,/app\.js\?v=20261114-camera-diagrams-v6/);
});

test("orientasi 00 menampilkan formulir peserta yang sama dengan pendaftaran HP",()=>{
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.match(app,/function orientationRegistrationSlide\(/);
 assert.match(app,/\$\{signupPage\(\)\}/);
 assert.match(app,/orientation-phone-screen" inert/);
 assert.match(app,/trainer-show-registration/);
 assert.match(app,/stage===0&&state\.orientation/);
 assert.match(app,/prevOrientation!==state\.orientation/);
 assert.match(css,/\.lcd-orientation-registration/);
 assert.match(css,/\.orientation-instructions/);
 assert.match(worker,/path==="\/api\/orientation"/);
 assert.match(worker,/await stageState\(env\)!==0/);
 assert.match(worker,/orientation:camera\.orientation==="registration"/);
});

test("counter real-time dan daftar nama hanya saat dipicu trainer",()=>{
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.match(app,/orientation-registered-count/);
 assert.match(app,/prevCount!==state.count/);
 assert.match(app,/function orientationRosterSlide\(count,page,names\)/);
 assert.match(app,/escapeHtml\(String\(name\)\)/);
 assert.match(app,/trainer-show-roster/);
 assert.match(app,/trainer-roster-next/);
 assert.match(app,/trainer-roster-prev/);
 assert.match(app,/rosterNames=Array.isArray\(data.rosterNames\)/);
 assert.match(app,/prevRosterNames!==JSON.stringify\(state.rosterNames\)/);
 assert.match(css,/\.orientation-roster-grid/);
 assert.match(css,/\.orientation-live-counter/);
 assert.match(worker,/camera.orientation==="roster"&&stage===0/);
 assert.match(worker,/SELECT name FROM participants/);
 assert.match(worker,/LIMIT 48 OFFSET/);
 assert.match(worker,/\["registration","roster","guide"\]/);
 assert.match(worker,/data.screen==="roster"&&\(!Number.isInteger\(data.page\)/);
});

test("orientasi 00 memiliki tur layar peserta yang dipicu trainer sesudah panduan pendaftaran",()=>{
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.match(app,/function orientationParticipantGuideSlide\(\)/);
 assert.match(app,/Sebelum mulai, mari pahami tampilan aplikasi/);
 assert.match(app,/di device anda sebagai Peserta/);
 assert.match(app,/orientation-guide-phone/);
 assert.match(app,/orientation-guide-callouts left/);
 assert.match(app,/orientation-guide-callouts right/);
 assert.match(app,/orientation-guide-save-status/);
 assert.match(app,/trainer-show-participant-guide/);
 assert.match(app,/payload:\{screen:"guide"\}/);
 assert.match(app,/stage===0&&state.participantGuide&&!state.welcome/);
 assert.match(app,/prevParticipantGuide!==state.participantGuide/);
 assert.match(app,/participantGuide:state.participantGuide/);
 assert.match(worker,/participantGuide:camera.orientation==="guide"/);
 assert.match(worker,/\["registration","roster","guide"\]/);
 assert.match(css,/\.lcd-orientation-guide/);
 assert.match(css,/\.orientation-guide-callouts/);
 assert.match(css,/\.orientation-guide-phone/);
 assert.match(css,/\.orientation-guide-tip/);
});
