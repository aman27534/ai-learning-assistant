import request from 'supertest';
import app from '../index';

describe('Learning Service API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register a test user
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(registerResponse.status).toBe(200);
    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('learning-service');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Learning Sessions', () => {
    it('should create a learning session', async () => {
      const response = await request(app)
        .post('/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'javascript-basics'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.topic).toBe('javascript-basics');
      expect(response.body.data.status).toBe('active');
    });

    it('should require authentication for sessions', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          topic: 'javascript-basics'
        });

      expect(response.status).toBe(401);
    });

    it('should get active sessions', async () => {
      const response = await request(app)
        .get('/sessions/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Learning Content', () => {
    it('should get personalized recommendations', async () => {
      const response = await request(app)
        .get('/recommendations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get learning insights', async () => {
      const response = await request(app)
        .get('/insights')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overallProgress).toBeDefined();
    });

    it('should track progress', async () => {
      const response = await request(app)
        .post('/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          concept: 'javascript-basics',
          mastery: 0.8
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});