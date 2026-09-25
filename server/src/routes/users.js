import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Lister tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    // req.user.id vient du middleware d'authentification (le token)
    const userId = req.user.id;

    // Mise à jour uniquement du nom et de l'email (on ne modifie pas le rôle ni le mot de passe ici)
    const query = `
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const params = [name, email, userId];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    // Si l'email est déjà utilisé par quelqu'un d'autre (violation d'unicité)
    if (err.code === '23505') { 
      return res.status(400).json({ success: false, error: 'Cet email est déjà utilisé par un autre compte.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
