-- 0002: Username peserta tanpa password, aman untuk data peserta yang sudah ada.
-- Jalankan SATU KALI pada D1 produksi yang sudah dipakai kelas.
-- Tidak menghapus peserta, jawaban, foto, atau progres.
ALTER TABLE participants ADD COLUMN username TEXT;
UPDATE participants
SET username = 'LM-' || UPPER(HEX(RANDOMBLOB(6)))
WHERE username IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_username ON participants(session_id, username);
