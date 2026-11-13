import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {COMPOSITION_START,COMPOSITION_END,COMPOSITION_SLIDES,compositionSlide,compositionLabel,compositionVisual} from "../public/composition.js";

test("Bab 2 punya tujuh slide unik dan visual lokal berlabel simulasi",()=>{
 assert.equal(COMPOSITION_START,21);
 assert.equal(COMPOSITION_END,27);
 assert.equal(COMPOSITION_SLIDES.length,7);
 for(let n=21;n<=27;n++){
  const x=compositionSlide(n);
  assert.ok(x.title&&x.lead&&x.points?.length>=3&&x.prompt&&x.note);
  assert.equal(compositionLabel(n),String(n-20).padStart(2,"0"));
  const visual=compositionVisual(n);
  assert.match(visual,/assets\/camera\/base.webp/);
  assert.match(visual,/Ilustrasi generatif/);
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
 assert.ok(backend.includes('data.slide>27'));
});
