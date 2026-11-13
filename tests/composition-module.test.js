import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {COMPOSITION_START,COMPOSITION_END,COMPOSITION_SLIDES,compositionSlide,compositionLabel,compositionVisual,compositionImageUrl} from "../public/composition.js";

test("Bab 2 punya 11 slide foto dokumentasi unik dari Sangihe",()=>{
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
 assert.ok(source.includes('stage===1?0:stage===2?COMPOSITION_START:stage===3?EDFAT_START:STORY_START'));
 assert.ok(source.includes('state.composition.reason'));
 assert.ok(source.includes('saveAnswer("komposisi"'));
 assert.ok(backend.includes('data.slide>44'));
});

test("setiap slide memakai foto asli Sangihe yang dipilih, bukan foto Modul 01",()=>{
 const ids=COMPOSITION_SLIDES.map(s=>s.image);
 assert.equal(new Set(ids).size,11);
 for(let i=COMPOSITION_START;i<=COMPOSITION_END;i++){
  const asset=compositionImageUrl(i);
  assert.ok(asset.startsWith("/lensa-muda/assets/composition/"));
  assert.ok(asset.endsWith(".webp"));
  assert.ok(!compositionVisual(i).includes("assets/camera/base.webp"));
 }
});

test("laboratorium peserta mengganti contoh foto nyata saat kontrol dipilih",()=>{
 const source=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 assert.ok(source.includes("function compositionExample(c)"));
 assert.ok(source.includes('id="comp-example-image"'));
 assert.ok(source.includes('state.composition.preview=attr'));
 assert.ok(source.includes('state.composition.preview="frame"'));
 assert.ok(source.includes('sc.classList.toggle("comp-grid-on"'));
});


test("tombol peserta memakai semua pilihan; teks terang LCD tak bocor ke kartu putih; demo trainer dan LCD sinkron",()=>{
 const source=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.ok(source.includes('state.composition[attr]=btn.dataset[attr];state.composition.preview=attr;$$("[data-"+attr+"]").forEach'));
 assert.ok(source.includes('function compositionDemoControls('));
 assert.ok(source.includes('function compositionTrainerDemoPanel('));
 assert.ok(source.includes('"/api/demo-composition"'));
 assert.ok(source.includes('function paintLcdComposition('));
 assert.ok(source.includes('prevComposition!==JSON.stringify(state.demoComposition)'));
 assert.ok(source.includes('compositionDemoPreview(state.demoComposition,"lcdCompositionDemo")'));
 assert.ok(css.includes('.composition-participant-theory .composition-slide-copy .theory-lead'));
 assert.ok(css.includes('color:#27313d!important'));
});
