import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EDFAT_START,EDFAT_END,EDFAT_SLIDES,EDFAT_CASES,EDFAT_OPTIONS,edfatSlide,edfatLabel,edfatVisual,edfatPhoto} from "../public/edfat.js";

test("Modul 03 memiliki tujuh slide teori dan lima kasus EDFAT dari foto dokumentasi Sangihe",()=>{
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
  assert.match(html,/sangihe-2017-[0-9]{4}\.webp/);
  assert.match(html,/Ronny Adolof Buol/);
 }
 for(const c of EDFAT_CASES){
  assert.ok(EDFAT_OPTIONS.includes(c.recommended));
  assert.ok(edfatPhoto(c.image).startsWith("/lensa-muda/assets/composition/"));
 }
});
test("Alur EDFAT mengikuti pembukaan tahap, slide LCD, dan latihan individu",()=>{
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
 assert.ok(app.includes('state.work.edfat?.answers'));
 assert.ok(app.includes('EDFAT_CASES.find('));
 assert.ok(api.includes('data.slide>38'));
 assert.ok(css.includes('.edfat-learner-theory .edfat-lead'));
 assert.ok(css.includes('object-fit:contain'));
});
