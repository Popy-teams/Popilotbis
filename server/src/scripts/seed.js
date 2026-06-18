import bcrypt from 'bcryptjs';
import { query } from '../db.js';

export async function ensureSchema() {
  await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function seedDefaultAdmin() {
  const email = 'admin@popilot.com';
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) return;

  const passwordHash = await bcrypt.hash('Popilot2026!', 10);
  await query(
    `INSERT INTO users (id, email, password_hash, name, role, email_verified_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [
      'a0000000-0000-4000-8000-000000000001',
      email,
      passwordHash,
      'Jean Dupont',
      'admin',
    ]
  );
  console.log('Default admin user seeded (admin@popilot.com)');
}
