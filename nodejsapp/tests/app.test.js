const request = require('supertest');
const app = require('../src/index.js');

describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});

describe('GET /status', () => {
  it('should return status object', async () => {
    const response = await request(app).get('/status');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('App is running');
  });
});

describe('POST /process', () => {
  it('should return processed message', async () => {
    const response = await request(app)
      .post('/process')
      .send({ data: 'test' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Processed successfully');
  });
});