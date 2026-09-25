import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM dashboard_alerts WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, message, severity } = req.body;
    
    const query = `
      INSERT INTO dashboard_alerts (id, project_id, message, severity)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [id, projectId, message, severity];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, severity } = req.body;
    
    const query = `
      UPDATE dashboard_alerts 
      SET 
        message = COALESCE($1, message),
        severity = COALESCE($2, severity)
      WHERE id = $3
      RETURNING *
    `;
    const params = [message, severity, id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Alert non trouvée' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM dashboard_alerts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
