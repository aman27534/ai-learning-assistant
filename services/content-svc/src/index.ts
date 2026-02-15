import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { getMaterials, getMaterialById, addMaterial } from './controllers/content.controller';
import { initDb } from './db';

const app = express();
const port = process.env.PORT || 3004;

if (process.env.NODE_ENV !== 'test') {
    initDb();
}

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'content-service',
        timestamp: new Date().toISOString()
    });
});

// APIs
app.get('/materials', getMaterials);
app.post('/materials', addMaterial);
app.get('/materials/:id', getMaterialById);

// Start server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Content Service running on port ${port}`);
    });
}

export default app;
