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

test("simulator trainer, peserta dan LCD menggunakan foto yang sama tanpa merusak modul komposisi",()=>{
  const js=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
  for(const id of ["cameraScene","trainerCameraScene","lcdCameraScene"]){
    assert.ok(js.includes('photoSceneHTML("'+id+'")'),id);
  }
  assert.match(js,/function photoSceneHTML/);
  assert.match(js,/photo-camera-scene/);
  assert.match(js,/sceneHTML\("compositionScene","showgrid"\)/);
  assert.match(js,/state\.active==="kamera" && \$\("#aperture"\)/);
  assert.match(js,/SIMULASI FOTO GENERATIF/);
});
