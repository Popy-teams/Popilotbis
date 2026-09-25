import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Protection des routes
router.use(requireAuth);

// 1. Lister les membres de l'équipe (filtrés par project_id si fourni)
router.get('/', async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = `
      SELECT t.id, t.role, t.availability, t.workload, t.user_id, t.project_id, t.position_ids, u.name, u.email 
      FROM team_members t
      JOIN users u ON t.user_id = u.id
    `;
    const params = [];
    if (project_id) {
      query += ` WHERE t.project_id = $1`;
      params.push(project_id);
    }
    query += ` ORDER BY u.name ASC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Ajouter un membre
router.post('/', async (req, res) => {
  try {
    const { id, user_id, project_id, role, availability, workload, position_ids } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id requis' });
    if (!project_id) return res.status(400).json({ success: false, error: 'project_id requis' });

    const memberId = id || `TM-${Date.now()}`;
    
    const query = `
      INSERT INTO team_members (id, user_id, project_id, role, availability, workload, position_ids)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      memberId, 
      user_id,
      project_id,
      role || 'Membre', 
      availability || 'Disponible', 
      workload || 0,
      position_ids ? JSON.stringify(position_ids) : '[]'
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'Cet utilisateur est déjà membre de ce projet.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});


// 3. Obtenir un membre spécifique
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Membre non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Modifier un membre
router.put('/:id', async (req, res) => {
  try {
    const { role, availability, workload, position_ids } = req.body;
    
    const query = `
      UPDATE team_members 
      SET 
        role = COALESCE($1, role),
        availability = COALESCE($2, availability),
        workload = COALESCE($3, workload),
        position_ids = COALESCE($4, position_ids)
      WHERE id = $5
      RETURNING *
    `;
    const params = [role, availability, workload, position_ids ? JSON.stringify(position_ids) : null, req.params.id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Membre non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Retirer un membre
router.delete('/:id', async (req, res) => {
  try {
    // Note: Dans le schéma, la suppression d'un membre est restreinte (ON DELETE RESTRICT) 
    // s'il a encore des tâches assignées (table tasks). 
    // Cela évitera les problèmes d'intégrité de la base de données.
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Membre non trouvé' });
    }
    res.json({ success: true, data: { message: 'Membre supprimé' } });
  } catch (err) {
    // Gestion d'erreur spécifique pour la contrainte de clé étrangère
    if (err.code === '23503') { // 23503 = foreign_key_violation dans Postgres
      return res.status(400).json({ success: false, error: 'Impossible de supprimer ce membre car des tâches lui sont assignées.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
