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
