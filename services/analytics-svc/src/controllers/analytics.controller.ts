import { Request, Response } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

// In-memory fallback for active user count simulation (or use Redis in production)
let activeUserCount = 5;

export const getDashboard = async (req: Request, res: Response) => {
    try {
        // Calculate stats using DB aggregations
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM Event');
        const totalEvents = (countStmt.get() as any).count;

        const completedStmt = db.prepare("SELECT COUNT(*) as count FROM Event WHERE type = 'session_complete'");
        const completedSessions = (completedStmt.get() as any).count;

        // Get recent events
        const recentStmt = db.prepare('SELECT * FROM Event ORDER BY timestamp DESC LIMIT 10');
        const recentEventsRaw = recentStmt.all();

        const recentEvents = recentEventsRaw.map((e: any) => ({
            ...e,
            metadata: e.metadata ? JSON.parse(e.metadata) : {}
        }));

        const stats = {
            users: 42 + Math.floor(totalEvents / 10), // Logic preserved from original
            completedSessions: 128 + completedSessions, // Logic preserved + DB count
            activeNow: activeUserCount,
            recentEvents
        };

        res.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Analytics Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

export const trackEvent = async (req: Request, res: Response) => {
    try {
        const { type, userId, metadata } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Event type is required' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const metadataString = metadata ? JSON.stringify(metadata) : null;

        const stmt = db.prepare(`
            INSERT INTO Event (id, type, userId, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(id, type, userId, metadataString, now);

        // Simulate activity changes
        if (Math.random() > 0.7) activeUserCount++;
        if (Math.random() > 0.8 && activeUserCount > 0) activeUserCount--;

        console.log(`[Analytics] Event tracked: ${type}`);

        res.json({ success: true, message: 'Event tracked', eventId: id });
    } catch (error: any) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
