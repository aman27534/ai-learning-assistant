import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { getDashboard, trackEvent } from './controllers/analytics.controller';
import { initDb } from './db';

const app = express();
const port = process.env.PORT || 3005;

initDb();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'analytics-service',
        timestamp: new Date().toISOString()
    });
});

// APIs
app.get('/dashboard', getDashboard);
app.post('/events', trackEvent);

// Start server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Analytics Service running on port ${port}`);
    });
}

export default app;
