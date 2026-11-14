// Bound the complete response (including JSON body), not just response headers.
export async function requestJSON(url,options={}, {fetchImpl=fetch,timeoutMs=10000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const controller=new AbortController();let timer;
 const timeout=new Promise((_,reject)=>{
  timer=setTimer(()=>{
   const error=Object.assign(new Error("Koneksi melewati batas waktu. Status pengiriman belum dapat dipastikan; coba lagi setelah tersambung."),{code:"REQUEST_TIMEOUT"});
   reject(error);controller.abort();
  },timeoutMs);
 });
 const operation=(async()=>{
  const response=await fetchImpl(url,{...options,signal:controller.signal});
  let body;
  try{body=await response.json()}
  catch{
   if(response.ok)throw Object.assign(new Error("Respons layanan kelas tidak valid. Coba lagi setelah koneksi pulih."),{code:"INVALID_RESPONSE"});
   body={};
  }
  if(!response.ok)throw Object.assign(new Error(body?.error||`HTTP ${response.status}`),{status:response.status});
  if(!body||typeof body!=="object"||Array.isArray(body))throw Object.assign(new Error("Respons layanan kelas tidak valid."),{code:"INVALID_RESPONSE"});
  return body;
 })();
 try{return await Promise.race([operation,timeout])}
 finally{clearTimer(timer)}
}
export function singleFlight(task){
 let flight;
 return (...args)=>{
  if(!flight)flight=Promise.resolve().then(()=>task(...args)).finally(()=>{flight=null});
  return flight;
 };
}
export function localDemo(location){
 return ["localhost","127.0.0.1","[::1]"].includes(location.hostname)
  &&new URLSearchParams(location.search).get("demo")==="1";
}
export function validClassSnapshot(value){
 return !!value&&Number.isInteger(value.stage)&&value.stage>=0&&value.stage<=6
  &&typeof value.locked==="boolean";
}
