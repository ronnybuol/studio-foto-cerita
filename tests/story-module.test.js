import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {STORY_START,STORY_END,STORY_SLIDES,STORY_BANK,storySlide,storyLabel,storyAsset,storyImage,storySlideVisual} from "../public/story.js";

test("Modul 04 menyediakan enam slide dan dua belas kandidat foto dengan sembilan pilihan",()=>{
 assert.equal(STORY_START,39);
 assert.equal(STORY_END,44);
 assert.equal(STORY_SLIDES.length,6);
 assert.equal(STORY_BANK.length,12);
 assert.equal(new Set(STORY_BANK.map(x=>x.id)).size,12);
 for(let i=STORY_START;i<=STORY_END;i++){
  const slide=storySlide(i);
  assert.ok(slide.title&&slide.lead&&slide.prompt&&slide.note&&slide.points.length===3);
  assert.equal(storyLabel(i),String(i-STORY_START+1).padStart(2,"0"));
  assert.match(storySlideVisual(i),/sangihe-2017-[0-9]{4}\.webp/);
 }
 for(const image of STORY_BANK){
  assert.ok(storyAsset(image).startsWith("/lensa-muda/assets/composition/"));
  assert.match(storyImage(image),/class="story-photo/);
 }
 const extra=STORY_BANK.find(x=>x.id===12);
 assert.equal(extra.image,STORY_BANK.find(x=>x.id===5).image);
 assert.equal(extra.crop,true);
 assert.match(extra.desc,/potongan/i);
});
test("Sembilan Bingkai memiliki alur trainer-LCD, penyimpanan urutan dan alasan pada HP",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
 assert.ok(app.includes('function storyTrainerPanel('));
 assert.ok(app.includes('function storyTheoryContent('));
 assert.ok(app.includes('function storyParticipantSlide('));
 assert.ok(app.includes('data-story-step'));
 assert.ok(app.includes('data-story-mode'));
 assert.ok(app.includes('stage===4&&state.presentation.view==="theory"'));
 assert.ok(app.includes('saveAnswer("story",{selected:ids,title,reason'));
 assert.ok(app.includes('state.work.story={...current(),selected}'));
 assert.ok(app.includes('data-pick'));
 assert.ok(app.includes('data-remove'));
 assert.ok(app.includes('data-move'));
 assert.ok(css.includes('.story-editor-workspace'));
 assert.ok(css.includes('.story-learner-theory .story-theory-lead'));
 assert.ok(api.includes('data.slide>44'));
 assert.ok(api.includes('data.selected.length!==9'));
});
