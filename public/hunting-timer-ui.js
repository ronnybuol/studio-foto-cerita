// One classroom timer, projected on LCD and shown on learner phones.
// Snapshot comes from D1 via /api/state; only the trainer can change its phase.
export const EMPTY_HUNTING_TIMER={phase:null,status:"idle",endsAt:null,remainingMs:0};
const phaseName=phase=>phase==="upload"?"Seleksi & Unggah":"Hunting Foto Museum";
export function timerRemaining(timer,now=Date.now()){
 if(timer?.status==="running")return Math.max(0,Number(timer.endsAt||0)-now);
 if(timer?.status==="paused")return Math.max(0,Number(timer.remainingMs||0));
 return 0;
}
export function timerClock(ms){
 const seconds=Math.ceil(Math.max(0,ms)/1000);
 return String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
}
function timerBase(){
 return `<span class="hunting-timer-eyebrow">TIMER KELAS · ${phaseName("hunting")}</span><strong class="hunting-timer-time">25:00</strong><span class="hunting-timer-status">Belum dimulai</span>`;
}
export function timerParticipantHTML(){
 return `<div id="shared-hunting-participant" class="shared-hunting-timer participant-hunting-timer" role="timer" aria-label="Waktu kegiatan hunting" hidden>${timerBase()}<small>Waktu bersama · kendali trainer</small></div>`;
}
export function timerLCDHTML(){
 return `<div id="shared-hunting-lcd" class="shared-hunting-timer lcd-hunting-timer" role="timer" aria-label="Hitung mundur kegiatan" hidden>${timerBase()}</div>`;
}
export function timerTrainerHTML(disabled=false){
 return `<section class="card shared-timer-trainer" id="shared-timer-control">
 <div class="shared-timer-heading"><div><span class="eyebrow">MODUL 03 · PENGATURAN WAKTU BERSAMA</span><h2>Timer Hunting dan Unggah Foto</h2><p class="small-note">Mulai, jeda, lanjutkan, atau tambah waktu. LCD dan HP peserta akan mengikuti timer kelas.</p></div>
 <div id="shared-hunting-trainer" class="shared-hunting-timer trainer-hunting-timer" role="timer">${timerBase()}</div></div>
 <div class="shared-timer-actions">
  <button class="btn primary" data-hunting-timer="start" data-phase="hunting" ${disabled?"disabled":""}>▶ Mulai Hunting · 25 menit</button>
  <button class="btn primary" data-hunting-timer="start" data-phase="upload" ${disabled?"disabled":""}>▶ Mulai Seleksi & Unggah · 15 menit</button>
  <button class="btn subtle" data-hunting-timer="pause" ${disabled?"disabled":""}>⏸ Jeda</button>
  <button class="btn subtle" data-hunting-timer="resume" ${disabled?"disabled":""}>▶ Lanjutkan</button>
  <button class="btn subtle" data-hunting-timer="extend" data-minutes="5" ${disabled?"disabled":""}>+5 menit</button>
  <button class="btn subtle" data-hunting-timer="extend" data-minutes="10" ${disabled?"disabled":""}>+10 menit</button>
  <button class="btn subtle" data-hunting-timer="finish" ${disabled?"disabled":""}>■ Akhiri fase</button>
 </div><p id="shared-timer-feedback" class="small-note" role="status" aria-live="polite">Timer tidak membatalkan unggahan ketika waktunya habis.</p>
 </section>`;
}
export function paintSharedHuntingTimer(timer,offsetMs=0,now=Date.now()){
 const current=timer||EMPTY_HUNTING_TIMER;
 const remaining=timerRemaining(current,now+offsetMs);
 const expired=current.status==="running"&&remaining===0;
 const status=current.status==="idle"?"Belum dimulai":current.status==="finished"?"Fase selesai":current.status==="paused"?"Dijeda oleh trainer":expired?"Waktu habis — kembali berkumpul":remaining<=5*60000?"Sisa lima menit atau kurang":"Sedang berjalan";
 for(const node of document.querySelectorAll(".shared-hunting-timer")){
  node.hidden=current.status==="idle"&&node.id!=="shared-hunting-trainer";
  node.dataset.status=expired?"expired":current.status;
  node.dataset.warning=remaining<=300000&&current.status==="running"?"true":"false";
  const eyebrow=node.querySelector(".hunting-timer-eyebrow");if(eyebrow)eyebrow.textContent="TIMER KELAS · "+(current.phase?phaseName(current.phase):"Belum dimulai");
  const time=node.querySelector(".hunting-timer-time");if(time)time.textContent=timerClock(remaining);
  const label=node.querySelector(".hunting-timer-status");if(label)label.textContent=status;
 }
 const trainer=document.querySelector("#shared-timer-control");
 if(!trainer)return;
 const statusNow=current.status;
 for(const button of trainer.querySelectorAll("[data-hunting-timer]")){
  if(button.dataset.roleDisabled==="true")continue;
  const action=button.dataset.huntingTimer;
  button.disabled=trainer.dataset.busy==="true" ||
    (action==="start"&&["running","paused"].includes(statusNow)) ||
    (action==="pause"&&statusNow!=="running") ||
    (action==="resume"&&(statusNow!=="paused"||remaining<=0)) ||
    (action==="extend"&&!["running","paused"].includes(statusNow)) ||
    (action==="finish"&&!["running","paused"].includes(statusNow));
 }
}
