-- D1 lama sudah memiliki tabel sessions. Jalankan SEKALI di Cloudflare D1 Console:
ALTER TABLE sessions ADD COLUMN camera_json TEXT NOT NULL DEFAULT '{"a":1,"s":3,"i":1}';
