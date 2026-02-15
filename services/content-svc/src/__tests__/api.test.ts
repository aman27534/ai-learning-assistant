
import request from 'supertest';
import app from '../index';

describe('Content Service Endpoints', () => {
    it('should return health status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should list content', async () => {
        const res = await request(app).get('/materials');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
