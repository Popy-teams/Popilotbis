import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/surveys/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM client_surveys WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/surveys', async (req, res) => {
  try {
    const { id, projectId, title, description, phase, questions, shareToken, status } = req.body;
    const query = `
      INSERT INTO client_surveys (id, project_id, title, description, phase, questions, share_token, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [id, projectId, title, description || null, phase, JSON.stringify(questions || []), shareToken || null, status || 'draft'];
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, phase, questions, shareToken, status } = req.body;
    const query = `
      UPDATE client_surveys 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        phase = COALESCE($3, phase),
        questions = COALESCE($4, questions),
        share_token = COALESCE($5, share_token),
        status = COALESCE($6, status),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const params = [title, description, phase, questions ? JSON.stringify(questions) : null, shareToken, status, id];
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Non trouvé' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM client_surveys WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/responses/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM survey_responses WHERE project_id = $1 ORDER BY submitted_at DESC', [projectId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/responses', async (req, res) => {
  try {
    const { id, surveyId, surveyTitle, projectId, phase, respondentName, respondentType, answers, csat, ces, nps, verbatim, keyTopics, sentiment, linkedTasks, linkedRisks, status } = req.body;
    const query = `
      INSERT INTO survey_responses (id, survey_id, survey_title, project_id, phase, respondent_name, respondent_type, answers, csat, ces, nps, verbatim, key_topics, sentiment, linked_tasks, linked_risks, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const params = [id, surveyId, surveyTitle, projectId, phase, respondentName || null, respondentType || null, JSON.stringify(answers || {}), csat || null, ces || null, nps || null, verbatim || null, keyTopics || [], sentiment || null, linkedTasks || [], linkedRisks || [], status || 'new'];
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/responses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, linkedTasks, linkedRisks } = req.body;
    const query = `
      UPDATE survey_responses 
      SET 
        status = COALESCE($1, status),
        linked_tasks = COALESCE($2, linked_tasks),
        linked_risks = COALESCE($3, linked_risks)
      WHERE id = $4
      RETURNING *
    `;
    const params = [status, linkedTasks, linkedRisks, id];
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/responses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM survey_responses WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
