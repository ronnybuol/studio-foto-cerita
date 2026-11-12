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
