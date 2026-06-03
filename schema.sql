CREATE TABLE IF NOT EXISTS moment_entries (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    user_id           TEXT,
    primary_emotion   TEXT NOT NULL,
    secondary_emotion TEXT,
    leaf_emotion      TEXT,
    emotion_path      TEXT,
    narrative         TEXT,
    intensity         INTEGER CHECK (intensity BETWEEN 1 AND 5),
    reflection        TEXT,
    tags              TEXT,
    context           TEXT,
    device_info       TEXT,
    version           INTEGER DEFAULT 1
);