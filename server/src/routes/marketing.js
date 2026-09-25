import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM marketing_actions WHERE project_id = $1 ORDER BY date ASC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, title, type, budget, target, status, roiExpected, date } = req.body;
    
    const query = `
      INSERT INTO marketing_actions (id, project_id, title, type, budget, target, status, roi_expected, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [id, projectId, title, type, budget || 0, target, status || 'planned', roiExpected || null, date || null];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, budget, target, status, roiExpected, date } = req.body;
    
    const query = `
      UPDATE marketing_actions 
      SET 
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        budget = COALESCE($3, budget),
        target = COALESCE($4, target),
        status = COALESCE($5, status),
        roi_expected = COALESCE($6, roi_expected),
        date = COALESCE($7, date),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const params = [title, type, budget, target, status, roiExpected, date, id];
    
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
    await pool.query('DELETE FROM marketing_actions WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
