import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {closingSlideHTML,closingTrainerPanel} from "../public/closing.js";
const api=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const web=readFileSync(new URL("../public/buku-saku.html",import.meta.url),"utf8");

test("Booklet page covers all six original source modules and offers PDF fallback",()=>{
 for(let n=1;n<=6;n++)assert.ok(web.includes('id="modul-'+String(n).padStart(2,"0")+'"'));
 assert.ok(web.includes('Sembilan Bingkai'));
 assert.ok(web.includes('Caption Lab'));
 assert.ok(web.includes('Etika'));
 assert.ok(web.includes("window.print()"));
 assert.ok(web.includes('/lensa-muda/api/booklet/pdf'));
 assert.ok(web.includes('Unduh PDF Lengkap'));
 assert.ok((web.match(/class="topic"/g)||[]).length>=40);
});
test("Closing contains QR to booklet and direct entry on participant/LCD",()=>{
 const html=closingSlideHTML();
 assert.ok(html.includes("BUKU SAKU DIGITAL"));
 assert.ok(html.includes('buku-saku.html'));
 assert.ok(html.includes('data:image/png;base64,'));
 assert.ok(html.includes("Buka buku saku"));
 assert.ok(closingTrainerPanel(false,false).includes('id="booklet-pdf-upload"'));
 assert.ok(app.includes('bookletInput.onchange=async'));
});
test("Booklet is public after class locks; only trainer may upload the PDF",()=>{
 assert.ok(api.includes('path==="/api/booklet/status"'));
 assert.ok(api.includes('path==="/api/booklet/pdf"'));
 assert.ok(api.includes('admin.role!=="trainer"'));
 assert.ok(api.includes('magic!=="%PDF-"'));
 const start=api.indexOf('if(path==="/api/booklet/pdf")');
 const end=api.indexOf('// Optional full-screen closing slide.',start);
 const part=api.slice(start,end);
 assert.ok(!part.includes('is_locked'));
 assert.ok(!part.includes('is_locked='));
 assert.ok(part.includes('Content-Disposition'));
});
