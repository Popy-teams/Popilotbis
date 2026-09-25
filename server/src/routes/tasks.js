import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// 1. Lister les tâches (avec filtres optionnels)
router.get('/', async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    
    let query = `
      SELECT t.*, u.name AS assigned_to_name 
      FROM tasks t
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (projectId) {
      params.push(projectId);
      query += ` AND t.project_id = $${params.length}`;
    }
    
    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND t.assigned_to = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    
    query += ' ORDER BY t.due_date ASC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer une tâche
router.post('/', async (req, res) => {
  try {
    const { id, title, description, project_id, assigned_to, status, priority, due_date, progress } = req.body;
    const taskId = id || `TSK-${Date.now()}`;
    
    const query = `
      INSERT INTO tasks (id, title, description, project_id, assigned_to, status, priority, due_date, progress)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      taskId, 
      title, 
      description || '', 
      project_id, 
      assigned_to, 
      status || 'todo', 
      priority || 'medium', 
      due_date, 
      progress || 0
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Modifier une tâche
router.put('/:id', async (req, res) => {
  try {
    const { title, description, assigned_to, status, priority, due_date, progress } = req.body;
    
    const query = `
      UPDATE tasks 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assigned_to = COALESCE($3, assigned_to),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        due_date = COALESCE($6, due_date),
        progress = COALESCE($7, progress),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const params = [title, description, assigned_to, status, priority, due_date, progress, req.params.id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tâche non trouvée' });
    }
    res.json({ success: true, data: { message: 'Tâche supprimée' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
