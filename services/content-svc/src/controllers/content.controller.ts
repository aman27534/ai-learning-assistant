import { Request, Response } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getMaterials = async (req: Request, res: Response) => {
    try {
        const stmt = db.prepare('SELECT * FROM Material');
        const materialsRaw = stmt.all();

        // Deserialize tags string back to array
        const materials = materialsRaw.map((m: any) => ({
            ...m,
            tags: m.tags ? m.tags.split(',') : []
        }));
        res.json({ success: true, data: materials });
    } catch (error: any) {
        console.error('Content Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMaterialById = async (req: Request, res: Response) => {
    try {
        const stmt = db.prepare('SELECT * FROM Material WHERE id = ?');
        const material: any = stmt.get(req.params.id);

        if (!material) return res.status(404).json({ error: 'Material not found' });

        const formatted = {
            ...material,
            tags: material.tags ? material.tags.split(',') : []
        };

        res.json({ success: true, data: formatted });
    } catch (error: any) {
        console.error('Content Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addMaterial = async (req: Request, res: Response) => {
    try {
        const { title, type, url, description, tags } = req.body;

        if (!title || !type || !url) {
            return res.status(400).json({ error: 'Title, type, and URL are required' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

        const stmt = db.prepare(`
            INSERT INTO Material (id, title, type, url, description, tags, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, title, type, url, description, tagsString, now, now);

        const newMaterial = {
            id, title, type, url, description,
            tags: tagsString ? tagsString.split(',') : [],
            createdAt: now, updatedAt: now
        };

        console.log(`[Content] Material added: ${title}`);

        res.status(201).json({ success: true, data: newMaterial });
    } catch (error: any) {
        console.error('Content Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
