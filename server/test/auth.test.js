import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/createApp.js';
import { ensureSchema, seedDefaultAdmin } from '../src/scripts/seed.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('API Popilot', { skip: !hasDatabase ? 'DATABASE_URL requis' : false }, () => {
  const app = createApp();

  before(async () => {
    await ensureSchema();
    await seedDefaultAdmin();
  });

  describe('GET /api/health', () => {
    it('retourne ok si la base est joignable', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'ok');
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejette une requête sans identifiants', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('rejette des identifiants invalides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpass' });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('accepte le compte admin par défaut', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@popilot.com', password: 'Popilot2026!' });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.equal(res.body.data.user.email, 'admin@popilot.com');
    });
  });

  describe('POST /api/auth/register', () => {
    it('rejette un mot de passe trop court', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'short', name: 'Test User' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /8 caractères/);
    });
  });

  describe('Routes inconnues', () => {
    it('retourne 404', async () => {
      const res = await request(app).get('/api/inexistant');
      assert.equal(res.status, 404);
    });
  });
});

describe('API sans base de données', () => {
  it('valide les entrées login sans DB', () => {
    if (hasDatabase) return;
    const app = createApp();
    return request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400)
      .then((res) => {
        assert.equal(res.body.success, false);
      });
  });
});
