// Delapan slide teori dasar fotografi (±15–20 menit) untuk pelajar.
// Seluruh gambar pada modul ini adalah ilustrasi simulasi, bukan foto jurnalistik.
export const THEORY_SLIDES = [
 {eyebrow:"01 / MEMBACA FOTO",title:"Apa yang membuat foto bercerita?",
  lead:"Foto yang menarik mata belum tentu menjelaskan apa yang terjadi.",
  points:["Perhatikan manusia dan tindakannya.","Cari petunjuk tempat, suasana, serta waktu.","Jangan mengira-ngira hal yang tidak terlihat."],
  prompt:"Apa yang kamu ketahui? Apa yang masih harus ditanyakan?",
  note:"Minta dua siswa menyebut fakta yang terlihat, lalu satu pertanyaan yang perlu diverifikasi.",kind:"story"},
 {eyebrow:"02 / MEMBACA CAHAYA",title:"Fotografi menulis dengan cahaya",
  lead:"Arah dan jumlah cahaya menentukan apa yang bisa kita lihat dalam gambar.",
  points:["Cahaya depan memperjelas wajah dan detail.","Cahaya samping menonjolkan bentuk dan tekstur.","Cahaya belakang dapat membuat subjek menjadi siluet."],
  prompt:"Kalau wajah tokoh terlalu gelap, apa yang bisa kita ubah?",
  note:"Ajak siswa melihat jendela kelas: mana arah cahaya, dan apa efek berpindah posisi?",kind:"light"},
 {eyebrow:"03 / SEGITIGA EXPOSURE",title:"Tiga keputusan sebelum memotret",
  lead:"Aperture dan shutter mengatur cahaya yang ditangkap. ISO mengatur penguatan sinyal hasil.",
  points:["Aperture: bukaan lensa dan kedalaman ruang.","Shutter: lamanya cahaya masuk dan jejak gerakan.","ISO: tingkat penguatan, kecerahan, dan kompromi noise."],
  prompt:"Saat satu pengaturan berubah, apa yang harus diseimbangkan?",
  note:"Tekankan: ISO tidak menambah jumlah cahaya masuk ke sensor.",kind:"triangle"},
 {eyebrow:"04 / APERTURE",title:"Bukaan mengubah kedalaman ruang",
  lead:"f-number kecil berarti bukaan lebih besar; latar lebih mudah terlihat blur.",
  points:["f/1.8: latar cenderung lebih blur.","f/11: area yang terlihat tajam lebih luas.","Hasil bergantung juga pada jarak, lensa, dan ukuran sensor."],
  prompt:"Untuk cerita pengrajin dan tempat kerja, seberapa banyak latar perlu terlihat?",
  note:"Bandingkan potret tokoh dan foto lingkungan; latar blur bukan selalu lebih baik.",kind:"aperture"},
 {eyebrow:"05 / SHUTTER SPEED",title:"Membekukan atau merekam gerakan?",
  lead:"Rana cepat membatasi jejak gerak. Rana lambat dapat memperlihatkan arah gerakan.",
  points:["1/15 detik: gerak mudah kabur.","1/1000 detik: gerak lebih mudah dibekukan.","Rana cepat menangkap lebih sedikit cahaya pada bukaan yang sama."],
  prompt:"Saat memotret penari, kapan kita ingin blur dan kapan gerakan dibekukan?",
  note:"Tunjukkan dua tujuan kreatif: keduanya sah jika informasi foto tetap jelas.",kind:"shutter"},
 {eyebrow:"06 / ISO",title:"Terang bukan tanpa konsekuensi",
  lead:"ISO lebih tinggi dapat membuat gambar lebih terang, tetapi juga dapat memperjelas noise.",
  points:["ISO rendah biasanya memberi noise lebih sedikit.","ISO tinggi membantu situasi minim cahaya.","Mengubah ISO tidak menambah cahaya yang masuk."],
  prompt:"Apa yang kamu prioritaskan ketika memotret pertunjukan di ruang gelap?",
  note:"Noise juga dipengaruhi sensor, cahaya, dan pemrosesan kamera.",kind:"iso"},
 {eyebrow:"07 / KESEIMBANGAN",title:"Exposure mirip, karakter berbeda",
  lead:"Kombinasi berbeda dapat memberi kecerahan serupa, tetapi gerak dan noise tetap berubah.",
  points:["f/2.8 · 1/125 · ISO 200","f/2.8 · 1/500 · ISO 800","Rana dua stop lebih cepat diimbangi ISO dua stop lebih tinggi."],
  prompt:"Jika rana dipercepat, apa yang perlu diubah agar foto tidak gelap?",
  note:"Ajak siswa menghitung 2 stop: 1/125 → 1/250 → 1/500 dan ISO 200 → 400 → 800.",kind:"balance"},
 {eyebrow:"08 / SIAP PRAKTIK",title:"Sekarang giliran kamu bereksperimen",
  lead:"Tidak harus membawa kamera. Kita bisa menguji keputusan fotografi lewat simulasi.",
  points:["Coba membekukan gerakan pengrajin.","Coba membuat latar lebih tajam.","Coba menyeimbangkan exposure saat ISO berubah."],
  prompt:"Pengaturan mana yang pertama ingin kamu coba?",
  note:"Klik 'Mulai Simulator' di dashboard; minta siswa menebak hasil sebelum slider digeser.",kind:"challenge"}
];

export function theoryVisual(index,{sceneHTML,shotSrc}){
  const scene=(style,label,id)=>`<figure class="theory-sample ${style}">${sceneHTML(id)}<figcaption>${label}</figcaption></figure>`;
  switch(index){
    case 0:return `<div class="theory-story-visual">
      <img src="${shotSrc(5)}" alt="Ilustrasi pengrajin bekerja" loading="eager">
      <div class="theory-observe"><div><span>YANG TERLIHAT</span><strong>Seorang pengrajin menggunakan alat</strong></div>
      <div><span>YANG PERLU DIPASTIKAN</span><strong>Siapa namanya? Di mana? Membuat apa? Mengapa penting?</strong></div></div>
      <small>Ilustrasi latihan · bukan foto peristiwa nyata</small></div>`;
    case 1:return `<div class="theory-light-grid">
      ${scene("light-front","CAHAYA DEPAN","theoryLightFront")}
      ${scene("light-side","CAHAYA SAMPING","theoryLightSide")}
      ${scene("light-back","CAHAYA BELAKANG","theoryLightBack")}
      <p>Satu subjek, arah cahaya berbeda (simulasi).</p></div>`;
    case 2:return `<div class="theory-triangle">
      <svg viewBox="0 0 460 360" role="img" aria-label="Segitiga exposure aperture, shutter dan ISO">
        <path d="M230 50 75 303H385Z" fill="#ee73321c" stroke="#ee894b" stroke-width="7" stroke-linejoin="round"/>
        <circle cx="230" cy="50" r="46" fill="#272e38" stroke="#ee894b" stroke-width="5"/>
        <circle cx="75" cy="303" r="43" fill="#272e38" stroke="#ee894b" stroke-width="5"/>
        <circle cx="385" cy="303" r="43" fill="#272e38" stroke="#ee894b" stroke-width="5"/>
        <g fill="#fff" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle">
          <text x="230" y="48" font-size="19">f/2.8</text><text x="230" y="65" font-size="11">BUKAAN</text>
          <text x="75" y="303" font-size="15">1/125</text><text x="75" y="321" font-size="11">RANA</text>
          <text x="385" y="303" font-size="20">200</text><text x="385" y="321" font-size="11">ISO</text>
          <text x="230" y="201" font-size="29">EXPOSURE</text>
          <text x="230" y="224" fill="#cad1db" font-size="13">CAHAYA · GERAK · FOKUS</text>
        </g></svg><p>Tiga pengaturan saling terkait, tetapi memiliki dampak berbeda.</p></div>`;
    case 3:return `<div class="theory-two-scenes">
      ${scene("theory-depth-shallow","f/1.8 · LATAR LEBIH BLUR","theoryApertureWide")}
      ${scene("theory-depth-deep","f/11 · AREA TAJAM LEBIH LUAS","theoryApertureNarrow")}</div>`;
    case 4:return `<div class="theory-two-scenes">
      ${scene("theory-motion-slow","1/15 · JEJAK GERAK","theoryShutterSlow")}
      ${scene("theory-motion-fast","1/1000 · GERAK LEBIH BEKU","theoryShutterFast")}</div>`;
    case 5:return `<div class="theory-two-scenes">
      ${scene("theory-iso-low","ISO 100 · NOISE RENDAH","theoryIsoLow")}
      ${scene("theory-iso-high","ISO 3200 · NOISE SIMULASI","theoryIsoHigh")}</div>`;
    case 6:return `<div class="theory-balance">
      <div class="theory-balance-card"><span>KOMBINASI A</span>${sceneHTML("theoryBalanceA")}
        <strong>f/2.8 · 1/125 · ISO 200</strong><small>Rana sedang · ISO rendah</small></div>
      <div class="theory-balance-vs">↔</div>
      <div class="theory-balance-card"><span>KOMBINASI B</span>${sceneHTML("theoryBalanceB")}
        <strong>f/2.8 · 1/500 · ISO 800</strong><small>Rana lebih cepat · ISO lebih tinggi</small></div>
      <p>Kecerahan serupa, tetapi karakter gerak dan noise berbeda.</p></div>`;
    default:return `<div class="theory-challenge">
      <div><span>01</span><strong>Pengrajin bergerak cepat</strong><small>Bekukan gerakannya</small></div>
      <div><span>02</span><strong>Ruang kerja penuh cerita</strong><small>Perlihatkan latarnya</small></div>
      <div><span>03</span><strong>Ruangan agak gelap</strong><small>Seimbangkan kecerahan</small></div>
      <p>Coba jawab dengan slider kamera sesudah teori.</p></div>`;
  }
}