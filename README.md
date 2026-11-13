# Studio Foto Cerita — Lensa Muda 2026

Aplikasi laboratorium fotografi dan foto jurnalistik interaktif untuk pelajar SMA/SMK/MA, disiapkan untuk **Kelas Lensa Muda — 16 November 2026**.

## Tujuan belajar (180 menit)
- Menguji exposure triangle (aperture, shutter speed, ISO), kedalaman ruang dan gerak lewat simulator visual.
- Memahami komposisi foto, EDFAT (Entire, Detail, Frame, Angle, Time).
- Memilih serta mengurutkan **9 foto landscape (simulasi rasio 3:2)** menjadi photo story.
- Menyusun **satu caption untuk 9 foto** sekitar 150 kata dengan 5W+1H, mempraktikkan integritas foto jurnalistik.
- Tetap bisa mengikuti seluruh simulasi **tanpa memiliki kamera** saat workshop.

## Cara mencoba di komputer
Aplikasi frontend tanpa build step. Jalankan server statis dari folder `public` (misalnya `python -m http.server 8000 --directory public`), kemudian buka `http://localhost:8000`. Dalam deployment Cloudflare, akses aplikasi melalui `/lensa-muda/`.
Dalam mode ini, aplikasi menggunakan **mode demo lokal**: jawaban hanya tersimpan di browser, dan kontrol trainer tidak tersinkron antarpeserta.

## Deploy untuk kelas dengan banyak ponsel (Cloudflare Workers + D1)

1. Jalankan `npm install`, lalu buat database D1: `npx wrangler d1 create lensa-muda-db`; masukkan `database_id` yang diberikan ke `wrangler.jsonc` (ganti placeholder).
2. Buat juga bucket R2 bernama `lensa-muda-media` lewat dashboard Cloudflare (R2 Object Storage), untuk menampung media pada iterasi berikutnya.\n3. Terapkan skema: `npx wrangler d1 execute lensa-muda-db --remote --file=schema.sql`.
4. Tambahkan rahasia PIN: `npx wrangler secret put TRAINER_PIN` lalu `npx wrangler secret put MENTOR_PIN` (PIN berbeda; bagikan hanya kepada yang berhak).
5. Tambahkan kunci tanda tangan sesi: `npx wrangler secret put SESSION_SECRET` (teks acak minimal 32 karakter).\n6. Jalankan lokal terintegrasi: `npx wrangler dev` lalu buka `/lensa-muda/`; untuk produksi: `npx wrangler deploy`.
7. Periksa pendaftaran, simpan jawaban, pengaturan tahap oleh trainer, dan pembaruan LCD dari perangkat berbeda.

**Jangan menaruh PIN ke repositori**. Bersihkan data latihan jika berganti angkatan. Pendaftaran bersifat terbuka tanpa kuota, tetapi beban serentak tetap harus diuji pada jaringan tempat acara.

## Peran
- **Peserta**: daftar nama, sekolah, kelas; latihan di HP; pekerjaan tersimpan di server saat backend aktif.
- **Trainer**: login PIN, memantau dan mengubah tahap aktif, melihat jawaban peserta.
- **Pendamping fotografer**: login PIN pendamping, dapat memantau siswa dan hasil latihan (tanpa mengubah tahap).
- **LCD**: tampilan presentasi yang mengikuti tahap yang dibuka trainer.

## Catatan editorial & teknis
Semua ilustrasi adegan pada versi awal adalah **simulasi grafis**, bukan foto jurnalistik nyata dan tidak boleh diserahkan sebagai karya lomba. Uji pada ponsel dan laptop; simulator bukan pengganti pengukuran kamera sesungguhnya. Karya lomba harus buatan peserta sendiri, tanpa AI generatif/manipulasi objek. Juknis menetapkan sembilan foto, EDFAT, satu caption ±150 kata, dan etika candid. Tampilan 3:2 landscape untuk latihan; konfirmasi format unggahan final dengan panitia sebelum publikasi.

Aplikasi ini bukan sistem resmi pengumpulan karya lomba. Penyimpanan jawaban peserta dipakai hanya sebagai bahan praktik selama workshop.

## Domain publik

Setelah berhasil diuji melalui `*.workers.dev/lensa-muda/`, pasang Workers Route khusus `kelasbelajar.org/lensa-muda/*` pada zona domain `kelasbelajar.org`. **Jangan membuat route `kelasbelajar.org/*`**, sebab aplikasi lain pada domain tersebut harus tetap berfungsi. Cloudflare Workers kini mendukung `assets.base_path` (Wrangler >= 4.148.0), sehingga file di `public/` dapat langsung dilayani pada subpath tanpa dipindahkan ke folder `lensa-muda/`.

Deployment GitHub dapat dibuat melalui **Workers & Pages → Create application → GitHub → ronnybuol/studio-foto-cerita**. Pakai nama Worker `studio-foto-cerita`, build command kosong (aplikasi tanpa build), dan deploy command `npx wrangler deploy`. Sebelum deploy, database ID di `wrangler.jsonc` harus diganti dari placeholder seluruh nol ke ID D1 yang benar; dan bucket R2 `lensa-muda-media` harus telah dibuat. Setelah deploy, set secrets (`TRAINER_PIN`, `MENTOR_PIN`, `SESSION_SECRET`); jangan kirim nilai PIN atau secret melalui chat atau commit GitHub.

Pada versi ini R2 sudah diberi binding `PHOTO_BUCKET`, tetapi fitur unggah foto asli belum diaktifkan. Berkas gambar yang digunakan di editor sembilan bingkai saat ini adalah ilustrasi lokal untuk latihan.

## Peningkatan v0.2: Trainer mengendalikan demo kamera di LCD

Setelah deployment versi ini, lakukan migrasi **sekali saja** di D1 Console database `lensa-muda-db`:

```sql
ALTER TABLE sessions ADD COLUMN camera_json TEXT NOT NULL DEFAULT '{"a":1,"s":3,"i":1}';
```

Ini hanya menambah kolom dan **tidak menghapus data peserta maupun jawaban**. Jalankan **sekali saja** pada database yang sudah ada. SQL yang sama tersedia pada `migrations/0001-live-camera.sql`. Pada database baru, kolom sudah termasuk dalam `schema.sql`, jadi migrasi tidak diperlukan.

Untuk menguji:
1. Trainer login melalui `/lensa-muda/#/trainer`, buka tahap `01 · Laboratorium Kamera`.
2. Buka `/lensa-muda/#/lcd` di jendela lain (disarankan pada layar eksternal), pilih `Layar penuh`.
3. Pada dashboard trainer, gerakkan slider di panel `Kontrol Kamera dari Trainer`. Perubahan seharusnya muncul di LCD dalam sekitar 2–4 detik jika koneksi stabil.
4. Mode pendamping dapat melihat pengaturan, tetapi tidak dapat mengubahnya. Pengaturan trainer terpisah dari latihan kamera peserta.

### Fitur yang masih akan dikembangkan
- Simulator pada versi ini masih berupa ilustrasi grafis, bukan foto nyata atau simulasi optik yang presisi.
- Penyempurnaan viewport dan scroll pada layar HP peserta belum termasuk tahap v0.2.
- Penayangan LCD memakai polling D1, bukan WebSocket; latensi bergantung koneksi dan aktivitas browser.

## Peningkatan v0.3 — teori sebelum simulator (tanpa migrasi D1 tambahan)

Delapan slide teori dasar fotografi tersedia pada `public/slides.js`. Trainer mengendalikan slide melalui `#/trainer`, dan layar `#/lcd` secara otomatis mengikuti nomor slide dan mode presentasi. Seluruh catatan mengajar hanya ditampilkan di dashboard trainer; slide LCD dirancang untuk dibaca dari jauh.

**Cara uji:**
1. Buka `https://kelasbelajar.org/lensa-muda/#/trainer` dan login.
2. Klik tahap `01 · Laboratorium Kamera`. Ketika tahap ini dibuka dari tahap lain, mode dimulai dari slide teori 1.
3. Panel `Materi Dasar Fotografi` berisi navigasi slide, delapan tombol nomor, dan catatan khusus trainer.
4. Buka `https://kelasbelajar.org/lensa-muda/#/lcd` pada tab terpisah. Klik `Layar penuh`, lalu uji tombol `Slide berikutnya` dari dashboard. LCD mengikuti perubahan dalam beberapa detik tanpa keluar dari layar penuh.
5. Klik `Mulai simulator kamera` di dashboard. LCD beralih ke peragaan kamera langsung; slider aperture, shutter, dan ISO kembali berfungsi.
6. Klik `Kembali ke slide teori` untuk mengembalikan materi.
7. Peserta yang membuka modul kamera di HP akan melihat ringkasan slide selama mode teori, lalu simulator ketika trainer mengalihkan mode.

State presentasi disimpan secara atomik dalam JSON pada kolom `camera_json` yang sudah dibuat di v0.2 menggunakan `json_set` SQLite. **Tidak perlu menjalankan SQL baru.** Metadata tambahan `view` dan `slide` tidak menghapus pengaturan kamera `a`, `s`, dan `i`.

Materi visual pada versi ini berupa **ilustrasi simulasi** dan diberi label yang sesuai. Foto dokumenter nyata, foto seri dengan parameter kamera berbeda, serta penyempurnaan layout HP merupakan pekerjaan tahap berikutnya.


## v0.4 — Foto generatif untuk Laboratorium Kamera

Sepuluh file WebP ada di folder public/assets/camera/ dan akan diakses sebagai static assets Cloudflare, bukan R2. Ukuran gabungan sekitar 1,6 MB.

- base.webp: slide membaca foto dan referensi simulator.
- cahaya-depan.webp, cahaya-samping.webp, cahaya-belakang.webp: slide arah datang cahaya.
- aperture-lebar.webp dan aperture-sempit.webp: slide depth of field dan simulator.
- shutter-lambat.webp dan shutter-cepat.webp: slide gerak dan overlay simulator.
- iso-rendah.webp dan iso-tinggi.webp: contoh penguatan sinyal/noise.
- Segitiga exposure tetap menggunakan infografik SVG.

Semua ini foto generatif untuk latihan, bukan foto dokumentasi kejadian nyata. Angka f-stop, shutter dan ISO adalah label simulasi, bukan data EXIF hasil pemotretan. Simulator memberi representasi visual konseptual, bukan simulasi optika yang presisi. Jangan gunakan gambar ini sebagai foto jurnalistik atau karya lomba.

Uji pada https://kelasbelajar.org/lensa-muda/#/trainer (tahap 01). LCD dan tampilan peserta harus menampilkan gambar yang sama. Tidak ada migrasi SQL tambahan.

## Pembaruan akun peserta dan tata letak ponsel (November 2026)

- Pendaftaran baru mengumpulkan nama, sekolah, dan kelas **sekali**. Aplikasi membuat username acak format `LM-XXXXXXXXXXXX` yang harus disimpan peserta.
- Untuk kembali dari perangkat lain, pilih **Sudah punya username? Masuk**. Tidak ada password, sehingga username bersifat rahasia dan menjadi kunci untuk jawaban peserta. Masuk di perangkat lain menerbitkan token baru dan membatalkan token lama.
- Progres peserta dibaca kembali dari D1 melalui `GET /api/me` setelah masuk ulang. Token lama yang masih valid juga dipulihkan saat aplikasi dibuka.
- Dashboard trainer mencakup pencarian, salin username, koreksi nama/sekolah/kelas, dan penghapusan peserta **beserta seluruh jawabannya** dengan dialog konfirmasi. Pendamping hanya membaca dan tidak melihat username.
- Tata letak HP 320–430px, tablet dan laptop disesuaikan untuk seluruh modul, terutama bank 12 foto, caption, pilihan EDFAT, dan kuis etika. Setiap peserta mengendalikan simulator sendiri tanpa mempengaruhi LCD.

### Migrasi D1 dan perlindungan data

Kode mendeteksi kolom `participants.username` saat akses pendaftaran/login/dashboard pertama, lalu menjalankan migrasi aditif idempoten: menambah kolom, memberikan username acak kepada peserta lama, dan membuat indeks unik. **Tidak menghapus peserta atau jawaban.** Skrip manual yang ekuivalen tersedia pada `migrations/0002-participant-username.sql`; jangan menjalankannya setelah migrasi otomatis karena `ALTER TABLE` hanya boleh sekali.

Untuk produksi, sebaiknya ambil backup D1 sebelum deployment apabila tersedia. Setelah deployment, trainer membuka dashboard, memastikan username peserta lama tampil, kemudian menguji login dari browser privat. Jangan menghapus data peserta untuk memperbaiki login. Jika migrasi gagal, API mengembalikan pesan kegagalan agar operator dapat memeriksa D1 secara terkendali.


## Perubahan terbaru: akun mudah diingat, fokus materi dan penguncian kelas

**Ketentuan terbaru menggantikan keterangan sebelumnya tentang username acak saat pendaftaran.**

- Pendaftaran baru: peserta mengisi nama, sekolah, kelas, dan **username pilihannya sendiri**. Username harus satu kata terdiri dari 3–20 huruf kecil a–z tanpa spasi (contoh `jufri`). Nilai disimpan persis sesuai input, dan keunikan ditegakkan oleh indeks D1.
- Peserta lama yang memiliki username `LM-XXXXXXXXXXXX` **tetap dapat login**. Mereka bisa mengubahnya sendiri melalui menu **Akun > Ganti username** selama kelas terbuka, atau meminta trainer memperbaikinya dari tabel peserta. Tidak ada penghapusan progres.
- Halaman peserta berfokus pada materi: pemilih modul kecil, panel akun yang bisa dibuka, tanpa tautan ke layar trainer atau LCD. Jika tahap yang dibuka trainer berubah, tampilan peserta mengikuti tahap itu; peserta tetap dapat memilih tahap sebelumnya yang sudah terbuka.
- Trainer: tombol **Tambah peserta**, **Edit** identitas dan username, **Hapus** (jawaban ikut terhapus setelah konfirmasi), **Cetak / Simpan PDF** melalui dialog cetak browser, dan berbagi ringkasan daftar via WhatsApp/email. Username disertakan pada cetakan internal, **tidak disertakan pada pesan massal WA/email**.
- Tombol **Kunci aplikasi peserta** hanya untuk trainer; status `is_locked` disimpan di D1. Ketika terkunci, peserta tidak dapat mendaftar, login, membuka profil API, mengubah username, atau menyimpan jawaban. API status terbuka untuk menampilkan pesan kelas ditutup. Trainer dan pendamping tetap bisa mengakses dashboard sesuai haknya; trainer bisa membuka kembali kelas.
- `migrations/0003-class-lock.sql` adalah petunjuk migrasi aditif, tetapi Worker melakukan pengecekan dan penambahan kolom otomatis secara idempoten saat ada request. Jangan menjalankan migrasi manual setelah otomatis selesai. **Backup D1 lebih dulu** untuk deployment produksi.
- Identitas Zonautara ditampilkan melalui ikon yang diadaptasi langsung dari berkas logo yang diberikan dan kredit pengembang pada footer.

**Penting:** sistem username tanpa password tidak memberikan perlindungan setara autentikasi akun biasa selama kelas terbuka. Jangan membagikan username peserta kepada orang lain. Login salah telah dibatasi per IP. Aktifkan penguncian segera setelah kelas selesai; jangan mengandalkan penguncian sebagai pengganti keamanan saat kelas berlangsung.

### Pengujian sesudah Cloudflare deploy

1. Di HP kecil (lebar 320, 360, 390, 430 px), pastikan menu modul menjadi pemilih ringkas dan materi muncul di atas tanpa scroll horizontal.
2. Coba pendaftaran username `jufri` (atau username uji unik), username duplikat, login ulang dari browser lain, dan mengganti username dari panel akun.
3. Periksa username peserta lama di tabel trainer; ubah username salah satu akun lama lalu login tanpa kehilangan jawaban.
4. Tambah, edit, cetak daftar (Save as PDF), dan hapus akun uji sebagai trainer; pastikan pendamping tidak punya tombol edit/hapus.
5. Uji tombol kunci: peserta mendapat halaman “Kegiatan belajar telah selesai”, operasi peserta ditolak (423), dan trainer masih dapat membuka kembali.
6. Verifikasi branding header dan footer, serta bahwa pembaruan stage dan slide trainer masih sinkron ke peserta/LCD.
