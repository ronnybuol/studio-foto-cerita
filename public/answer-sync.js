// Local answers and submitted-but-unacknowledged snapshots belong to one account.
// Drafts are never sent automatically: only snapshots queued by the Save button.
const MODULES = ["kamera","komposisi","edfat","story","caption","etika"];
const clone = value => JSON.parse(JSON.stringify(value));
export function createAnswerSync({storage,getUser,send,onStorageError=()=>{}}){
  const records=new Map(),flights=new Map();
  const storageKey=id=>"lm26-answers-v1-"+id;
  function record(id){
    if(!records.has(id)){
      let saved;
      try{saved=JSON.parse(storage.getItem(storageKey(id))||"null")}
      catch(error){onStorageError(error)}
      records.set(id,{work:saved?.work||{},pending:saved?.pending||{},revision:Number.isSafeInteger(saved?.revision)?saved.revision:0});
    }
    return records.get(id);
  }
  function persist(id){
    try{storage.setItem(storageKey(id),JSON.stringify(record(id)));return true}
    catch(error){onStorageError(error);return false}
  }
  function activate(legacy={}){
    const id=getUser()?.id;
    if(!id)return {};
    const data=record(id);
    // The caller may supply legacy work only for the account present at startup.
    if(!Object.keys(data.work).length&&Object.keys(legacy).length){
      data.work=clone(legacy);
      // Old versions did not record acknowledgements. Preserve these as drafts
      // for review instead of overwriting them or uploading uncertain old work.
      for(const key of MODULES)if(data.work[key])data.work[key]._draft=true;
      persist(id);
    }
    return clone(data.work);
  }
  function saveWork(work){
    const id=getUser()?.id;if(!id)return false;
    record(id).work=clone(work);
    return persist(id);
  }
  function queue(key,payload,work){
    if(!MODULES.includes(key))throw Error("Modul tidak dikenal");
    const id=getUser()?.id;if(!id)throw Error("Akun peserta diperlukan");
    const data=record(id);
    data.work=clone(work);
    // A distinct object identity is enough to protect edits made during a send.
    const observed=Object.values(data.work).map(answer=>Number.isSafeInteger(answer?._clientRevision)?answer._clientRevision:0);
    data.revision=Math.max(Date.now(),data.revision+1,...observed.map(value=>value+1));
    data.pending[key]={payload:{...clone(payload),_clientRevision:data.revision}};
    return persist(id);
  }
  function pendingKeys(){const id=getUser()?.id;return id?Object.keys(record(id).pending):[]}
  function merge(serverAnswers,localWork){
    const merged=clone(serverAnswers||{}),pending=new Set(pendingKeys());
    const id=getUser()?.id;
    if(id){const data=record(id);for(const key of MODULES){const revision=serverAnswers?.[key]?._clientRevision;if(Number.isSafeInteger(revision))data.revision=Math.max(data.revision,revision)}}
    for(const key of MODULES){
      const local=localWork[key];
      const draft=local?._draft===true||(key==="story"&&!local?.completedAt&&(local?.selected?.length||local?.title||local?.reason));
      if(local&&(pending.has(key)||draft||!merged[key]))merged[key]=clone(local);
    }
    return merged;
  }
  function flush({online,locked=false,stage=0}={}){
    const user=getUser();
    if(!user?.token||!online||locked)return Promise.resolve({synced:false,pending:pendingKeys().length});
    const owner={id:user.id,token:user.token};
    if(flights.has(owner.id))return flights.get(owner.id);
    const task=(async()=>{
      const data=record(owner.id);
      let sent=false,durable=true;
      while(getUser()?.id===owner.id&&getUser()?.token===owner.token){
        const key=MODULES.find((key,index)=>index+1<=stage&&data.pending[key]);
        if(!key)break;
        const entry=data.pending[key];
        if(!Number.isSafeInteger(entry.payload._clientRevision)){
          data.revision=Math.max(Date.now(),data.revision+1);
          entry.payload._clientRevision=data.revision;durable=persist(owner.id)&&durable;
        }
        try{
          const response=await send(key,clone(entry.payload),owner);
          if(response?.ok!==true)throw Error("Server belum mengonfirmasi penyimpanan");
        }catch(error){return {synced:false,pending:Object.keys(data.pending).length,error,durable}}
        sent=true;
        // A newer Save can replace this entry while its request is in flight.
        if(data.pending[key]===entry){delete data.pending[key];durable=persist(owner.id)&&durable}
      }
      return {synced:sent&&Object.keys(data.pending).length===0,pending:Object.keys(data.pending).length,durable};
    })();
    flights.set(owner.id,task);
    task.finally(()=>{if(flights.get(owner.id)===task)flights.delete(owner.id)});
    return task;
  }
  return {activate,saveWork,queue,pendingKeys,merge,flush};
}
