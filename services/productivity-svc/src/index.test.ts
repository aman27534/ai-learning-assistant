import request from 'supertest';
import app from './app';

describe('Productivity Service API', () => {
    it('GET /health should return 200 and healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('healthy');
        expect(res.body.service).toBe('productivity-service');
    });

    it('GET / should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('AI Learning Assistant - Productivity Service');
    });
});
