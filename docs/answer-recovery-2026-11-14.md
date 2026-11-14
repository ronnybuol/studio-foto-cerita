# Langkah 1 — perlindungan jawaban peserta

## Masalah dan perubahan

Pada versi awal, hasil final yang PUT-nya gagal tidak lagi bertanda draf. Saat reload, jawaban server yang lebih lama bisa menggantikannya. Perbaikan ini hanya menyentuh frontend; tidak mengubah API, D1, R2, identitas peserta, atau isi database produksi.

`public/answer-sync.js` menyimpan `{work,pending}` per ID akun di localStorage dengan prefix `lm26-answers-v1-`. Saat peserta menekan Simpan, snapshot hasil masuk antrean sebelum jaringan dipanggil. Snapshot tetap pending sampai respons HTTP sukses memuat `ok:true`. Draf yang masih diketik disimpan terpisah dari snapshot kiriman dan tidak dikirim otomatis.

Pengiriman diserialkan per akun, memakai token akun yang ditangkap sebelum request. Respons untuk snapshot lama tidak boleh menghapus snapshot baru. Edit saat request berjalan dipertahankan sebagai draf. Antrean dicoba lagi setelah pemulihan profil dan saat polling status kelas berhasil, dengan interval retry minimal 15 detik. Kelas terkunci dan tahap yang belum terbuka tidak dikirimi hasil. Tidak ada perubahan cara login pada langkah ini.

Pemulihan `/api/me` mengutamakan draf dan hasil yang belum diakui server. Respons profil lambat tidak boleh menimpa edit yang terjadi selama request atau mengganti pekerjaan akun lain. Logout/401 hanya menutup identitas aktif; salinan jawaban per akun dipertahankan untuk login ulang akun yang sama. Login tidak lagi langsung mengganti seluruh pekerjaan dengan jawaban server.

Data dari penyimpanan lama tidak mempunyai bukti pengakuan server. Karena itu salinan lama dimigrasikan sebagai draf untuk diperiksa peserta, tanpa diunggah otomatis. Ini dapat membuat jawaban lama tampil sebagai draf; peserta dapat menekan Simpan setelah memeriksanya. Jangan menghapus key lama untuk melakukan migrasi massal.

Pesan UI membedakan hasil diterima server, tersimpan lokal/pending, draf, sesi berakhir, dan kegagalan storage. Story/EDFAT/caption/etika menunggu hasil pengiriman sebelum mengklaim penerimaan. Satu pemberitahuan di atas materi tetap terlihat setelah reload atau pindah modul jika masih ada antrean. URL script frontend diperbarui untuk menghindari versi app.js lama dari cache.

## Bukti pengujian

- Baseline sebelum perubahan: 55 tes lulus, `npm run check` lulus.
- Sebelas tes baru antrean: gagal PUT + reload, enam modul, draf tidak auto-kirim, klik Simpan saat request berjalan, edit draf saat pengiriman, pergantian akun, kelas terkunci/tahap tertutup, error autentikasi, respons tanpa pengakuan server, storage gagal, migrasi legacy.
- Empat tes integrasi fungsi asli app.js: Save + restore tidak menimpa hasil pending, 401 mempertahankan salinan akun untuk login ulang, respons profil lambat tidak menimpa edit atau akun lain, dan hasil final kamera/komposisi yang berasal dari draf tidak membawa penanda draf ke server.
- Browser lokal menjalankan frontend asli + handler Worker asli melalui jembatan HTTP Node, dengan SQLite sekali pakai di memori. Ini bukan runtime Cloudflare/D1.
- Browser: akun uji lokal membuat caption B (69 kata), PUT sengaja dibalas 500, database tetap memuat caption A. Reload mempertahankan B beserta checkbox dan status belum diterima server. Setelah simulasi gagal dinonaktifkan, reload memicu retry; SQLite menyimpan B dan status UI menyatakan sudah diterima server. Tidak ada akun atau data uji dimasukkan ke produksi.
- Hasil akhir lokal: 70 tes lulus; pemeriksaan sintaks bawaan dan seluruh file JavaScript harus lulus sebelum commit.

## Batas dan pekerjaan berikutnya

- Perbaikan melindungi salinan pada browser yang sama. Membersihkan data browser atau kehilangan perangkat tetap dapat menghilangkan draf/pending lokal.
- Dua tab/perangkat yang mengedit akun sama belum mempunyai kontrol konflik lintas perangkat. Login ulang merotasi token sesuai perilaku server yang sudah ada.
- Request yang menggantung masih dapat menahan antrean; timeout dan kendali polling merupakan langkah berikutnya. Jangan menyebut perilaku tersebut sudah diperbaiki.
- Backend tetap memakai upsert per peserta/modul. Ulang kirim snapshot yang sama tidak menambah baris jawaban. Belum ada version check server untuk konflik lintas perangkat atau request yang sudah timeout tetapi tetap diproses server.
- Native workerd/D1 Windows belum berhasil digunakan dalam audit sebelumnya. Tes SQLite Node memberi bukti tambahan SQL/HTTP tetapi tidak menggantikan uji Cloudflare dan 70 peserta.
- Tidak ada migrasi atau deployment produksi pada tahap pengembangan ini. Commit/PR, CI dan versi aktif produksi harus dilaporkan terpisah.

## Rilis dan verifikasi aman

Pastikan semua tes lulus dan kode yang dituju jelas. Perubahan ini tidak memerlukan migrasi D1. Periksa integrasi deployment otomatis dan backup sesuai AGENTS sebelum merilis. Setelah rilis, verifikasi parameter `answers=20261114-v1` pada URL app.js, modul `answer-sync.js`, status API dan counter produksi tanpa memasukkan data simulasi. Uji kegagalan jaringan yang mengubah jawaban tetap dilakukan pada lingkungan terisolasi.
