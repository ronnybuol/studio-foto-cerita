# Langkah 2 — koneksi terputus dan request menggantung

## Keputusan teknis

Perubahan ini melanjutkan perlindungan jawaban dalam PR #23. Tidak mengganti materi atau tampilan latihan yang sudah stabil.

- `connection.js` memberi batas waktu 6 detik untuk `/api/state` dan 12 detik untuk API lainnya. Batas mencakup fetch dan pembacaan JSON. Timeout membatalkan fetch dan melepas penunggu/polling, termasuk bila implementasi jaringan belum menyelesaikan promise-nya. POST pendaftaran/login dan kontrol trainer tidak diulang otomatis.
- `singleFlight` memastikan hanya satu pembacaan state dan satu siklus polling aktif. Interval, perubahan visibilitas, tombol coba kembali dan event online berbagi alur yang sama. LCD tetap memakai root fullscreen yang tidak diganti.
- Produksi offline mempertahankan akun, pekerjaan, jumlah peserta, tahap, kamera, komposisi dan presentasi terakhir. Snapshot kelas disimpan tanpa nama roster, jawaban spotlight atau token. Snapshot tidak menggantikan otorisasi backend: tahap/kunci baru hanya diketahui sesudah server tersambung lagi.
- Tanpa snapshot yang valid, peserta mendapat tampilan menunggu koneksi; modul tidak dibuka berdasarkan asumsi. Setelah koneksi pulih, status dimuat dan profil dipulihkan tanpa menimpa draf/pending. Modul yang sedang dilihat juga disimpan agar reload tidak kembali ke orientasi secara tidak sengaja.
- Demo hanya tersedia dengan opt-in `?demo=1` di localhost/127.0.0.1. Domain produksi tidak bisa menjadi demo melalui query tersebut. Kegagalan jaringan tidak membuat akun peserta lokal atau dashboard trainer dengan data simulasi. Kontrol tahap/slide produksi tidak mengklaim perubahan lokal sebagai perubahan kelas.
- Banner global dan pesan simpan pada latihan diperbarui bersama setelah retry; tidak ada dua status yang bertentangan.

## Timeout dan kiriman lama yang terlambat

Abort di browser bukan pembatalan transaksi server. Karena itu setiap snapshot baru diberi `_clientRevision` integer yang meningkat, disimpan bersama antrean. Revisi maju melewati waktu lokal, revisi lokal sebelumnya dan revisi server yang telah dibaca. Upsert SQLite hanya mengganti payload berevisi dengan revisi sama/lebih baru. Revisi lama yang tiba belakangan mendapat 409; UI mempertahankan salinan lokal dan meminta pemeriksaan sebelum Simpan kembali. Revisi sama boleh dikirim ulang dan tetap memakai satu baris jawaban.

Ini tidak menambah tabel/kolom atau menjalankan migrasi. Klien lama tanpa metadata revisi tetap diterima agar rollout tidak memutus peserta; perlindungan urutan penuh berlaku untuk kiriman berevisi dari klien baru. Konflik dua perangkat masih memerlukan pemeriksaan peserta, bukan penggabungan jawaban otomatis.

## Pengujian

- Baseline langkah sebelumnya: 70 tes lulus. Paket ini menambah tes timeout fetch/body, HTTP error, JSON rusak, single-flight, pembatasan demo, snapshot invalid, offline produksi, larangan akun demo, dashboard asli, status retry, revisi lintas reload, dan urutan kiriman dengan handler Worker asli + SQLite nyata.
- Browser lokal dengan frontend/handler Worker asli dan SQLite Node sekali pakai: request `/state` sengaja menggantung, melewati timeout, lalu halaman kembali menampilkan kelas tanpa mode demo. Saat seluruh API sengaja 503, reload mempertahankan akun, Caption Lab, draf dan tahap 06 yang masih terkunci. Hasil 74 kata disimpan saat offline; setelah API pulih, polling memulihkan koneksi dan antrean otomatis mengirim hasil.
- Skrip `load-test-local.mjs` sekarang menguji 70 pendaftaran dan 70 kiriman jawaban bersamaan, pemulihan hasil, penolakan kiriman lama, serta 70 hasil terlihat pada dashboard trainer. Username duplikat, login ulang tanpa menggandakan akun dan roster 48+22 tetap diperiksa. Target tetap hanya localhost/127.0.0.1 dan database uji kosong.
- Hasil lokal melalui bridge Node/SQLite: 70 pendaftaran, 0 gagal; 70 jawaban diterima, hasil lama ditolak. Waktu pendaftaran p50 175ms, p95 221ms, maksimum 223ms. Angka ini bukan kapasitas atau latensi Cloudflare/jaringan acara.
- Workflow beban GitHub diperluas agar perubahan backend, schema/migrasi dan alur koneksi/jawaban turut memicu simulasi native Wrangler/D1 pada Linux. Hasil CI harus diperiksa pada commit final sebelum rilis.
- Pemeriksaan sintaks tetap dijalankan pada seluruh JavaScript, selain `npm run check` bawaan.

## Rilis

Penanda aset paket: parameter `answers=20261114-v2` pada URL app.js; modul baru `connection.js`. Backend menyertakan validasi dan guard `_clientRevision`. Tidak ada deployment atau perubahan database remote selama pengembangan ini.

Sebelum merilis: pastikan CI unit dan beban lulus; verifikasi backup D1, versi Worker sebelumnya dan konfigurasi route khusus `/lensa-muda/*`. CLI Cloudflare yang diperiksa pada 14 November mengembalikan autentikasi kedaluwarsa dan dashboard browser meminta login. Penggabungan main ditahan sampai akses rilis/pemulihan dapat diverifikasi, karena belum diketahui apakah main memicu deployment otomatis.

Sesudah akses pulih: ambil/verifikasi backup tanpa mereset data, catat deployment sebelumnya, merge commit yang sudah diuji, jalankan atau amati deployment, lalu baca situs produksi dan pastikan penanda v2, API status serta counter. Jangan menguji putus-jaringan dengan akun peserta asli atau menyatakan deploy berhasil hanya karena merge berhasil.

Pekerjaan di luar langkah ini: konsistensi atomik tahap/slide trainer, penguatan autentikasi username, optimasi jumlah pembacaan D1, serta gladi lengkap pada jaringan tempat pelatihan. Request kontrol trainer yang timeout tetap harus diperiksa pada LCD/status server sebelum pengguna mengulang perubahan.
