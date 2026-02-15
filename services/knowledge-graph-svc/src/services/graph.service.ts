import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

export class GraphService {

    constructor() {
        logger.info('GraphService initialized with SQLite');
    }

    public async close(): Promise<void> {
        // No-op for better-sqlite3 as it runs in-process, but good for interface consistency
    }

    // Basic Concept Operations
    public async createConcept(name: string, description: string, type: string) {
        try {
            const id = uuidv4();
            const stmt = db.prepare('INSERT INTO nodes (id, name, description, type) VALUES (?, ?, ?, ?)');
            stmt.run(id, name, description, type);
            return { id, name, description, type };
        } catch (error: any) {
            logger.error('SQLite Error (createConcept):', error);
            throw error;
        }
    }

    public async getConcept(name: string) {
        try {
            const stmt = db.prepare('SELECT * FROM nodes WHERE name = ?');
            const result = stmt.get(name);
            return result || null;
        } catch (error: any) {
            logger.error('SQLite Error (getConcept):', error);
            throw error;
        }
    }

    public async createRelationship(fromName: string, toName: string, relationType: string) {
        try {
            // Verify nodes exist
            const nodeStmt = db.prepare('SELECT name FROM nodes WHERE name = ?');
            if (!nodeStmt.get(fromName) || !nodeStmt.get(toName)) {
                return null; // One or both nodes missing
            }

            const stmt = db.prepare('INSERT INTO edges (from_node, to_node, type) VALUES (?, ?, ?)');
            const info = stmt.run(fromName, toName, relationType);

            return { id: info.lastInsertRowid, from: fromName, to: toName, type: relationType };
        } catch (error: any) {
            // Check for unique constraint violation (relationship already exists)
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                // Return existing if possible or just null/error depending on desired behavior
                // For now, let's treat it as a success returning the existing one (mock behavior) or just null
                return null;
            }
            logger.error('SQLite Error (createRelationship):', error);
            throw error;
        }
    }

    public async getRelatedConcepts(name: string) {
        try {
            // Find all edges where 'from_node' is 'name'
            const stmt = db.prepare(`
                SELECT e.type as relationship, n.* 
                FROM edges e
                JOIN nodes n ON e.to_node = n.name
                WHERE e.from_node = ?
            `);
            const rows = stmt.all(name);

            return rows.map((row: any) => ({
                relationship: row.relationship,
                concept: {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    type: row.type
                }
            }));
        } catch (error: any) {
            logger.error('SQLite Error (getRelatedConcepts):', error);
            throw error;
        }
    }
}

// Singleton instance
export const graphService = new GraphService();
