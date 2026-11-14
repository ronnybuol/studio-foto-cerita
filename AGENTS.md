# Panduan kerja Studio Foto Cerita

## Tujuan dan konteks

Studio Foto Cerita mendukung pelatihan Lensa Muda pada 16 November 2026 untuk sekitar 50–70 peserta. Penyelenggara: Kelas Belajar Zonautara.com bersama Kamisama Fotografia. Utamakan stabilitas kelas, pemulihan jawaban, dan perubahan kecil. Jawab pengguna dalam Bahasa Indonesia.

## Arsitektur

- Frontend JavaScript ES modules tanpa build: `public/app.js`, `styles.css`, `index.html`.
- Materi: `slides.js` (kamera), `composition.js`, `edfat.js`, `story.js`, `caption.js`, `ethics.js`. Tahap 00 orientasi, 01–06 pembelajaran.
- Mode: peserta, trainer, LCD; mentor memiliki hak baca terbatas. URL memakai `/lensa-muda/`, hash dan path tertentu dikenali frontend.
- Worker: `src/index.js`; API `/lensa-muda/api/*`; aset melalui binding `ASSETS` dan `assets.base_path`.
- D1 `DB`: `sessions`, `participants`, `answers`, `login_attempts`. Sesi kelas `lensa-muda-2026`. Jawaban di-upsert per peserta dan modul.
- `sessions.camera_json` menyimpan kamera, slide, tampilan, orientasi, roster, komposisi dan spotlight. Perubahan parsial menggunakan fungsi JSON SQLite.
- R2 `PHOTO_BUCKET` sudah terikat; unggah foto belum diaktifkan. Foto latihan dan identitas ada dalam `public/assets/`; pertahankan foto pembuka Hong Bit beserta kredit dan logo asli.
- Peserta memakai bearer token acak, hash disimpan di D1. Login ulang menggunakan username saja dan merotasi token; ini risiko keamanan yang masih terbuka, bukan autentikasi kuat.
- Trainer/mentor memakai PIN dari secrets dan token HMAC dengan masa berlaku 12 jam. Jangan menyimpan atau mencetak secrets.
- Frontend menyimpan identitas pada localStorage; token trainer pada sessionStorage. `public/answer-sync.js` menyimpan pekerjaan dan antrean hasil per akun (`lm26-answers-v1-<id>`). Hanya hasil yang ditekan Simpan masuk antrean; draf tidak otomatis dikirim. Simpan serial per akun, respons lama tidak boleh menghapus pengiriman baru. Sinkronisasi status kelas memakai polling, bukan WebSocket.
- Pemulihan memprioritaskan draf dan hasil pending lokal. Logout/401 mempertahankan salinan per akun; login akun lain tidak boleh membacanya. Data dari key lama dimigrasikan sebagai draf untuk diperiksa, tanpa mengirimnya otomatis. Lihat `docs/answer-recovery-2026-11-14.md`.
- `public/connection.js` membatasi seluruh request termasuk body JSON: status kelas 6 detik, API lain 12 detik. Polling dan pembacaan status memakai single-flight. Produksi offline mempertahankan snapshot tahap terakhir (`lm26-class-state-v1`); tidak membuat akun demo atau membuka modul baru. Demo lokal hanya lewat `?demo=1` pada localhost.
- Snapshot kiriman baru membawa `_clientRevision` yang meningkat per akun. Upsert jawaban menolak revisi lebih lama (409) agar request yang selesai setelah timeout tidak menimpa hasil baru; retry revisi yang sama tetap idempoten. Tidak ada migrasi skema. Klien lama tanpa revisi tetap kompatibel selama rollout. Lihat `docs/connection-recovery-2026-11-14.md`.

## Aturan perubahan dan data

1. Jangan menghapus, mereset, menimpa atau mengisi data peserta produksi dengan simulasi. Jangan menjalankan DELETE/DROP/TRUNCATE, pembersihan massal, atau reset sesi produksi.
2. Audit terlebih dahulu. Jangan merombak aplikasi atau mengganti fitur stabil tanpa bug dan alasan yang terdokumentasi.
3. Perubahan harus sekecil mungkin, dengan pengujian regresi yang mereproduksi masalah penting.
4. Pisahkan data uji dari produksi. Load test hanya localhost dan D1 sekali pakai. Jangan menggunakan token peserta asli dalam laporan, log, fixture, atau commit.
5. Pertahankan progres, draf, akun lama, peran, mode layar penuh dan latihan mandiri ketika memperbaiki sinkronisasi.
6. Perubahan skema harus aditif, diperiksa terhadap skema aktual dan didahului backup yang terverifikasi. `schema.sql` untuk database baru; jangan menjalankannya sebagai reset/perbaikan produksi.
7. Ada migrasi otomatis username dan kunci kelas. Jangan mengulangi ALTER TABLE manual tanpa memeriksa kolom. `camera_json` punya migrasi tersendiri.
8. Jangan membagikan roster berisi username: username saat ini berfungsi sebagai kredensial. Tampilkan hanya data yang diperlukan pada LCD.
9. Catat keputusan, bukti tes, batas pemeriksaan dan commit acuan dalam `docs/`. Jangan klaim temuan statis sudah direproduksi di produksi.

## Prosedur pengujian

1. Catat commit, branch, perubahan lokal dan versi Node/Wrangler sebelum bekerja. Gunakan checkout lengkap termasuk aset biner.
2. Jalankan `npm test` dan `npm run check` sebelum perubahan; ulangi setelah perubahan penting. `check` bawaan baru memeriksa tiga file, bukan seluruh modul.
3. Untuk integrasi lokal: install dependensi resmi, salin `.dev.vars.example` ke `.dev.vars` dengan secrets uji lokal. Jangan memakai secrets produksi.
4. Siapkan database lokal sekali pakai dengan `npx wrangler d1 execute lensa-muda-db --local --file=schema.sql`; jalankan `npx wrangler dev --local --ip 127.0.0.1 --port 8787` dan buka `/lensa-muda/`.
5. Untuk `node scripts/load-test-local.mjs`, mulai dari D1 uji kosong tahap 00, gunakan TRAINER_PIN uji yang diminta skrip (`local-trainer-12345`), port 8787. Jangan mengosongkan database yang sedang dipakai untuk memenuhi prasyarat; buat direktori persistensi uji baru.
6. Tes 70 pendaftaran belum membuktikan 70 peserta serentak mengerjakan, menyimpan jawaban dan mengikuti LCD. Tambahkan skenario tersebut pada lingkungan terisolasi bila diperlukan.
7. Uji browser trainer, LCD dan peserta terpisah: orientasi, roster 48+22, tahap 01–06, teori/simulator, perpindahan cepat, fullscreen, spotlight, jawaban tersimpan, reload, login ulang, putus-sambung jaringan, kegagalan API dan kedaluwarsa sesi.
8. Uji lebar 320/360/390/430px, keyboard terbuka, scroll, urutan foto, caption panjang, fokus formulir dan status penyimpanan yang dapat dibaca. Uji laptop/proyektor 16:9.
9. Tes mock tidak membuktikan transaksi SQLite, migrasi serentak atau performa D1. Laporkan tes unit, integrasi HTTP dan browser secara terpisah.
10. Jika lingkungan gagal karena sertifikat/dependensi, jelaskan kegagalan dan batas hasil; jangan menonaktifkan TLS atau menyebut tes yang belum dijalankan lulus.

## Deployment

- Audit dan dokumentasi saja tidak menjadi alasan deployment aplikasi.
- Bedakan empat keadaan: file lokal, commit/PR GitHub, hasil CI, dan versi Cloudflare yang aktif. Push/merge bukan bukti deploy berhasil.
- Sebelum menulis main, periksa integrasi deployment otomatis karena push dapat memicu Cloudflare. Gunakan branch audit/PR untuk dokumentasi yang belum perlu dipublikasikan ke produksi.
- Konfigurasi ada di `wrangler.jsonc`: Worker `studio-foto-cerita`, D1 `lensa-muda-db`, R2 `lensa-muda-media`; jangan mengganti resource ID produksi saat pengujian.
- Rute produksi hanya `kelasbelajar.org/lensa-muda/*`. Jangan mengambil alih `kelasbelajar.org/*` atau aplikasi lain pada domain.
- Secrets wajib: TRAINER_PIN, MENTOR_PIN, SESSION_SECRET. Jangan menaruh nilainya di GitHub atau chat.
- Sebelum deployment yang diperlukan: pastikan tes lulus, backup D1 tersedia, migrasi dipahami, commit target jelas dan versi sebelumnya dicatat untuk rollback kode. Rollback kode tidak otomatis memulihkan database.
- Setelah deployment: verifikasi situs produksi, aset/version marker, API status, jumlah peserta, trainer–LCD dan pemulihan jawaban melalui prosedur yang tidak mengubah data peserta asli. Jangan membuat akun uji produksi tanpa kebutuhan eksplisit.
- Jangan mengklaim berhasil deploy sebelum situs produksi diverifikasi. Cantumkan commit, hasil tes, status deployment dan batas verifikasi pada laporan akhir.

## Audit awal

Lihat `docs/audit-2026-11-14.md` untuk temuan, prioritas dan batas verifikasi awal. Dokumen ini bukan bukti bahwa seluruh risiko sudah diperbaiki.
