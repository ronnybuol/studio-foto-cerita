import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
test("Mode latihan peserta bertahan saat trainer mengubah slide dan referensi tetap independen",()=>{
 const start=app.indexOf("const LEARNER_RANGES="),end=app.indexOf("function goModule(",start);
 assert.ok(start>=0&&end>start);
 const ctx={
  state:{user:{id:"participant-a"},presentation:{view:"simulator",slide:44},learnerViews:{story:{mode:"practice",slide:39}},active:"story",work:{}},
  MAX_PRESENTATION_SLIDE:29,COMPOSITION_START:30,COMPOSITION_END:34,EDFAT_START:35,EDFAT_END:38,STORY_START:39,STORY_END:44,
  localStorage:{setItem(){}},readJSON:()=>({}),renderParticipant(){ctx.renders++},
  renders:0,Number
 };
 vm.runInNewContext(app.slice(start,end)+";this.expose={learnerMode,learnerSlide,setLearnerMode,liveLearnerSlide}",ctx);
 assert.equal(ctx.expose.learnerMode("story"),"practice");
 ctx.state.presentation={view:"theory",slide:43};
 assert.equal(ctx.expose.learnerMode("story"),"practice");
 ctx.expose.setLearnerMode("story","reference",41);
 assert.equal(ctx.expose.learnerMode("story"),"reference");
 assert.equal(ctx.expose.learnerSlide("story"),41);
 ctx.state.presentation.slide=44;
 assert.equal(ctx.expose.learnerSlide("story"),41);
 ctx.expose.setLearnerMode("story","practice");
 assert.equal(ctx.expose.learnerMode("story"),"practice");
 assert.equal(ctx.renders,2);
 ctx.expose.setLearnerMode("story","follow");
 assert.equal(ctx.expose.learnerMode("story"),"follow");
 assert.equal(ctx.expose.learnerSlide("story"),44);
});
test("Draf Modul 04 tidak dianggap sebagai permintaan mengikuti slide",()=>{
 assert.ok(app.includes('key==="story"&&!draft.completedAt'));
 assert.ok(app.includes('(learnerMode(state.active)==="follow"&&slideChanged)'));
 assert.ok(app.includes("accessRevoked"));
 assert.doesNotMatch(app,/if\(state.user&&data.stage!==previousStage\)\{state.active=/);
 assert.ok(app.includes("state.work.story={...current(),selected,_draft:true}"));
 assert.ok(app.includes("state.work.edfat={...current,_draft:true}"));
 assert.ok(app.includes('const serverAnswers=response.answers||{}'));
 assert.ok(app.includes('if(learnerRange(state.active)&&!state.learnerViews[state.active])'));
 assert.ok(app.includes('bindLearnerMode();bindLessons()'));
});
test("Materi mandiri menggunakan slide pilihan peserta, bukan slide trainer",()=>{
 assert.ok(app.includes('storyParticipantSlide(slide)'));
 assert.ok(app.includes('compositionParticipantPage(slide)'));
 assert.ok(app.includes('edfatParticipantSlide(slide)'));
 assert.ok(app.includes('theoryParticipantPage(slide)'));
 assert.ok(app.includes('data-reference-step="-1"'));
 assert.ok(app.includes('data-learner-mode="practice"'));
 assert.ok(app.includes('data-learner-mode="reference"'));
});

test("Peserta otomatis menjadi mandiri begitu trainer membuka simulator",()=>{
 assert.ok(app.includes('state.learnerViews[state.active]?.mode==="follow"'));
 assert.ok(app.includes('state.presentation.view==="simulator"'));
 assert.ok(app.includes('state.learnerViews[state.active]={mode:"practice",slide:liveLearnerSlide(state.active)}'));
 assert.ok(app.includes('saveLearnerViews();'));
});
