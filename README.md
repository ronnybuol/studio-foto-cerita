# Studio Foto Cerita — Lensa Muda 2026

Aplikasi laboratorium fotografi dan foto jurnalistik interaktif untuk pelajar SMA/SMK/MA, disiapkan untuk **Kelas Lensa Muda — 16 November 2026**.

## Tujuan belajar (180 menit)
- Menguji exposure triangle (aperture, shutter speed, ISO), kedalaman ruang dan gerak lewat simulator visual.
- Memahami komposisi foto, EDFAT (Entire, Detail, Frame, Angle, Time).
- Memilih serta mengurutkan **9 foto landscape (simulasi rasio 3:2)** menjadi photo story.
- Menyusun **satu caption untuk 9 foto** sekitar 150 kata dengan 5W+1H, mempraktikkan integritas foto jurnalistik.
- Tetap bisa mengikuti seluruh simulasi **tanpa memiliki kamera** saat workshop.

## Cara mencoba di komputer
Aplikasi frontend tanpa build step. Jalankan server statis dari folder `public` (misalnya `python -m http.server 8000 --directory public`), kemudian buka `http://localhost:8000`.
Dalam mode ini, aplikasi menggunakan **mode demo lokal**: jawaban hanya tersimpan di browser, dan kontrol trainer tidak tersinkron antarpeserta.

## Deploy untuk kelas dengan banyak ponsel (Cloudflare Workers + D1)

1. Buat database D1: `npx wrangler d1 create lensa-muda-db`; masukkan `database_id` yang diberikan ke `wrangler.jsonc` (ganti placeholder).
2. Terapkan skema: `npx wrangler d1 execute lensa-muda-db --remote --file=schema.sql`.
3. Tambahkan rahasia PIN: `npx wrangler secret put TRAINER_PIN` lalu `npx wrangler secret put MENTOR_PIN` (PIN berbeda; bagikan hanya kepada yang berhak).
4. Jalankan lokal terintegrasi: `npx wrangler dev`; untuk produksi: `npx wrangler deploy`.
5. Periksa pendaftaran, simpan jawaban, pengaturan tahap oleh trainer, dan pembaruan LCD dari perangkat berbeda.

**Jangan menaruh PIN ke repositori**. Bersihkan data latihan jika berganti angkatan. Pendaftaran bersifat terbuka tanpa kuota, tetapi beban serentak tetap harus diuji pada jaringan tempat acara.

## Peran
- **Peserta**: daftar nama, sekolah, kelas; latihan di HP; pekerjaan tersimpan di server saat backend aktif.
- **Trainer**: login PIN, memantau dan mengubah tahap aktif, melihat jawaban peserta.
- **Pendamping fotografer**: login PIN pendamping, dapat memantau siswa dan hasil latihan (tanpa mengubah tahap).
- **LCD**: tampilan presentasi yang mengikuti tahap yang dibuka trainer.

## Catatan editorial & teknis
Semua ilustrasi adegan pada versi awal adalah **simulasi grafis**, bukan foto jurnalistik nyata dan tidak boleh diserahkan sebagai karya lomba. Uji pada ponsel dan laptop; simulator bukan pengganti pengukuran kamera sesungguhnya. Karya lomba harus buatan peserta sendiri, tanpa AI generatif/manipulasi objek. Juknis menetapkan sembilan foto, EDFAT, satu caption ±150 kata, dan etika candid. Tampilan 3:2 landscape untuk latihan; konfirmasi format unggahan final dengan panitia sebelum publikasi.

Aplikasi ini bukan sistem resmi pengumpulan karya lomba. Penyimpanan jawaban peserta dipakai hanya sebagai bahan praktik selama workshop.
