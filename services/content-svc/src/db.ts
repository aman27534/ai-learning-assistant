import Database from 'better-sqlite3';

const db = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : 'content.db');

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Material (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  console.log('Content DB initialized');
};

export default db;
