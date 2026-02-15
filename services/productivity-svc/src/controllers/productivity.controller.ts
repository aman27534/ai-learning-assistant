import { Request, Response } from 'express';
import { analyzer } from '../services/analyzer'; // Note .js extension for ES modules if needed, or check config. assuming ts-node or build execution.
// Using standard import for now, build system will handle resolution

export const analyzeCode = async (req: Request, res: Response) => {
    try {
        const { code, language } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const result = analyzer.analyze(code, language);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze code' });
    }
};

export const debugCode = async (req: Request, res: Response) => {
    try {
        const { code, error } = req.body;
        const result = analyzer.debug(code, error);
        res.json({ success: true, data: { suggestion: result } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to provide debug info' });
    }
};

export const explainCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const result = analyzer.explain(code);
        res.json({ success: true, data: { explanation: result } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to explain code' });
    }
};
