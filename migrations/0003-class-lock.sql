-- Migrasi aditif penguncian kelas, tidak menghapus data.
ALTER TABLE sessions ADD COLUMN is_locked INTEGER NOT NULL DEFAULT 0;
-- Jangan jalankan dua kali; Worker juga mengaplikasikan migrasi otomatis secara idempoten.
