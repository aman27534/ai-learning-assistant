import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'knowledge_graph.db');
const db = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : dbPath);

export const initDb = () => {
  // Create Nodes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Edges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_node TEXT NOT NULL,
      to_node TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_node) REFERENCES nodes(name),
      FOREIGN KEY(to_node) REFERENCES nodes(name),
      UNIQUE(from_node, to_node, type)
    )
  `);

  console.log('Knowledge Graph DB initialized');
};

export default db;
