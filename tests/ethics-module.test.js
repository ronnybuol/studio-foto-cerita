import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {ETHICS_START,ETHICS_END,ETHICS_SLIDES,ethicsSlide,ethicsLabel,ethicsVisual} from "../public/ethics.js";
test("Modul 06 memakai enam foto dokumenter dengan fallback Sangihe yang tidak mengubah materi",()=>{
 assert.equal(ETHICS_START,52);assert.equal(ETHICS_END,57);assert.equal(ETHICS_SLIDES.length,6);
 for(let i=52;i<=57;i++){
   const x=ethicsSlide(i);
   assert.ok(x.tag&&x.title&&x.lead&&x.note&&x.prompt);
   assert.equal(x.points.length,3);
   assert.equal(ethicsLabel(i),String(i-51).padStart(2,"0"));
   assert.ok(existsSync(new URL("../public/assets/composition/sangihe-2017-"+x.image+".webp",import.meta.url)));
   assert.match(ethicsVisual(i),new RegExp("/api/ethics/slide-photo/"+(i-ETHICS_START+1)));
   assert.match(ethicsVisual(i),/sangihe-2017/);
 }
});
test("Tantangan akhir menghubungkan trainer, LCD, peserta, jawaban, dan sorotan karya",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 for(const anchor of [
   'function ethicsTrainerPanel(','function ethicsParticipantSlide(','function ethicsTheoryContent(',
   'function ethicsPage(','ETHICS_PLAN_FIELDS','data-ethics-step','data-ethics-slide','data-ethics-mode',
   'etika:[ETHICS_START,ETHICS_END]','stage===6?ethicsTrainerPanel(data,isMentor)',
   'stage===6&&state.presentation.view==="theory"','saveAnswer("etika",result)',
   'state.work.etika={...(state.work.etika||{}),...ethicsDraft(),_draft:true}',
   'if(spot.module==="etika")','if(key==="etika")return'
 ])assert.ok(app.includes(anchor),"Fitur hilang: "+anchor);
 assert.ok(api.includes('data.slide>57'));
 assert.ok(api.includes('value.slide<=57'));
 assert.ok(html.includes('app.js?v=20261115-ethics-six-photos-v4'));
 assert.ok(css.includes('.ethics-final-question'));
 assert.ok(css.includes('.ethics-theory-layout'));
 assert.ok(app.includes('ethicsPhotoUploadPanel(isMentor)'));
 assert.ok(app.includes('id="ethics-upload-input"')===false || app.includes('const upload=$("#ethics-upload-input")'));
 assert.ok(api.includes('"/api/ethics/photos/status"'));
 assert.ok(api.includes('const ethicsImageMatch='));
});
