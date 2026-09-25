import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// 1. Lister tous les risques
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer un risque
router.post('/', async (req, res) => {
  const { id, project_id, title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO risks (id, project_id, title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [id, project_id, title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Modifier un risque
router.put('/:id', async (req, res) => {
  const { title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy } = req.body;
  try {
    const result = await pool.query(
      `UPDATE risks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           type = COALESCE($4, type),
           status = COALESCE($5, status),
           probability = COALESCE($6, probability),
           impact_cost = COALESCE($7, impact_cost),
           impact_delay = COALESCE($8, impact_delay),
           impact_quality = COALESCE($9, impact_quality),
           impact_security = COALESCE($10, impact_security),
           impact_image = COALESCE($11, impact_image),
           criticality = COALESCE($12, criticality),
           criticality_score = COALESCE($13, criticality_score),
           strategy = COALESCE($14, strategy),
           updated_at = NOW()
       WHERE id = $15 RETURNING *`,
      [title, description, category, type, status, probability, impact_cost, impact_delay, impact_quality, impact_security, impact_image, criticality, criticality_score, strategy, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Risque non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Supprimer un risque
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM risks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Risque non trouvé' });
    }
    res.json({ success: true, data: { message: 'Risque supprimé' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
