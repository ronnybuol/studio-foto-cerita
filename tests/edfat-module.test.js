import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EDFAT_START,EDFAT_END,EDFAT_SLIDES,EDFAT_CASES,EDFAT_OPTIONS,edfatSlide,edfatLabel,edfatVisual,edfatPhoto} from "../public/edfat.js";

test("Modul 03 mempertahankan tujuh slide teori dan lima contoh EDFAT; slide akhir briefing hunting",()=>{
 assert.equal(EDFAT_START,32);
 assert.equal(EDFAT_END,38);
 assert.equal(EDFAT_SLIDES.length,7);
 assert.equal(EDFAT_CASES.length,5);
 assert.deepEqual(EDFAT_OPTIONS,["Entire","Detail","Frame","Angle","Time"]);
 for(let i=EDFAT_START;i<=EDFAT_END;i++){
  const slide=edfatSlide(i);
  assert.ok(slide.title&&slide.lead&&slide.prompt&&slide.trainer);
  assert.ok(slide.points.length>=3);
  assert.ok(edfatLabel(i));
  const html=edfatVisual(i);
  if(i===EDFAT_END){
   assert.match(html,/edfat-hunting-brief/);
   assert.match(html,/25 MENIT/);
   assert.match(html,/15 MENIT/);
   assert.match(html,/1 KARYA/);
  }else{
   assert.match(html,/sangihe-2017-[0-9]{4}\.webp/);
   assert.match(html,/Ronny Adolof Buol/);
  }
 }
 for(const c of EDFAT_CASES){
  assert.ok(EDFAT_OPTIONS.includes(c.recommended));
  assert.ok(edfatPhoto(c.image).startsWith("/lensa-muda/assets/composition/"));
 }
});
test("Alur EDFAT mengikuti pembukaan tahap, slide LCD, dan pilihan foto hunting pribadi",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.ok(app.includes('function edfatTrainerPanel('));
 assert.ok(app.includes('function edfatSlideHTML('));
 assert.ok(app.includes('function edfatParticipantSlide('));
 assert.ok(app.includes('data-edfat-slide-step'));
 assert.ok(app.includes('data-edfat-mode="simulator"'));
 assert.ok(app.includes('stage===3&&state.presentation.view==="theory"'));
 assert.ok(app.includes('saveAnswer("edfat"'));
 assert.ok(app.includes('state.work.edfat?.photoSlot'));
 assert.ok(app.includes('data-edfat-dominant'));
 assert.ok(app.includes('data-edfat-trainer-preview'));
 assert.ok(app.includes('/api/spotlight/photo?participant='));
 assert.ok(app.includes('onSelect:slot=>'));
 assert.ok(api.includes('answer?.mode==="hunting"'));
 assert.ok(api.includes('photoSlot!==slot'));
 assert.ok(api.includes('const trainerPhoto='));
 assert.ok(api.includes('data.slide>57'));
 assert.ok(css.includes('.edfat-learner-theory .edfat-lead'));
 assert.ok(css.includes('object-fit:contain'));
});
