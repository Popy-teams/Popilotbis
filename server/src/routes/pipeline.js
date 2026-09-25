import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Obtenir le pipeline d'un projet
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT * FROM pipeline_stages WHERE project_id = $1 ORDER BY "order" ASC',
      [projectId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Créer une phase
router.post('/', async (req, res) => {
  try {
    const { id, projectId, name, order, status, progress, objectives, deliverables, exitCriteria, startDate, endDate, estimatedDuration } = req.body;
    
    const query = `
      INSERT INTO pipeline_stages (id, project_id, name, "order", status, progress, objectives, deliverables, exit_criteria, start_date, end_date, estimated_duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [
      id, projectId, name, order, status, progress || 0,
      objectives || [], deliverables || [], exitCriteria || [],
      startDate || null, endDate || null, estimatedDuration || null
    ];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mettre à jour une phase
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, status, progress, objectives, deliverables, exitCriteria, startDate, endDate, estimatedDuration } = req.body;
    
    const query = `
      UPDATE pipeline_stages 
      SET 
        name = COALESCE($1, name),
        "order" = COALESCE($2, "order"),
        status = COALESCE($3, status),
        progress = COALESCE($4, progress),
        objectives = COALESCE($5, objectives),
        deliverables = COALESCE($6, deliverables),
        exit_criteria = COALESCE($7, exit_criteria),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        estimated_duration = COALESCE($10, estimated_duration),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `;
    const params = [
      name, order, status, progress, objectives, deliverables, exitCriteria, startDate, endDate, estimatedDuration, id
    ];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Phase non trouvée' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supprimer une phase
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pipeline_stages WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
