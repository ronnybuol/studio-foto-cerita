// Modul 04 selects fresh hunting photos, never the legacy music-bamboo exercise.
// Keep legacy saved answers readable, but do not count their slots toward the new 9.
export function storyHuntingSelection(work){
 if(work?.mode!=="hunting"||!Array.isArray(work.selected))return [];
 return [...new Set(work.selected.filter(slot=>Number.isInteger(slot)&&slot>=1&&slot<=12))].slice(0,9);
}
export function addStoryHuntingPhoto(work,slot,available){
 const selected=storyHuntingSelection(work);
 if(!Array.isArray(available)||!available.includes(slot))return {selected,error:"Foto ini belum tersedia di galeri server. Tekan Perbarui galeri."};
 if(selected.includes(slot))return {selected,error:"Foto sudah berada dalam rangkaian."};
 if(selected.length>=9)return {selected,error:"Sudah sembilan foto. Keluarkan satu dahulu."};
 return {selected:[...selected,slot],error:null};
}
