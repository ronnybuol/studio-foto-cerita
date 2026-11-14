import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {cameraPhotoUrl,theoryVisual} from "../public/slides.js";

const names=[
  "base","cahaya-depan","cahaya-samping","cahaya-belakang",
  "aperture-lebar","aperture-sempit","shutter-lambat",
  "shutter-cepat","iso-rendah","iso-tinggi"
];

test("sepuluh foto latihan tersedia secara lokal dengan ukuran hemat bandwidth",()=>{
  for(const name of names){
    const url=cameraPhotoUrl(name);
    assert.equal(url,"/lensa-muda/assets/camera/"+name+".webp");
    const file=new URL("../public/assets/camera/"+name+".webp",import.meta.url);
    const stats=statSync(file);
    assert.ok(stats.size>10_000, name+" kemungkinan kosong");
    assert.ok(stats.size<230_000, name+" terlalu besar untuk kelas berbasis ponsel");
  }
});

test("slide exposure menampilkan foto generatif dan bukan URL remote",()=>{
  for(const n of [0,1,3,4,5,6,7]){
    const html=theoryVisual(n);
    assert.match(html, /\/lensa-muda\/assets\/camera\/[^" ]+\.webp/);
    assert.doesNotMatch(html,/https?:\/\//);
  }
  assert.match(theoryVisual(2),/svg/);
  assert.match(theoryVisual(1),/cahaya-belakang/);
  assert.match(theoryVisual(3),/aperture-lebar/);
  assert.match(theoryVisual(4),/shutter-lambat/);
  assert.match(theoryVisual(5),/iso-tinggi/);
});

test("simulator kamera tetap memakai foto Modul 01, lab komposisi memakai foto Sangihe",()=>{
  const js=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
  for(const id of ["cameraScene","trainerCameraScene","lcdCameraScene"]){
    assert.ok(js.includes('photoSceneHTML("'+id+'")'),id);
  }
  assert.match(js,/function photoSceneHTML/);
  assert.match(js,/photo-camera-scene/);
  assert.ok(js.includes('data-comp-vote="A"'));
  assert.ok(js.includes("function compositionChallengePhotos("));
  assert.match(js,/state\.active==="kamera" && \$\("#aperture"\)/);
  assert.match(js,/SIMULASI FOTO GENERATIF/);
});

test("foto simulator LCD dan peserta tampil utuh tanpa cropping atau distorsi",()=>{
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
 const after=css.slice(css.lastIndexOf("/* Modul 01 — never crop"));
 assert.match(after,/\.scene\.photo-camera-scene>\.photo-main,[\s\S]*?\.scene\.photo-camera-scene>\.photo-motion\s*\{\s*object-fit:contain;/);
 assert.match(after,/\.lcd-camera-photo \.scene\.photo-camera-scene\s*\{[\s\S]*?width:min\(100%,72vh\);[\s\S]*?max-height:none;[\s\S]*?aspect-ratio:3\/2;/);
 assert.match(after,/\.participant-camera-image \.scene\.photo-camera-scene\s*\{[\s\S]*?width:100%;[\s\S]*?height:auto;[\s\S]*?aspect-ratio:3\/2;/);
 assert.match(html,/styles\.css\?v=20261115-composition-ab-v9/);
});
