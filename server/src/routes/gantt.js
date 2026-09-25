import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Obtenir le gantt d'un projet
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT g.*, u.name AS assignee_name 
       FROM gantt_items g
       LEFT JOIN team_members tm ON g.assignee = tm.id
       LEFT JOIN users u ON tm.user_id = u.id
       WHERE g.project_id = $1 
       ORDER BY g.start_date ASC`,
      [projectId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Créer un item
router.post('/', async (req, res) => {
  try {
    const { id, projectId, label, startDate, endDate, progress, status, assignee, parentId, taskId, meetingId } = req.body;
    
    const query = `
      INSERT INTO gantt_items (id, project_id, label, start_date, end_date, progress, status, assignee, parent_id, task_id, meeting_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      id, projectId, label, startDate, endDate, progress || 0,
      status || 'planned', assignee || null, parentId || null, taskId || null, meetingId || null
    ];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mettre à jour un item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, startDate, endDate, progress, status, assignee, parentId, taskId, meetingId } = req.body;
    
    const query = `
      UPDATE gantt_items 
      SET 
        label = COALESCE($1, label),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        progress = COALESCE($4, progress),
        status = COALESCE($5, status),
        assignee = COALESCE($6, assignee),
        parent_id = COALESCE($7, parent_id),
        task_id = COALESCE($8, task_id),
        meeting_id = COALESCE($9, meeting_id),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
    const params = [
      label, startDate, endDate, progress, status, assignee, parentId, taskId, meetingId, id
    ];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Item non trouvé' });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supprimer un item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gantt_items WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
