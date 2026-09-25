import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM objectives WHERE 1=1';
    const params = [];
    
    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, name, progress, target, deadline } = req.body;
    
    const objectiveId = id || `OBJ-${Date.now()}`;
    const query = `
      INSERT INTO objectives (id, project_id, name, progress, target, deadline)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      objectiveId,
      projectId,
      name,
      progress || 0,
      target || 100,
      deadline || null
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, progress, target, deadline } = req.body;
    
    const query = `
      UPDATE objectives
      SET 
        name = COALESCE($1, name),
        progress = COALESCE($2, progress),
        target = COALESCE($3, target),
        deadline = COALESCE($4, deadline)
      WHERE id = $5
      RETURNING *
    `;
    const params = [name, progress, target, deadline, id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Objectif non trouvé' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM objectives WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Objectif non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
