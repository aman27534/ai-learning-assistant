import Database = require('better-sqlite3');

const db: any = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : 'learning.db');

export const initDb = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      preferences TEXT, -- JSON
      skill_levels TEXT, -- JSON
      learning_goals TEXT, -- JSON
      progress_history TEXT, -- JSON
      created_at TEXT,
      updated_at TEXT
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      status TEXT NOT NULL,
      current_difficulty TEXT,
      learning_path TEXT, -- JSON
      progress TEXT, -- JSON
      start_time TEXT,
      end_time TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Session Metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_metrics (
      session_id TEXT PRIMARY KEY,
      duration INTEGER DEFAULT 0,
      concepts_covered INTEGER DEFAULT 0,
      exercises_completed INTEGER DEFAULT 0,
      hints_used INTEGER DEFAULT 0,
      average_accuracy REAL DEFAULT 0,
      engagement_score REAL DEFAULT 1.0,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    )
  `);

  // Auth Sessions table (for token management)
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      last_activity TEXT,
      is_active INTEGER, -- boolean 0/1
      metadata TEXT, -- JSON
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Learning DB initialized');
};

export default db;
