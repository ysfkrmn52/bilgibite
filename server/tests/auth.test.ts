// Unit tests for authentication and security
import request from 'supertest';
import { app } from '../index';

describe('Authentication Tests', () => {
  
  describe('Protected Routes', () => {
    test('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/users/test-user/progress')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('should return 403 for invalid token', async () => {
      const response = await request(app)
        .get('/api/users/test-user/progress')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Input Validation', () => {
    test('should validate user creation payload', async () => {
      const invalidPayload = {
        username: '', // Invalid empty username
        email: 'invalid-email', // Invalid email format
        password: '123' // Too short password
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(3);
    });

    test('should sanitize HTML input', async () => {
      const payload = {
        username: '<script>alert("xss")</script>test',
        email: 'test@example.com',
        password: 'validpassword123'
      };

      // This would need a valid auth token in real implementation
      const response = await request(app)
        .post('/api/users')
        .send(payload);

      // Should strip HTML tags
      expect(response.body.username).toBe('test');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on auth endpoints', async () => {
      // Make multiple requests rapidly
      const requests = Array(6).fill(null).map(() => 
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password' })
      );

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toBe('Too many requests');
    });
  });
});

describe('Security Headers', () => {
  test('should include security headers in response', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-xss-protection']).toBeDefined();
  });
});