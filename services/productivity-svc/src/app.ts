import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { analyzeCode, debugCode, explainCode } from './controllers/productivity.controller';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'productivity-service',
        timestamp: new Date().toISOString()
    });
});

// Analysis Routes
app.post('/analyze', analyzeCode);
app.post('/debug', debugCode);
app.post('/explain', explainCode);

// Basic route to verify connectivity
app.get('/', (req, res) => {
    res.send('AI Learning Assistant - Productivity Service');
});

export default app;
