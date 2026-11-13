import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {COMPOSITION_START,COMPOSITION_END,COMPOSITION_SLIDES,compositionSlide,compositionLabel,compositionVisual,compositionImageUrl} from "../public/composition.js";

test("Bab 2 punya tujuh slide unik dan visual lokal berlabel simulasi",()=>{
 assert.equal(COMPOSITION_START,21);
 assert.equal(COMPOSITION_END,31);
 assert.equal(COMPOSITION_SLIDES.length,11);
 for(let n=21;n<=31;n++){
  const x=compositionSlide(n);
  assert.ok(x.title&&x.lead&&x.points?.length>=3&&x.prompt&&x.note);
  assert.ok(/^0[1-7][ab]?$/.test(compositionLabel(n)));
  const visual=compositionVisual(n);
  assert.match(visual,/assets\/composition\/sangihe-2017-[0-9]{4}\.webp/);
  assert.match(visual,/Foto: Ronny Adolof Buol/);
 }
});
test("trainer, LCD, dan peserta mengenali tahap komposisi tanpa mengubah teori kamera",()=>{
 const source=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const backend=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 assert.ok(source.includes('function compositionSlideContent('));
 assert.ok(source.includes('function compositionTrainerPanel('));
 assert.ok(source.includes('function compositionParticipantPage('));
 assert.ok(source.includes('data-comp-slide-step'));
 assert.ok(source.includes('data-comp-mode'));
 assert.ok(source.includes('stage===2 && state.presentation.view==="theory"'));
 assert.ok(source.includes('stage===1?0:COMPOSITION_START'));
 assert.ok(source.includes('state.composition.reason'));
 assert.ok(source.includes('saveAnswer("komposisi"'));
 assert.ok(backend.includes('data.slide>31'));
});

test("setiap slide memakai foto asli Sangihe yang dipilih, bukan foto Modul 01",()=>{
 const ids=COMPOSITION_SLIDES.map(s=>s.image);
 assert.equal(new Set(ids).size,11);
 for(let i=COMPOSITION_START;i<=COMPOSITION_END;i++){
  const asset=compositionImageUrl(i);
  assert.ok(asset.startsWith("/lensa-muda/assets/composition/"));
  assert.ok(asset.endsWith(".webp"));
  assert.doesNotMatch(compositionVisual(i),/assets\\/camera\\/base\\.webp/);
 }
});
