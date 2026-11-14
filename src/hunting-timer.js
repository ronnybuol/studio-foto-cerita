// Shared classroom hunting timer. Stored in sessions.camera_json: no D1 migration.
// The server's absolute timestamps prevent drift between trainer, LCD and phones.
export const TIMER_PHASES=Object.freeze({hunting:25,upload:15});
export const TIMER_ACTIONS=Object.freeze(["start","pause","resume","extend","finish"]);
export const EMPTY_TIMER=Object.freeze({phase:null,status:"idle",endsAt:null,remainingMs:0});
export function normalizeHuntingTimer(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||!["hunting","upload"].includes(raw.phase)||!["running","paused","finished"].includes(raw.status))return {...EMPTY_TIMER};
 if(!Number.isSafeInteger(raw.remainingMs)||raw.remainingMs<0||raw.remainingMs>4*60*60*1000)return {...EMPTY_TIMER};
 if(raw.status==="running"&&(!Number.isSafeInteger(raw.endsAt)||raw.endsAt<0))return {...EMPTY_TIMER};
 return {phase:raw.phase,status:raw.status,endsAt:raw.status==="running"?raw.endsAt:null,remainingMs:raw.remainingMs};
}
export function remainingHuntingMs(timer,now=Date.now()){
 const t=normalizeHuntingTimer(timer);
 return t.status==="running"?Math.max(0,t.endsAt-now):t.status==="paused"?t.remainingMs:0;
}
export function applyHuntingTimerAction(current,data,now=Date.now()){
 if(!data||typeof data!=="object"||!TIMER_ACTIONS.includes(data.action))throw new Error("Perintah timer tidak valid");
 const t=normalizeHuntingTimer(current);
 if(data.action==="start"){
  if(!["hunting","upload"].includes(data.phase))throw new Error("Fase hunting tidak valid");
  if(t.status==="running"||t.status==="paused")throw new Error("Akhiri fase aktif sebelum memulai fase lain");
  const duration=TIMER_PHASES[data.phase]*60*1000;
  return {phase:data.phase,status:"running",endsAt:now+duration,remainingMs:duration};
 }
 if(t.status==="idle")throw new Error("Mulai timer hunting terlebih dahulu");
 if(data.action==="finish")return {phase:t.phase,status:"finished",endsAt:null,remainingMs:0};
 if(data.action==="pause"){
  if(t.status!=="running")throw new Error("Timer tidak sedang berjalan");
  return {phase:t.phase,status:"paused",endsAt:null,remainingMs:remainingHuntingMs(t,now)};
 }
 if(data.action==="resume"){
  if(t.status!=="paused")throw new Error("Timer tidak sedang dijeda");
  if(t.remainingMs===0)throw new Error("Tambah waktu sebelum melanjutkan");
  return {...t,status:"running",endsAt:now+t.remainingMs};
 }
 if(data.action==="extend"){
  if(![5,10].includes(data.minutes))throw new Error("Tambahan waktu hanya 5 atau 10 menit");
  if(t.status==="finished")throw new Error("Fase sudah diakhiri");
  const added=data.minutes*60000;
  const remaining=Math.min(4*60*60*1000,remainingHuntingMs(t,now)+added);
  return {...t,remainingMs:remaining,endsAt:t.status==="running"?now+remaining:null};
 }
 throw new Error("Perintah timer tidak dikenal");
}
