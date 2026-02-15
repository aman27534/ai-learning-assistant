
import request from 'supertest';
import app from '../index';

describe('Analytics Service Endpoints', () => {
    it('should return health status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should return dashboard stats', async () => {
        const res = await request(app).get('/dashboard');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should accept events', async () => {
        const res = await request(app)
            .post('/events')
            .send({
                type: 'test_event',
                data: { foo: 'bar' }
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
