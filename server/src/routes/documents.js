import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// 1. Lister tous les documents ISO
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iso_documents ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer un document
router.post('/', async (req, res) => {
  const { id, project_id, title, type, category, status, responsible, version, valid_until, description, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO iso_documents (id, project_id, title, type, category, status, responsible, version, valid_until, description, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, project_id, title, type, category, status, responsible, version, valid_until, description, content]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Modifier un document
router.put('/:id', async (req, res) => {
  const { title, type, category, status, responsible, version, valid_until, description, content } = req.body;
  try {
    const result = await pool.query(
      `UPDATE iso_documents 
       SET title = COALESCE($1, title),
           type = COALESCE($2, type),
           category = COALESCE($3, category),
           status = COALESCE($4, status),
           responsible = COALESCE($5, responsible),
           version = COALESCE($6, version),
           valid_until = COALESCE($7, valid_until),
           description = COALESCE($8, description),
           content = COALESCE($9, content),
           updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, type, category, status, responsible, version, valid_until, description, content, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Supprimer un document
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM iso_documents WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document non trouvé' });
    }
    res.json({ success: true, data: { message: 'Document supprimé' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
