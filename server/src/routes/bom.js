import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// 1. Lister tous les composants (BOM)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bom_components ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer un composant
router.post('/', async (req, res) => {
  const { id, project_id, category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bom_components (id, project_id, category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [id, project_id, category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Modifier un composant
router.put('/:id', async (req, res) => {
  const { category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bom_components 
       SET category = COALESCE($1, category),
           name = COALESCE($2, name),
           functional_name = COALESCE($3, functional_name),
           example = COALESCE($4, example),
           quantity = COALESCE($5, quantity),
           unit_price_estimated = COALESCE($6, unit_price_estimated),
           total_estimated = COALESCE($7, total_estimated),
           unit_price_actual = COALESCE($8, unit_price_actual),
           total_actual = COALESCE($9, total_actual),
           status = COALESCE($10, status),
           supplier_id = COALESCE($11, supplier_id),
           price_source = COALESCE($12, price_source),
           criticality = COALESCE($13, criticality),
           updated_at = NOW()
       WHERE id = $14 RETURNING *`,
      [category, name, functional_name, example, quantity, unit_price_estimated, total_estimated, unit_price_actual, total_actual, status, supplier_id, price_source, criticality, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Composant non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Supprimer un composant
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bom_components WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Composant non trouvé' });
    }
    res.json({ success: true, data: { message: 'Composant supprimé' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
