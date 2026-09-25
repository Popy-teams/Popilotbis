import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM roadmap_phases WHERE project_id = $1 ORDER BY created_at ASC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, name, timeline, status, budget, progress, keyDeliverables } = req.body;
    
    const query = `
      INSERT INTO roadmap_phases (id, project_id, name, timeline, status, budget, progress, key_deliverables)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [id, projectId, name, timeline, status || 'planned', budget || 0, progress || 0, keyDeliverables || []];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, timeline, status, budget, progress, keyDeliverables } = req.body;
    
    const query = `
      UPDATE roadmap_phases 
      SET 
        name = COALESCE($1, name),
        timeline = COALESCE($2, timeline),
        status = COALESCE($3, status),
        budget = COALESCE($4, budget),
        progress = COALESCE($5, progress),
        key_deliverables = COALESCE($6, key_deliverables),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const params = [name, timeline, status, budget, progress, keyDeliverables, id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Non trouvé' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM roadmap_phases WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
