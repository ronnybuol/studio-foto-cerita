import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {COMPOSITION_CHALLENGES,compositionChallengeImage} from "../public/composition-lab.js";
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
 assert.ok(source.includes('stage===1?0:stage===2?COMPOSITION_START:stage===3?EDFAT_START:stage===4?STORY_START:stage===5?CAPTION_START:ETHICS_START'));
 assert.ok(source.includes('compositionChallengeTab'));
 assert.ok(source.includes('saveAnswer("komposisi"'));
 assert.ok(backend.includes('data.slide>56'));
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


test("empat tantangan memakai foto A/B tetap dan foto WebP yang benar",()=>{
 assert.deepEqual(COMPOSITION_CHALLENGES.map(c=>c.id),["sepertiga","framing","jarak","subjek"]);
 assert.deepEqual(COMPOSITION_CHALLENGES.map(c=>[c.a.image,c.b.image]),[["8798","5625"],["8824","5794"],["5711","5712"],["8980","8851"]]);
 for(const challenge of COMPOSITION_CHALLENGES){
  assert.ok(challenge.question.length>30);
  assert.ok(challenge.guidance.length>20);
  for(const photo of [challenge.a,challenge.b]){
   const url=compositionChallengeImage(photo.image);
   assert.equal(url,"/lensa-muda/assets/composition/sangihe-2017-"+photo.image+".webp");
   const file=new URL("../public/assets/composition/sangihe-2017-"+photo.image+".webp",import.meta.url);
   assert.ok(statSync(file).size>20000,photo.image);
  }
 }
});
test("latihan mandiri memiliki pilihan A/B, draf lokal, simpan ke server dan catatan sinkron",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 assert.match(app,/function compositionPage\(\)/);
 assert.match(app,/function bindCompositionChallenge\(\)/);
 assert.match(app,/data-comp-vote="A"/);
 assert.match(app,/data-comp-vote="B"/);
 assert.match(app,/data-comp-tab/);
 assert.match(app,/state\.work\.komposisi=/);
 assert.match(app,/saveWork\(\)/);
 assert.match(app,/saveAnswer\("komposisi",payload\)/);
 assert.match(app,/answerSaveMessage\(result\)/);
 assert.doesNotMatch(app,/function compositionExample\(c\)/);
});
test("trainer-LCD mempunyai empat tantangan, ringkasan respons dan sorotan per ulasan",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const backend=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 assert.match(app,/function compositionTrainerDemoPanel\(/);
 assert.match(app,/function compositionTrainerResponsePanel\(/);
 assert.match(app,/data-comp-challenge/);
 assert.match(app,/data-comp-spotlight-id/);
 assert.match(app,/data-comp-spotlight-index/);
 assert.match(app,/function paintLcdComposition\(/);
 assert.match(app,/compositionDemoPreview\(state\.demoComposition,"lcdCompositionDemo"\)/);
 assert.match(app,/prevComposition!==JSON\.stringify\(state\.demoComposition\)/);
 assert.match(app,/function lcdSpotlightContent\(/);
 assert.match(backend,/data\.challengeIndex/);
 assert.match(backend,/key==="komposisi"&&Object\.hasOwn\(data,"challenges"\)/);
 assert.match(backend,/challengeIndex:Number\.isInteger/);
});

test("empat versi foto yang diproses AI diberi label transparansi di peserta, LCD, trainer dan sorotan",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.match(app,/\["5625","5794","5711","5712"\]\.includes\(photo\.image\)/);
 assert.match(app,/Penyempurnaan visual berbantuan AI/);
 assert.match(css,/\.comp-photo-disclosure/);
});
