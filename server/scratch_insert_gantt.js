import { pool } from './src/db.js';

const PROJECT_ID = 'popy';

const TASKS = [
  // LOT 0
  { title: "Rédaction charte projet", lot: 0, start: "2026-02-01", end: "2026-02-15", group: "QA/Management" },
  { title: "Définition vision produit", lot: 0, start: "2026-02-15", end: "2026-03-01", group: "QA/Management" },
  { title: "Définition roadmap produit", lot: 0, start: "2026-03-01", end: "2026-03-15", group: "QA/Management" },
  { title: "Définition MVP V1", lot: 0, start: "2026-03-15", end: "2026-04-01", group: "QA/Management" },
  { title: "Définition version cible V2", lot: 0, start: "2026-04-01", end: "2026-04-15", group: "QA/Management" },
  { title: "Définition critères succès", lot: 0, start: "2026-04-15", end: "2026-05-01", group: "QA/Management" },
  { title: "Gantt détaillé", lot: 0, start: "2026-02-01", end: "2026-03-01", group: "QA/Management" },
  { title: "Allocation ressources", lot: 0, start: "2026-03-01", end: "2026-04-01", group: "QA/Management" },
  { title: "Plan de charge", lot: 0, start: "2026-04-01", end: "2026-05-01", group: "QA/Management" },
  { title: "Identification risques techniques", lot: 0, start: "2026-02-01", end: "2026-03-01", group: "QA/Management" },
  { title: "Identification risques pédagogiques", lot: 0, start: "2026-03-01", end: "2026-04-01", group: "QA/Management" },
  { title: "Identification risques réglementaires", lot: 0, start: "2026-03-01", end: "2026-04-01", group: "QA/Management" },
  { title: "Scoring criticité", lot: 0, start: "2026-04-01", end: "2026-05-01", group: "QA/Management" },
  { title: "Plans de mitigation", lot: 0, start: "2026-05-01", end: "2026-06-01", group: "QA/Management" },
  { title: "Cartographie processus", lot: 0, start: "2026-02-01", end: "2026-04-01", group: "QA/Management" },
  { title: "Définition indicateurs", lot: 0, start: "2026-03-01", end: "2026-05-01", group: "QA/Management" },
  { title: "Procédure gestion documentaire", lot: 0, start: "2026-04-01", end: "2026-05-01", group: "QA/Management" },
  { title: "Procédure gestion non-conformité", lot: 0, start: "2026-04-01", end: "2026-06-01", group: "QA/Management" },
  { title: "Procédure gestion modification", lot: 0, start: "2026-05-01", end: "2026-06-01", group: "QA/Management" },

  // LOT 1 - Web App Quality
  { title: "Recueil besoins équipe", lot: 1, start: "2026-06-01", end: "2026-06-15", group: "Web/Software" },
  { title: "Rédaction cahier des charges", lot: 1, start: "2026-06-15", end: "2026-06-30", group: "Web/Software" },
  { title: "Modélisation base données", lot: 1, start: "2026-06-15", end: "2026-06-30", group: "Web/Software" },
  { title: "CRUD projets / risques", lot: 1, start: "2026-06-15", end: "2026-07-15", group: "Web/Software" },
  { title: "Module KPI", lot: 1, start: "2026-07-15", end: "2026-08-01", group: "Web/Software" },
  { title: "Dashboard global", lot: 1, start: "2026-06-15", end: "2026-07-15", group: "Web/Software" },

  // LOT 2 - Cloud
  { title: "Choix hébergeur européen", lot: 2, start: "2026-08-01", end: "2026-08-15", group: "Cloud/Cyber" },
  { title: "Création serveur production", lot: 2, start: "2026-08-15", end: "2026-09-01", group: "Cloud/Cyber" },
  { title: "Mise en place CI/CD", lot: 2, start: "2026-09-01", end: "2026-09-15", group: "Cloud/Cyber" },
  { title: "API gestion profils", lot: 2, start: "2026-10-01", end: "2026-10-15", group: "Web/Software" },
  { title: "API gestion progression", lot: 2, start: "2026-10-15", end: "2026-11-01", group: "Web/Software" },
  { title: "Chiffrement données", lot: 2, start: "2026-12-01", end: "2026-12-15", group: "Cloud/Cyber" },

  // LOT 3 & 4
  { title: "Wireframes & Maquettes Figma", lot: 3, start: "2026-11-01", end: "2026-12-01", group: "Web/Software" },
  { title: "Création compte parent", lot: 3, start: "2026-12-01", end: "2026-12-15", group: "Web/Software" },
  { title: "Interface enseignants (création classe)", lot: 4, start: "2027-01-01", end: "2027-02-01", group: "Web/Software" },

  // LOT 5 - Robot
  { title: "Modélisation 3D", lot: 5, start: "2026-08-01", end: "2026-09-01", group: "Hardware/Robot" },
  { title: "Simulation chute", lot: 5, start: "2026-09-01", end: "2026-09-15", group: "Hardware/Robot" },
  { title: "Schéma alimentation", lot: 5, start: "2026-09-01", end: "2026-10-01", group: "Hardware/Robot" },
  { title: "PCB V1", lot: 5, start: "2026-10-01", end: "2026-11-01", group: "Hardware/Robot" },
  { title: "Installation OS embarqué", lot: 5, start: "2026-10-01", end: "2026-10-15", group: "Hardware/Robot" },
  { title: "Module pédagogique embarqué", lot: 5, start: "2026-12-01", end: "2027-01-01", group: "IA/Data" },
  { title: "Assemblage V1", lot: 5, start: "2027-01-01", end: "2027-02-01", group: "Hardware/Robot" },
  { title: "Prototype V2", lot: 5, start: "2027-02-01", end: "2027-03-01", group: "Hardware/Robot" },

  // LOT 6 - Certification
  { title: "Tests utilisateurs", lot: 6, start: "2027-03-01", end: "2027-04-01", group: "QA/Management" },
  { title: "Norme jouet", lot: 6, start: "2027-04-01", end: "2027-05-01", group: "QA/Management" }
];

async function run() {
  try {
    const res = await pool.query(`SELECT tm.id as tm_id, u.name, tm.role FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.project_id = $1`, [PROJECT_ID]);
    const members = res.rows;

    const findMember = (group) => {
      let filtered = [];
      if (group === 'QA/Management') {
        filtered = members.filter(m => m.role.includes('Qualité') || m.name.includes('Sonia') || m.role.includes('Product Owner'));
      } else if (group === 'Web/Software') {
        filtered = members.filter(m => m.role.includes('Data Engineer') || m.role.includes('NLP') || m.role.includes('Vision'));
      } else if (group === 'Cloud/Cyber') {
        filtered = members.filter(m => m.role.includes('Cloud') || m.role.includes('Cyber') || m.role.includes('RGPD'));
      } else if (group === 'Hardware/Robot') {
        filtered = members.filter(m => m.role.includes('IoT') || m.role.includes('robotique'));
      } else if (group === 'IA/Data') {
        filtered = members.filter(m => m.role.includes('IA') || m.role.includes('Data'));
      }
      
      // Exclude Admin from assignment if possible
      filtered = filtered.filter(m => !m.role.includes('Membre'));
      if (filtered.length === 0) filtered = members.filter(m => !m.role.includes('Membre'));

      return filtered[Math.floor(Math.random() * filtered.length)].tm_id;
    };

    let counter = 0;
    for (let task of TASKS) {
      counter++;
      const assignee = findMember(task.group);
      const taskId = `task-${Date.now()}-${counter}`;
      
      await pool.query(`
        INSERT INTO tasks (id, title, description, project_id, assigned_to, status, priority, due_date, progress)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [taskId, task.title, '', PROJECT_ID, assignee, 'todo', 'medium', task.end, 0]);

      const ganttId = `gantt-${Date.now()}-${counter}`;
      await pool.query(`
        INSERT INTO gantt_items (id, project_id, label, start_date, end_date, progress, status, assignee, task_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [ganttId, PROJECT_ID, task.title, task.start, task.end, 0, 'planned', assignee, taskId]);
      console.log(`Inserted: ${task.title} for assignee ${assignee}`);
    }
    console.log("DONE");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
