import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// 1. Lister les réunions
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];
    
    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer une réunion
router.post('/', async (req, res) => {
  try {
    const { id, title, date, duration, project_id, meeting_type, status, participant_ids, writer_name } = req.body;
    const meetingId = id || `MEET-${Date.now()}`;
    
    const query = `
      INSERT INTO meetings (id, title, date, duration, project_id, meeting_type, status, participant_ids, writer_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      meetingId, 
      title, 
      date, 
      duration || 60, 
      project_id, 
      meeting_type || 'standard', 
      status || 'planned',
      participant_ids ? JSON.stringify(participant_ids) : '[]',
      writer_name || null
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Modifier une réunion (ex: ajouter un compte-rendu)
router.put('/:id', async (req, res) => {
  try {
    const { title, date, duration, meeting_type, status, report, participant_ids, writer_name } = req.body;
    
    const query = `
      UPDATE meetings 
      SET 
        title = COALESCE($1, title),
        date = COALESCE($2, date),
        duration = COALESCE($3, duration),
        meeting_type = COALESCE($4, meeting_type),
        status = COALESCE($5, status),
        report = COALESCE($6, report),
        participant_ids = COALESCE($7::jsonb, participant_ids),
        writer_name = COALESCE($8, writer_name),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const parsedParticipantIds = participant_ids ? JSON.stringify(participant_ids) : null;
    const params = [title, date, duration, meeting_type, status, report, parsedParticipantIds, writer_name, req.params.id];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Réunion non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Supprimer / Annuler une réunion
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Réunion non trouvée' });
    }
    res.json({ success: true, data: { message: 'Réunion supprimée' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
