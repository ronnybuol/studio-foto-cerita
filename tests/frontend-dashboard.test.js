import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source=readFileSync(new URL("../public/app.js", import.meta.url),"utf8");

test("dashboard tidak memanggil forEach pada querySelector tunggal",()=>{
  assert.doesNotMatch(source,/(?<!\$)\$\(["'][^"']+["']\)\.forEach\s*\(/);
  for(const selector of ["data-slide-step","data-slide","data-present-mode","data-inspect"]){
    assert.ok(source.includes('$$("['+selector+']").forEach('),
      selector+" harus dipilih sebagai kumpulan elemen");
  }
});

test("fungsi bindDashboard memasang event handler tanpa error pada tombol yang tersedia",()=>{
  const start=source.indexOf("function bindDashboard(){");
  const end=source.indexOf("async function renderTrainer(){",start);
  assert.ok(start>=0&&end>start);
  const code=source.slice(start,end);
  const elements=new Map();
  const many=new Map();
  const get=id=>{
    if(id==="#trainer-camera-reset")return null;
    if(!elements.has(id))elements.set(id,{});
    return elements.get(id);
  };
  for(const selector of ["[data-stage]","[data-slide-step]","[data-slide]",
    "[data-present-mode]","[data-inspect]"]){
    many.set(selector,[{dataset:{}}]);
  }
  vm.runInNewContext(code+"\nbindDashboard();",{
    $:get,$$:selector=>many.get(selector)||[],
    state:{trainerRole:"trainer",presentation:{slide:0}},
    THEORY_SLIDES:[{title:"Pengantar"}],
    sessionStorage:{removeItem(){}},
    render(){},
    toast(){},
    fetchDashboard(){},
    syncState(){},
    request(){},
    Number,
  });
  assert.equal(typeof get("#trainer-out").onclick,"function");
  assert.equal(typeof get("#refresh-dashboard").onclick,"function");
  for(const entries of many.values())assert.equal(typeof entries[0].onclick,"function");
});

test("halaman pemulihan memiliki tombol kembali ke login",()=>{
  assert.ok(source.includes('id="trainer-back-login"'));
  assert.ok(source.includes('sessionStorage.removeItem("lm26-trainer")'));
});


test("panel LCD memiliki indikator kamera visual yang mengikuti pembaruan polling",()=>{
 assert.ok(source.includes('function cameraDialHTML(key,index)'));
 assert.ok(source.includes('function paintCameraDials(camera)'));
 for(const key of ["a","s","i"])assert.ok(source.includes('cameraDialHTML("'+key+'",camera.'+key+')'));
 assert.match(source,/function paintLcdCamera\(\)[\s\S]*?paintCameraDials\(c\);/);
 assert.ok(source.includes('id="lcd-track-'));
 assert.ok(source.includes('id="lcd-thumb-'));
});


test("teks LCD menyampaikan informasi kepada peserta, bukan instruksi pengoperasian trainer",()=>{
 assert.doesNotMatch(source,/IKUT TRAINER/);
 assert.doesNotMatch(source,/Peragaan langsung dikendalikan trainer/);
 assert.ok(source.includes("Amati bagaimana bukaan, kecepatan rana, dan ISO memengaruhi foto."));
});

test("simulator peserta mempertahankan kontrol independen, tombol simpan, dan bingkai responsif",()=>{
 assert.ok(source.includes('class="participant-camera-page"'));
 assert.ok(source.includes('class="card participant-camera-card"'));
 assert.ok(source.includes('class="control-grid participant-camera-controls"'));
 for(const id of ["aperture","shutter","iso"]){
   assert.ok(source.includes('id="'+id+'" type="range"'));
 }
 assert.ok(source.includes('id="save-camera"'));
 assert.ok(source.includes('id="reset-camera"'));
 assert.ok(source.includes('state.camera[key]=Number(e.target.value);updateCamera()'));
 assert.ok(source.includes('saveAnswer("kamera",{...state.camera'));
 assert.ok(source.includes('const c=state.demoCamera;'));
});


test("tampilan peserta berfokus pada materi, navigasi ringkas, identitas Zonautara dan manajemen kelas",()=>{
 const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
 const css=readFileSync(new URL("../public/styles.css",import.meta.url),"utf8");
 assert.ok(source.includes('id="participant-module-select"'));
 assert.ok(source.includes('class="learner-account"'));
 assert.ok(source.includes('function participantFormHTML(p=null)'));
 assert.ok(source.includes('id="trainer-toggle-class-lock"'));
 assert.ok(source.includes('id="print-participants"'));
 assert.ok(source.includes('id="share-participants-wa"'));
 assert.ok(source.includes('id="share-participants-email"'));
 assert.ok(source.includes('id="participant-print-sheet"'));
 assert.ok(source.includes('document.body.dataset.appMode=mode'));
 assert.ok(css.includes('body[data-app-mode="peserta"] .top-links'));
 assert.ok(css.includes('@media print'));
 assert.ok(html.includes("brand-logo-kamisama"));
 assert.ok(html.includes("Ronny Adolof Buol"));
 assert.ok(html.includes("brand-logo-zonautara"));
});
