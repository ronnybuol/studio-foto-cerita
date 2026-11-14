import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {closingSlideHTML,closingTrainerPanel} from "../public/closing.js";
const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const worker=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");

test("Closing slide includes complete trainer contact details and photograph background",()=>{
 const html=closingSlideHTML();
 for(const value of ["Terima kasih!","Ronny Adolof Buol","ronny.buol@gmail.com","085256510522","@ronnybuol"]){
  assert.ok(html.includes(value),value);
 }
 assert.ok(css.includes('/lensa-muda/api/closing/photo'));
 assert.ok(css.includes('.closing-slide-gradient'));
 assert.ok(css.includes('body.closing-visible .masthead'));
 assert.ok(!html.includes('<button'));
});
test("Trainer controls closing without class lock, changing stage, or deleting answers",()=>{
 const html=closingTrainerPanel(false,false);
 assert.ok(html.includes('trainer-show-closing'));
 assert.ok(html.includes('trainer-hide-closing'));
 assert.ok(html.includes('closing-photo-input'));
 assert.ok(!closingTrainerPanel(true,false).includes('id="closing-photo-input"'));
 assert.ok(app.includes('"/api/closing/presentation"'));
 assert.ok(app.includes('state.closingVisible=!!data.closingVisible'));
 assert.ok(app.includes('const closingChanged=before.closingVisible!==state.closingVisible'));
 assert.ok(app.includes('prevClosing!==state.closingVisible'));
 assert.ok(app.includes('if(state.closingVisible&&state.hasClassState)'));
 assert.ok(app.includes('if(state.closingVisible)return'));
 assert.ok(!worker.slice(worker.indexOf('if(method==="PUT"&&path==="/api/closing/presentation")'),worker.indexOf('// Six documentary photos for Modul 06')).includes('is_locked='));
});
test("Closing background upload is authenticated and cannot activate without its JPG",()=>{
 assert.ok(worker.includes('path==="/api/closing/status"'));
 assert.ok(worker.includes('path==="/api/closing/photo"'));
 assert.ok(worker.includes('closingPhotoKey'));
 assert.ok(worker.includes('path==="/api/closing/presentation"'));
 assert.ok(worker.includes('if(data.visible&&(!env.PHOTO_BUCKET||!(await env.PHOTO_BUCKET.head(closingPhotoKey))))'));
 assert.ok(worker.includes('admin.role!=="trainer"'));
});
