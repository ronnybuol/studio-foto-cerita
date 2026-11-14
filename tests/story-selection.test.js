import test from "node:test";
import assert from "node:assert/strict";
import {storyHuntingSelection,addStoryHuntingPhoto} from "../public/story-selection.js";

test("Legacy stock-photo exercise must not block the new nine-photo hunting selection",()=>{
 const legacy={selected:[1,2,3,4,5,6,7,8,9],title:"Latihan bambu",reason:"Contoh stok lama"};
 assert.deepEqual(storyHuntingSelection(legacy),[]);
 const first=addStoryHuntingPhoto(legacy,4,[1,2,3,4,5,6,7,8,9,10,11,12]);
 assert.deepEqual(first,{selected:[4],error:null});
 assert.equal(first.selected.length,1);
});
test("Nine saved hunting photos can be chosen and correctly ordered, with a tenth rejected",()=>{
 const available=Array.from({length:12},(_,i)=>i+1);
 let work={mode:"hunting",selected:[]};
 for(const slot of [3,1,6,2,8,4,7,9,5]){
  const result=addStoryHuntingPhoto(work,slot,available);
  assert.equal(result.error,null);
  work={...work,selected:result.selected};
 }
 assert.deepEqual(work.selected,[3,1,6,2,8,4,7,9,5]);
 assert.equal(addStoryHuntingPhoto(work,10,available).selected.length,9);
 assert.match(addStoryHuntingPhoto(work,10,available).error,/Sembilan|sembilan/);
 assert.match(addStoryHuntingPhoto(work,3,available).error,/sudah/);
 assert.match(addStoryHuntingPhoto({mode:"hunting",selected:[]},11,[1,2,3]).error,/server/);
});
test("Saved selection restores only hunting mode with valid unique slots",()=>{
 assert.deepEqual(storyHuntingSelection({mode:"hunting",selected:[1,3,3,14,8,-2,10]}),[1,3,8,10]);
 assert.deepEqual(storyHuntingSelection({selected:[1,2,3]}),[]);
});
