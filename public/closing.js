// Full-screen photo closing, activated by trainer for LCD + participants.
// This is a projection overlay, not a new module or a class lock.
export function closingSlideHTML(){
 return `<section class="closing-slide" aria-label="Penutup pelatihan Lensa Muda">
 <div class="closing-slide-image" role="img" aria-label="Siluet seorang fotografer berlatar awan"></div>
 <div class="closing-slide-gradient" aria-hidden="true"></div>
 <div class="closing-slide-content">
   <span class="closing-eyebrow">LENSA MUDA · 16 NOVEMBER 2026</span>
   <h1>Terima kasih!</h1>
   <p class="closing-subtitle">Sudah menjadi bagian dari pelatihan fotografi dan foto cerita.</p>
   <p class="closing-message">Teruslah melihat dengan rasa ingin tahu, memotret dengan empati, dan bercerita dengan jujur.</p>
   <div class="closing-contact"><strong>Ronny Adolof Buol</strong>
    <a href="mailto:ronny.buol@gmail.com">ronny.buol@gmail.com</a>
    <a href="https://wa.me/6285256510522" target="_blank" rel="noopener noreferrer">WhatsApp: 085256510522</a>
    <a href="https://www.instagram.com/ronnybuol/" target="_blank" rel="noopener noreferrer">Instagram: @ronnybuol</a>
   </div>
   <div class="closing-credit">Foto dokumentasi: Ronny Adolof Buol · Kelas Belajar × Kamisama Fotografia</div>
 </div>
 </section>`;
}
export function closingTrainerPanel(isMentor,visible){
 return `<section class="card closing-trainer-panel" id="closing-trainer-panel">
  <span class="eyebrow">SLIDE PENUTUP · SELURUH KELAS</span>
  <h2>Terima kasih sudah mengikuti Lensa Muda</h2>
  <p class="small-note">Satu klik menampilkan penutup penuh serentak di LCD dan ponsel peserta. Pilihan ini tidak mengunci kelas, menghapus jawaban, atau memindahkan modul.</p>
  <div class="actions">
   <button id="trainer-show-closing" class="btn primary" ${isMentor||visible?"disabled":""}>Tampilkan Penutup di LCD &amp; Peserta</button>
   <button id="trainer-hide-closing" class="btn subtle" ${isMentor||!visible?"disabled":""}>Kembali ke Materi</button>
  </div>
  <p id="closing-trainer-status" class="small-note" role="status" aria-live="polite">${visible?"● Penutup sedang ditampilkan di seluruh kelas.":"Penutup belum diaktifkan."}</p>
  ${isMentor?"":`<details class="closing-upload-details">
   <summary>Unggah foto siluet pilihan (JPG, sekali saja)</summary>
   <p class="small-note">Gunakan foto kedua: siluet fotografer berlatar awan, dengan nama asli <b>200785_1687237294458_1328259_n.jpg</b>. Foto tetap asli, tanpa ditambahi objek.</p>
   <input id="closing-photo-input" type="file" accept=".jpg,.jpeg,image/jpeg">
   <p id="closing-upload-message" class="small-note" aria-live="polite"></p>
  </details>`}
  <p id="closing-photo-ready" class="small-note">Memeriksa ketersediaan foto penutup…</p>
 </section>`;
}
