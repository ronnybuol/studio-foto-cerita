// Bab 2: Bahasa Visual. Semua foto contoh bersifat simulasi generatif.
export const COMPOSITION_START=21;
export const COMPOSITION_SLIDES=[
 {eyebrow:"01 / FAKTA DALAM BINGKAI",title:"Bingkai adalah pilihan informasi",lead:"Apa yang kita masukkan—atau keluarkan—dari foto dapat mengubah pemahaman pembaca.",points:["Tempat dan manusia memberikan konteks.","Detail membantu menjelaskan kegiatan.","Foto indah tidak boleh mengorbankan fakta."],prompt:"Apa yang hilang kalau tempat kerja pengrajin tidak terlihat?",note:"Minta dua peserta menyebut petunjuk yang tampak. Bedakan pengamatan dengan asumsi.",kind:"wide"},
 {eyebrow:"02 / GARIS SEPERTIGA",title:"Memberi ruang untuk cerita",lead:"Garis bantu sepertiga dapat membantu menempatkan tokoh dan aktivitas, tetapi bukan aturan wajib.",points:["Perhatikan lokasi wajah atau tangan tokoh.","Berikan ruang untuk alat dan kegiatan.","Jangan memotong informasi penting demi garis bantu."],prompt:"Lebih jelas tokoh di tengah atau di samping? Mengapa?",note:"Perlihatkan perbandingan dan tekankan bahwa pilihan ditentukan kebutuhan informasi.",kind:"thirds"},
 {eyebrow:"03 / PUSAT ATAU SAMPING",title:"Di mana perhatian pembaca jatuh?",lead:"Posisi tengah terasa langsung; posisi samping bisa memberi konteks ruang dan tindakan.",points:["Komposisi tengah cocok untuk hubungan yang simetris.","Komposisi samping memberi ruang untuk lingkungan.","Perhatikan arah pandang dan gerak subjek."],prompt:"Untuk memperlihatkan pengrajin beserta karyanya, pilih penempatan yang mana?",note:"Minta peserta menyampaikan alasan jurnalistik, bukan sekadar suka/tidak suka.",kind:"center"},
 {eyebrow:"04 / FRAMING",title:"Bingkai alami tidak boleh menutupi fakta",lead:"Pintu, kain, jendela, atau objek sekitar bisa membantu memandu mata menuju tokoh.",points:["Bingkai memberi lapisan kedalaman.","Pastikan tindakan utama tetap terbaca.","Jangan memindahkan benda atau mengatur ulang kejadian demi foto."],prompt:"Apakah bingkai alami memperjelas tokoh atau malah mengganggu?",note:"Tunjukkan bingkai sebagai pilihan, bukan efek dekoratif.",kind:"frame"},
 {eyebrow:"05 / JARAK DAN DETAIL",title:"Foto lebar atau mendekat?",lead:"Foto lebar menjelaskan tempat, foto sedang memperlihatkan hubungan, foto dekat menunjukkan petunjuk penting.",points:["Lebar: di mana peristiwa berlangsung?","Sedang: siapa melakukan apa?","Dekat: petunjuk apa yang terlewat?"],prompt:"Apa yang harus tetap terlihat agar foto tangan pengrajin tidak kehilangan konteks?",note:"Ajak kelas menyebut satu informasi yang diperoleh dan satu yang hilang pada tiap jarak.",kind:"detail"},
 {eyebrow:"06 / SUDUT PANDANG",title:"Sudut kamera ikut menentukan makna",lead:"Tinggi mata, sudut rendah, dan sudut tinggi memperlihatkan informasi dan kesan yang berbeda.",points:["Setinggi mata membuat hubungan terasa setara.","Sudut rendah bisa menonjolkan gestur atau sosok.","Sudut tinggi bisa menjelaskan pola dan aktivitas."],prompt:"Posisi mana yang paling baik menunjukkan proses kerja tanpa merendahkan subjek?",note:"Tekankan keselamatan, izin, dan sikap hormat saat mencari sudut pengambilan.",kind:"angle"},
 {eyebrow:"07 / PRAKTIK",title:"Komposisi harus bisa dijelaskan",lead:"Coba tiga keputusan: tempatkan tokoh, pilih jarak, dan nyalakan atau matikan bingkai.",points:["Tentukan apa yang ingin diketahui pembaca.","Ubah satu keputusan dan amati hasilnya.","Tuliskan alasan pilihanmu, lalu simpan latihan."],prompt:"Komposisi mana yang paling jujur menjelaskan aktivitas budaya?",note:"Buka laboratorium komposisi. Minta peserta menjelaskan alasan, bukan mencari jawaban tunggal.",kind:"practice"}
];
export const COMPOSITION_END=COMPOSITION_START+COMPOSITION_SLIDES.length-1;
export const compositionSlide=(i)=>COMPOSITION_SLIDES[i-COMPOSITION_START]||COMPOSITION_SLIDES[0];
export const compositionLabel=(i)=>String(i-COMPOSITION_START+1).padStart(2,"0");
export function compositionVisual(index){
 const slide=compositionSlide(index);
 const src="/lensa-muda/assets/camera/base.webp";
 const type=slide.kind;
 const mask=type==="frame"?"comp-frame-on":"";
 const grid=type==="thirds"?"comp-grid-on":"";
 const zoom=type==="detail"?"comp-zoom-on":"";
 return `<div class="comp-visual ${mask} ${grid} ${zoom}" data-visual-kind="${type}">
 <figure><div class="comp-photo-stage"><img src="${src}" alt="Ilustrasi generatif pengrajin kayu di ruang kerja, untuk latihan komposisi" decoding="async"><div class="comp-rule-grid"></div><div class="comp-natural-frame"></div></div>
 <figcaption>Ilustrasi generatif untuk latihan visual · bukan dokumentasi peristiwa nyata</figcaption></figure>
 ${type==="wide"||type==="detail"?`<div class="comp-visual-labels"><span>${type==="wide"?"LEBAR: TOKOH + LINGKUNGAN":"DEKAT: DETAIL PROSES"}</span><span>Perhatikan informasi yang terlihat</span></div>`:""}
 ${type==="thirds"?'<div class="comp-visual-labels"><span>Garis sepertiga</span><span>Bukan aturan mutlak</span></div>':""}
 ${type==="center"?'<div class="comp-visual-labels"><span>TOKOH</span><span>ALAT · RUANG · CERITA</span></div>':""}
 ${type==="frame"?'<div class="comp-visual-labels"><span>Bingkai alami</span><span>Jangan menghalangi subjek</span></div>':""}
 ${type==="angle"?'<div class="comp-visual-labels"><span>Setinggi mata</span><span>Sudut ditentukan informasi</span></div>':""}
 ${type==="practice"?'<div class="comp-visual-labels"><span>Amati, ubah, jelaskan</span><span>Latihan mandiri setelah teori</span></div>':""}
 </div>`;
}
