import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM veille_entries WHERE project_id = $1 ORDER BY date DESC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, projectId, title, category, impact, source, date, author, summary, link, tags, status } = req.body;
    
    const query = `
      INSERT INTO veille_entries (id, project_id, title, category, impact, source, date, author, summary, link, tags, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [id, projectId, title, category, impact, source, date, author || null, summary || null, link || null, tags || [], status || 'new'];
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, impact, source, date, author, summary, link, tags, status } = req.body;
    
    const query = `
      UPDATE veille_entries 
      SET 
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        impact = COALESCE($3, impact),
        source = COALESCE($4, source),
        date = COALESCE($5, date),
        author = COALESCE($6, author),
        summary = COALESCE($7, summary),
        link = COALESCE($8, link),
        tags = COALESCE($9, tags),
        status = COALESCE($10, status),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `;
    const params = [title, category, impact, source, date, author, summary, link, tags, status, id];
    
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
    await pool.query('DELETE FROM veille_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
