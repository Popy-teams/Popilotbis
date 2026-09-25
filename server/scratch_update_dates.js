import { pool } from './src/db.js';

const PROJECT_ID = 'popy';

async function run() {
  try {
    // 1. All documentation and early planning to "completed" -> 'done' for tasks, 'completed' for gantt if allowed?
    // Wait, let's check gantt_items status first. 
    // Wait, I will just set gantt status to 'completed' as it might be allowed, or 'done' if the same.
    const docKeywords = [
      'Rédaction', 'Définition', 'Gantt', 'Allocation', 'Plan de charge',
      'Identification', 'Scoring', 'Plans', 'Cartographie', 'Procédure',
      'Recueil', 'Modélisation base données', 'Wireframes'
    ];
    
    for (let kw of docKeywords) {
      await pool.query(`
        UPDATE tasks SET status = 'done', progress = 100 
        WHERE project_id = $1 AND title ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
      
      await pool.query(`
        UPDATE gantt_items SET status = 'completed', progress = 100,
        start_date = '2026-02-01', end_date = '2026-06-01'
        WHERE project_id = $1 AND label ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
    }

    // 2. Hosting & CI/CD "in-progress" in Sept 2026
    const cicdTasks = ['Choix hébergeur', 'Création serveur', 'Mise en place CI/CD'];
    for (let kw of cicdTasks) {
      await pool.query(`
        UPDATE tasks SET status = 'in-progress', progress = 50, due_date = '2026-09-30'
        WHERE project_id = $1 AND title ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
      
      await pool.query(`
        UPDATE gantt_items SET status = 'in-progress', progress = 50,
        start_date = '2026-09-01', end_date = '2026-09-30'
        WHERE project_id = $1 AND label ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
    }

    // 3. Plateforme Web (Parents/Enseignants/API) -> Oct/Nov/Dec 2026
    const webTasks = ['CRUD', 'Module KPI', 'Dashboard', 'API gestion', 'Chiffrement', 'Création compte parent', 'Interface enseignants'];
    for (let kw of webTasks) {
      await pool.query(`
        UPDATE tasks SET due_date = '2026-11-30', status = 'todo', progress = 0
        WHERE project_id = $1 AND title ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
      
      await pool.query(`
        UPDATE gantt_items SET start_date = '2026-10-01', end_date = '2026-11-30', status = 'planned'
        WHERE project_id = $1 AND label ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
    }

    // 4. Hardware start in Jan 2027
    const hwTasks = ['Modélisation 3D', 'Simulation chute', 'Schéma alimentation', 'PCB V1', 'Installation OS', 'Assemblage V1', 'Prototype V2'];
    for (let kw of hwTasks) {
      await pool.query(`
        UPDATE tasks SET due_date = '2027-02-28', status = 'todo', progress = 0
        WHERE project_id = $1 AND title ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
      
      await pool.query(`
        UPDATE gantt_items SET start_date = '2027-01-01', end_date = '2027-02-28', status = 'planned'
        WHERE project_id = $1 AND label ILIKE $2
      `, [PROJECT_ID, `%${kw}%`]);
    }

    // AI local storage
    await pool.query(`
      UPDATE gantt_items SET start_date = '2027-01-01', end_date = '2027-03-30', status = 'planned'
      WHERE project_id = $1 AND label ILIKE '%Module pédagogique embarqué%'
    `, [PROJECT_ID]);
    
    await pool.query(`
      UPDATE tasks SET due_date = '2027-03-30', status = 'todo', progress = 0
      WHERE project_id = $1 AND title ILIKE '%Module pédagogique embarqué%'
    `, [PROJECT_ID]);

    // Insert BOM task in Dec 2026
    const res = await pool.query(`SELECT tm.id FROM team_members tm WHERE tm.project_id = $1 AND tm.role ILIKE '%IoT%' LIMIT 1`, [PROJECT_ID]);
    if (res.rows.length > 0) {
      const assignee = res.rows[0].id;
      const taskId = `task-${Date.now()}-BOM`;
      await pool.query(`
        INSERT INTO tasks (id, title, project_id, assigned_to, status, priority, due_date, progress)
        VALUES ($1, 'Rendu BOM (Bill of Materials)', $2, $3, 'todo', 'high', '2026-12-15', 0)
      `, [taskId, PROJECT_ID, assignee]);

      const ganttId = `gantt-${Date.now()}-BOM`;
      await pool.query(`
        INSERT INTO gantt_items (id, project_id, label, start_date, end_date, progress, status, assignee, task_id)
        VALUES ($1, $2, 'Rendu BOM (Bill of Materials)', '2026-12-01', '2026-12-15', 0, 'planned', $3, $4)
      `, [ganttId, PROJECT_ID, assignee, taskId]);
    }

    console.log("DONE updating timeline");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
