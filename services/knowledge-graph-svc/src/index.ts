import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createConcept, getConcept, createRelationship, getRelated } from './controllers/graph.controller';
import { initDb } from './db';

dotenv.config();

const app = express();
if (process.env.NODE_ENV !== 'test') {
    initDb();
}
const port = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'knowledge-graph-service',
        timestamp: new Date().toISOString()
    });
});

// Graph API Routes
app.post('/concepts', createConcept);
app.get('/concepts/:name', getConcept);
app.post('/relationships', createRelationship);
app.get('/concepts/:name/related', getRelated);

// Only start server if run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Knowledge Graph Service running on port ${port}`);
    });
}

export default app;
