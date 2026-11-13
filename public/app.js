import {THEORY_SLIDES,theoryVisual,cameraPhotoUrl,PHOTO_DETAILS,PRESENTATION_ORDER,MAX_PRESENTATION_SLIDE,photoDetail,presentationLabel} from "./slides.js";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const escapeHtml = (s="") => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STORAGE_USER = "lm26-user";
const STORAGE_WORK = "lm26-work";
const STORAGE_VIEW = "lm26-view";
const STAGES = [
  {key:"mulai",name:"Orientasi",icon:"⌂",title:"Selamat datang di Studio Foto Cerita",blurb:"Tidak membawa kamera? Tidak masalah. Kita akan belajar melihat dan menyusun cerita."},
  {key:"kamera",name:"Laboratorium Kamera",icon:"◉",title:"Bermain dengan cahaya",blurb:"Geser bukaan, shutter, dan ISO. Lihat bagaimana pilihan teknis mengubah gambar."},
  {key:"komposisi",name:"Komposisi Visual",icon:"▦",title:"Apa yang masuk bingkai?",blurb:"Belajar membuat subjek lebih jelas melalui posisi, ruang, dan sudut pandang."},
  {key:"edfat",name:"Detektif EDFAT",icon:"◈",title:"Lima cara mengamati peristiwa",blurb:"Entire, Detail, Frame, Angle, Time: bukan hafalan, melainkan cara mencari cerita."},
  {key:"story",name:"Sembilan Bingkai",icon:"▤",title:"Sembilan foto, satu cerita",blurb:"Pilih 9 dari 12 ilustrasi latihan, lalu atur alurnya dari pembuka hingga penutup."},
  {key:"caption",name:"Caption Lab",icon:"✎",title:"Foto yang jujur butuh konteks",blurb:"Kumpulkan fakta 5W+1H lalu tulis satu caption untuk sembilan foto."},
  {key:"etika",name:"Etika & Tantangan",icon:"✓",title:"Merekam budaya dengan hormat",blurb:"Jaga keaslian momen, hormati orang yang dipotret, dan siapkan rencana hunting."}
];
const APERTURE = [1.8,2.8,4,5.6,8,11,16];
const SHUTTERS = [{t:1/15,l:"1/15"},{t:1/30,l:"1/30"},{t:1/60,l:"1/60"},{t:1/125,l:"1/125"},{t:1/250,l:"1/250"},{t:1/500,l:"1/500"},{t:1/1000,l:"1/1000"}];
const ISOS = [100,200,400,800,1600,3200,6400];
const CAPTION_FIELDS = [
  ["who","Siapa? (Who)","Nama dan peran tokoh, kelompok atau komunitas"],
  ["what","Apa? (What)","Kegiatan atau peristiwa yang sungguh terjadi"],
  ["when","Kapan? (When)","Tanggal atau waktu kejadian yang telah dipastikan"],
  ["where","Di mana? (Where)","Tempat spesifik, desa/kecamatan/kota"],
  ["why","Mengapa? (Why)","Makna, tujuan, atau latar yang sudah terverifikasi"],
  ["how","Bagaimana? (How)","Proses atau cara terjadinya peristiwa"]
];
const ETHICS = [
  {q:"Seorang pengrajin sedang bekerja. Bolehkah kita meminta ia mengulang gerakan seolah-olah spontan untuk foto dokumenter candid?",a:["Boleh, asal lebih bagus","Tidak. Cari momen asli, jangan merekayasa peristiwa","Boleh tanpa memberi tahu pembaca"],correct:1,why:"Juknis melarang staged photography untuk adegan candid. Jangan mengubah kenyataan demi foto."},
  {q:"Di belakang penari ada seseorang yang mengganggu komposisi. Apa pilihan yang sesuai aturan lomba?",a:["Hapus orang itu dengan aplikasi","Minta semua orang meninggalkan lokasi","Ubah posisi kamera atau tunggu momen, bukan menghapus objek"],correct:2,why:"Penyuntingan yang menambah, menghapus, atau memindahkan objek dilarang."},
  {q:"Kamu belum tahu nama upacara yang dipotret. Apa yang harus dilakukan sebelum menulis caption?",a:["Bertanya kepada orang yang memahami dan memeriksa informasinya","Tebak dari kostum","Salin deskripsi dari unggahan viral"],correct:0,why:"Foto jurnalistik membutuhkan fakta terverifikasi, tidak hanya deskripsi visual."},
  {q:"Kamu akan memotret ritual dengan pembatasan tertentu. Langkah terbaik?",a:["Tetap memotret diam-diam karena untuk tugas sekolah","Hormati aturan setempat, minta izin dan penjelasan","Pindahkan benda ritual agar fotonya lebih kuat"],correct:1,why:"Hormati komunitas, adat, akses, keselamatan, dan hak orang yang dipotret."}
];
const SHOTS = [
  ["Gerbang sanggar","Entire","Menetapkan tempat",0],
  ["Warga berdatangan","Frame","Menunjukkan suasana",1],
  ["Pengrajin membuka ruang","Entire","Memperkenalkan kegiatan",2],
  ["Wajah pengrajin","Portrait","Menghadirkan tokoh",3],
  ["Alat kerja di meja","Detail","Memberi petunjuk",4],
  ["Tangan mengukir kayu","Detail","Mengikuti proses",5],
  ["Anak mengamati","Frame","Melihat hubungan generasi",6],
  ["Pekerjaan bersama","Angle","Menunjukkan interaksi",7],
  ["Momen paling sibuk","Time","Menangkap puncak",8],
  ["Wajah penuh konsentrasi","Time","Momen manusiawi",9],
  ["Karya selesai","Detail","Menunjukkan hasil",10],
  ["Sanggar menjelang sore","Closing","Menutup kisah",11]
].map(([title,type,desc,i])=>({id:i+1,title,type,desc,i}));
let state = {
  online:false,serverStage:0,count:0,demoStage:6,role:"participant",
  demoCamera:{a:1,s:3,i:1},
  presentation:{view:"theory",slide:0},
  user:readJSON(STORAGE_USER,null),work:readJSON(STORAGE_WORK,{}),
  trainerToken:sessionStorage.getItem("lm26-trainer")||"",
  trainerRole:sessionStorage.getItem("lm26-role")||"trainer",
  active:localStorage.getItem(STORAGE_VIEW)||"mulai",
  camera:{a:1,s:3,i:1},composition:{grid:true,frame:false,position:"center"},
  dashboard:null
};
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveWork(){localStorage.setItem(STORAGE_WORK,JSON.stringify(state.work))}
function toast(message){const box=$("#toast");box.textContent=message;box.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.classList.remove("visible"),2800)}
const PUBLIC_BASE = "/lensa-muda";
async function request(path,{method="GET",payload,auth=false}={}){
  const headers={};
  if(payload!==undefined) headers["Content-Type"]="application/json";
  const token=auth?state.trainerToken:state.user?.token;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(PUBLIC_BASE+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){
    const error=new Error(body.error||`HTTP ${response.status}`);
    error.status=response.status;
    throw error;
  }
  return body;
}
async function syncState(){
  try {
    const data=await request("/api/state");
    if(!data||typeof data.stage!=="number") throw Error("API belum terpasang");
    state.online=true; state.serverStage=data.stage;state.count=data.count||0;
    if(data.camera&&["a","s","i"].every(k=>Number.isInteger(data.camera[k])&&data.camera[k]>=0&&data.camera[k]<=6))state.demoCamera=data.camera;
    if(data.presentation&&["theory","simulator"].includes(data.presentation.view)&&Number.isInteger(data.presentation.slide)&&data.presentation.slide>=0&&data.presentation.slide<=MAX_PRESENTATION_SLIDE)
      state.presentation=data.presentation;
    $("#connectivity").className="connection online";
    $("#connectivity").textContent=`● Terhubung ke kelas langsung · ${data.count||0} peserta terdaftar`;
  }catch{
    state.online=false;
    $("#connectivity").className="connection demo";
    $("#connectivity").textContent="◌ Mode demo lokal — latihan tersimpan pada perangkat ini, belum tersinkron ke kelas";
  }
}
function pageMode(){const mode=location.hash.replace(/^#\//,"").split("/")[0];return ["trainer","lcd","peserta"].includes(mode)?mode:"peserta"}
function goModule(key){state.active=key;localStorage.setItem(STORAGE_VIEW,key);render();window.scrollTo({top:0,behavior:"smooth"})}
function titleBlock(key){const s=STAGES.find(x=>x.key===key);return `<div class="module-top"><div><span class="eyebrow">MODUL ${STAGES.indexOf(s)} / 6</span><h1>${s.title}</h1><p>${s.blurb}</p></div><span class="pill">Latihan interaktif</span></div>`}
function isUnlocked(key){return !state.online || STAGES.findIndex(x=>x.key===key)<=state.serverStage}
function lessonLayout(){
  const nav=STAGES.map((s,i)=>`<button data-nav="${s.key}" class="${state.active===s.key?"active":""} ${isUnlocked(s.key)?"":"locked"}" ${isUnlocked(s.key)?"":"disabled"}><span class="stepnum">${String(i).padStart(2,"0")}</span>${s.name}</button>`).join("");
  return `<div class="page"><div class="lab-layout"><aside class="side"><h3>Modul pembelajaran</h3><nav class="side-nav">${nav}</nav><div class="user-chip"><b>${escapeHtml(state.user?.name||"Peserta")}</b><p>${escapeHtml(state.user?.school||"")} ${state.user?.className?"· "+escapeHtml(state.user.className):""}</p><span class="pill ${state.online?"green":"gray"}">${state.online?"Kelas langsung":"Mode demo"}</span></div></aside><section class="lesson">${renderModule()}</section></div></div>`;
}
function renderModule(){switch(state.active){
  case "kamera":return state.presentation.view==="theory"?theoryParticipantPage():cameraPage();
  case "komposisi":return compositionPage();
  case "edfat":return edfatPage();
  case "story":return storyPage();
  case "caption":return captionPage();
  case "etika":return ethicsPage();
  default:return startPage();
}}
function landing(){
  return `<div class="page"><div class="hero"><div><div class="kicker">Kelas Lensa Muda • 16 November 2026</div><h1>Dari jepretan menjadi <span>cerita.</span></h1><p>Pelajari kamera, komposisi, dan foto jurnalistik melalui eksperimen visual. Tanpa kamera pun kamu tetap bisa belajar. Siapkan cerita tentang budaya Sulawesi Utara.</p><div class="actions"><button class="btn primary" id="start-signup">Mulai belajar →</button><a class="btn ghost-dark" href="#/lcd">Layar kelas</a></div></div><div class="hero-icon"><svg viewBox="0 0 240 200" fill="none"><rect x="18" y="55" width="205" height="125" rx="24" stroke="currentColor" stroke-width="12"/><path d="M75 54 91 22h66l17 32" stroke="currentColor" stroke-width="12"/><circle cx="119" cy="115" r="44" stroke="currentColor" stroke-width="12"/><circle cx="119" cy="115" r="19" fill="currentColor"/><circle cx="191" cy="81" r="8" fill="currentColor"/></svg></div></div><div style="margin-top:26px" class="grid"><div class="card feature"><span class="num">01 / TEKNIK</span><span class="mini-icon">◉</span><strong>Atur kamera</strong><p>Geser slider dan lihat hubungan bukaan, rana, ISO, gerak, serta kedalaman ruang.</p></div><div class="card feature"><span class="num">02 / CERITA</span><span class="mini-icon">▧</span><strong>Susun 9 bingkai</strong><p>Seleksi dan urutkan ilustrasi landscape menjadi rangkaian photo story.</p></div><div class="card feature"><span class="num">03 / JURNALISTIK</span><span class="mini-icon">✎</span><strong>Perkuat caption</strong><p>Latih 5W+1H dan etika sebelum hunting budaya sesungguhnya.</p></div></div><div class="info" style="margin-top:18px"><b>Belum punya kamera?</b> Semua simulator dan latihan bisa dikerjakan melalui browser HP atau komputer. Fotografi lapangan dilakukan belakangan bersama pendamping.</div></div>`;
}
function signupPage(){
  return `<div class="page"><div class="card login-card"><span class="eyebrow">Pendaftaran peserta • tanpa batas kuota aplikasi</span><h1>Masuk ke kelas</h1><p class="muted">Gunakan nama yang kamu setujui untuk ditampilkan selama kegiatan. Data sekolah dan kelas membantu guru serta fotografer pendamping mengenali peserta.</p><form id="signup-form"><div class="field"><label for="name">Nama peserta</label><input id="name" name="name" required minlength="2" maxlength="90" autocomplete="name" placeholder="Nama lengkap"></div><div class="field"><label for="school">Asal sekolah</label><input id="school" name="school" required maxlength="140" placeholder="SMA/SMK/MA ..."></div><div class="field"><label for="className">Kelas</label><input id="className" name="className" required maxlength="30" placeholder="Contoh: XI IPA 2"></div><button class="btn primary block" type="submit">Masuk Studio Foto Cerita →</button></form><p class="small-note">Aplikasi menyimpan progres latihan. Dalam mode demo, datanya hanya tersimpan pada perangkat ini.</p></div></div>`;
}
function startPage(){
  return `${titleBlock("mulai")}<div class="hero" style="padding:30px"><div><span class="kicker">Tantangan Lensa Muda</span><h1 style="font-size:clamp(27px,4vw,47px)">Satu foto bisa indah.<br><span>Sembilan foto bisa bercerita.</span></h1><p>Dalam tiga jam, kamu belajar membuat keputusan di balik kamera dan di meja editor. Karya akhir lomba menggunakan 9 foto asli dan satu caption bersama sekitar 150 kata.</p><div class="actions"><button class="btn primary" data-nav="kamera">Masuk laboratorium kamera →</button></div></div><div class="hero-icon"><svg viewBox="0 0 240 180" fill="none"><rect x="23" y="26" width="196" height="129" rx="12" stroke="currentColor" stroke-width="8"/><circle cx="119" cy="89" r="46" stroke="currentColor" stroke-width="8"/><path d="M33 145 92 98l41 27 35-51 44 54" stroke="currentColor" stroke-width="7"/></svg></div></div><div class="grid" style="margin-top:16px"><div class="card"><div class="eyebrow">Tidak perlu kamera</div><h3>Pakai simulator</h3><p class="small-note">Seluruh pelajaran inti dapat dikerjakan tanpa memotret sungguhan.</p></div><div class="card"><div class="eyebrow">Tema karya</div><h3>Wajah Budaya Sulut</h3><p class="small-note">Cari manusia, aktivitas, detail, hubungan, serta makna kebudayaan.</p></div><div class="card"><div class="eyebrow">Aturan pokok</div><h3>Jujur pada momen</h3><p class="small-note">Jangan mengarang fakta, merekayasa candid, atau menghapus objek.</p></div></div>`;
}
const backSVG=`<svg class="back" viewBox="0 0 900 600" aria-hidden="true"><defs><linearGradient id="wall" x1="0" y1="0" y2="1"><stop stop-color="#557f7e"/><stop offset="1" stop-color="#314d4f"/></linearGradient><linearGradient id="window" x1="0" y1="0" y2="1"><stop stop-color="#fbd5a1"/><stop offset="1" stop-color="#c1b58c"/></linearGradient></defs><rect width="900" height="600" fill="url(#wall)"/><path d="M0 0h900v77H0z" fill="#293f43"/><path d="M0 430h900v170H0z" fill="#8f6d52"/><path d="M0 455h900" stroke="#af8a65" stroke-width="11"/><rect x="65" y="110" width="290" height="263" rx="7" fill="#29494b" stroke="#b6a989" stroke-width="17"/><rect x="86" y="131" width="248" height="221" fill="url(#window)"/><path d="M209 131v222M86 240h248" stroke="#6b6b55" stroke-width="10"/><path d="M86 330 140 248l44 37 58-82 92 98v50H86" fill="#789688"/><circle cx="281" cy="167" r="27" fill="#fff2c6" opacity=".65"/><path d="M0 80h900" stroke="#8d714d" stroke-width="19"/><path d="M610 84v95m90-95v122m92-122v94" stroke="#c1ad78" stroke-width="8"/><path d="M590 170q25-40 48 0l-9 45h-28z" fill="#b97941"/><path d="M677 199q29-46 56 0l-8 57h-39z" fill="#c9aa6b"/><path d="M765 175q25-39 48 0l-7 42h-34z" fill="#b8794b"/><rect x="565" y="318" width="270" height="78" rx="4" fill="#4b4941"/><rect x="596" y="250" width="14" height="70" fill="#c8ba8c"/><path d="M594 248h78l-12 22h-66" fill="#9b9e86"/><rect x="685" y="280" width="80" height="35" fill="#af855a"/><path d="M45 510h800" stroke="#664d3e" stroke-width="19" opacity=".42"/></svg>`;
const subjectSVG=`<svg class="subject" viewBox="0 0 900 600" aria-hidden="true"><ellipse cx="478" cy="539" rx="315" ry="41" fill="#262a28" opacity=".29"/><path d="M240 415h495l-24 130H267z" fill="#614536"/><path d="M220 399h540v36H220z" fill="#d2a26d"/><path d="M210 436h30l14 110h-28zm520 0h30l-18 110h-30z" fill="#433a36"/><path d="M369 408q-54-81-26-146 18-49 68-57 67-5 97 74l26 132z" fill="#db693d"/><path d="M384 266q-34 74-28 133l60 13 27-122z" fill="#ba542c"/><path d="M463 280q54 39 63 128l-63 8-49-126z" fill="#e58a4a"/><path d="M398 197q-29-33-21-73 9-53 61-59 60-1 65 51 4 51-36 79l-5 37h-62z" fill="#be8565"/><path d="M379 130q-14-75 54-90 78-14 78 71-24-18-48-27-20 39-84 46z" fill="#25282b"/><path d="M384 149q-6-17-18-6-11 19 12 31" fill="#be8565"/><path d="M458 149q-11 15-22 16" stroke="#844b3e" stroke-width="5" stroke-linecap="round"/><circle cx="467" cy="128" r="4" fill="#30282a"/><path d="M384 210 424 242 467 204l-1 34-45 42-41-43z" fill="#ebc29e"/><path d="M284 425q111-39 220-37l-12 40z" fill="#e8b783"/><path d="M530 375 570 326l28 3-48 76-37 19" fill="#b87a53"/><path d="M534 369 557 341 601 340" stroke="#f0bc86" stroke-width="14" stroke-linecap="round"/><path d="M418 402q29-6 55-8 22 5 35 18l-17 18-60-9" fill="#c18768"/><path d="M321 411q-4-17 14-31l50 3 25 23-12 20-65 3" fill="#bd825d"/><path d="M465 393l113-31 35 37-119 29z" fill="#ab754d" stroke="#5d4836" stroke-width="5"/><path d="M525 383l61-15" stroke="#e0b07d" stroke-width="3"/><rect x="624" y="407" width="75" height="13" rx="3" fill="#987554"/><path d="M645 410v-45l31-26 18 18-34 30v23" fill="#414548"/><path d="M659 366l22-18" stroke="#c4c2b4" stroke-width="7"/></svg>`;
const motionSVG=`<svg class="motion" viewBox="0 0 900 600" aria-hidden="true"><path d="M463 363Q500 379 525 393" stroke="#bc7954" stroke-width="27" stroke-linecap="round"/><path d="M524 390 562 377" stroke="#d9a078" stroke-width="15" stroke-linecap="round"/><path d="M555 375 606 357" stroke="#c7bbb0" stroke-width="7" stroke-linecap="round"/></svg>`;
function sceneHTML(id="cameraScene",extra=""){
return `<div id="${id}" class="scene ${extra}"><div class="view-label">SIMULASI • SANGGAR KERAJINAN</div>${backSVG}${subjectSVG}${motionSVG}<div class="exposure"></div><canvas class="noise" width="450" height="300"></canvas><svg class="gridlines" viewBox="0 0 900 600"><path d="M300 0v600M600 0v600M0 200h900M0 400h900" stroke="#ffffffad" stroke-width="3"/></svg><div class="framing"></div></div>`;
}
function photoSceneHTML(id="cameraScene"){
 return `<div id="${id}" class="scene photo-camera-scene">
   <img class="photo-main" src="${cameraPhotoUrl("base")}" alt="Ilustrasi generatif pengrajin memahat kayu sebagai bahan latihan exposure" decoding="async">
   <img class="photo-motion" src="${cameraPhotoUrl("shutter-cepat")}" alt="" aria-hidden="true" decoding="async">
   <div class="exposure"></div><canvas class="noise" width="450" height="300"></canvas>
   <div class="view-label">SIMULASI FOTO GENERATIF · BUKAN FOTO PERISTIWA NYATA</div>
 </div>`;
}
function photoDetailContent(index,variant="lcd"){
 const detail=photoDetail(index);
 if(!detail)return "";
 return `<div class="photo-detail-layout photo-detail-${variant}">
  <div class="photo-detail-heading"><span class="theory-kicker">FOTO ${presentationLabel(index)} · ILUSTRASI GENERATIF</span><h2>${escapeHtml(detail.title)}</h2></div>
  <figure class="photo-detail-figure"><img src="${cameraPhotoUrl(detail.image)}" alt="${escapeHtml(detail.caption)}" loading="eager" decoding="async"><figcaption>${escapeHtml(detail.caption)}</figcaption></figure>
  <div class="photo-detail-question"><b>AMATI & DISKUSIKAN</b><span>${escapeHtml(detail.question)}</span></div>
 </div>`;
}
function theorySlideContent(index,variant="lcd"){
 if(photoDetail(index))return photoDetailContent(index,variant);
 const slide=THEORY_SLIDES[index]||THEORY_SLIDES[0];
 return `<div class="theory-layout theory-layout-${variant}">
   <section class="theory-explain">
     <div class="theory-kicker">${escapeHtml(slide.eyebrow)} <span>· ${index+1} / ${THEORY_SLIDES.length}</span></div>
     <h2>${escapeHtml(slide.title)}</h2>
     <p class="theory-lead">${escapeHtml(slide.lead)}</p>
     <ul class="theory-points">${slide.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
     <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(slide.prompt)}</strong></div>
   </section>
   <div class="theory-visual">${theoryVisual(index,{sceneHTML,shotSrc})}</div>
 </div>`;
}
function theoryParticipantPage(){
 const i=state.presentation.slide,slide=THEORY_SLIDES[photoDetail(i)?.parent??i]||THEORY_SLIDES[0];
 return `${titleBlock("kamera")}
  <div class="info" style="margin-bottom:14px"><b>Materi teori sedang berlangsung.</b> Ikuti pembahasan bersama trainer. Setelah slide terakhir, trainer akan membuka laboratorium kamera untuk latihan pribadi.</div>
  <div class="card theory-participant-card">${theorySlideContent(i,"participant")}</div>
  <p class="small-note">Materi ${presentationLabel(i)} · 8 pokok bahasan dan contoh foto. Pertanyaan diskusi dijawab secara lisan bersama kelas; tidak perlu membawa kamera.</p>`;
}
function theoryTrainerPanel(data,isMentor){
 const p=state.presentation;
 const i=p.slide,detail=photoDetail(i),slide=THEORY_SLIDES[detail?.parent??i]||THEORY_SLIDES[0];
 const stageLive=data.stage===1,enabled=!isMentor;
 return `<section class="card trainer-theory-card">
    <div class="trainer-demo-heading"><div><span class="eyebrow">PRESENTASI INTERAKTIF · BAB 1</span>
      <h2>Materi Dasar Fotografi</h2>
      <p class="small-note">Delapan pokok bahasan beserta sub-slide foto utuh. Ketika tahap 01 terbuka, tombol ini mengubah isi LCD.</p></div>
      <span class="pill ${stageLive?"green":"gray"}">${stageLive?"● TAHAP 01 AKTIF":"BUKA TAHAP 01 TERLEBIH DAHULU"}</span>
    </div>
    ${p.view==="theory"?`
      <div class="trainer-theory-preview ${detail?"trainer-photo-preview":""}">
        <div class="trainer-theory-title"><span>${escapeHtml(slide.eyebrow)} · ${presentationLabel(i)}</span><h3>${escapeHtml(detail?.title||slide.title)}</h3>
          <p>${escapeHtml(slide.lead)}</p><div class="trainer-theory-note"><b>CATATAN UNTUK TRAINER</b><p>${escapeHtml(slide.note)}</p></div></div>
        <div class="trainer-theory-mini">${detail?photoDetailContent(i,"trainer"):theoryVisual(i,{sceneHTML,shotSrc})}</div>
      </div>
      <div class="trainer-slide-nav">
        <button class="btn subtle" data-slide-step="-1" ${PRESENTATION_ORDER.indexOf(i)===0||!enabled?"disabled":""}>← Slide sebelumnya</button>
        <strong>Slide ${presentationLabel(i)} · ${PRESENTATION_ORDER.indexOf(i)+1}/${PRESENTATION_ORDER.length}</strong>
        <button class="btn primary" data-slide-step="1" ${PRESENTATION_ORDER.indexOf(i)===PRESENTATION_ORDER.length-1||!enabled?"disabled":""}>Slide berikutnya →</button>
      </div>
      <div class="theory-step-picker" role="group" aria-label="Pilih slide">
        ${PRESENTATION_ORDER.map(n=>`<button class="theory-dot" data-slide="${n}" aria-pressed="${n===i}" title="${escapeHtml(photoDetail(n)?.title||THEORY_SLIDES[n]?.title||"Foto")}" ${!enabled?"disabled":""}>${presentationLabel(n)}</button>`).join("")}
      </div>
      <div class="actions">
        <button class="btn primary" data-present-mode="simulator" ${!enabled?"disabled":""}>◉ Mulai simulator kamera →</button>
        <span class="small-note">Membuka simulator tanpa mengubah hasil latihan peserta.</span>
      </div>
    `:`
      <div class="trainer-theory-compact">
        <div><strong>Mode simulator kamera sedang aktif</strong>
          <p class="small-note">Panel pengaturan kamera berada tepat di bawah ini. Anda dapat kembali ke slide teori kapan saja.</p></div>
        <button class="btn subtle" data-present-mode="theory" ${!enabled?"disabled":""}>← Kembali ke slide teori</button>
      </div>
    `}
    <p id="presentation-save-status" role="status" class="small-note">${!stageLive?"Slide tersimpan, tetapi belum ditayangkan sampai tahap 01 dibuka.":p.view==="theory"?"Tampilan LCD: slide teori.":"Tampilan LCD: simulator."}</p>
  </section>`;
}
function cameraPage(){
const cam=state.camera;
return `<div class="participant-camera-page">${titleBlock("kamera")}<div class="card participant-camera-card"><div class="info participant-camera-intro"><b>Eksperimen:</b> geser bukaan, rana, dan ISO satu per satu. Perhatikan perubahan ketajaman, gerak, dan kecerahan. Adegan ini <b>ilustrasi simulasi</b>, bukan foto sesungguhnya.</div><div class="participant-camera-image">${photoSceneHTML("cameraScene")}</div><div class="statline"><div><span>Perubahan exposure dibanding f/2.8 · 1/125 · ISO 200</span><div class="small-note" style="color:#ccd2d5">Pengaruh terang-gelap dihitung bersama, seperti exposure triangle.</div></div><strong id="ev">0 EV</strong></div><div class="control-grid participant-camera-controls"><div class="control"><label for="aperture">Bukaan / aperture <output id="apertureValue">f/${APERTURE[cam.a]}</output></label><input id="aperture" type="range" min="0" max="6" value="${cam.a}" step="1"><small id="apertureHelp">Kedalaman ruang</small></div><div class="control"><label for="shutter">Shutter speed <output id="shutterValue">${SHUTTERS[cam.s].l}s</output></label><input id="shutter" type="range" min="0" max="6" value="${cam.s}" step="1"><small id="shutterHelp">Ketajaman gerak</small></div><div class="control"><label for="iso">ISO <output id="isoValue">${ISOS[cam.i]}</output></label><input id="iso" type="range" min="0" max="6" value="${cam.i}" step="1"><small id="isoHelp">Noise dan sensitivitas efektif</small></div></div><div class="actions participant-camera-actions"><button id="reset-camera" class="btn subtle">↺ Reset kamera</button><button id="save-camera" class="btn primary">Simpan eksperimen ✓</button></div></div><div class="grid two participant-camera-notes"><div class="card"><h3>💡 Bukaan lensa</h3><p class="small-note">f-number kecil berarti bukaan besar: lebih banyak cahaya dan area fokus yang lebih tipis. Pada banyak HP, bukaan fisik tetap. Di simulator ini semua pilihan tetap bisa dicoba.</p></div><div class="card"><h3>⚡ Rana & ISO</h3><p class="small-note">Rana lebih cepat bisa membekukan gerakan tetapi mengurangi cahaya. ISO tinggi membantu pemotretan gelap, namun biasanya meningkatkan noise. Pengaturan nyata bergantung jenis kamera dan kondisi lokasi.</p></div></div></div>`;
}
function exposureFor(cam){
  const aperture=APERTURE[cam.a],shutter=SHUTTERS[cam.s].t,iso=ISOS[cam.i];
  return Math.log2((shutter/(1/125))*Math.pow(2.8/aperture,2)*(iso/200));
}
function exposureText(cam){
  const ev=exposureFor(cam);
  return `${ev>0?"+":""}${ev.toFixed(1)} EV`;
}
function paintCameraScene(sc,cam){
  if(!sc)return;
  const aperture=APERTURE[cam.a],shutter=SHUTTERS[cam.s].t,iso=ISOS[cam.i],ev=exposureFor(cam);
  const bgBlur=Math.max(0,Math.min(8,(8-aperture)*1.3));
  const motionBlur=Math.max(0,Math.min(18,(shutter*125-1)*2));
  if(sc.classList.contains("photo-camera-scene")){
    const main=sc.querySelector(".photo-main");
    const photo=cam.a<=1?"aperture-lebar":cam.a>=4?"aperture-sempit":"base";
    const next=cameraPhotoUrl(photo);
    if(main.getAttribute("src")!==next)main.setAttribute("src",next);
    const movement=sc.querySelector(".photo-motion");
    const movePhoto=cam.s<=2?"shutter-lambat":"shutter-cepat";
    const moveSrc=cameraPhotoUrl(movePhoto);
    if(movement.getAttribute("src")!==moveSrc)movement.setAttribute("src",moveSrc);
    movement.style.opacity=cam.s===3?"0":String(Math.min(.96,Math.abs(cam.s-3)*.32));
  } else {
    sc.querySelector(".back").style.filter=`blur(${bgBlur.toFixed(1)}px)`;
    sc.querySelector(".motion").style.filter=`blur(${motionBlur.toFixed(1)}px)`;
  }
  sc.querySelector(".exposure").style.background=ev<0
    ?`rgba(0,0,0,${Math.min(.72,-ev*.115)})`
    :`rgba(255,255,240,${Math.min(.68,ev*.105)})`;
  const canvas=sc.querySelector(".noise"),ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(iso>400){
    const pixels=ctx.createImageData(canvas.width,canvas.height),d=pixels.data;
    let seed=12271+cam.i*8137;
    const alpha=Math.min(120,(cam.i-2)*23);
    for(let j=0;j<d.length;j+=4){
      seed=(1664525*seed+1013904223)>>>0;
      const gray=(seed>>>16)&255;
      d[j]=gray;d[j+1]=gray;d[j+2]=gray;d[j+3]=alpha;
    }
    ctx.putImageData(pixels,0,0);
  }
}
function updateCamera(){
  const cam=state.camera,sc=$("#cameraScene");
  if(!sc)return;
  paintCameraScene(sc,cam);
  $("#ev").textContent=exposureText(cam);
  $("#apertureValue").textContent=`f/${APERTURE[cam.a]}`;
  $("#shutterValue").textContent=`${SHUTTERS[cam.s].l}s`;
  $("#isoValue").textContent=`${ISOS[cam.i]}`;
  $("#apertureHelp").textContent=APERTURE[cam.a]<4?"Latar cenderung semakin blur":APERTURE[cam.a]>8?"Area fokus tampak lebih luas":"Kedalaman ruang menengah";
  $("#shutterHelp").textContent=SHUTTERS[cam.s].t>=1/30?"Gerak tampak kabur":SHUTTERS[cam.s].t<=1/500?"Gerak lebih mudah dibekukan":"Perhatikan gerakan tangan";
  $("#isoHelp").textContent=ISOS[cam.i]>=1600?"Noise semakin terlihat":ISOS[cam.i]<=200?"Noise relatif rendah":"Penguatan cahaya meningkat";
}
function compositionPage(){
return `${titleBlock("komposisi")}<div class="card"><p class="small-note">Ubah garis bantu, bingkai dalam bingkai, dan posisi subjek. Tidak semua foto harus mengikuti rule of thirds; tentukan mana yang paling baik menjelaskan peristiwa.</p>${sceneHTML("compositionScene","showgrid")}<div class="choice-set"><button class="choice" data-comp="grid" aria-pressed="${state.composition.grid}">▦ Garis sepertiga</button><button class="choice" data-comp="frame" aria-pressed="${state.composition.frame}">▣ Bingkai alami</button></div><div class="eyebrow">Letak subjek</div><div class="choice-set">${["left","center","right"].map((p,i)=>`<button class="choice" data-position="${p}" aria-pressed="${state.composition.position===p}">${["Kiri","Tengah","Kanan"][i]}</button>`).join("")}</div><div class="info">Coba tempatkan tokoh di sisi kiri atau kanan dan biarkan ruang untuk alat kerja. Tanyakan: apakah bingkai memperjelas informasi atau justru memotong bagian penting?</div><div class="actions"><button class="btn primary" id="save-comp">Simpan pilihan komposisi ✓</button></div></div><div class="grid two" style="margin-top:15px"><div class="card"><h3>Jarak dan sudut</h3><p class="small-note">Foto lebar memberi konteks, foto dekat menunjukkan detail. Sudut rendah dapat mengubah kesan subjek; pilih angle untuk menjelaskan, bukan sekadar dramatis.</p></div><div class="card"><h3>Ketika memotret budaya</h3><p class="small-note">Jangan sampai upaya memperoleh komposisi bagus membuat kita mengganggu ritual atau mengatur ulang kejadian yang seharusnya spontan.</p></div></div>`;
}
function updateComposition(){
const sc=$("#compositionScene");if(!sc)return;
sc.classList.toggle("showgrid",state.composition.grid);sc.classList.toggle("showframe",state.composition.frame);
const x={left:-85,center:0,right:85}[state.composition.position];
sc.querySelector(".subject").style.transform=`translateX(${x}px)`;
sc.querySelector(".motion").style.transform=`translateX(${x}px)`;
}
function edfatPage(){
const facts=[
 ["E","Entire","Lihat peristiwa secara utuh. Di mana berlangsung? Siapa saja yang hadir?"],
 ["D","Detail","Temukan petunjuk kecil yang penting: tangan, alat, tekstur, ekspresi."],
 ["F","Frame","Gunakan objek di depan/belakang untuk memberi lapisan konteks."],
 ["A","Angle","Ubah sudut pandang untuk memperlihatkan informasi yang berbeda."],
 ["T","Time","Tunggu momen yang paling menjelaskan tindakan atau emosi."]
];
return `${titleBlock("edfat")}<div class="grid" style="margin-bottom:16px">${facts.map(([key,name,desc])=>`<div class="card"><div class="eyebrow" style="font-size:26px">${key}</div><h3>${name}</h3><p class="small-note">${desc}</p></div>`).join("")}</div><div class="card"><h2>Detektif EDFAT</h2><p class="small-note">Seorang fotografer mendekat untuk memperlihatkan pahatan halus pada alat musik yang sedang dibuat. Pendekatan utama yang sedang ia cari adalah…</p><div class="quiz-visual">${shotSvg(5)}</div><div class="choice-set">${["Entire","Detail","Frame","Angle","Time"].map(x=>`<button class="choice" data-edfat="${x}">${x}</button>`).join("")}</div><div id="edfat-feedback" class="info" style="display:none"></div><div class="actions"><button class="btn primary" id="save-edfat">Simpan jawaban ✓</button></div></div><p class="small-note" style="margin-top:15px">Catatan: satu foto bisa mengandung lebih dari satu pendekatan. EDFAT adalah alat bantu saat meliput, bukan kategori penilaian yang kaku.</p>`;
}
function shotSvg(i){
const palettes=[["#779da2","#e4c08f","#ae633e"],["#697c7d","#c9aa7c","#af6d38"],["#496e73","#e0bb8e","#cc6638"],["#8a9d92","#dcc6a3","#976a52"],["#485b5d","#d4ad77","#9c5132"],["#6d817c","#e2af7b","#b87948"]];
const [bg,ground,accent]=palettes[i%palettes.length];
const near=[3,4,5,9,10].includes(i),detail=[4,5,10].includes(i),crowd=[1,6,7,8].includes(i);
const scale=near?1.4:1, shift=i%3===0?45:i%3===1?-30:0;
return `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi latihan foto cerita"><rect width="600" height="400" fill="${bg}"/><rect x="0" y="265" width="600" height="135" fill="${ground}"/><rect x="25" y="39" width="210" height="185" rx="5" fill="#34555b" stroke="#d2b890" stroke-width="10"/><rect x="42" y="55" width="175" height="150" fill="#d4d6b8"/><path d="M42 185 90 123l35 24 46-55 46 59v54H42" fill="#89a6a0"/><path d="M0 38h600" stroke="#524c3e" stroke-width="17"/><path d="M470 42v90M540 42v100" stroke="#d4b37c" stroke-width="6"/><path d="M452 136q15-31 36 0v30h-36zM520 143q15-29 36 0v29h-36z" fill="${accent}"/><g transform="translate(${shift} 0) translate(${detail?-60:30} ${detail?-55:5}) scale(${scale})"><ellipse cx="315" cy="340" rx="145" ry="22" fill="#3a3a3a" opacity=".3"/><path d="M225 280h220v28H225zM242 306h15v45h-15zM418 306h14v45h-14z" fill="#725039"/><path d="M283 290q-16-96 26-127 43-20 81 20l28 107z" fill="${accent}"/><path d="M304 166q-29-34-7-71 23-31 61-11 21 31 8 61l-17 26v15h-41z" fill="#c28c69"/><path d="M285 119q-15-53 38-59 55-5 54 56-33-27-53-24-15 20-39 27" fill="#282b2c"/><path d="M313 272q39-13 69-8" stroke="#cd9b73" stroke-width="18" stroke-linecap="round"/><path d="M362 273 415 243" stroke="#cfad8e" stroke-width="14" stroke-linecap="round"/><path d="M330 288 413 275 430 303 352 314" fill="#ab7648"/></g>${crowd?`<g fill="#a95838"><circle cx="515" cy="189" r="26"/><path d="M481 286q0-67 35-65 38 0 49 65z"/></g>`:""}<path d="M0 381h600" stroke="#856750" stroke-width="8" opacity=".3"/><text x="18" y="383" fill="#fff" font-family="Arial" font-size="13" font-weight="bold">ILUSTRASI LATIHAN • ${String(i+1).padStart(2,"0")}</text></svg>`;
}
function shotSrc(i){return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shotSvg(i))}`}
function storyPage(){
const selected=state.work.story?.selected||[];
return `${titleBlock("story")}<div class="info"><b>Tujuan simulasi:</b> pilih tepat 9 dari 12 ilustrasi sebuah sanggar kerajinan, urutkan dari pembuka hingga penutup. Semua ilustrasi sintetis ini hanya untuk belajar; <b>bukan foto karya lomba</b>. Bingkai disajikan landscape 3:2.</div><div class="story-head" style="margin-top:18px"><h3>Rangkaian cerita kamu</h3><span class="counter" id="story-count">${selected.length} / 9 terpilih</span></div><div class="dropzone"><div class="story-tray" id="selected-shots">${selected.map((id,i)=>renderShot(SHOTS.find(x=>x.id===id),true,i)).join("")||`<div class="empty" style="grid-column:1/-1">Belum ada foto. Pilih foto dari bank di bawah.</div>`}</div></div><div class="actions"><button class="btn primary" id="save-story" ${selected.length===9?"":"disabled"}>Simpan susunan 9 foto ✓</button><button class="btn subtle" id="reset-story">↺ Ulangi pilihan</button></div><hr class="rule"><div class="story-head"><h3>Bank ilustrasi foto</h3><span class="pill">${SHOTS.length} pilihan</span></div><div class="story-tray">${SHOTS.filter(x=>!selected.includes(x.id)).map(x=>renderShot(x,false)).join("")}</div><div class="info" style="margin-top:17px"><b>Catatan editor:</b> susunan ini contoh, bukan aturan baku. Foto pembuka memperkenalkan situasi, foto berikutnya memperdalam manusia/proses, dan penutup memberi kesan akhir. EDFAT membantu mencari variasi visual, bukan urutan wajib.</div>`;
}
function renderShot(shot,selected,pos=0){
if(!shot)return "";
return `<article class="shot ${selected?"selected":""}"><figure><img alt="Ilustrasi simulasi: ${escapeHtml(shot.title)}" loading="lazy" src="${shotSrc(shot.i)}"></figure><div class="shot-meta">${selected?`<span class="photo-number">FOTO ${pos+1}</span>`:""}<strong>${escapeHtml(shot.title)}</strong><small>${escapeHtml(shot.type)} · ${escapeHtml(shot.desc)}</small><div class="shot-buttons">${selected?`<button data-move="${shot.id}" data-dir="-1" ${pos===0?"disabled":""} aria-label="Geser foto ${pos+1} ke kiri">←</button><button data-move="${shot.id}" data-dir="1" ${pos===8?"disabled":""} aria-label="Geser foto ${pos+1} ke kanan">→</button><button data-remove="${shot.id}" aria-label="Keluarkan foto">×</button>`:`<button data-pick="${shot.id}">+ Pilih</button>`}</div></div></article>`;
}
function captionPage(){
const saved=state.work.caption||{};
const draft=saved.captionText||"";
return `${titleBlock("caption")}<div class="info"><b>Satu caption untuk sembilan foto.</b> Masukkan data yang sudah kamu ketahui benar. Jika belum tahu, tulis “perlu verifikasi” dalam catatanmu, jangan mengarang informasi.</div><form id="caption-form" class="card" style="margin-top:16px"><h2>Catatan reporter: 5W+1H</h2><div class="field-row">${CAPTION_FIELDS.map(([key,label,placeholder])=>`<div class="field"><label for="cap-${key}">${label}</label><input id="cap-${key}" name="${key}" value="${escapeHtml(saved[key]||"")}" placeholder="${escapeHtml(placeholder)}" maxlength="500"></div>`).join("")}</div><hr class="rule"><div class="field"><label for="captionText">Caption final (satu narasi bersama)</label><textarea class="captionbox" id="captionText" name="captionText" placeholder="Tulis narasi yang memandu pembaca memahami seluruh rangkaian foto. Mulailah dari fakta terpenting…">${escapeHtml(draft)}</textarea><small><b id="wordcount">${countWords(draft)}</b> kata · target sekitar 150 kata (indikator latihan 120–180) · tidak ada teks otomatis dari AI</small><div class="progress-meter"><span id="wordbar" style="width:${Math.min(100,countWords(draft)/150*100)}%"></span></div></div><button class="btn primary" type="submit">Simpan caption ✓</button></form><div class="grid two" style="margin-top:14px"><div class="card"><h3>Caption bukan sekadar judul</h3><p class="small-note">Sampaikan siapa, apa, di mana, kapan, bagaimana, dan mengapa penting. Bedakan informasi yang kamu saksikan dan penjelasan yang kamu peroleh dari narasumber.</p></div><div class="card"><h3>Integritas karya</h3><p class="small-note">Pertahankan file asli beserta metadata. Jangan menambah, menghapus, atau memindahkan objek dan jangan menggunakan AI untuk menghasilkan karya lomba.</p></div></div>`;
}
function countWords(v){return v.trim()?v.trim().split(/\s+/).length:0}
function ethicsPage(){
const saved=state.work.etika||{};
return `${titleBlock("etika")}<div class="card"><h2>Kuis keputusan di lapangan</h2><p class="small-note">Pilih tindakan yang paling bertanggung jawab. Setelah dikirim, pembahasannya akan muncul.</p><form id="ethics-form">${ETHICS.map((e,i)=>`<div class="question"><h3>${i+1}. ${escapeHtml(e.q)}</h3>${e.a.map((choice,j)=>`<label><input type="radio" name="q${i}" value="${j}" ${saved.answers?.[i]===j?"checked":""}>${escapeHtml(choice)}</label>`).join("")}</div>`).join("")}<button class="btn primary" type="submit">Periksa & simpan jawaban ✓</button></form><div id="ethics-result" style="margin-top:14px"></div></div><div class="card" style="margin-top:16px"><h3>Checklist hunting budaya</h3><div class="small-note">□ Tentukan cerita dan tokoh yang ingin dipahami<br>□ Cari informasi latar dan izin yang diperlukan<br>□ Siapkan variasi Entire, Detail, Frame, Angle, Time<br>□ Ambil gambar asli, bukan adegan yang direkayasa<br>□ Catat nama, waktu, lokasi, dan informasi yang terverifikasi<br>□ Pilih sembilan foto landscape yang saling melengkapi<br>□ Tulis satu caption bersama sekitar 150 kata<br>□ Simpan file asli dan periksa aturan unggahan dari panitia</div></div>`;
}
async function saveAnswer(key,payload){
 state.work[key]=payload;saveWork();
 if(!state.online||!state.user?.token){toast("Tersimpan di perangkat (demo)");return}
 try{await request(`/api/answers/${encodeURIComponent(key)}`,{method:"PUT",payload});toast("Jawaban tersimpan di kelas ✓")}
 catch(e){toast(`Tersimpan lokal; sinkronisasi gagal: ${e.message}`)}
}
function bindLessons(){
 $$("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>{const key=btn.dataset.nav;if(isUnlocked(key))goModule(key)}));
 if(state.active==="kamera" && $("#aperture")){
  [["aperture","a"],["shutter","s"],["iso","i"]].forEach(([id,key])=>$("#"+id).addEventListener("input",e=>{state.camera[key]=Number(e.target.value);updateCamera()}));
  $("#reset-camera").onclick=()=>{state.camera={a:1,s:3,i:1};["aperture","shutter","iso"].forEach((id,n)=>{$("#"+id).value=[1,3,1][n]});updateCamera()};
  $("#save-camera").onclick=()=>saveAnswer("kamera",{...state.camera,at:new Date().toISOString()});
  updateCamera();
 }
 if(state.active==="komposisi"){
  $$("[data-comp]").forEach(btn=>btn.onclick=()=>{const key=btn.dataset.comp;state.composition[key]=!state.composition[key];btn.setAttribute("aria-pressed",String(state.composition[key]));updateComposition()});
  $$("[data-position]").forEach(btn=>btn.onclick=()=>{state.composition.position=btn.dataset.position;$$("[data-position]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));updateComposition()});
  $("#save-comp").onclick=()=>saveAnswer("komposisi",{...state.composition});updateComposition();
 }
 if(state.active==="edfat"){
  let answer=state.work.edfat?.answer||null;
  $$("[data-edfat]").forEach(btn=>{btn.setAttribute("aria-pressed",String(btn.dataset.edfat===answer));btn.onclick=()=>{
    answer=btn.dataset.edfat;$$("[data-edfat]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
    const feedback=$("#edfat-feedback");feedback.style.display="block";feedback.textContent=answer==="Detail"?"Tepat! Mendekat untuk memperlihatkan pahatan adalah pendekatan Detail.":"Coba lagi. Perhatikan petunjuk kecil yang dipotret dari jarak dekat."; }});
  $("#save-edfat").onclick=()=>answer?saveAnswer("edfat",{answer}):toast("Pilih jawaban lebih dahulu");
 }
 if(state.active==="story"){
  $$("[data-pick]").forEach(b=>b.onclick=()=>{const arr=state.work.story?.selected||[];if(arr.length>=9){toast("Sudah sembilan foto. Keluarkan satu lebih dulu.");return}state.work.story={selected:[...arr,Number(b.dataset.pick)]};saveWork();render()});
  $$("[data-remove]").forEach(b=>b.onclick=()=>{const arr=state.work.story?.selected||[];state.work.story={selected:arr.filter(x=>x!==Number(b.dataset.remove))};saveWork();render()});
  $$("[data-move]").forEach(b=>b.onclick=()=>{const arr=[...(state.work.story?.selected||[])],idx=arr.indexOf(Number(b.dataset.move)),target=idx+Number(b.dataset.dir);if(target<0||target>=arr.length)return;[arr[idx],arr[target]]=[arr[target],arr[idx]];state.work.story={selected:arr};saveWork();render()});
  $("#reset-story").onclick=()=>{state.work.story={selected:[]};saveWork();render()};
  $("#save-story").onclick=()=>{const selected=state.work.story?.selected||[];if(selected.length!==9)return;saveAnswer("story",{selected})};
 }
 if(state.active==="caption"){
  const form=$("#caption-form");
  form.addEventListener("input",()=>{
    const obj=Object.fromEntries(new FormData(form).entries());state.work.caption=obj;saveWork();
    const n=countWords(obj.captionText||"");$("#wordcount").textContent=n;$("#wordbar").style.width=Math.min(100,n/150*100)+"%";
  });
  form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());saveAnswer("caption",data)};
 }
 if(state.active==="etika"){
  $("#ethics-form").onsubmit=e=>{
    e.preventDefault();const d=new FormData(e.currentTarget),answers=ETHICS.map((_,i)=>d.get("q"+i)===null?null:Number(d.get("q"+i)));
    if(answers.some(x=>x===null)){toast("Jawab semua pertanyaan terlebih dahulu");return}
    const score=answers.filter((x,i)=>x===ETHICS[i].correct).length;
    $("#ethics-result").innerHTML=`<div class="info"><b>${score}/${ETHICS.length} keputusan tepat.</b><hr class="rule">${ETHICS.map((q,i)=>`<p><b>${i+1}. ${answers[i]===q.correct?"✓":"✕"}</b> ${escapeHtml(q.why)}</p>`).join("")}</div>`;
    saveAnswer("etika",{answers,score});
  }
 }
}
async function signup(e){
 e.preventDefault();const form=e.currentTarget,data=Object.fromEntries(new FormData(form).entries());
 data.name=data.name.trim();data.school=data.school.trim();data.className=data.className.trim();
 if(!data.name||!data.school||!data.className){toast("Lengkapi nama, sekolah, dan kelas");return}
 const button=form.querySelector("button");button.disabled=true;button.textContent="Menyimpan…";
 if(state.online){
  try {const response=await request("/api/participants",{method:"POST",payload:data});state.user=response.user}
  catch(err){button.disabled=false;button.textContent="Masuk Studio Foto Cerita →";toast("Pendaftaran gagal: "+err.message);return}
 }else{
  state.user={id:crypto.randomUUID(),...data,token:null};
 }
 localStorage.setItem(STORAGE_USER,JSON.stringify(state.user));
 state.active="mulai";render();toast("Selamat datang, "+state.user.name+"!");
}
function logout(){state.user=null;state.work={};localStorage.removeItem(STORAGE_USER);localStorage.removeItem(STORAGE_WORK);render()}
function renderParticipant(){
 if(!state.user){$("#root").innerHTML=landing();$("#start-signup").onclick=()=>{$("#root").innerHTML=signupPage();$("#signup-form").onsubmit=signup;window.scrollTo(0,0)};return}
 if(!isUnlocked(state.active))state.active=STAGES[Math.min(state.serverStage,6)].key;
 $("#root").innerHTML=lessonLayout();bindLessons();
}
function trainerLogin(){
 return `<div class="page"><div class="card login-card"><span class="eyebrow">Akses trainer / pendamping</span><h1>Ruang kendali kelas</h1><p class="muted">Masukkan PIN trainer atau pendamping yang telah disiapkan di Cloudflare. Jangan bagikan PIN trainer kepada peserta.</p><form id="trainer-login"><div class="field"><label for="trainer-pin">PIN akses</label><input id="trainer-pin" type="password" required minlength="4" autocomplete="off" inputmode="numeric" placeholder="PIN"></div><div id="trainer-login-feedback" role="alert" aria-live="polite" class="login-feedback" hidden></div><button type="submit" class="btn primary block">Masuk dashboard →</button></form><p class="small-note">Dalam mode demo lokal, dashboard hanya menunjukkan status perangkat ini. Untuk kendali serentak dibutuhkan Workers dan D1.</p>${!state.online?`<button class="btn subtle" id="trainer-preview">Buka pratinjau dashboard lokal</button>`:""}</div></div>`;
}
async function fetchDashboard(){
 if(!state.online||!state.trainerToken){state.dashboard={stage:state.demoStage,camera:state.demoCamera,presentation:state.presentation,count:state.user?1:0,participants:state.user?[{...state.user,done:Object.keys(state.work).length,answers:state.work}]:[],answers:state.work};return}
 state.dashboard=await request("/api/dashboard",{auth:true});
 state.serverStage=state.dashboard.stage;state.count=state.dashboard.count;
 if(state.dashboard.camera)state.demoCamera=state.dashboard.camera;
 if(state.dashboard.presentation)state.presentation=state.dashboard.presentation;
}
function trainerCameraPanel(data,isMentor){
 const c=state.demoCamera;
 return `<section class="card trainer-demo-card" aria-label="Studio kamera langsung">
   <div class="trainer-demo-heading">
     <div><span class="eyebrow">STUDIO PERAGAAN · LIVE LCD</span><h2>Kontrol Kamera dari Trainer</h2>
       <p class="small-note">Geser pengaturan di sini. Perubahan dikirim ke layar LCD saat tahap <b>01 · Laboratorium Kamera</b> aktif.</p></div>
     <span class="pill ${data.stage===1?"green":"gray"}">${data.stage===1?"● LIVE DI LCD":"BUKA TAHAP 01 UNTUK TAMPIL DI LCD"}</span>
   </div>
   <div class="trainer-demo-grid">
     <div class="trainer-scene">
       ${photoSceneHTML("trainerCameraScene")}
       <div class="trainer-demo-ev"><span>Perubahan pencahayaan</span><strong id="trainer-ev">${exposureText(c)}</strong></div>
       <p class="small-note">Ilustrasi demonstrasi — pengaturan di sini tidak mengganti eksperimen individu peserta.</p>
     </div>
     <div class="trainer-controls">
       <div class="control"><label for="trainer-aperture">Aperture / Bukaan <output id="trainer-aperture-value">f/${APERTURE[c.a]}</output></label>
          <input id="trainer-aperture" data-livecam="a" type="range" min="0" max="6" step="1" value="${c.a}" ${isMentor?"disabled":""}>
          <small>Nilai f kecil: latar lebih blur. Nilai f besar: ruang tajam lebih luas.</small></div>
       <div class="control"><label for="trainer-shutter">Shutter Speed <output id="trainer-shutter-value">${SHUTTERS[c.s].l}s</output></label>
          <input id="trainer-shutter" data-livecam="s" type="range" min="0" max="6" step="1" value="${c.s}" ${isMentor?"disabled":""}>
          <small>Rana lambat: gerak kabur. Rana cepat: gerak cenderung beku.</small></div>
       <div class="control"><label for="trainer-iso">ISO <output id="trainer-iso-value">ISO ${ISOS[c.i]}</output></label>
          <input id="trainer-iso" data-livecam="i" type="range" min="0" max="6" step="1" value="${c.i}" ${isMentor?"disabled":""}>
          <small>ISO tinggi: gambar lebih terang dengan risiko noise lebih besar.</small></div>
       <div class="actions">
         <button class="btn subtle" id="trainer-camera-reset" ${isMentor?"disabled":""}>↺ Reset simulasi</button>
         <a href="${location.pathname}#/lcd" target="_blank" rel="noopener noreferrer" class="btn">Lihat LCD ↗</a>
       </div>
       <p id="trainer-camera-status" role="status" class="small-note">${isMentor?"Mode pendamping: hanya melihat pengaturan.":!state.online?"Mode demo lokal — belum tersinkron.":"Siap mengirim pengaturan ke proyektor."}</p>
     </div>
   </div>
 </section>`;
}
function answerDetails(key,v){
 if(!v||typeof v!=="object")return `<p class="small-note">Belum ada detail.</p>`;
 if(key==="kamera"){
   const ok=["a","s","i"].every(k=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<=6);
   if(!ok)return `<p class="small-note">Data kamera tidak lengkap.</p>`;
   return `<div class="response-pills"><span>BUKAAN <b>f/${APERTURE[v.a]}</b></span><span>RANA <b>${SHUTTERS[v.s].l}s</b></span><span>ISO <b>${ISOS[v.i]}</b></span><span>EV <b>${exposureText(v)}</b></span></div>`;
 }
 if(key==="komposisi")return `<p class="small-note">Posisi subjek: <b>${escapeHtml(v.position||"–")}</b> · Garis sepertiga: <b>${v.grid?"Ya":"Tidak"}</b> · Framing: <b>${v.frame?"Ya":"Tidak"}</b></p>`;
 if(key==="edfat")return `<p class="small-note">Pilihan EDFAT: <b>${escapeHtml(v.answer||"–")}</b></p>`;
 if(key==="story"){
   const ids=Array.isArray(v.selected)?v.selected:[];
   return `<div class="response-story">${ids.map((id,i)=>`<span><b>${i+1}.</b> ${escapeHtml(SHOTS.find(s=>s.id===id)?.title||"Foto "+id)}</span>`).join("")}</div>`;
 }
 if(key==="caption"){
   const facts=CAPTION_FIELDS.filter(([k])=>v[k]).map(([k,label])=>`<div><b>${escapeHtml(label)}</b> ${escapeHtml(v[k])}</div>`).join("");
   return `<div class="small-note">${facts||"Belum ada unsur 5W+1H."}</div><div class="response-caption"><b>Caption (${countWords(v.captionText||"")} kata):</b><p>${escapeHtml(v.captionText||"Belum ditulis")}</p></div>`;
 }
 if(key==="etika")return `<p class="small-note">Jawaban benar: <b>${Number(v.score)||0} dari 4</b></p>`;
 return `<p class="small-note">Latihan tersimpan.</p>`;
}
function renderDashboard(){
 const data=state.dashboard||{stage:state.serverStage,count:state.count,participants:[]},isMentor=state.trainerRole==="mentor";
 return `<div class="page"><div class="module-top"><div><span class="eyebrow">DASHBOARD ${isMentor?"PENDAMPING":"TRAINER"}</span><h1>Kendali Studio Foto Cerita</h1><p>16 November 2026 · kelas berlangsung 180 menit · tampilan peserta dan LCD mengikuti tahap yang dibuka.</p></div><button id="trainer-out" class="btn subtle">Keluar dashboard</button></div><div class="grid"><div class="card"><div class="eyebrow">Peserta terdaftar</div><h2 style="font-size:38px">${data.count||0}</h2><p class="small-note">Tidak ada batas jumlah peserta dalam formulir.</p></div><div class="card"><div class="eyebrow">Tahap terbuka</div><h2 style="font-size:22px">${STAGES[data.stage||0]?.name||"Orientasi"}</h2><p class="small-note">Peserta dapat mengakses tahap ini dan semua tahap sebelumnya.</p></div><div class="card"><div class="eyebrow">Tampilan publik</div><a href="${location.pathname}#/lcd" target="_blank" rel="noopener noreferrer" class="btn">Buka layar LCD ↗</a><p class="small-note">Gunakan jendela/tab terpisah di proyektor.</p></div></div><div class="card" style="margin-top:16px"><h2>Alur pelajaran</h2><p class="small-note">${isMentor?"Mode pendamping: memantau kelas tanpa mengubah tahap.":"Pilih tahap untuk membuka akses siswa. Simulasi kamera juga dapat ditampilkan sendiri dari LCD."}</p><div class="choice-set">${STAGES.map((s,i)=>`<button class="choice" data-stage="${i}" ${isMentor?"disabled":""} aria-pressed="${data.stage===i}">${String(i).padStart(2,"0")} · ${s.name}</button>`).join("")}</div></div>${theoryTrainerPanel(data,isMentor)}${state.presentation.view==="simulator"?trainerCameraPanel(data,isMentor):""}<div class="card" style="margin-top:16px"><div class="story-head"><h2>Peserta & progres</h2><button class="btn small subtle" id="refresh-dashboard">↻ Segarkan</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama</th><th>Sekolah</th><th>Kelas</th><th>Modul tersimpan</th><th>Detail</th></tr></thead><tbody>${(data.participants||[]).map(p=>`<tr><td><b>${escapeHtml(p.name)}</b></td><td>${escapeHtml(p.school)}</td><td>${escapeHtml(p.className)}</td><td>${Number(p.done)||0}/6</td><td><button class="btn small" data-inspect="${escapeHtml(p.id)}">Lihat</button></td></tr>`).join("")||`<tr><td colspan="5" class="center muted">Belum ada peserta terdaftar.</td></tr>`}</tbody></table></div><div id="inspect" style="margin-top:12px"></div></div></div>`;
}
function bindDashboard(){
 $("#trainer-out").onclick=()=>{
   state.trainerToken="";
   sessionStorage.removeItem("lm26-trainer");sessionStorage.removeItem("lm26-role");
   state.dashboard=null;render();
 };
 $("#refresh-dashboard").onclick=async()=>{
   try{await fetchDashboard();render()}catch(e){toast(e.message)}
 };
 $$("[data-stage]").forEach(b=>b.onclick=async()=>{
   const stage=Number(b.dataset.stage);
   if(state.trainerRole==="mentor")return;
   if(!state.online){state.demoStage=stage;state.dashboard.stage=stage;if(stage===1){state.presentation={view:"theory",slide:0};state.dashboard.presentation=state.presentation}render();toast("Tahap demo diubah pada perangkat ini");return}
   try{
     await request("/api/state",{method:"PUT",payload:{stage},auth:true});
     if(stage===1 && state.dashboard?.stage!==1){
       await request("/api/presentation",{method:"PUT",payload:{view:"theory",slide:0},auth:true});
     }
     await syncState();await fetchDashboard();render();
     toast("Tahap kelas berhasil diperbarui");
   }catch(e){toast("Tidak dapat mengubah tahap: "+e.message)}
 });
 async function choosePresentation(next){
   if(state.trainerRole==="mentor")return;
   const target={view:next.view,slide:Math.max(0,Math.min(MAX_PRESENTATION_SLIDE,next.slide))};
   if(!state.online){
     state.presentation=target;
     if(state.dashboard)state.dashboard.presentation=target;
     render();toast("Pratinjau lokal — LCD lain tidak ikut berubah.");
     return;
   }
   const status=$("#presentation-save-status");
   if(status)status.textContent="Mengirim slide ke layar LCD…";
   try{
     await request("/api/presentation",{method:"PUT",payload:target,auth:true});
     state.presentation=target;
     if(state.dashboard)state.dashboard.presentation=target;
     render();
   }catch(error){
     if(status)status.textContent="Gagal: "+error.message;
     toast("Slide tidak tersinkron: "+error.message);
   }
 }
 $$("[data-slide-step]").forEach(button=>button.onclick=()=>{
   const pos=PRESENTATION_ORDER.indexOf(state.presentation.slide);
    const n=PRESENTATION_ORDER[pos+Number(button.dataset.slideStep)];
   if(n!==undefined)choosePresentation({view:"theory",slide:n});
 });
 $$("[data-slide]").forEach(button=>button.onclick=()=>{
   choosePresentation({view:"theory",slide:Number(button.dataset.slide)});
 });
 $$("[data-present-mode]").forEach(button=>button.onclick=()=>{
   choosePresentation({view:button.dataset.presentMode,slide:state.presentation.slide});
 });
 $$("[data-inspect]").forEach(btn=>btn.onclick=()=>{
   const p=(state.dashboard.participants||[]).find(p=>p.id===btn.dataset.inspect);
   if(!p)return;
   const answers=p.answers||{};
   $("#inspect").innerHTML=`<div class="info"><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.school)} · ${escapeHtml(p.className)}<hr class="rule">${
     Object.keys(answers).length
       ?Object.entries(answers).map(([key,v])=>`<div class="response-group"><strong>${escapeHtml(STAGES.find(s=>s.key===key)?.name||key)}</strong>${answerDetails(key,v)}</div>`).join("")
       :"Belum ada hasil tersimpan."
   }</div>`;
 });
 if($("#trainer-camera-reset")) {
 // Simulator langsung: diubah seketika di laptop; pengiriman diserialkan agar
 // pembaruan cepat dari beberapa slider tidak saling menimpa.
 const isMentor=state.trainerRole==="mentor";
 let debounce=null,writing=false,dirty=false;
 function redrawTrainerCamera(){
   const c=state.demoCamera;
   paintCameraScene($("#trainerCameraScene"),c);
   $("#trainer-ev").textContent=exposureText(c);
   $("#trainer-aperture-value").textContent=`f/${APERTURE[c.a]}`;
   $("#trainer-shutter-value").textContent=`${SHUTTERS[c.s].l}s`;
   $("#trainer-iso-value").textContent=`ISO ${ISOS[c.i]}`;
   $$("[data-livecam]").forEach(el=>{el.value=c[el.dataset.livecam]});
 }
 async function commitCamera(){
   if(isMentor)return;
   if(!state.online){$("#trainer-camera-status").textContent="Pratinjau lokal — belum tersinkron.";return}
   if(writing){dirty=true;return}
   writing=true;dirty=false;
   const snapshot={...state.demoCamera};
   $("#trainer-camera-status").textContent="Menyinkronkan pengaturan ke LCD…";
   try{
     await request("/api/demo-camera",{method:"PUT",payload:snapshot,auth:true});
     $("#trainer-camera-status").textContent="✓ Pengaturan tersimpan dan siap ditampilkan di LCD";
   }catch(error){
     $("#trainer-camera-status").textContent="✕ Gagal menyinkronkan: "+error.message;
     toast("Gagal mengirim demo kamera: "+error.message);
   }finally{
     writing=false;
     if(dirty||["a","s","i"].some(k=>state.demoCamera[k]!==snapshot[k]))commitCamera();
   }
 }
 $$("[data-livecam]").forEach(el=>el.addEventListener("input",()=>{
   state.demoCamera[el.dataset.livecam]=Number(el.value);
   redrawTrainerCamera();
   clearTimeout(debounce);
   $("#trainer-camera-status").textContent="Pengaturan berubah — menyiapkan pembaruan…";
   debounce=setTimeout(commitCamera,180);
 }));
 $("#trainer-camera-reset").onclick=()=>{
   if(isMentor)return;
   state.demoCamera={a:1,s:3,i:1};
   redrawTrainerCamera();
   clearTimeout(debounce);
   debounce=setTimeout(commitCamera,20);
 };
 redrawTrainerCamera();
 }
}
async function renderTrainer(){
  const root=$("#root");
  if(!state.trainerToken){
    root.innerHTML=trainerLogin();
    const form=$("#trainer-login");
    const feedback=$("#trainer-login-feedback");
    const showError=(message)=>{
      feedback.hidden=false;
      feedback.textContent=message;
    };
    form.onsubmit=async event=>{
      event.preventDefault();
      const button=form.querySelector("button[type=submit]");
      if(!state.online){
        showError("Server kelas belum terhubung. Periksa koneksi internet dan muat ulang halaman.");
        return;
      }
      button.disabled=true;
      button.textContent="Memeriksa PIN…";
      feedback.hidden=true;
      try{
        const result=await request("/api/login",{method:"POST",payload:{pin:$("#trainer-pin").value}});
        state.trainerToken=result.token;
        state.trainerRole=result.role;
        sessionStorage.setItem("lm26-trainer",result.token);
        sessionStorage.setItem("lm26-role",result.role);
        await renderTrainer();
      }catch(error){
        showError(error.message);
        button.disabled=false;
        button.textContent="Coba masuk kembali";
      }
    };
    if(!state.online){
      const preview=$("#trainer-preview");
      if(preview)preview.onclick=()=>{
        state.trainerToken="demo";
        state.trainerRole="trainer";
        fetchDashboard().then(render);
      };
    }
    return;
  }
  try{
    await fetchDashboard();
    root.innerHTML=renderDashboard();
    bindDashboard();
  }catch(error){
    if(error.status===401||error.status===403){
      state.trainerToken="";
      sessionStorage.removeItem("lm26-trainer");
      sessionStorage.removeItem("lm26-role");
      await renderTrainer();
      const feedback=$("#trainer-login-feedback");
      if(feedback){
        feedback.hidden=false;
        feedback.textContent="Sesi lama sudah kedaluwarsa. Masukkan PIN trainer untuk membuat sesi baru.";
      }
      return;
    }
    // PIN telah diterima: jangan hapus sesi saat dashboard yang gagal.
    root.innerHTML=`<div class="page"><div class="card login-card"><span class="eyebrow">LOGIN BERHASIL, DASHBOARD BELUM SIAP</span>
      <h1>PIN sudah diterima.</h1><p>Terjadi kesalahan saat memuat dashboard: ${escapeHtml(error.message)}.</p>
      <p class="small-note">Data peserta dan pengaturan kelas tidak dihapus. Anda bisa mengulang pemuatan dashboard.</p>
      <button id="trainer-retry-dashboard" class="btn primary block">Coba muat dashboard lagi</button>
      <button id="trainer-back-login" class="btn subtle block" style="margin-top:8px">← Kembali ke Login / Ganti PIN</button></div></div>`;
    $("#trainer-retry-dashboard").onclick=renderTrainer;
    $("#trainer-back-login").onclick=()=>{
      state.trainerToken="";
      state.trainerRole="trainer";
      state.dashboard=null;
      sessionStorage.removeItem("lm26-trainer");
      sessionStorage.removeItem("lm26-role");
      renderTrainer();
    };
  }
}
function lcdFooter(stage,count,link,qr){
 return `<div class="lcd-bottom">
  <div><strong>${String(stage).padStart(2,"0")} / 06</strong><div>${escapeHtml(STAGES[stage]?.name||"Orientasi")}</div>
  <div class="lcd-participants">${count} peserta terdaftar · 16 November 2026</div></div>
  <div class="lcd-join"><span>${escapeHtml(link)}</span><div class="lcd-qr">
   <img src="${qr}" alt="QR menuju halaman peserta" width="112" height="112"
   onerror="this.style.display='none';this.parentElement.textContent='Buka tautan kelas'"></div></div>
 </div>`;
}
function cameraDialHTML(key,index){
 const iris=key==="a";
 return `<div class="lcd-camera-control" data-camera-control="${key}" aria-hidden="true">
  <div class="lcd-camera-dial ${iris?"lcd-aperture-dial":"lcd-setting-dial"}" id="lcd-dial-${key}" style="--dial-angle:${-135+index*45}deg;--iris-size:${10+((6-index)/6)*41}%">
   ${iris?`<div class="lcd-iris-ring"><div class="lcd-iris-opening"></div></div>`:`<div class="lcd-dial-pointer"></div><div class="lcd-dial-center">${key==="s"?"S":"ISO"}</div>`}
  </div>
  <div class="lcd-camera-track"><div class="lcd-camera-track-fill" id="lcd-track-${key}" style="width:${index/6*100}%"></div><span class="lcd-camera-track-thumb" id="lcd-thumb-${key}" style="left:${index/6*100}%"></span></div>
  <div class="lcd-camera-scale"><span>${key==="a"?"f/1.8":key==="s"?"1/15":"100"}</span><span>${key==="a"?"f/16":key==="s"?"1/1000":"6400"}</span></div>
  <span class="lcd-camera-control-label">${key==="a"?"DIAFRAGMA":key==="s"?"DIAL RANA":"DIAL ISO"}</span>
 </div>`;
}
function paintCameraDials(camera){
 for(const key of ["a","s","i"]){
  const index=camera[key];
  const dial=$("#lcd-dial-"+key),fill=$("#lcd-track-"+key),thumb=$("#lcd-thumb-"+key);
  if(dial){
   dial.style.setProperty("--dial-angle",(-135+index*45)+"deg");
   if(key==="a")dial.style.setProperty("--iris-size",(10+((6-index)/6)*41)+"%");
  }
  if(fill)fill.style.width=(index/6*100)+"%";
  if(thumb)thumb.style.left=(index/6*100)+"%";
 }
}
function lcdPage(){
 const stage=state.online?state.serverStage:state.demoStage;
 const step=STAGES[stage]||STAGES[0];
 const count=state.online?state.count:(state.user?1:0);
 const link=location.origin+location.pathname+"#/peserta";
 const qr=`https://api.qrserver.com/v1/create-qr-code/?size=210x210&margin=1&data=${encodeURIComponent(link)}`;
 const footer=lcdFooter(stage,count,link,qr);
 const camera=state.demoCamera;
 const content=stage===1 && state.presentation.view==="theory"
   ?`<div class="lcd-theory-intro"><span class="kicker">BAB 1 · MATERI TEORI FOTOGRAFI</span><span class="theory-slide-indicator">SLIDE ${presentationLabel(state.presentation.slide)} · ${PRESENTATION_ORDER.indexOf(state.presentation.slide)+1}/${PRESENTATION_ORDER.length}</span></div>${theorySlideContent(state.presentation.slide,"lcd")}`
   :stage===1
   ?`<div class="lcd-camera-heading"><div class="kicker">TAHAP 01 · LABORATORIUM KAMERA</div>
      <h1>Ubah pengaturan. <em>Amati fotonya.</em></h1>
      <p>Amati bagaimana bukaan, kecepatan rana, dan ISO memengaruhi foto.</p></div>
      <div class="lcd-camera-layout">
        <div class="lcd-camera-photo">${photoSceneHTML("lcdCameraScene")}
          <div class="lcd-camera-note">Ilustrasi simulasi · bukan hasil kamera sungguhan</div></div>
        <div class="lcd-camera-readouts">
          <div class="lcd-reading"><span>APERTURE / BUKAAN</span><strong id="lcd-aperture">f/${APERTURE[camera.a]}</strong><small id="lcd-aperture-tip">Kedalaman ruang</small>${cameraDialHTML("a",camera.a)}</div>
          <div class="lcd-reading"><span>SHUTTER SPEED</span><strong id="lcd-shutter">${SHUTTERS[camera.s].l}s</strong><small id="lcd-shutter-tip">Gerak objek</small>${cameraDialHTML("s",camera.s)}</div>
          <div class="lcd-reading"><span>ISO</span><strong id="lcd-iso">${ISOS[camera.i]}</strong><small id="lcd-iso-tip">Penguatan sinyal</small>${cameraDialHTML("i",camera.i)}</div>
          <div class="lcd-reading lcd-ev-reading"><span>PERUBAHAN EXPOSURE</span><strong id="lcd-ev">${exposureText(camera)}</strong><small>Relatif terhadap f/2.8 · 1/125 · ISO 200</small></div>
        </div>
      </div>`
   :`<div><div class="kicker">LENSA MUDA 2026 · STUDIO FOTO CERITA</div>
      <h1>${escapeHtml(step.title)}</h1><p>${escapeHtml(step.blurb)}</p></div>`;
 return `<div class="page lcd-page">
   <div class="lcd-mode ${stage===1?(state.presentation.view==="theory"?"lcd-theory-mode":"lcd-camera-mode"):""} ${stage===1&&state.presentation.view==="theory"&&photoDetail(state.presentation.slide)?"lcd-photo-detail":""}">
     ${content}
     ${footer}
   </div>
   <div class="actions lcd-toolbar"><button class="btn" id="lcd-refresh">↻ Segarkan</button>
     <button class="btn primary" id="lcd-fullscreen">⛶ Layar penuh</button></div>
   <p class="small-note">Untuk demonstrasi langsung, tampilkan LCD di jendela tersendiri. QR menggunakan layanan gambar eksternal; gunakan URL tertulis jika QR tidak tampil.</p>
 </div>`;
}
function paintLcdCamera(){
 const scene=$("#lcdCameraScene");if(!scene)return;
 const c=state.demoCamera;
 paintCameraScene(scene,c);
 $("#lcd-aperture").textContent=`f/${APERTURE[c.a]}`;
 $("#lcd-shutter").textContent=`${SHUTTERS[c.s].l}s`;
 $("#lcd-iso").textContent=ISOS[c.i];
 $("#lcd-ev").textContent=exposureText(c);
 $("#lcd-aperture-tip").textContent=APERTURE[c.a]<=2.8?"Latar lebih blur":APERTURE[c.a]>=11?"Area fokus lebih luas":"Kedalaman ruang sedang";
 $("#lcd-shutter-tip").textContent=SHUTTERS[c.s].t>=1/30?"Gerak mudah kabur":SHUTTERS[c.s].t<=1/500?"Gerak dibekukan":"Perhatikan gerakan";
 $("#lcd-iso-tip").textContent=ISOS[c.i]>=1600?"Noise semakin jelas":ISOS[c.i]<=200?"Noise rendah":"Noise sedang";
 paintCameraDials(c);
}
function renderLCD(){
 $("#root").innerHTML=lcdPage();
 $("#lcd-refresh").onclick=refreshLCD;
 // Fullscreen menempel pada #root yang tidak diganti saat LCD diperbarui.
 $("#lcd-fullscreen").onclick=()=>{
   $("#root").requestFullscreen?.().catch(()=>toast("Mode layar penuh tidak tersedia di browser ini"));
 };
 paintLcdCamera();
}
let lcdPolling=false;
async function refreshLCD(){
 if(lcdPolling||pageMode()!=="lcd")return;
 lcdPolling=true;
 const prevStage=state.online?state.serverStage:state.demoStage;
 const prevCamera=JSON.stringify(state.demoCamera);
 const prevPresentation=JSON.stringify(state.presentation);
 try{
   await syncState();
   const nextStage=state.online?state.serverStage:state.demoStage;
   if(prevStage!==nextStage||prevPresentation!==JSON.stringify(state.presentation)||!$(".lcd-mode")){
     renderLCD();
   }else{
     if(prevCamera!==JSON.stringify(state.demoCamera))paintLcdCamera();
     const count=$(".lcd-participants");
     if(count)count.textContent=`${state.online?state.count:state.user?1:0} peserta terdaftar · 16 November 2026`;
   }
 }finally{lcdPolling=false}
}
async function render(){
 document.title=`Studio Foto Cerita — Lensa Muda 2026`;
 const mode=pageMode();if(mode==="trainer")await renderTrainer();else if(mode==="lcd")renderLCD();else renderParticipant();
}
window.addEventListener("hashchange",render);
window.addEventListener("visibilitychange",()=>{
  if(!document.hidden){
    if(pageMode()==="lcd")refreshLCD();
    else syncState();
  }
});
// LCD diperbarui tanpa mengganti konten halaman, sehingga mode fullscreen tetap aktif.
let lastPassivePoll=0;
setInterval(async()=>{
  if(pageMode()==="lcd"){await refreshLCD();return}
  if(document.hidden)return;
  const now=Date.now();
  if(now-lastPassivePoll>3500){
    lastPassivePoll=now;
    const prev=JSON.stringify({stage:state.serverStage,presentation:state.presentation});
    await syncState();
    if(pageMode()==="peserta"&&state.user&&state.active==="kamera"&&prev!==JSON.stringify({stage:state.serverStage,presentation:state.presentation})){
      renderParticipant();
    }
  }
},1800);
await syncState();
render();