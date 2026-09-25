import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import teamRoutes from './routes/team.js';
import usersRoutes from './routes/users.js';
import tasksRoutes from './routes/tasks.js';
import meetingsRoutes from './routes/meetings.js';
import risksRoutes from './routes/risks.js';
import bomRoutes from './routes/bom.js';
import documentsRoutes from './routes/documents.js';
import pipelineRoutes from './routes/pipeline.js';
import ganttRoutes from './routes/gantt.js';
import kpiRoutes from './routes/kpi.js';
import dashboardAlertsRoutes from './routes/dashboard_alerts.js';
import marketingRoutes from './routes/marketing.js';
import roadmapRoutes from './routes/roadmap.js';
import veilleRoutes from './routes/veille.js';
import satisfactionRoutes from './routes/satisfaction.js';
import objectivesRoutes from './routes/objectives.js';
export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ success: true, status: 'ok' });
    } catch (err) {
      res.status(503).json({ success: false, error: err.message });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/team-members', teamRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/meetings', meetingsRoutes);
  app.use('/api/risks', risksRoutes);
  app.use('/api/bom', bomRoutes);
  app.use('/api/documents', documentsRoutes);
  app.use('/api/pipeline', pipelineRoutes);
  app.use('/api/gantt', ganttRoutes);
  app.use('/api/kpi', kpiRoutes);
  app.use('/api/dashboard-alerts', dashboardAlertsRoutes);
  app.use('/api/marketing', marketingRoutes);
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/veille', veilleRoutes);
  app.use('/api/satisfaction', satisfactionRoutes);
  app.use('/api/objectives', objectivesRoutes);
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route introuvable' });
  });

  return app;
}
