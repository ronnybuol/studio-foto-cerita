import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {ETHICS_START,ETHICS_END,ETHICS_SLIDES,ethicsSlide,ethicsLabel,ethicsVisual} from "../public/ethics.js";
test("Modul 06 memiliki enam slide dengan dokumentasi Sangihe asli",()=>{
 assert.equal(ETHICS_START,51);assert.equal(ETHICS_END,56);assert.equal(ETHICS_SLIDES.length,6);
 for(let i=51;i<=56;i++){
   const x=ethicsSlide(i);
   assert.ok(x.tag&&x.title&&x.lead&&x.note&&x.prompt);
   assert.equal(x.points.length,3);
   assert.equal(ethicsLabel(i),String(i-50).padStart(2,"0"));
   assert.ok(existsSync(new URL("../public/assets/composition/sangihe-2017-"+x.image+".webp",import.meta.url)));
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
 assert.ok(api.includes('data.slide>56'));
 assert.ok(api.includes('value.slide<=56'));
 assert.ok(html.includes('app.js?v=20261115-comp-photo-disclosure-v10'));
 assert.ok(css.includes('.ethics-final-question'));
 assert.ok(css.includes('.ethics-theory-layout'));
});
