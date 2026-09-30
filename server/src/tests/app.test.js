import request from 'supertest';
import app from '../app.js';
test('health endpoint works', async () => {
  const r = await request(app).get('/api/health');
  expect(r.status).toBe(200);
  expect(r.body.ok).toBe(true);
});
test('protected satellite endpoint requires auth', async () => {
  const r = await request(app).get('/api/satellites');
  expect(r.status).toBe(401);
});
