# Sinkronisasi trainer–LCD, 14 November 2026

Dasar: main b3d4571e067d3d0222a2ea94415941a8a9c302ac (PR #23), produksi Worker 00b3c2f6. Dokumen ini mencatat perubahan dan uji sebelum rilis; status deployment harus diverifikasi terpisah pada PR.

## Masalah dan keputusan

Sebelumnya pergantian tahap dan slide merupakan dua request. LCD dapat membaca tahap baru dengan slide lama, dan request tertunda dapat mengembalikan presentasi ke pilihan sebelumnya. Pembacaan sesi berulang juga berpotensi mencampur versi tahap, presentasi dan spotlight.

- Pergantian tahap memakai satu UPDATE SQLite atomik, memilih slide awal modul dan keluar dari spotlight modul sebelumnya. Memilih tahap yang sama mempertahankan slide aktif.
- Status publik dan dashboard mengambil satu snapshot sesi. Tidak ada migrasi skema; revisi kontrol disimpan di JSON sesi.
- Navigasi trainer menunggu acknowledgement sebelum menerima klik berikutnya. Revisi meningkat melampaui jam lokal dan revisi server yang teramati. Server menolak revisi lama serta slide teori di luar modul yang dimaksud (409); frontend mengabaikan snapshot yang lebih lama daripada acknowledgement.
- Welcome, orientasi dan spotlight memakai revisi yang sama. Pembaruan simulator tetap menggunakan pembaruan JSON parsial yang sudah ada. Ini bukan penguncian eksklusif lintas trainer; gunakan satu pengendali trainer saat kelas.
- Klien lama tetap didukung tanpa revisi selama rollout. Muat ulang kedua layar setelah rilis agar perlindungan frontend baru aktif. Perintah presentasi tidak dikirim ulang otomatis setelah timeout.
- Tidak ada penghapusan peserta atau perubahan payload jawaban. Tetap gunakan polling dan elemen root fullscreen yang sama.

## Validasi

- `npm test`: 91/91 lulus; `npm run check` lulus.
- Tes handler dengan SQLite nyata: tahap 01–06 memilih indeks awal dari modul frontend asli; tahap sama mempertahankan slide; perintah terlambat ditolak; snapshot konsisten walaupun sesi berubah setelah SELECT; spotlight berakhir tanpa merusak pengaturan kamera, peserta atau jawaban; mentor tetap tidak boleh mengendalikan.
- Integrasi HTTP lokal dengan database sekali pakai: 70 pendaftaran dan 70 simpan jawaban paralel berhasil; counter, roster 48+22, pemulihan jawaban, semua tahap dan penolakan perintah lama lulus. Windows memakai bridge Node SQLite; native Wrangler/D1 perlu dibuktikan lagi oleh CI Linux.
- Dua tab browser lokal: trainer memilih modul 02, LCD membuka “Bingkai adalah pilihan informasi”; navigasi berikutnya menampilkan “Memberi ruang untuk cerita”. LCD tetap fullscreen. Saat API 503, trainer memberi indikator terputus dan LCD mempertahankan slide terakhir.
- Produksi tidak dipakai untuk mendaftarkan peserta palsu atau mengubah tahap kelas dalam pengujian.

## Prosedur rilis

Tunggu CI Linux lulus, catat versi Worker sebelumnya dan ketersediaan Time Travel D1, lalu merge PR. Verifikasi build Cloudflare, traffic aktif, hash aset, API status dan LCD publik. Catat commit dan versi aktif pada PR. Jika kode bermasalah, rollback Worker; jangan reset database.
