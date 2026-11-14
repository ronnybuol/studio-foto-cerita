import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CAPTION_START,CAPTION_END,CAPTION_SLIDES} from "../public/caption.js";
const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");

test("Six Caption Lab slides remain in place, and the locked Modul 04 is unchanged",()=>{
 assert.equal(CAPTION_START,45);
 assert.equal(CAPTION_END,51);
 assert.equal(CAPTION_SLIDES.length,7);
 assert.ok(app.includes('function storyPage(){'));
 assert.ok(app.includes('function captionPage(){'));
 assert.ok(app.includes('storyHuntingSelection(story)'));
});

test("Caption only submits nine saved hunting photos, not the old Sangihe bank",()=>{
 assert.ok(app.includes('validStory=selected.length===9&&!!story.completedAt&&!story._draft'));
 assert.ok(app.includes('const story=state.work.story||{},nine=storyHuntingSelection(story);'));
 assert.ok(app.includes('storyMode:"hunting",storySelected:nine,storyTitle:story.title'));
 assert.ok(app.includes('const selected=storyHuntingSelection(story);'));
 assert.ok(app.includes('Sembilan foto Modul 04 belum tersimpan'));
 assert.ok(!app.includes('Rangkaian ini dokumentasi musik bambu Sangihe, September 2017.'));
 assert.ok(api.includes('if(data.storyMode!=="hunting")return failure('));
 assert.ok(api.includes('JSON.stringify(story.selected)!==JSON.stringify(data.storySelected)'));
});

test("Caption Lab validates narrative and editorial review before saving",()=>{
 assert.ok(api.includes('!data.captionText.trim()'));
 assert.ok(api.includes('["reviewVisual","reviewFacts","reviewSequence"].some(k=>data[k]!=="yes")'));
 assert.ok(app.includes('const result={...data,storyMode:"hunting"'));
});

test("Trainer watches submissions and can review or spotlight complete stories",()=>{
 assert.ok(app.includes('function captionSubmissionList(data,isMentor){'));
 assert.ok(app.includes('data-caption-review='));
 assert.ok(app.includes('data-caption-spotlight='));
 assert.ok(app.includes('refreshCaptionResponses()'));
 assert.ok(app.includes('changeSpotlight(spot.dataset.captionSpotlight,"caption")'));
 assert.ok(app.includes('data-story-trainer-preview='));
 assert.ok(app.includes('SOROTAN KARYA · CAPTION LAB'));
 assert.ok(styles.includes('.caption-review-grid'));
});
