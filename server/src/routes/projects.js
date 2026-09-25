import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes projets
router.use(requireAuth);

// 1. Lister tous les projets
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Récupérer les membres de l'équipe pour chaque projet pour peupler participantIds
    const teamMembersResult = await pool.query('SELECT project_id, user_id FROM team_members');
    const participantsByProject = {};
    for (const row of teamMembersResult.rows) {
      if (!participantsByProject[row.project_id]) {
        participantsByProject[row.project_id] = [];
      }
      participantsByProject[row.project_id].push(row.user_id);
    }
    
    const projectsWithParticipants = result.rows.map(p => ({
      ...p,
      participantIds: participantsByProject[p.id] || []
    }));

    res.json({ success: true, data: projectsWithParticipants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Créer un projet
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    // Accepte à la fois budget_total (format SQL) et budget.total (format frontend)
    const budgetTotal = body.budget_total ?? body.budget?.total ?? 0;
    const projectId = body.id || `PRJ-${Date.now()}`;

    if (!body.name?.trim()) {
      return res.status(400).json({ success: false, error: 'Le nom du projet est requis' });
    }
    if (!body.deadline) {
      return res.status(400).json({ success: false, error: 'La date d\'échéance est requise' });
    }

    const query = `
      INSERT INTO projects (id, name, description, status, priority, progress, deadline, budget_total, owner)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      projectId,
      body.name.trim(),
      body.description || '',
      body.status || 'on-track',
      body.priority || 'medium',
      body.progress || 0,
      body.deadline,
      budgetTotal,
      body.owner || req.user.name
    ];
    
    const result = await pool.query(query, params);
    const newProject = result.rows[0];

    // Synchronisation des participants avec l'équipe
    if (body.participantIds && Array.isArray(body.participantIds)) {
      for (const userId of body.participantIds) {
        // Ignorer l'owner s'il est déjà ajouté ou non présent dans les users, on ajoute juste ceux sélectionnés
        const teamMemberId = `TM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        try {
          await pool.query(
            `INSERT INTO team_members (id, user_id, project_id, role, availability)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, project_id) DO NOTHING`,
            [teamMemberId, userId, projectId, 'Membre', 'Disponible']
          );
        } catch (err) {
          console.error(`Erreur lors de l'ajout du participant ${userId} à l'équipe:`, err);
        }
      }
    }

    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 3. Récupérer un projet spécifique
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Modifier un projet
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    const budgetTotal = body.budget_total ?? body.budget?.total;
    const budgetUsed = body.budget_used ?? body.budget?.used;
    
    const query = `
      UPDATE projects 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        progress = COALESCE($5, progress),
        deadline = COALESCE($6, deadline),
        budget_total = COALESCE($7, budget_total),
        budget_used = COALESCE($8, budget_used),
        owner = COALESCE($9, owner),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
    const params = [
      body.name, body.description, body.status, body.priority, body.progress, 
      body.deadline, budgetTotal, budgetUsed, body.owner, req.params.id
    ];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    }
    const updatedProject = result.rows[0];

    // Synchronisation des participants avec la table team_members
    if (body.participantIds && Array.isArray(body.participantIds)) {
      if (body.participantIds.length > 0) {
        const placeholders = body.participantIds.map((_, i) => `$${i + 2}`).join(',');
        await pool.query(
          `DELETE FROM team_members WHERE project_id = $1 AND user_id NOT IN (${placeholders})`,
          [req.params.id, ...body.participantIds]
        );
      } else {
        await pool.query('DELETE FROM team_members WHERE project_id = $1', [req.params.id]);
      }

      for (const userId of body.participantIds) {
        const teamMemberId = `TM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        try {
          await pool.query(
            `INSERT INTO team_members (id, user_id, project_id, role, availability)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, project_id) DO NOTHING`,
            [teamMemberId, userId, req.params.id, 'Membre', 'Disponible']
          );
        } catch (err) {
          console.error(`Erreur de synchro pour le participant ${userId}:`, err);
        }
      }
    }

    const membersRes = await pool.query('SELECT user_id FROM team_members WHERE project_id = $1', [req.params.id]);
    updatedProject.participantIds = membersRes.rows.map(r => r.user_id);

    res.json({ success: true, data: updatedProject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projet non trouvé' });
    }
    res.json({ success: true, data: { message: 'Projet supprimé' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
