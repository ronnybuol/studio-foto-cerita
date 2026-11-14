import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {THEORY_SLIDES,PHOTO_DETAILS,PRESENTATION_ORDER,MAX_PRESENTATION_SLIDE,photoDetail,presentationLabel,cameraPhotoUrl} from "../public/slides.js";

test("sub-slide tambahan mempertahankan delapan indeks materi utama",()=>{
 assert.equal(THEORY_SLIDES.length,8);
 assert.equal(PHOTO_DETAILS.length,13);
 assert.equal(MAX_PRESENTATION_SLIDE,20);
 assert.equal(PRESENTATION_ORDER.length,21);
 assert.deepEqual(PRESENTATION_ORDER.filter(n=>n<8),[0,1,2,3,4,5,6,7]);
 assert.equal(new Set(PRESENTATION_ORDER).size,PRESENTATION_ORDER.length);
 for(const n of PRESENTATION_ORDER)assert.ok(n>=0&&n<=MAX_PRESENTATION_SLIDE);
});
test("semua sub-slide mempunyai foto lokal dan label berurutan",()=>{
 assert.deepEqual(PRESENTATION_ORDER.slice(0,6).map(presentationLabel),["01","01a","02","02a","02b","02c"]);
 for(let i=8;i<=MAX_PRESENTATION_SLIDE;i++){
   const d=photoDetail(i);
   assert.ok(d?.title&&d?.question&&d?.caption);
   assert.ok(cameraPhotoUrl(d.image).startsWith("/lensa-muda/assets/camera/"));
 }
 assert.equal(photoDetail(0),null);
});

test("hanya detail foto 04a/04b, 05a/05b dan 07a/07b punya ilustrasi fisik kamera",()=>{
 const js=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 for(const key of ["04a","04b","05a","05b","07a","07b"])assert.ok(js.includes('key==="'+key+'"'),key);
 assert.match(js,/function cameraDetailVisual\(detail\)/);
 assert.match(js,/photo-detail-media-split/);
 assert.match(js,/camera-diagram-iris/);
 assert.match(js,/camera-shutter-track/);
 assert.match(js,/camera-exposure-reading/);
 assert.doesNotMatch(js,/key==="06[ab]"/);
 assert.match(css,/\.iris-wide\{--iris-opening:77%\}/);
 assert.match(css,/\.iris-narrow\{--iris-opening:19%\}/);
 assert.match(css,/\.shutter-short\{width:1\.5%/);
 assert.match(css,/\.camera-diagram-exposure/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.equal(PHOTO_DETAILS.length,13);
});
