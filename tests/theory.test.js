import test from "node:test";
import assert from "node:assert/strict";
import {THEORY_SLIDES,theoryVisual} from "../public/slides.js";

test("bab teori memiliki delapan slide lengkap dengan pertanyaan dan catatan trainer",()=>{
 assert.equal(THEORY_SLIDES.length,8);
 for(const [i,s] of THEORY_SLIDES.entries()){
   assert.ok(s.title?.length>12,`Slide ${i+1}: judul`);
   assert.ok(s.lead?.length>20,`Slide ${i+1}: pengantar`);
   assert.equal(s.points.length,3,`Slide ${i+1}: tiga gagasan`);
   assert.ok(s.prompt.length>20,`Slide ${i+1}: pertanyaan`);
   assert.ok(s.note.length>20,`Slide ${i+1}: catatan trainer`);
 }
});
test("setiap slide memiliki visual pengajaran tanpa jaringan eksternal",()=>{
 const renderer={
   sceneHTML:id=>`<div class="scene" id="${id}">Ilustrasi</div>`,
   shotSrc:()=> "data:image/svg+xml;base64,AAAA"
 };
 for(let i=0;i<THEORY_SLIDES.length;i++){
   const html=theoryVisual(i,renderer);
   assert.ok(html.includes("theory-"),`slide ${i+1} kosong`);
   assert.ok(html.length>50);
   assert.ok(!/https?:\/\//.test(html),`slide ${i+1} tidak boleh memerlukan jaringan`);
 }
});