import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/mailer.js';

const router = Router();

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: Boolean(row.email_verified_at),
    createdAt: row.created_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {};
    if (!email?.trim() || !password || !name?.trim()) {
      return res.status(400).json({ success: false, error: 'Email, mot de passe et nom requis' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Mot de passe : 8 caractères minimum' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, password_hash, name, email_verified_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, name, role, email_verified_at, created_at`,
      [email.trim().toLowerCase(), passwordHash, name.trim()]
    );

    const user = publicUser(result.rows[0]);
    const token = signToken(user);

    try {
      await sendWelcomeEmail({ to: user.email, name: user.name });
    } catch (mailErr) {
      console.warn('Welcome email failed:', mailErr.message);
    }

    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Cet email est déjà utilisé' });
    }
    console.error('register error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
    }

    const result = await query(
      `SELECT id, email, name, role, password_hash, email_verified_at, created_at
       FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
    }

    const user = publicUser(row);
    const token = signToken(user);
    return res.json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, email_verified_at, created_at FROM users WHERE id = $1`,
      [req.user.sub]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    }
    return res.json({ success: true, data: publicUser(result.rows[0]) });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email?.trim()) {
      return res.status(400).json({ success: false, error: 'Email requis' });
    }

    const result = await query(`SELECT id, email, name FROM users WHERE email = $1`, [
      email.trim().toLowerCase(),
    ]);

    const row = result.rows[0];
    if (row) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [row.id, tokenHash, expiresAt]
      );

      try {
        await sendPasswordResetEmail({ to: row.email, name: row.name, token: rawToken });
      } catch (mailErr) {
        console.warn('Reset email failed:', mailErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Si un compte existe, un email de réinitialisation a été envoyé.',
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token et mot de passe requis' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Mot de passe : 8 caractères minimum' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenResult = await query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [tokenHash]
    );

    const resetRow = tokenResult.rows[0];
    if (!resetRow) {
      return res.status(400).json({ success: false, error: 'Lien invalide ou expiré' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      passwordHash,
      resetRow.user_id,
    ]);
    await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [resetRow.id]);

    return res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
