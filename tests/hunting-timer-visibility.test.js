import test from "node:test";
import assert from "node:assert/strict";
import {paintSharedHuntingTimer} from "../public/hunting-timer-ui.js";

test("finish hides the timer on trainer, LCD and participant; pause keeps it visible",()=>{
 const original=globalThis.document;
 const screenIds=["shared-hunting-trainer","shared-hunting-lcd","shared-hunting-participant"];
 const nodes=screenIds.map(id=>({
  id,hidden:false,dataset:{},
  querySelector:()=>({textContent:""})
 }));
 globalThis.document={
  querySelectorAll:selector=>selector===".shared-hunting-timer"?nodes:[],
  querySelector:()=>null
 };
 try{
  for(const status of ["running","paused","finished","idle"]){
   const now=1_000_000;
   paintSharedHuntingTimer({phase:"hunting",status,endsAt:now+60_000,remainingMs:60_000},0,now);
   for(const node of nodes){
    assert.equal(node.hidden,!["running","paused"].includes(status),`${node.id}: ${status}`);
   }
  }
 }finally{
  if(original===undefined)delete globalThis.document;
  else globalThis.document=original;
 }
});
