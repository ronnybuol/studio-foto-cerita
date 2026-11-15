# Studio Foto Cerita — Lensa Muda 2026

**Panduan operasional kelas, pemulihan masalah, arsitektur, dan pengujian aman.** Pembaruan dokumentasi: **15 November 2026**, berdasarkan kode di branch `main` setelah PR #43. Program pelatihan: **16 November 2026**, oleh **Kelas Belajar Zonautara.com × Kamisama Fotografia**, dengan trainer **Ronny Adolof Buol**.

> **PENTING UNTUK OPERATOR:** Ada dua pekerjaan berbeda: mengajar memakai dashboard dan mengubah kode aplikasi. Ketika kelas berlangsung, **jangan deploy, reset D1, menghapus peserta, membersihkan cache/storage browser peserta, atau menguji 70 akun palsu di produksi**. Periksa tindakan pemulihan tanpa merusak data terlebih dahulu. Status sebuah PR di GitHub **tidak membuktikan** bahwa versi itu telah aktif di Cloudflare.

## DAFTAR ISI CEPAT

- [1. Jika terjadi masalah saat kelas — baca ini dahulu](#1-jika-terjadi-masalah-saat-kelas--baca-ini-dahulu)
- [2. Link kelas dan peran pengguna](#2-link-kelas-dan-peran-pengguna)
- [3. Checklist sebelum peserta masuk](#3-checklist-sebelum-peserta-masuk)
- [4. Alur operasional dari pembuka sampai buku saku](#4-alur-operasional-dari-pembuka-sampai-buku-saku)
- [5. Enam modul dan keluaran peserta](#5-enam-modul-dan-keluaran-peserta)
- [6. Dashboard trainer dan LCD](#6-dashboard-trainer-dan-lcd)
- [7. Foto hunting, R2, penyimpanan dan pemulihan jawaban](#7-foto-hunting-r2-penyimpanan-dan-pemulihan-jawaban)
- [8. Galeri materi, foto penutup, dan buku saku](#8-galeri-materi-foto-penutup-dan-buku-saku)
- [9. Kunci kelas dan privasi](#9-kunci-kelas-dan-privasi)
- [10. Arsitektur dan berkas utama](#10-arsitektur-dan-berkas-utama)
- [11. Menjalankan aplikasi dan pengujian LOKAL yang aman](#11-menjalankan-aplikasi-dan-pengujian-lokal-yang-aman)
- [12. Cloudflare, deployment dan pemulihan produksi](#12-cloudflare-deployment-dan-pemulihan-produksi)
- [13. API yang perlu diketahui saat diagnosis](#13-api-yang-perlu-diketahui-saat-diagnosis)
- [14. Pengujian, batas bukti, dan audit lanjutan](#14-pengujian-batas-bukti-dan-audit-lanjutan)
- [15. Arsip keputusan dan kontribusi](#15-arsip-keputusan-dan-kontribusi)

---

## 1. Jika terjadi masalah saat kelas — baca ini dahulu

### Tiga langkah aman pertama

1. **Jangan panik dan jangan reset.** Minta peserta **tidak menutup halaman, tidak logout, tidak menghapus data browser, dan tidak menghapus foto asli di HP**. Bila sedang mengetik, pertahankan perangkat/browser yang sama.
2. **Periksa apa yang sebenarnya terganggu:** internet perangkat, satu layar, sinkronisasi antarlayar, unggah foto, atau penyimpanan jawaban. Lihat status koneksi dan pesan pada layar, lalu buka `https://kelasbelajar.org/lensa-muda/api/state` **hanya untuk membaca** status server.
3. **Pisahkan “tersimpan lokal” dan “sudah diterima server”.** Jawaban yang masih tertunda tidak sama dengan jawaban yang sudah terlihat di dashboard. Saat koneksi pulih, gunakan status/fitur retry pada layar; jangan mengulang tindakan secara membabi buta.

### Tabel penyelesaian masalah (untuk trainer di lapangan)

| Gejala | Pemeriksaan / tindakan aman | Jangan lakukan |
|---|---|---|
| LCD tidak mengikuti slide | Periksa URL `#/lcd`, internet, status trainer, lalu tombol **Segarkan** di LCD. Perubahan memakai polling, bukan instan. Pastikan hanya satu trainer mengendalikan presentasi. | Reset sesi atau deploy ulang tanpa diagnosis. |
| Peserta masih melihat materi lama | Peserta mungkin berada di mode **Latihan saya** atau **Baca materi**. Untuk mengikuti presentasi, pilih **Ikuti trainer**. Kemandirian peserta ini disengaja. | Memaksa semua peserta refresh saat mereka sedang mengetik. |
| Trainer mengganti tahap, tetapi tampilan tertinggal | Tunggu respons kendali; bila timeout, **baca ulang status LCD/server dahulu** sebelum mengulangi tombol. Request lama dapat selesai belakangan. | Menekan tombol berkali-kali hingga urutan tak jelas. |
| Jawaban tidak terlihat di dashboard | Periksa apakah peserta sudah menekan **Simpan** dan ada konfirmasi **diterima server**. Jika **tersimpan lokal / pending**, sambungkan kembali internet pada **perangkat dan akun yang sama**. | Menyuruh peserta menghapus cache/storage, logout, atau ganti HP saat masih ada pending. |
| Foto hunting tidak muncul di Meja Editor | Di Modul 03 periksa galeri: status harus **Tersimpan di server**. Gunakan **Unggah tertunda / Perbarui**. Foto antrean lokal belum tentu tersedia untuk Modul 04. | Hapus foto asli HP atau data browser. |
| Tombol **+ Pilih Foto** atau **Simpan sembilan foto** belum aktif | Pastikan sudah memilih foto **hasil hunting dari server**; untuk menyimpan perlu **tepat 9 foto** serta judul dan alasan editorial yang memenuhi validasi. Pilihan foto stok lama tidak dihitung. | Mengubah data peserta dari D1 secara manual. |
| Caption Lab belum bisa dikirim | Harus ada **9 foto Modul 04 yang sudah disimpan**; narasi boleh **berapa pun jumlah katanya selama tidak kosong**; periksa isian serta tiga checklist editorial. | Memaksa target minimum 50 atau 150 kata; aturan latihan sudah berubah. |
| Timer dihentikan tetapi overlay belum hilang | Gunakan kontrol **Stop/Selesai**, lalu periksa status server dan tunggu polling. Jika satu layar tertinggal, **Segarkan** layar itu setelah memastikan tidak ada isian belum disimpan. | Membuat timer baru untuk “menimpa” timer yang macet tanpa mengecek status. |
| Tidak bisa login peserta | Pastikan kelas belum dikunci, username benar, dan internet aktif. Username menjadi kredensial; login ulang dari perangkat lain **merotasi token lama**. | Sebarkan username peserta dalam grup atau mencoba login berulang memakai akun milik orang lain. |
| Kelas sudah dikunci | Ini memblokir operasi peserta. Trainer dapat **membuka kembali kelas** bila benar-benar perlu. Buku saku publik tetap bisa dibaca/diunduh. | Reset data agar peserta bisa masuk. |
| Foto Modul 06 masih foto Sangihe | Foto dokumenter baru per slide belum ada di R2 atau URL belum terambil. Periksa status enam foto di panel Modul 06. Foto Sangihe adalah **fallback** yang disengaja. | Menghapus aset fallback di repo. |
| Slide terima kasih tidak tampil | Foto latar JPG harus tersedia di R2 sebelum tombol penutup aktif. Periksa panel **Slide Penutup**. Klik **Kembali ke Materi** untuk menutup overlay. | Mengubah tahap/modul hanya untuk menutup penutup. |
| QR buku saku terbuka tetapi tombol PDF belum tersedia | QR menuju **halaman buku saku digital**. PDF unduhan baru muncul setelah trainer **mengunggah PDF** ke R2; peserta tetap bisa **Cetak / Simpan PDF** dari browser. | Menutup seluruh situs atau kunci akses buku saku. |
| Koneksi internet satu lokasi terputus | Hentikan sementara kiriman, lanjutkan penjelasan verbal/observasi; saat koneksi pulih periksa antrean, status sinkron dan jawaban. | Menganggap status offline sama dengan data hilang atau status server sukses. |

**Tanda bahaya yang memerlukan pemeriksaan teknis:** HTTP 401 (sesi/token), 403 (peran/tahap), 409 (konflik revisi/data), 413 (file terlalu besar), 415 (format file), 423 (kelas terkunci), 429 (pembatasan), 503 (ketidaktersediaan backend/binding). Arti pasti harus dibaca dari pesan respons API; tabel ini bukan daftar seluruh kemungkinan.

### Jika benar-benar perlu melapor ke pengembang/Codex

Catat **waktu WITA, layar/URL, modul dan slide, tindakan terakhir, pesan error, status online, apakah jawaban masih ada di HP, serta apakah LCD dan dashboard sama-sama bermasalah**. Sertakan screenshot yang disamarkan bila memuat identitas peserta. **Jangan kirim PIN, token, daftar username, atau foto privat peserta** di issue publik.

---

## 2. Link kelas dan peran pengguna

| Layar | Link |
|---|---|
| Beranda | https://kelasbelajar.org/lensa-muda/ |
| Peserta | https://kelasbelajar.org/lensa-muda/#/peserta |
| Trainer | https://kelasbelajar.org/lensa-muda/#/trainer |
| LCD / proyektor | https://kelasbelajar.org/lensa-muda/#/lcd |
| Buku saku digital | https://kelasbelajar.org/lensa-muda/buku-saku.html |
| Status kelas (GET, baca saja) | https://kelasbelajar.org/lensa-muda/api/state |

Aplikasi juga mengenali sejumlah rute berbasis path; URL hash di atas dipakai di panduan ini agar konsisten saat operator berpindah layar.

**Peran:**
- **Peserta:** daftar/login dengan username, mengerjakan latihan di perangkat sendiri, mengunggah foto hunting dan menyimpan jawaban. Username bukan password yang kuat — perlakukan sebagai **kredensial rahasia**.
- **Trainer:** masuk menggunakan PIN trainer yang disimpan sebagai **Cloudflare secret**, mengendalikan tahap, slide, kamera demo, timer, sorotan karya, layar penutup, penguncian kelas dan unggah aset materi.
- **Pendamping/mentor:** masuk dengan PIN pendamping; terutama **memantau**, bukan memegang kendali presentasi/unggah materi atau menghapus data.
- **LCD:** presentasi publik yang membaca status kelas. Tidak perlu token trainer pada layar LCD.

**Rekomendasi kelas:** satu laptop trainer, satu layar LCD/TV/proyektor eksternal, dan masing-masing peserta memakai ponsel. Pastikan laptop serta perangkat peserta memperoleh internet yang memadai; dua tab laptop trainer dan LCD boleh digunakan sebagai alat kontrol/penayangan.

---

## 3. Checklist sebelum peserta masuk

- [ ] Pastikan commit GitHub yang dituju sudah **benar-benar terdeploy** ke Cloudflare; jangan hanya melihat status PR.
- [ ] Buka beranda, `#/trainer`, `#/lcd` dan satu HP peserta (tanpa membuat akun palsu baru di produksi).
- [ ] Pastikan layar trainer tersambung, LCD mengikuti satu perpindahan slide yang aman, dan presentasi masih bisa kembali.
- [ ] Periksa jumlah peserta yang sudah terdaftar **tanpa menghapusnya** dan apakah kelas masih terbuka.
- [ ] Periksa **status enam foto Modul 06** serta lima spread NatGeo di panel yang tersedia.
- [ ] Pastikan **foto siluet penutup** sudah berstatus tersedia.
- [ ] Pastikan **PDF Buku Saku** sudah diterbitkan (maksimal 5 MB), lalu **pindai QR** layar penutup dengan HP dan lakukan satu unduhan percobaan.
- [ ] Cek bahwa halaman `buku-saku.html` masih bisa dibaca tanpa login.
- [ ] Pastikan charger, kabel/HDMI, perangkat LCD, browser fullscreen, dan jaringan cadangan.
- [ ] Siapkan cara fasilitasi tanpa internet: instruksi lisan, foto asli peserta, dan diskusi bersama. Hindari tindakan destruktif saat sambungan tidak stabil.

**Penting:** status **berhasil merge** berbeda dari **Cloudflare sudah menjalankan versi baru**. Kondisi produksi dan ketersediaan media R2 harus diuji langsung oleh operator. Repo hanya mendefinisikan fitur dan rutenya.

---

## 4. Alur operasional dari pembuka sampai buku saku

### Tahap 00 — orientasi dan registrasi

1. Trainer membuka dashboard dan memilih tampilan orientasi/pendaftaran.
2. Peserta masuk dari ponsel dan mendaftar memakai **nama, sekolah, kelas, serta username pilihan**, atau login dengan username yang pernah dibuat.
3. LCD dapat menampilkan panduan, jumlah peserta dan roster. Pada uji 70 peserta, daftar dibagi **48 nama + 22 nama**.
4. Simpan username masing-masing secara privat; jangan sebarkan roster yang memuat username.

### Modul 01 — Laboratorium Kamera

1. Trainer membuka tahap 01; teori dimulai dari indeks presentasi **0** dan dapat berpindah ke simulasi kamera.
2. Peserta memahami cahaya, aperture, shutter speed, ISO dan hubungan ketiganya. Mereka menguji perubahan setting masing-masing.
3. Trainer dapat menggerakkan demo kamera pada dashboard untuk ditampilkan di LCD; demo ini **terpisah** dari latihan kamera peserta.
4. Peserta menyimpan hasil kamera jika tugas meminta penyimpanan.

### Modul 02 — Komposisi Visual

1. Tahap 02 mulai di indeks **21**; gunakan contoh dokumentasi Sangihe untuk membahas bingkai, posisi, jarak, sudut dan framing.
2. Trainer membuka latihan komposisi. Demo trainer tampil di LCD, sedangkan peserta mengendalikan contoh komposisi sendiri.
3. Peserta menyimpan keputusan dan alasan. Praktik bukan membuat objek pada foto dokumenter menjadi kejadian baru.

### Modul 03 — EDFAT + hunting foto

1. Tahap 03 mulai di indeks **32**. Enam slide pertama menjelaskan **Entire, Detail, Frame, Angle, Time**; slide 07 adalah **briefing hunting dan unggah**.
2. Trainer dapat menjalankan timer hunting **25 menit**, lalu seleksi/unggah **15 menit**. Pengaturan ini membantu kelas; tetap gunakan penilaian situasional saat memfasilitasi.
3. Peserta mengambil foto sendiri, memilih hingga **12** foto dari galeri HP, lalu mengunggah salinan yang dikompresi WebP. Foto asli di HP **tidak dihapus** aplikasi.
4. Pastikan status setiap foto yang diperlukan **Tersimpan di server**. Ketika jaringan putus, periksa antrean IndexedDB di perangkat yang sama.
5. **Misi Detektif:** setiap peserta memilih **SATU** foto dari hasil hunting, menentukan unsur EDFAT dominan, dan menulis alasan berdasarkan bukti yang terlihat. Trainer dapat memeriksa dan menyorot foto pilihan ke LCD.

**Foto musik bambu Sangihe tetap dipakai sebagai contoh teori**, bukan menggantikan foto hasil hunting peserta pada latihan.

### Modul 04 — Sembilan Bingkai / Meja Editor — **DIKUNCI**

1. Tahap 04 mulai di indeks **39** dan memiliki **enam slide teori** dengan contoh foto Sangihe.
2. Portofolio majalah **National Geographic — Hudog Pekayang**, lima spread karya Ronny Adolof Buol, disajikan dalam layout asli sebagai inspirasi penyuntingan foto cerita. Spread dan urutannya **dikunci**.
3. Slide 06 mengantar praktik menggunakan foto hunting peserta; ilustrasinya spread pertama NatGeo.
4. Peserta membuka Meja Editor dan memilih **tepat sembilan dari maksimal dua belas foto hunting yang sudah tersimpan**, mengatur urutannya, mengisi judul dan alasan editorial, lalu menyimpan.
5. Trainer dapat melihat sembilan foto dan melempar karya peserta pilihan ke LCD untuk diskusi; foto peserta lain tidak boleh tercampur.

Jangan kembali memakai foto stok musik bambu sebagai **jawaban latihan**. Contoh Sangihe tetap sah pada slide teori.

### Modul 05 — Caption Lab — **DIKUNCI**

1. Tahap 05 mulai di indeks **45** dan memiliki **tujuh slide** (45–51).
2. Slide 06 memuat **contoh caption musik bambu Sangihe** tanggal foto 9 September 2017 beserta peta **5W+1H**; slide 07 adalah praktik.
3. Latihan hanya bisa dikirim setelah rangkaian **sembilan foto** Modul 04 disimpan oleh akun peserta yang sama.
4. Peserta mencatat 5W+1H, hal yang perlu diverifikasi, dan menulis **satu narasi**; panjang tulisan **bebas selama tidak kosong**. Penghitung kata ditampilkan untuk bahan diskusi, bukan syarat minimum 50/150 kata.
5. Tiga pemeriksaan editorial perlu diselesaikan sebelum mengirim.
6. Trainer memantau hasil dan menyorotnya ke LCD: **sembilan foto berurutan dalam grid 3×3, judul, narasi utuh yang bisa digulir, dan jumlah kata**.

### Modul 06 — Etika & Tantangan

1. Tahap 06 mulai di indeks **52** dan memiliki enam slide (52–57), meliputi kepercayaan, momen asli, izin dan martabat subjek, edit/verifikasi, pilihan etis dan tantangan akhir.
2. Enam foto dokumenter pengganti ditampilkan dari **R2** dengan fallback foto Sangihe. Berkas unggahan WebP dipasangkan ke slide 01–06.
3. Latihan peserta: **empat situasi etika**, masing-masing satu jawaban dan **alasan**, lalu rencana foto cerita budaya yang mencakup **enam bagian**: tema, tokoh, izin, ragam foto, fakta yang harus diperiksa, serta keselamatan/martabat. Terakhir **tiga komitmen etika**.
4. Peserta menyimpan hasil; trainer membaca skor keputusan (0–4) sebagai bahan refleksi, bukan satu-satunya ukuran etika, dan dapat menyorot rencana ke LCD.
5. **Belum ada alasan menganggap seluruh alur ini terverifikasi end-to-end pada 70 sesi nyata** hanya dari uji pendaftaran serentak. Lakukan gladi ringan dengan akun khusus yang memang diizinkan bila diperlukan.

### Layar penutup dan buku saku

1. Pada dashboard trainer, buka **Slide Penutup · Seluruh Kelas**.
2. Pastikan foto **siluet fotografer berlatar awan** sudah diunggah sebagai JPG dan status siap.
3. Klik **Tampilkan Penutup di LCD & Peserta**. Ini **overlay**, bukan modul baru, dan tidak menghapus jawaban.
4. Slide berisi **Terima kasih**, kontak trainer, **QR Buku Saku** dan tombol buka buku saku.
5. Peserta memindai QR yang mengarah ke **`https://kelasbelajar.org/lensa-muda/buku-saku.html`**; di sana dapat membaca enam modul dan mengunduh PDF lengkap bila tersedia, atau **Cetak / Simpan PDF** sebagai alternatif.
6. **Kembali ke Materi** menonaktifkan overlay dan mengembalikan posisi sebelumnya.
7. Setelah yakin semua sudah tersimpan dan buku saku dapat diakses, trainer boleh mengunci aplikasi peserta. **Tautan buku saku publik tetap tersedia setelah kelas dikunci.**

**Pegangan praktis:** jangan mengunci sebelum peserta yang masih memiliki unggah/jawaban pending menyelesaikan sinkronisasi atau memahami konsekuensinya.

---

## 5. Enam modul dan keluaran peserta

| Tahap | Materi | Indeks presentasi | Keluaran praktik |
|---|---|---|---|
| 00 | Orientasi, panduan, registrasi | Tampilan khusus tahap 00 | Akun peserta dan pemahaman alur |
| 01 | Dasar fotografi / kamera | 0–20 | Keputusan kamera (aperture, shutter, ISO) |
| 02 | Komposisi Visual | 21–31 | Komposisi dan alasan pilihan |
| 03 | EDFAT / hunting foto | 32–38 | Maks. 12 foto tersimpan di R2; 1 pilihan EDFAT + alasan |
| 04 | Sembilan Bingkai | 39–44 | 9 foto hunting tersusun, judul dan alasan editorial |
| 05 | Caption Lab | 45–51 | Satu narasi untuk 9 foto, 5W+1H, verifikasi dan jumlah kata |
| 06 | Etika & Tantangan | 52–57 | 4 respons etika, alasan, rencana foto cerita dan 3 komitmen |
| Penutup | Slide terima kasih | Overlay terpisah | QR/link ke buku saku |

Indeks di tabel adalah **indeks internal untuk debugging**, bukan nomor yang harus dibaca peserta. Konstanta acuan terdapat di `src/index.js` (`STAGE_FIRST_SLIDES` / `STAGE_LAST_SLIDES`) dan berkas materi masing-masing. Jika kelak ada slide tambahan, seluruh batas dan tes harus disesuaikan **bersama**.

**Mode peserta:** **Latihan saya** mempertahankan pekerjaan; **Baca materi** memberi navigasi materi mandiri; **Ikuti trainer** membuat layar kembali mengikuti presentasi. LCD selalu mengikuti kendali trainer. Saat kelas dibuka ke tahap berikutnya, tugas yang sedang dikerjakan peserta tidak perlu dipaksa berpindah.

---

## 6. Dashboard trainer dan LCD

### Pengendalian yang harus dipahami trainer

**Satu kendali kelas:** pilih tahap → tampilkan materi → pindah slide → buka latihan → bahas hasil peserta → pindah tahap. Jangan memakai dua sesi trainer yang sama-sama aktif mengendalikan presentasi pada waktu bersamaan.

- **Presenter:** trainer mengirim perubahan lewat API; server menyimpan snapshot sesi; LCD dan peserta mengikuti melalui polling. Sinkron bukan WebSocket dan tidak dijanjikan tanpa jeda.
- **Konsistensi tahap:** pergantian tahap dan slide awal memakai pembaruan atomik; `controlRevision` menolak perintah lama yang datang terlambat.
- **Sorotan karya:** hasil terpilih muncul di LCD tanpa mengganti tahap/slide dasar. Hentikan sorotan melalui **Kembali ke Presentasi**. Pastikan tidak menampilkan informasi sensitif pada proyektor.
- **Hunting timer:** start, pause, resume, extend, stop/finish. Saat dihentikan, overlay countdown seharusnya ikut hilang setelah sinkronisasi.
- **Layar penutup:** tampil/keluar tanpa mengunci kelas atau mengubah modul. Slide penutup perlu foto latar yang sudah tersedia di server.
- **Mentor/pendamping:** hak baca, bukan kendali trainer.

**Catatan privasi:** LCD dan status publik dapat menyajikan karya/teks yang dipilih trainer. Jangan menyorot data pribadi, alamat sensitif, atau informasi yang berpotensi membahayakan subjek.

---

## 7. Foto hunting, R2, penyimpanan dan pemulihan jawaban

### Tiga lapisan penyimpanan yang berbeda

| Lapisan | Menyimpan | Dampak jika hilang |
|---|---|---|
| Browser perangkat peserta | Identitas/token lokal, draf dan **pending answer** per akun; antrean unggah foto di IndexedDB | Draf / antrean yang **belum tersinkron** bisa hilang jika data browser dibersihkan |
| Cloudflare **D1** | Akun, status kelas, metadata foto, hasil jawaban per modul | Merupakan sumber data kegiatan; **jangan reset** |
| Cloudflare **R2** | Berkas WebP hunting, foto materi Modul 06, spread portfolio, foto penutup, dan PDF buku saku | Foto dan unduhan gagal jika objek/binding tidak tersedia |

**Batas teknis foto hunting:** maksimal **12 slot per peserta**, diproses ke format **WebP** dan dibatasi sekitar **2 MB per hasil optimasi**. Status **Tersimpan di server** berarti foto telah dikonfirmasi sebagai hasil kiriman; antrean lokal tidak boleh dianggap sudah di R2.

**Jawaban D1** memakai kunci `kamera`, `komposisi`, `edfat`, `story`, `caption`, dan `etika`. Satu akun + satu modul memakai satu hasil terbaru (upsert), dengan proteksi `_clientRevision` untuk menolak kiriman lama. Foto yang disimpan tetap milik akun tersebut, bukan aset yang bisa dibaca sembarang pengguna.

**Pola pemulihan yang aman:** tetap di browser yang sama → cek label status → sambungkan internet → buka kembali modul/galeri → gunakan tombol retry/perbarui → konfirmasi hasil pada dashboard trainer. Logout atau login ulang di perangkat berbeda bisa merotasi token, sehingga **jangan pindah perangkat sebelum antrean tersinkron**.

**Tidak dijamin:** data yang hanya berada di browser akan selamat bila perangkat hilang, browser di-reset, atau penyimpanan dibersihkan. Konflik edit simultan dari dua perangkat dengan username yang sama tidak otomatis digabung.

Dokumen rinci: [perlindungan jawaban](docs/answer-recovery-2026-11-14.md), [pemulihan koneksi](docs/connection-recovery-2026-11-14.md), dan [sinkronisasi trainer–LCD](docs/trainer-lcd-sync-2026-11-14.md).

---

## 8. Galeri materi, foto penutup, dan buku saku

| Media | Lokasi / cara mendapatkan | Jika belum tersedia |
|---|---|---|
| Foto contoh kamera dan komposisi Sangihe | Aset statis di `public/assets/`, ikut kode/deploy | Periksa deployment dan URL aset; jangan ubah D1 |
| Lima spread NatGeo `Hudog Pekayang` | R2; tampilan portofolio Modul 04 | Periksa panel status dan unggahan yang sudah ada; **jangan menimpa** spread yang dikunci |
| Enam foto Modul 06 | Trainer unggah **6 WebP sekaligus**: `slide 1 - modul 06.webp` s.d. `slide 6 - modul 06.webp`, maksimal **3 MB per file**, melalui panel Modul 06 | Aplikasi memakai foto Sangihe sebagai fallback |
| Foto siluet penutup | Trainer unggah **JPG** (maks. **4 MB**) pada panel Slide Penutup | Penutup tidak bisa dinyalakan sampai JPG tersedia |
| Buku saku digital | `/lensa-muda/buku-saku.html` | Bisa dibaca tanpa login, dengan perintah cetak/simpan PDF |
| PDF buku saku 19 halaman | Trainer unggah **PDF maksimal 5 MB** melalui panel `Publikasikan Buku Saku Peserta (PDF)`; unduhan publik `/lensa-muda/api/booklet/pdf` | Tombol PDF lengkap belum muncul sampai file siap; QR tetap mengarah ke halaman digital |

**Jangan memperlakukan “sudah ada fitur upload” sebagai bukti bahwa objek media sudah ada di R2.** Periksa status dan buka foto/PDF di browser.

**Materi peserta untuk donor:** buku saku merupakan **produk pembelajaran dan lampiran materi**, bukan bukti otomatis kehadiran, jumlah peserta selesai, atau mutu hasil belajar. Dokumentasi pelaksanaan dan keluaran karya perlu diverifikasi tersendiri.

---

## 9. Kunci kelas dan privasi

- Kunci kelas `is_locked` dapat diaktifkan **hanya trainer** setelah kelas selesai. Akses operasi peserta ditolak ketika dikunci; dashboard trainer tetap tersedia untuk keperluan pengawasan.
- Setelah dikunci, peserta tidak dapat memperbaiki hasil yang belum tersinkron. **Konfirmasi seluruh peserta telah menyimpan tugas terlebih dahulu.**
- **Buku saku** dan halaman statis digital **tetap publik** walaupun akun kelas terkunci; jangan menempatkannya di balik operasi login peserta.
- Username yang dipilih peserta (3–20 huruf kecil a–z tanpa spasi untuk akun baru) **berfungsi sebagai kredensial login**, bukan sekadar nama tampilan. Jangan membagikannya secara publik. Username lama dengan pola `LM-...` tetap mendapat jalur kompatibilitas.
- Trainer/mentor memakai PIN dari Cloudflare secrets; token tidak boleh masuk log publik, tangkapan layar, repo, atau laporan donor.
- Permintaan hapus peserta dari dashboard **dapat menghapus jawaban terkait**; jangan gunakan fitur ini untuk memperbaiki masalah login.

---

## 10. Arsitektur dan berkas utama

`
Browser peserta / trainer / LCD
        │
        ▼
Cloudflare Worker (`src/index.js`)
   ├── Assets dari `public/` (ES modules tanpa bundling)
   ├── D1 `DB`: sesi, akun peserta, jawaban, metadata hunting
   └── R2 `PHOTO_BUCKET`: media hunting dan materi/handbook
`

| Berkas | Fungsi |
|---|---|
| `public/index.html`, `public/app.js`, `public/styles.css` | Entry aplikasi, state, dashboard, rendering 3 mode dan styling |
| `public/slides.js`, `public/composition.js` | Materi kamera dan komposisi |
| `public/edfat.js` | Materi EDFAT dan briefing hunting |
| `public/story.js`, `public/story-selection.js`, `public/story-hunting-ui.js` | Meja Editor sembilan foto dan loading foto milik peserta |
| `public/caption.js` | Tujuh slide Caption Lab dan contoh 5W+1H |
| `public/ethics.js` | Enam slide etika dan ilustrasi R2/fallback |
| `public/closing.js`, `public/buku-saku.html` | Penutup penuh, QR dan buku saku |
| `public/photo-hunting.js`, `public/hunting-ui.js` | Kompresi WebP, IndexedDB antrean, tampilan galeri peserta |
| `public/hunting-timer-ui.js`, `src/hunting-timer.js` | Kendali/tampilan countdown bersama |
| `public/answer-sync.js`, `public/connection.js`, `public/trainer-sync.js` | Pending jawaban, timeout/polling, revisi kendali |
| `src/index.js`, `src/hunting-photos.js` | Worker API, hak akses, D1/R2 dan skema hunting |
| `wrangler.jsonc`, `schema.sql`, `migrations/` | Konfigurasi layanan, skema baru, migrasi terdokumentasi |
| `scripts/load-test-local.mjs`, `scripts/hunting-photo-smoke-local.mjs` | Tes HTTP/70 peserta dan unggah foto **hanya lokal** |
| `tests/` | Unit/regresi; tidak semuanya pengujian browser end-to-end |
| `docs/`, `AGENTS.md` | Laporan audit, pemulihan, dan aturan keamanan perubahan |

Binding produksi saat dokumentasi diperbarui: Worker `studio-foto-cerita`; D1 `lensa-muda-db` (binding `DB`); R2 `lensa-muda-media` (binding `PHOTO_BUCKET`); aset statis `ASSETS` dengan `base_path: "/lensa-muda"`. Konfigurasi sebenarnya adalah `wrangler.jsonc`; **jangan mengganti ID database/bucket dengan resource uji pada kode produksi**.

Status sesi disimpan di `sessions.camera_json` (tahap/presentasi/spotlight, timer, penutup) dan tabel terkait. Tidak ada kebutuhan membuat migrasi baru hanya untuk menampilkan penutup dan buku saku.

---

## 11. Menjalankan aplikasi dan pengujian LOKAL yang aman

### Prasyarat

- Node.js dan npm; CI memakai Node **22**.
- Wrangler dari dependensi repository.
- Repo di komputer sendiri dengan semua aset (termasuk file biner) tersedia.
- **Rahasia uji**, bukan rahasia produksi, pada `.dev.vars` yang **tidak di-commit**.
- D1/R2 **lokal terpisah**. Jangan menjalankan perintah schema pada database remote yang aktif.

### Periksa sintaks dan tes

```bash
npm install --no-audit --no-fund
npm run check
npm test
```

Perintah `npm run check` mengikuti daftar berkas yang ditentukan `package.json`; modul ES lain juga diuji melalui `npm test`, tetapi **lulus tes unit tidak sama dengan lulus 70 sesi browser**.

### Siapkan lingkungan HTTP/Wrangler lokal

Buat `.dev.vars` **lokal saja** menggunakan PIN contoh khusus uji, bukan PIN produksi:

```text
TRAINER_PIN=local-trainer-12345
MENTOR_PIN=local-mentor-12345
SESSION_SECRET=local-load-test-only-secret-for-virtual-users-123456
```

```bash
# HANYA D1 lokal. Jangan tambah --remote.
npx wrangler d1 execute lensa-muda-db --local --file=schema.sql

# Worker lokal, data lokal; jangan akses Cloudflare produksi.
npx wrangler dev --local --ip 127.0.0.1 --port 8787

# Di terminal LAIN, setelah API lokal siap:
node scripts/load-test-local.mjs
```

Skrip beban **secara eksplisit menolak alamat selain localhost/127.0.0.1**; memerlukan database uji **kosong**, tahap 00 dan kredensial trainer uji. Jangan mengosongkan data produksi atau mengubah `LOAD_TEST_BASE` ke URL produksi. Untuk uji ulang, siapkan **persistensi lokal disposable baru**, jangan menghapus database lain yang sedang dipakai.

Uji unggah foto lokal dengan `node scripts/hunting-photo-smoke-local.mjs` pada instance lokal **terpisah / kosong**: skrip membuat akun uji sendiri dan menguji sampai 12 slot. Jangan menjalankannya pada server kelas.

### Apa yang belum terwakili skrip ini

`scripts/load-test-local.mjs` memeriksa 70 pendaftaran bersamaan, 70 hasil kamera bersamaan, counter/roster, tahap 01–06, revisi kontrol, timer dan pemulihan. `scripts/hunting-photo-smoke-local.mjs` menguji R2 lokal **satu peserta dengan 12 foto**, bukan 70 × 12 foto secara paralel.

**Belum ada bukti satu skenario HTTP/browser tunggal menjalankan 70 peserta dari orientasi hingga 840 unggahan foto, 630 pilihan foto, 70 caption, 70 rencana etika, penutup dan unduhan R2.** Tes sumber/logic yang lain tidak boleh digambarkan sebagai pengujian kapasitas Cloudflare produksi.

Workflow CI: [syntax/test](.github/workflows/check.yml), [70 peserta lokal](.github/workflows/isolated-classroom-load.yml), dan [R2 foto lokal](.github/workflows/isolated-hunting-photos.yml).

---

## 12. Cloudflare, deployment dan pemulihan produksi

### Konfigurasi

- Worker: `studio-foto-cerita`, kode utama `src/index.js`.
- Route produksi yang boleh dipakai: `kelasbelajar.org/lensa-muda/*`. **Jangan memakai route `kelasbelajar.org/*`** karena terdapat aplikasi lain.
- Konfigurasi `assets.base_path` = `/lensa-muda` dan API `/lensa-muda/api/*` dijalankan Worker lebih dahulu.
- Binding: D1 `DB` = `lensa-muda-db`; R2 `PHOTO_BUCKET` = `lensa-muda-media`.
- Secrets yang wajib ada: `TRAINER_PIN`, `MENTOR_PIN`, `SESSION_SECRET`. Jangan menulis nilai secret di README, issue, chat, atau commit.

### Prosedur perubahan kode (bukan untuk dilakukan saat kelas berlangsung)

1. Pastikan masalah teridentifikasi dan perubahan memang diperlukan; dokumentasi/audit saja tidak perlu deploy Worker.
2. Baca `AGENTS.md`, pastikan branch/commit basis dan perubahan GitHub pihak lain (termasuk Codex).
3. Buat branch kecil; jalankan tes, dokumentasikan keterbatasan; review PR.
4. Sebelum merge yang memengaruhi runtime, cek apakah Cloudflare terhubung ke `main` untuk **auto-deploy**; siapkan backup D1 dan catat versi Worker sebelumnya.
5. Merge hanya setelah CI relevan lulus dan aman untuk kelas; cek **Cloudflare Deployments**.
6. Verifikasi **versi live**, URL aset, `GET /api/state`, koneksi trainer–LCD dan kemampuan menyimpan satu jawaban **hanya melalui akun uji yang memang disetujui**, tidak mengganggu peserta asli.
7. Bila perlu rollback, rollback **versi Worker** lewat mekanisme deployment yang tersedia. Rollback kode **tidak otomatis memulihkan D1/R2**.

### Database: jangan menjalankan migrasi historis sembarangan

- `schema.sql` dipakai untuk membuat database uji/baru, **bukan** alat memperbaiki/mereset D1 produksi.
- `migrations/0001-live-camera.sql` menambah `camera_json` pada database lama; database baru sudah menyertakannya.
- `migrations/0002-participant-username.sql` terkait kolom username; aplikasi mempunyai migrasi otomatis aditif.
- `migrations/0003-class-lock.sql` terkait kunci kelas; aplikasi mempunyai migrasi otomatis aditif.
- Tabel `hunting_photos` dibuat secara aditif bila diperlukan.

**Selalu periksa kondisi skema aktual sebelum ALTER TABLE**, karena mengulang migrasi manual bisa gagal. Lakukan backup/Time Travel D1 sebelum perubahan database yang benar-benar diperlukan.

---

## 13. API yang perlu diketahui saat diagnosis

Semua endpoint berikut memiliki prefix `https://kelasbelajar.org/lensa-muda/api`. **GET** digunakan untuk pemeriksaan yang tidak mengubah data; jangan memanggil **PUT/POST/DELETE** di produksi sekadar untuk diagnosis.

| Endpoint | Kegunaan / catatan |
|---|---|
| `GET /state` | Tahap, presentasi, timer, roster/spotlight yang dapat ditampilkan publik; jangan sisipkan token peserta |
| `GET /dashboard` | Data trainer/mentor, **memerlukan token** dan memuat informasi yang tidak boleh disebar |
| `GET /me` | Profil/jawaban akun peserta, **memerlukan token peserta** |
| `POST /participants` | Pendaftaran; membuat akun **baru** |
| `POST /participant-login` | Login peserta; menerbitkan token baru |
| `PUT /state`, `PUT /presentation`, `PUT /orientation`, `PUT /spotlight` | Kendali trainer; menggunakan revisi kontrol untuk mencegah request lama |
| `PUT /hunting/timer` | Start/pause/resume/extend/finish timer; **mengubah sesi** |
| `GET /hunting/photos`, `GET /hunting/photos/1..12` | Daftar/pratinjau foto akun peserta, memerlukan autentikasi |
| `PUT /hunting/photos/1..12` | Unggah foto WebP akun peserta (maks. 12 slot) |
| `GET /ethics/photos/status` | Status tersedia enam foto materi Modul 06 |
| `GET /ethics/slide-photo/1..6` | Aset enam slide Modul 06 dari R2 |
| `GET /closing/status`, `GET /closing/photo` | Ketersediaan / pembacaan JPG latar penutup |
| `PUT /closing/presentation` | Tampilkan/sembunyikan overlay penutup, **hanya trainer** |
| `GET /booklet/status` | Cek PDF buku saku sudah tersedia di R2 |
| `GET /booklet/pdf` | Unduh buku saku PDF; **publik**, tidak bergantung pada lock peserta |
| `PUT /booklet/pdf` | Unggah PDF buku saku baru; **trainer saja**, maksimum 5 MB |
| `GET /portfolio/status`, `GET /portfolio/spread/1..5` | Lima spread portofolio NatGeo |
| `PUT /class-lock` | Mengunci/membuka operasi peserta; jangan uji saat kelas berlangsung |

Endpoint jawaban modul dan foto/sorotan khusus memakai pola rute di `src/index.js`. Penggunaan langsung API autentikasi tidak disarankan bagi operator kelas; dashboard menyediakan kontrol resminya.

---

## 14. Pengujian, batas bukti, dan audit lanjutan

### Bukti yang dapat dirujuk

Pada pengujian CI di PR #43 (kode yang kemudian masuk `main`), tercatat:
- **122 tes JavaScript lulus**, 0 gagal; pemeriksaan sintaks lulus.
- Simulasi **70 registrasi bersamaan** ke Worker/D1 lokal: **70 sukses**, 0 gagal; **p95 ≈267 ms** untuk sampel pendaftaran lokal.
- **70 penyimpanan jawaban kamera serentak** berhasil dan terlihat pada dashboard uji lokal.
- Uji R2 lokal tersendiri berhasil untuk **12 slot foto satu akun**, pembatasan akses/ukuran dan pengambilan ulang.

Angka tersebut berasal dari runner **terisolasi**, bukan pengukuran Cloudflare produksi atau Wi-Fi lokasi kegiatan. Uji unit banyak yang hanya memeriksa sumber kode/handler dan tidak menggantikan uji klik browser aktual.

### Skenario yang masih perlu gladi atau audit terarah

- Perjalanan **70 peserta sekaligus** dari tahap 00 sampai penutup: 12 unggahan foto tiap orang, satu pilihan EDFAT, sembilan pilihan Meja Editor, seluruh caption, empat soal etika, enam isian rencana, tiga komitmen, sorotan LCD dan 70 unduhan **dari R2/Worker lokal**.
- Validasi langsung pengiriman **Modul 06** dari browser peserta (belum dikonfirmasi oleh trainer pada sesi terakhir).
- Perangkat ponsel nyata (320–430 px), koneksi lemah, tab background, keyboard terbuka, LCD 16:9, serta pengujian unduh PDF/QR setelah lock kelas.
- Setelah Codex mengaudit repo, bandingkan temuannya dengan kode sekarang. **Tidak boleh menganggap status “lulus” lama membuktikan bug baru tidak ada**.

Selama audit, **jangan** membuat akun palsu, menyalakan/mematikan timer, mengunci kelas, mengunggah gambar, atau menghapus jawaban di server produksi tanpa izin yang jelas. Uji perubahan hanya pada sistem lokal disposable.

---

## 15. Arsip keputusan dan kontribusi

**Materi yang disepakati terkunci:** Modul 04 (portofolio lima spread dan Meja Editor foto hunting) serta Modul 05 (tujuh slide, caption tanpa minimal kata, grid sembilan foto + narasi di LCD). Ubah hanya atas permintaan trainer atau bug penting yang dibuktikan.

**Riwayat dokumentasi/bug yang relevan:**
- [Audit kode 14 November](docs/audit-2026-11-14.md)
- [Perlindungan draf dan jawaban pending](docs/answer-recovery-2026-11-14.md)
- [Koneksi putus, timeout dan pemulihan](docs/connection-recovery-2026-11-14.md)
- [Sinkron trainer–LCD dan revisi kendali](docs/trainer-lcd-sync-2026-11-14.md)
- [Pemetaan foto asli Sangihe Modul 02](docs/module02-sangihe-photo-map.md)
- PR #37: perbaikan pemilihan sembilan foto Meja Editor; #38–#40: Caption Lab dan contoh caption; #41: foto Modul 06; #42: layar penutup; #43: buku saku digital dan unduhan PDF.

**Pedoman bekerja:** baca [AGENTS.md](AGENTS.md) sebelum menyentuh kode. Buat perubahan kecil, jaga privasi data peserta, pisahkan pengujian lokal dari produksi, dan jangan menyatakan deploy berhasil hanya karena PR telah di-merge.

**Kontak trainer:** Ronny Adolof Buol · ronny.buol@gmail.com · WhatsApp 085256510522 · Instagram [@ronnybuol](https://www.instagram.com/ronnybuol/).

---

**Status dokumentasi:** diselaraskan dengan **kode `main` per 15 November 2026**, tetapi ketersediaan objek R2 dan versi Cloudflare yang sedang aktif **harus diperiksa di lingkungan live**. README ini merupakan petunjuk operasional, bukan sertifikat kelulusan seluruh skenario end-to-end.
