import Database from 'better-sqlite3';

const db = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : 'analytics.db');

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Event (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      userId TEXT,
      metadata TEXT,
      timestamp TEXT
    )
  `);
  console.log('Analytics DB initialized');
};

export default db;
