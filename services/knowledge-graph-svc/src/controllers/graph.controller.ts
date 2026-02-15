import { Request, Response } from 'express';
import { graphService } from '../services/graph.service';

export const createConcept = async (req: Request, res: Response) => {
    try {
        const { name, description, type } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const result = await graphService.createConcept(name, description, type || 'General');
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Create Concept Error:', error);
        // Graceful fallback if DB is down
        res.status(503).json({ error: 'Graph database unavailable', details: error.message });
    }
};

export const getConcept = async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        const result = await graphService.getConcept(name);
        if (!result) return res.status(404).json({ error: 'Concept not found' });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(503).json({ error: 'Graph database unavailable' });
    }
};

export const createRelationship = async (req: Request, res: Response) => {
    try {
        const { from, to, type } = req.body;
        const result = await graphService.createRelationship(from, to, type);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(503).json({ error: 'Graph database unavailable' });
    }
};

export const getRelated = async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        const result = await graphService.getRelatedConcepts(name);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(503).json({ error: 'Graph database unavailable' });
    }
};
