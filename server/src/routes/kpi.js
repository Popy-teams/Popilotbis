import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM kpi_metrics WHERE project_id = $1', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, categoryId, name, objective, measurementMethod, responsible, targetThreshold, thresholdKind, targetNumeric, unit, currentValue, previousValue, status, trend } = req.body;
    
    const query = `
      INSERT INTO kpi_metrics (id, project_id, category_id, name, objective, measurement_method, responsible, target_threshold, threshold_kind, target_numeric, unit, current_value, previous_value, status, trend)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const params = [
      id, projectId, categoryId, name, objective || null, measurementMethod || null, responsible || null,
      targetThreshold || null, thresholdKind, targetNumeric || null, unit || null,
      currentValue || 0, previousValue || 0, status || 'good', trend || 'stable'
    ];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, objective, measurementMethod, responsible, targetThreshold, thresholdKind, targetNumeric, unit, currentValue, previousValue, status, trend } = req.body;
    
    const query = `
      UPDATE kpi_metrics 
      SET 
        name = COALESCE($1, name),
        objective = COALESCE($2, objective),
        measurement_method = COALESCE($3, measurement_method),
        responsible = COALESCE($4, responsible),
        target_threshold = COALESCE($5, target_threshold),
        threshold_kind = COALESCE($6, threshold_kind),
        target_numeric = COALESCE($7, target_numeric),
        unit = COALESCE($8, unit),
        current_value = COALESCE($9, current_value),
        previous_value = COALESCE($10, previous_value),
        status = COALESCE($11, status),
        trend = COALESCE($12, trend),
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;
    const params = [
      name, objective, measurementMethod, responsible, targetThreshold, thresholdKind, targetNumeric, unit, currentValue, previousValue, status, trend, id
    ];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'KPI non trouvé' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM kpi_metrics WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
