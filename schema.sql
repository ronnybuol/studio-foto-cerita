CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  active_stage INTEGER NOT NULL DEFAULT 0 CHECK(active_stage BETWEEN 0 AND 6),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  class_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id,created_at);

CREATE TABLE IF NOT EXISTS answers (
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK(stage IN ('kamera','komposisi','edfat','story','caption','etika')),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(participant_id,stage)
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

INSERT OR IGNORE INTO sessions(id,title,event_date,active_stage)
VALUES('lensa-muda-2026','Studio Foto Cerita — Lensa Muda','2026-11-16',0);
