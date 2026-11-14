import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
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
 assert.ok(app.includes('state.work.story={...current(),selected,_draft:true}'));
 assert.ok(app.includes('data-pick'));
 assert.ok(app.includes('data-remove'));
 assert.ok(app.includes('data-move'));
 assert.ok(css.includes('.story-editor-workspace'));
 assert.ok(css.includes('.story-learner-theory .story-theory-lead'));
 assert.ok(api.includes('data.slide>56'));
 assert.ok(api.includes('data.selected.length!==9'));
});

test("Semua foto Modul 04 benar-benar ada di public/assets/composition",()=>{
 for(const image of STORY_BANK){
  const relative="../public"+storyAsset(image).replace(/^\/lensa-muda/,"");
  const file=new URL(relative,import.meta.url);
  assert.ok(existsSync(file),"Aset foto hilang: "+storyAsset(image));
 }
 for(let i=STORY_START;i<=STORY_END;i++){
  const id=storySlide(i).image;
  const file=new URL("../public/assets/composition/sangihe-2017-"+id+".webp",import.meta.url);
  assert.ok(existsSync(file),"Foto slide hilang: "+id);
 }
});
test("Dashboard Modul 04 tampil pada tahap 04 atau lebih tinggi dan penanda rilis jelas",()=>{
 const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
 assert.ok(app.includes("data.stage>=4?storyTrainerPanel(data,isMentor)"));
 assert.ok(app.includes('APP_RELEASE = "m06-finale-20261114"'));
 assert.ok(html.includes('app.js?v=20261114-camera-diagrams-v6'));
});
