// Navigation is acknowledged before accepting another click. Do not replay
// presentation commands after a timeout: the trainer must check current state.
export function createTrainerControl({getRevision=()=>0,onBusy=()=>{},now=Date.now}={}){
 let lastIssued=0,busy=false;
 function nextRevision(){const observed=getRevision();lastIssued=Math.max(now(),lastIssued+1,(Number.isSafeInteger(observed)?observed:0)+1);return lastIssued}
 async function run(task){
  if(busy)return false;
  busy=true;onBusy(true);
  try{await task(nextRevision());return true}
  finally{busy=false;onBusy(false)}
 }
 return {run,nextRevision,get busy(){return busy}};
}
