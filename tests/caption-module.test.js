import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {CAPTION_START,CAPTION_END,CAPTION_SLIDES,captionSlide,captionLabel,captionVisual,captionWordCount} from "../public/caption.js";

test("Caption Lab memiliki enam materi dan foto Sangihe yang tersedia",()=>{
 assert.equal(CAPTION_START,45);
 assert.equal(CAPTION_END,50);
 assert.equal(CAPTION_SLIDES.length,6);
 for(let i=CAPTION_START;i<=CAPTION_END;i++){
  const slide=captionSlide(i);
  assert.ok(slide.title&&slide.lead&&slide.note&&slide.prompt);
  assert.equal(slide.points.length,3);
  assert.equal(captionLabel(i),String(i-CAPTION_START+1).padStart(2,"0"));
  assert.ok(existsSync(new URL("../public/assets/composition/sangihe-2017-"+slide.image+".webp",import.meta.url)));
  assert.match(captionVisual(i),/object|img|sangihe-2017/);
 }
 assert.equal(captionWordCount("  Sembilan  foto menyusun satu cerita. "),5);
 assert.equal(captionWordCount(""),0);
});
test("Trainer, LCD, peserta, draf, dan sorotan Caption Lab tetap terhubung",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
 for(const text of [
  "function captionTrainerPanel(", "function captionParticipantSlide(", "function captionTheoryContent(",
  "function captionPage(", "function captionPhotoStrip(", 'case "caption":return theory?captionParticipantSlide(slide):captionPage()',
  'data-caption-mode', 'data-caption-slide', 'data-caption-step',
  'caption-form','caption-verification','captionText','reviewVisual','reviewFacts','reviewSequence',
  'storySelected:Array.isArray(state.work.story?.selected)', 'saveAnswer("caption",result)',
  'state.work.caption={...obj,_draft:true}', 'caption:[CAPTION_START,CAPTION_END]'
 ])assert.ok(app.includes(text),"Fitur caption hilang: "+text);
 assert.ok(app.includes('stage===5?captionTrainerPanel(data,isMentor)'));
 assert.ok(app.includes('stage===5&&state.presentation.view==="theory"'));
 assert.ok(api.includes('data.slide>56'));
 assert.ok(css.includes('.caption-photo-strip'));
 assert.ok(css.includes('.caption-theory-layout'));
 assert.ok(html.includes('app.js?v=20261114-orientation-v4'));
});
