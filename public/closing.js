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
   <div class="closing-booklet">
   <div><span class="closing-booklet-head">BUKU SAKU DIGITAL · 6 MODUL</span>
   <strong>Bawa pulang materi Lensa Muda</strong>
   <a class="closing-booklet-button" href="/lensa-muda/buku-saku.html" target="_blank" rel="noopener noreferrer">Buka buku saku &amp; unduh PDF ↗</a>
   <span class="closing-booklet-url">kelasbelajar.org/lensa-muda/buku-saku.html</span></div>
   <a href="/lensa-muda/buku-saku.html" target="_blank" rel="noopener noreferrer" title="Buka buku saku melalui QR">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAN4AAADeAQAAAAB6HIMaAAACLUlEQVR42u2YMY7UQBBFX9kj9RC1OYH3IkwvEfchHry2zA04EDYn8ZyAdtYjtf0JhoAEtAFSO9iKWqrk61f931Vl4q+xVfwj3pJvyf+Q3MzMGtZ+7VczO8/MZmaFACHlVspe2gHTTtAkaZFyMfrMeoYGXvTdKuYzdzsdsp6nP97eLKR3O8zH6D6LnR/8dp6PK4cTgNi+1VHvf64f9x8JcOJWEO3N7ARrzxg/nLk/nzGzp4O6SS1JcWsr1M7pgx8IklTQ3p7MrLnCuq8Vtj6n2cqK9wZ1/Ap+iJf7s5vALUUb7J9mjJR99tLud6cUNKWWtpAZI2VyO8Y6moYY0sUJEsUAvY6+ns5Lu1MKBMgl6WtrjfHqdyBoclNCC5QFlH0PvGjiQkhIR67nUqvHosULEEBLrXJo6+XU3k3q6fyYLEGwkA/pJhVAvo1xa9SwhjNu0ODmYn8ZkpbHqDTEDtPkRKA9ZvdVQCuN6lFbofMFEtyKyqHNbebqpZ0gJZwSuaSbQDvGOkLnd6eEJqlejlvPZWuuXqrWOukcwGwLRVev5UXZ93730uQmcAel7/F1LPhM53c/EVJ4KKRc9z1ijKYhXsDJKbXF6HvIAXz2Q+z87nZwJae31y3+o3bfE9LFTU4FR7sTgHFlaz7f3ktVWD/dDfLp0FeeOqr5YnWa/UBIBwC0NR3jby8Z/FKLg246j7NT7Lxi0ASJRK3S4h01SJpTSBCciu0O9nanfksWS/4CCTGW5pp7vyAAAAAASUVORK5CYII=" alt="QR menuju buku saku Lensa Muda 2026" width="128" height="128">
   </a>
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
  <div class="closing-booklet-control"><b>Publikasikan Buku Saku Peserta (PDF)</b>
   <p class="small-note">PDF 19 halaman dapat diunduh peserta lewat QR pada slide penutup, bahkan setelah kelas ditutup. Satu kali unggah, maksimal 5 MB.</p>
   ${isMentor?"":`<input id="booklet-pdf-upload" type="file" accept=".pdf,application/pdf">
   <p id="booklet-upload-status" class="small-note" role="status" aria-live="polite"></p>`}
   <p id="booklet-upload-ready" class="small-note">Memeriksa PDF…</p>
   <a href="/lensa-muda/buku-saku.html" target="_blank" rel="noopener noreferrer" class="btn subtle">Lihat Buku Saku Digital ↗</a>
  </div>
  <p id="closing-photo-ready" class="small-note">Memeriksa ketersediaan foto penutup…</p>
 </section>`;
}
