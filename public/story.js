// Modul 04 – Sembilan Bingkai. Dokumentasi asli Sangihe, September 2017.
export const STORY_START=39;
export const STORY_SLIDES=[
 {tag:"01 / KERJA EDITOR",title:"Sembilan foto. Satu cerita.",lead:"Memilih foto bukan memilih sembilan gambar yang paling indah, melainkan sembilan informasi yang saling melengkapi.",points:["Temukan gagasan utama sebelum memilih.","Cari variasi orang, aktivitas, tempat, alat, dan momen.","Susun alur yang dapat dibaca tanpa banyak penjelasan."],prompt:"Dapatkah pembaca memahami kegiatan musik bambu dari sembilan foto saja?",note:"Tanyakan kepada peserta mengapa beberapa foto menarik belum tentu membantu cerita.",image:"9053"},
 {tag:"02 / FOTO PEMBUKA",title:"Buka cerita dengan konteks",lead:"Foto pembuka mengundang pembaca sekaligus memperlihatkan arah cerita; sering kali foto lebar atau momen utama bekerja lebih baik.",points:["Perlihatkan tema dan situasi.","Berikan alasan mengapa foto itu penting.","Jangan gunakan foto pembuka hanya karena paling dramatis."],prompt:"Apakah suasana kelompok atau tokoh tunggal lebih tepat untuk pembuka?",note:"Perlihatkan konteks pelatihan. Foto pembuka tak harus wide shot, tetapi harus informatif.",image:"9010"},
 {tag:"03 / VARIASI",title:"Hindari sembilan foto yang sama",lead:"Foto tokoh, proses, detail, hubungan, dan suasana memiliki fungsi berbeda dalam satu cerita.",points:["Periksa apakah ada foto yang mengulang informasi.","Selingi foto lebar dengan detail dan interaksi.","Pertimbangkan dampak jika satu foto dikeluarkan."],prompt:"Mengapa detail alat bambu perlu hadir di samping foto para pemain?",note:"Minta peserta menyebut apa yang foto detail tambahkan ke cerita.",image:"8878"},
 {tag:"04 / ALUR",title:"Urutan mengubah pengalaman membaca",lead:"Foto awal memperkenalkan, bagian tengah mengembangkan informasi, dan penutup meninggalkan pemahaman yang kuat.",points:["Mulai dari konteks yang mudah dipahami.","Kembangkan hubungan tokoh, proses, dan bukti visual.","Tutup dengan foto yang memberi penyelesaian atau refleksi."],prompt:"Apa yang berubah ketika foto detail ditempatkan sebelum foto konteks?",note:"Coba tukar dua foto di layar dan minta peserta membandingkan logikanya.",image:"8851"},
 {tag:"05 / PILIHAN REDAKSI",title:"Kekuatan foto perlu alasan",lead:"Tidak semua foto dengan komposisi kuat harus dipilih. Editor memastikan informasi akurat, tidak berlebihan, dan tidak menyesatkan.",points:["Jangan mengarang urutan waktu dari foto yang tidak mendukungnya.","Hindari foto yang mengulang atau menimbulkan salah tafsir.","Pastikan keterangan nanti sesuai dengan fakta terverifikasi."],prompt:"Apakah siluet cocok sebagai penutup? Informasi apa yang mungkin hilang?",note:"Tekankan: urutan naratif adalah pilihan editorial, bukan klaim kronologi kejadian.",image:"9087"},
 {tag:"06 / LABORATORIUM",title:"Sekarang giliranmu menjadi editor",lead:"Dari 12 pilihan visual, pilih sembilan bingkai yang paling membantu, susun urutannya, lalu tuliskan arah ceritamu.",points:["Pilih tepat sembilan foto.","Atur urutan dengan tombol naik dan turun.","Berikan judul kerja serta alasan penyusunan."],prompt:"Foto mana yang ingin kamu keluarkan, dan apa alasan editorialnya?",note:"Buka laboratorium mandiri. Minta peserta mempertahankan alasan, bukan menebak susunan 'benar'.",image:"8895"}
];
export const STORY_END=STORY_START+STORY_SLIDES.length-1;
export const storySlide=i=>STORY_SLIDES[i-STORY_START]||STORY_SLIDES[0];
export const storyLabel=i=>String(i-STORY_START+1).padStart(2,"0");
export const STORY_BANK=[
 {id:1,image:"9053",title:"Ruang latihan musik bambu",role:"Entire",desc:"Memperlihatkan lokasi, kegiatan, dan hubungan pelatih dengan instrumen",function:"Konteks"},
 {id:2,image:"9010",title:"Peserta mengikuti instruktur",role:"Entire",desc:"Memperlihatkan latihan kolektif dari belakang peserta",function:"Situasi"},
 {id:3,image:"8980",title:"Instruktur dan papan notasi",role:"Frame",desc:"Menghubungkan pengajar dengan materi yang sedang dipelajari",function:"Tokoh"},
 {id:4,image:"8851",title:"Pemain dan pembuat instrumen",role:"Angle",desc:"Menampilkan sosok pemusik dan aktivitas di belakangnya",function:"Hubungan"},
 {id:5,image:"8878",title:"Bentuk alat musik bambu",role:"Detail",desc:"Mengenalkan bentuk instrumen melalui repetisi visual",function:"Detail"},
 {id:6,image:"8824",title:"Dua pemusik dalam bingkai",role:"Frame",desc:"Memperlihatkan dua pemain melalui celah alat musik",function:"Lapisan"},
 {id:7,image:"8798",title:"Pemusik di tepi jalan",role:"Entire",desc:"Menghubungkan pemain dengan lingkungan sekitar",function:"Lingkungan"},
 {id:8,image:"8868",title:"Alat musik di ruang kerja",role:"Angle",desc:"Foreground besar dan pemain di latar memberikan sudut berbeda",function:"Perspektif"},
 {id:9,image:"8895",title:"Kelompok memainkan musik",role:"Time",desc:"Menggambarkan kegiatan bermain musik secara bersama",function:"Aksi"},
 {id:10,image:"9042",title:"Instruktur memberi arahan",role:"Time",desc:"Gestur pengajar menunjukkan momen dalam kegiatan latihan",function:"Momen"},
 {id:11,image:"9087",title:"Siluet pemain musik",role:"Frame",desc:"Suasana dengan bentuk pemain di depan proyeksi",function:"Suasana"},
 {id:12,image:"8878",title:"Alternatif detail: corong bambu",role:"Detail",desc:"Potongan dari foto nomor 5 yang sama; kandidat pembanding, bukan foto peristiwa lain",function:"Alternatif",crop:true}
];
export const storyAsset=x=>"/lensa-muda/assets/composition/sangihe-2017-"+x.image+".webp";
export function storyImage(x,alt="Foto dokumentasi musik bambu Sangihe"){
 return `<div class="story-photo ${x.crop?"story-photo-crop":""}"><img src="${storyAsset(x)}" alt="${alt}" loading="lazy" decoding="async"></div>`;
}
export function storySlideVisual(i){
 const x=storySlide(i);
 return `<figure class="story-slide-figure"><div class="story-photo"><img src="/lensa-muda/assets/composition/sangihe-2017-${x.image}.webp" alt="Foto dokumentasi Sangihe untuk materi ${x.title}" decoding="async"></div><figcaption>Sangihe, September 2017 · Foto: Ronny Adolof Buol</figcaption></figure>`;
}
