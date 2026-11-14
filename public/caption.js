// Modul 05 – Caption Lab. Contoh bersumber dari seri dokumentasi Sangihe 2017.
export const CAPTION_START=45;
export const CAPTION_SLIDES=[
 {tag:"01 / BERI KONTEKS",title:"Foto memperlihatkan. Caption menjelaskan.",lead:"Caption menambahkan informasi yang tidak selalu terlihat dalam foto. Caption bukan tempat menebak cerita.",points:["Deskripsikan hal yang terlihat secara akurat.","Tambahkan siapa, kapan, dan lokasi bila telah dipastikan.","Pisahkan bukti visual dari keterangan narasumber."],prompt:"Apa yang belum kita ketahui hanya dengan melihat foto latihan ini?",note:"Tanyakan informasi yang perlu diverifikasi sebelum foto diberi caption.",image:"9053"},
 {tag:"02 / ENAM PERTANYAAN",title:"Lengkapi 5W + 1H",lead:"Siapa, apa, kapan, di mana, mengapa, dan bagaimana. Tidak semua fakta harus dipadatkan dalam kalimat pertama.",points:["Mulai dari tokoh, tindakan, tempat, dan waktu.","Latar dan alasan harus punya sumber.","Jika informasi belum ada, catat sebagai perlu verifikasi."],prompt:"Dari enam unsur ini, mana yang benar-benar tampak di foto?",note:"Bedakan observasi visual dan data yang diketahui lewat reportase.",image:"9042"},
 {tag:"03 / KLAIM DAN BUKTI",title:"Jangan mengarang yang tak terlihat",lead:"Foto seseorang sedang meniup instrumen musik bambu tidak dapat menjelaskan jenis lagu, suasana hati, atau tujuan acara.",points:["Hindari menebak maksud atau emosi orang.","Jangan mengarang dialog, tanggal, atau nama.","Keterangan dari narasumber harus bisa ditelusuri."],prompt:"Apakah kita dapat menulis bahwa group musik ini sedang berlatih untuk sebuah festival?",note:"Jawab: tidak tanpa verifikasi. Jangan jadikan contoh karangan sebagai fakta dokumenter.",image:"8895"},
 {tag:"04 / NARASI RANGKAIAN",title:"Satu tulisan untuk sembilan foto",lead:"Susunan foto punya alur, sementara caption menyatukan konteks, tokoh, proses, dan makna yang telah diketahui.",points:["Pilih fakta terpenting sebagai pembuka.","Terangkan hubungan antarbagian tanpa mengulang semua foto.","Tulis ringkas, jelas, dan bisa dipahami pembaca baru."],prompt:"",note:"Minta peserta merujuk urutan sembilan foto Modul 04, bukan menulis cerita lain.",image:"9010"},
 {tag:"05 / PERIKSA ULANG",title:"Klaim perlu verifikasi",lead:"Nama, jabatan, angka penghargaan, lokasi spesifik, dan penyebab harus dicek sesuai sumbernya.",points:["Tandai informasi yang masih perlu verifikasi.","Periksa nama tokoh dan keterangan tempat/waktu.","Jangan mengubah ketidakpastian menjadi pernyataan pasti."],prompt:"Apa yang harus dilakukan ketika sumber menyebut gelar atau penghargaan tanpa rincian detil?",note:"Kenalkan kerja cek fakta dan atribusi, bukan sekadar mengoreksi tata bahasa.",image:"8980"},
 {tag:"06 / CONTOH CAPTION",key:"caption-example",title:"Dari foto menjadi caption yang terverifikasi",
 lead:"Contoh caption dari dokumentasi musik bambu di Sangihe, 9 September 2017, dilengkapi konteks terpisah dari laporan Mongabay Indonesia (2015).",
 points:["Who, What, When, Where: siapa yang terlihat, apa yang dilakukan, kapan dan di mana dipotret.",
 "Why dan How: konteks pelestarian musik dan cara membuat instrumen, dengan atribusi sumber.",
 "Jangan menebak nama pemain atau kegiatan khusus yang belum terverifikasi."],
 prompt:"Mana informasi dari foto, mana yang berasal dari liputan Mongabay, dan mana yang masih perlu diperiksa?",
 note:"Bacakan caption lengkap dan tunjukkan pemisahan observasi foto 2017 dari laporan latar 2015. Nama pemain maupun jenis acara pada 9 September 2017 belum terkonfirmasi.",image:"9010"},
 {tag:"07 / PRAKTIK CAPTION",title:"Sekarang tulis narasimu",lead:"Gunakan rangkaian sembilan foto yang sudah dipilih sebelumnya. Isi lembar fakta lalu susun satu caption sekitar 150 kata.",points:["Lihat sembilan foto pilihanmu sebelum menulis.","Isi 5W+1H; yang belum pasti boleh ditandai.","Baca ulang: adakah klaim yang belum didukung bukti?"],prompt:"Sebutkan satu fakta yang sudah diketahui dan satu hal yang perlu ditanyakan lagi.",note:"Buka Caption Lab dan beri waktu peserta bekerja mandiri. Jangan pindahkan otomatis dari tugas mereka.",image:"8824"}
];
export const CAPTION_END=CAPTION_START+CAPTION_SLIDES.length-1;
export const captionSlide=i=>CAPTION_SLIDES[i-CAPTION_START]||CAPTION_SLIDES[0];
export const captionLabel=i=>String(i-CAPTION_START+1).padStart(2,"0");
export function captionVisual(i){
 const x=captionSlide(i);
 return `<figure class="caption-slide-photo"><img src="/lensa-muda/assets/composition/sangihe-2017-${x.image}.webp" alt="Dokumentasi musik bambu Sangihe, foto materi Caption Lab" decoding="async"><figcaption>Sangihe · September 2017 · Foto: Ronny Adolof Buol</figcaption></figure>`;
}
export function captionWordCount(text){return String(text||"").trim()?String(text).trim().split(/\s+/u).length:0}
