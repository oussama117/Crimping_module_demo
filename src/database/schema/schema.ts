export const __SCHEMA = `
  CREATE TABLE IF NOT EXISTS trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    registration_number INTEGER UNIQUE NOT NULL,
    turns_m INTEGER DEFAULT 0,
    result TEXT CHECK(result IN ('success', 'failure')) DEFAULT 'failure',
    level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER IF NOT EXISTS update_trail_timestamp 
  AFTER UPDATE ON trail
  BEGIN
    UPDATE trail SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`
