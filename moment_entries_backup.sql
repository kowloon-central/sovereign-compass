PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE moment_entries (
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
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(1,'2026-06-03T14:27:50.921Z','2026-06-03T14:27:50.921Z','patrick-main','Fearful',NULL,NULL,'Fearful','Test pact',3,NULL,NULL,NULL,NULL,1);
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(2,'2026-06-03T14:30:11.929Z','2026-06-03T14:30:11.929Z','patrick-main','Fearful',NULL,NULL,'Fearful','Test pact',3,NULL,NULL,NULL,NULL,1);
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(3,'2026-06-03T14:31:25.090Z','2026-06-03T14:31:25.090Z','patrick-main','Neutral',NULL,NULL,'Neutral','Second go. Log with emotion.',3,NULL,NULL,NULL,NULL,1);
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(4,'2026-06-03T14:37:02.801Z','2026-06-03T14:37:02.801Z','patrick-main','Neutral','Balanced',NULL,'Neutral → Balanced','Input emotion.',3,NULL,NULL,NULL,NULL,1);
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(5,'2026-06-03T14:48:56.072Z','2026-06-03T14:48:56.072Z','patrick-main','Surprised','Amazed',NULL,'Surprised → Amazed','Test again  with emotion.',3,NULL,NULL,NULL,NULL,1);
INSERT INTO "moment_entries" ("id","created_at","updated_at","user_id","primary_emotion","secondary_emotion","leaf_emotion","emotion_path","narrative","intensity","reflection","tags","context","device_info","version") VALUES(6,'2026-06-03T15:00:05.121Z','2026-06-03T15:00:05.121Z','patrick-main','Bad',NULL,NULL,'Bad','abc',3,NULL,NULL,NULL,NULL,1);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('moment_entries',6);
