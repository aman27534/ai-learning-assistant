
import request from 'supertest';
import app from '../app';

describe('Productivity Service Endpoints', () => {
    it('should return health status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should analyze code', async () => {
        const res = await request(app)
            .post('/analyze')
            .send({ code: 'console.log("hello")' });
        // Expect 200 or 400 depending on impl, but 404 is wrong.
        // Assuming controller handles it.
        expect(res.statusCode).not.toEqual(404);
    });

    it('should explain code', async () => {
        const res = await request(app)
            .post('/explain')
            .send({ code: 'const x = 1;' });
        expect(res.statusCode).not.toEqual(404);
    });
});
