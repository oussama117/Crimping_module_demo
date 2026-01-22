export const __SCHEMA = `
  CREATE TABLE IF NOT EXISTS trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL, -- Logical Fix: Trail should point to Candidate
    turns_m INTEGER DEFAULT -1,
    result TEXT CHECK(result IN ('success', 'failure', 'init')) DEFAULT 'init',
    level TEXT CHECK(level IN ('level_init', 'level_1', 'level_2', 'level_3')) DEFAULT 'level_init',
    class TEXT CHECK(class IN ('class_init', 'beginner', 'intermediate', 'advanced')) DEFAULT 'class_init',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS candidate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT CHECK(language IN ('fr', 'en', 'ar')) DEFAULT 'fr',
    trail_time INTEGER NOT NULL,
    level_1 INTEGER NOT NULL,
    level_2 INTEGER NOT NULL,
    level_3 INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER IF NOT EXISTS update_candidate_timestamp AFTER UPDATE ON candidate
  BEGIN UPDATE candidate SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

  CREATE TRIGGER IF NOT EXISTS update_trail_timestamp AFTER UPDATE ON trail
  BEGIN UPDATE trail SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

  CREATE TRIGGER IF NOT EXISTS update_app_settings_timestamp AFTER UPDATE ON app_settings
  BEGIN UPDATE app_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

  INSERT OR IGNORE INTO app_settings (id, language, trail_time, level_1, level_2, level_3)
  VALUES (1, 'fr', 60, 60, 90, 110);
`
