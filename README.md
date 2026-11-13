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


## Modul 02 — Komposisi Visual / Bab 2: Bahasa Visual

Modul ini mengikuti laboratorium kamera dan mendahului EDFAT. Materi diarahkan untuk karya tema *Wajah Budaya Sulawesi Utara*, dengan rangkaian sembilan foto landscape dan caption terverifikasi sekitar 150 kata sebagai tujuan jangka akhir.

**Alur:** trainer membuka tahap `02 · Komposisi Visual`; sistem otomatis mengatur presentasi `view:theory, slide:21`. Tujuh slide 21–27 berisi pemahaman informasi dalam bingkai, garis sepertiga, pusat/samping, framing, jarak/detail, sudut, dan transisi praktik. Trainer dapat berpindah slide dari dashboard; LCD dan layar peserta mengikuti sesi yang sama.

Setelah diskusi, trainer menekan **Buka latihan komposisi peserta**. Nilai presentasi menjadi `view:simulator` pada tahap 02; peserta masing-masing mencoba garis sepertiga, framing, posisi subjek, jarak, sudut pandang, kemudian menulis alasan minimal 15 karakter dan menyimpan jawaban ke D1 melalui kunci `komposisi` yang sudah digunakan sebelumnya. Perubahan keputusan satu peserta tidak memengaruhi tampilan peserta lain maupun LCD. Trainer membaca alasan di tabel progres.

**Catatan fasilitasi:** Dalam slide, pancing pengamatan, bukan estetika semata: informasi apa yang masuk, hilang, atau perlu verifikasi. Foto di presentasi berasal dari aset simulasi generatif lokal yang sudah tersedia, diberi label jelas, bukan contoh liputan peristiwa yang dapat dianggap faktual. Saat praktik lapangan, peserta harus mengambil foto orisinal dan menghormati komunitas yang dipotret.

Secara teknis hanya rentang indeks presentasi yang diperluas ke 27. Tidak ada migrasi D1, perubahan objek R2, penggantian hak akses, atau perubahan tahapan penilaian.


### Pembaruan visual Modul 02 (dokumentasi Sangihe, 2017)

Catatan ini **menggantikan** keterangan Modul 02 sebelumnya tentang ilustrasi generatif yang berulang. Terdapat **11 slide foto asli** (01, 02, 03a, 03b, 04a, 04b, 05a, 05b, 06, 07a, 07b) dari dokumentasi Ronny Adolof Buol tentang musik bambu dan Agustinus Sasundu di Sangihe, September 2017.

File berformat WebP di `public/assets/composition/sangihe-2017-XXXX.webp`, satu foto per slide, ditampilkan utuh tanpa cropping di dashboard, LCD, dan perangkat peserta. Pemetaan ada di `docs/module02-sangihe-photo-map.md`. **Seluruh sebelas file foto harus tersedia sebelum PR ini digabungkan ke `main`.** Foto dibagikan sebagai ZIP dalam percakapan pengguna karena akses konektor GitHub hanya mendukung unggahan teks, bukan biner lokal.

Laboratorium peserta kini menggunakan foto asli dari rangkaian Sangihe sebagai galeri perbandingan (dipilih sesuai kontrol terakhir). Gambar yang tampil adalah contoh foto yang memang dipotret, bukan satu foto yang subjeknya digeser secara sintetis. Garis sepertiga tetap overlay edukatif. Jawaban peserta tetap disimpan memakai key `komposisi` di D1; tidak ada migrasi D1.

Pemeriksaan akhir: pastikan 11 URL foto valid, validasi GitHub Actions, lalu merge PR. **Jangan** deploy dari branch sebelum seluruh foto terunggah.


### Koreksi Modul 02 — kontras, tombol peserta, dan demo sinkron LCD

- Pada panel teori peserta berlatar putih, warna teks penjelasan dan poin diatur gelap; warna putih pada LCD tetap dipertahankan menggunakan CSS spesifik.
- Tombol komposisi peserta kini mengganti foto dengan contoh Sangihe sesuai pilihan **posisi, jarak, sudut, framing**; tombol garis sepertiga hanya mengubah overlay kisi. Perbaikan memakai selector banyak elemen sehingga setiap tombol mendapat status `aria-pressed` benar. Simulasi tidak membuat satu foto berevolusi atau mengubah kejadian aslinya.
- Pada **Tahap 02**, trainer membuka mode **Latihan komposisi** untuk menampilkan panel demonstrasi di dashboard. Tombol yang sama dapat digunakan trainer, dan foto contoh serta garisnya mengikuti di LCD melalui polling yang telah tersedia. Peserta tetap memakai kontrol mandiri di HP: aksi peserta tidak menulis ke demo kelas.
- State demo komposisi disimpan dalam `sessions.camera_json.composition` melalui `PUT /api/demo-composition` khusus trainer. Statusnya diekspos lewat `GET /api/state` dan dashboard. Tidak perlu migrasi D1 ataupun perubahan R2, token, atau tahapan.
- Uji langkah: buka tahap 02 → klik **Buka latihan komposisi peserta** → pada trainer klik **Lebar / Sedang / Dekat**, lalu **Framing** dan **Garis sepertiga** → amati perubahan foto/overlay pada LCD sambil peserta mencoba pengaturan sendiri di HP. Tes otomatis meliputi hak akses, persistensi, isolasi kamera, tombol frontend, dan CSS.


## Modul 03 – Detektif EDFAT (Entire, Detail, Frame, Angle, Time)

Materi diperluas dari pertanyaan tunggal menjadi tujuh slide yang mengikuti pengendalian trainer: pengantar dan lima cara mengamati foto (Entire, Detail, Frame, Angle, Time), kemudian Misi Detektif. Menggunakan foto dokumentasi Sangihe, September 2017 karya Ronny Adolof Buol, dari sebelas aset Modul 02 yang sudah berada di repositori; bukan ilustrasi peristiwa rekayasa.

**Cara menjalankan:** trainer membuka **03 · Detektif EDFAT**. Presentasi otomatis diposisikan ke indeks 32 (pengantar). Tombol navigasi membuka indeks 32–38, sinkron ke LCD dan tampilan peserta. Saat siap latihan, tekan **Buka Misi Detektif peserta**. Peserta melihat lima foto individual, memilih kategori EDFAT yang paling dominan dan menulis alasan minimal 12 karakter untuk tiap foto. Simpan melalui tombol di bagian bawah; jawaban disimpan di D1 pada kunci `edfat` yang sudah tersedia dan dapat dibaca di progres trainer. Peserta lama yang memiliki jawaban EDFAT format lama tetap terbaca.

**Catatan fasilitasi:** EDFAT adalah cara mengamati dan merencanakan liputan, bukan klasifikasi mutlak atau kuis hafalan. Penilaian utamakan rujukan ke hal yang benar-benar terlihat pada foto, tidak menebak fakta yang belum diverifikasi. Satu foto mungkin memuat lebih dari satu pendekatan. Diskusikan bagaimana foto Entire dan Detail saling mengisi untuk membangun rangkaian sembilan bingkai cerita budaya Sulawesi Utara.

Tidak ada migrasi D1, unggah R2, perubahan izin, atau modifikasi aset Modul 01–02. Hanya batas indeks presentasi diperluas ke 38.

**QA setelah deployment:** tahap 03 menampilkan slide pembuka di trainer/LCD/HP; semua tujuh slide dapat dipindahkan tanpa menggeser viewport; transisi ke Misi Detektif mengubah tampilan LCD dan peserta; semua lima pertanyaan dapat dipilih, alasan wajib diisi, lalu hasil tersimpan dan terbaca di dashboard.


## Modul 04 – Sembilan Bingkai (versi alur lengkap)

Modul ini mengubah simulasi sederhana menjadi meja editor foto berorientasi tugas. Trainer membuka **04 · Sembilan Bingkai** dan dapat memandu **enam slide presentasi** (indeks 39–44): kerja editor, foto pembuka, variasi, alur, pilihan redaksi, lalu praktik. LCD dan peserta mengikuti tahap/slide dari server, seperti Modul 02 dan 03.

Pada praktik, peserta memilih **tepat 9 dari 12 kandidat** foto dokumentasi musik bambu Sangihe karya Ronny Adolof Buol (September 2017), menyusun urutannya dengan tombol ↑ ↓ yang cocok untuk layar sentuh, menulis judul kerja minimal 5 karakter dan alasan editorial minimal 30 karakter, lalu menyimpan hasil melalui kunci D1 `story` yang sudah ada. Trainer melihat urutan, judul, dan alasan masing-masing peserta di menu progres. Data susunan lama (`selected` saja) masih dapat dibaca.

Penting: kandidat 12 adalah **potongan alternatif dari foto kandidat 5**, bukan dokumentasi peristiwa berbeda, dan telah diberi label. Simulasi menyusun alur naratif, **bukan klaim kronologi** yang tidak terverifikasi. Tidak ada foto asli yang ditimpa, migrasi D1, atau perubahan bucket R2.

**Uji produksi:** tahap 04 langsung menampilkan slide pengantar; pindah antar enam slide; buka meja editor; pada HP pilih 9 foto, geser urutan dengan ↑ ↓, isi judul dan alasan, simpan; trainer membaca kembali hasil peserta. Uji layout HP 320–430 piksel dan LCD 16:9 setelah Cloudflare menayangkan commit.

### Pemicu build produksi Modul 04

Commit dokumentasi ini dimaksudkan untuk memicu ulang integrasi GitHub–Cloudflare pada branch `main` setelah konfigurasi Production dipastikan menggunakan `npx wrangler deploy`. Tidak mengubah aplikasi, aset, konfigurasi Worker, migrasi D1, ataupun R2. Bila Cloudflare tidak membuat build baru, periksa instalasi/otorisasi GitHub App Cloudflare dan riwayat build Cloudflare.
