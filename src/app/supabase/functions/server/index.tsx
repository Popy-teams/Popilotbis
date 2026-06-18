import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Projects endpoints
app.get('/make-server-036a5a33/projects', async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    return c.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-036a5a33/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const project = await kv.get(id);
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404);
    }
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-036a5a33/projects', async (c) => {
  try {
    const body = await c.req.json();
    const projectId = `project:${Date.now()}`;
    
    const project = {
      id: projectId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(projectId, project);
    return c.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-036a5a33/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-036a5a33/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404);
    }
    await kv.del(id);
    return c.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Tasks endpoints
app.get('/make-server-036a5a33/tasks', async (c) => {
  try {
    const tasks = await kv.getByPrefix('task:');
    return c.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-036a5a33/tasks', async (c) => {
  try {
    const body = await c.req.json();
    const taskId = `task:${Date.now()}`;
    
    const task = {
      id: taskId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(taskId, task);
    return c.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-036a5a33/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Task not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Meetings endpoints
app.get('/make-server-036a5a33/meetings', async (c) => {
  try {
    const meetings = await kv.getByPrefix('meeting:');
    return c.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-036a5a33/meetings', async (c) => {
  try {
    const body = await c.req.json();
    const meetingId = `meeting:${Date.now()}`;
    
    const meeting = {
      id: meetingId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(meetingId, meeting);
    return c.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Risks endpoints
app.get('/make-server-036a5a33/risks', async (c) => {
  try {
    const risks = await kv.getByPrefix('risk:');
    return c.json({ success: true, data: risks });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-036a5a33/risks', async (c) => {
  try {
    const body = await c.req.json();
    const riskId = `risk:${Date.now()}`;
    
    const risk = {
      id: riskId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(riskId, risk);
    return c.json({ success: true, data: risk });
  } catch (error) {
    console.error('Error creating risk:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-036a5a33/risks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Risk not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating risk:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Team members endpoints
app.get('/make-server-036a5a33/team', async (c) => {
  try {
    const members = await kv.getByPrefix('team:');
    return c.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-036a5a33/team', async (c) => {
  try {
    const body = await c.req.json();
    const memberId = `team:${Date.now()}`;
    
    const member = {
      id: memberId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(memberId, member);
    return c.json({ success: true, data: member });
  } catch (error) {
    console.error('Error creating team member:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Initialize sample data
app.post('/make-server-036a5a33/init-sample-data', async (c) => {
  try {
    // Check if data already exists
    const existingProjects = await kv.getByPrefix('project:');
    if (existingProjects.length > 0) {
      return c.json({ success: true, message: 'Sample data already exists' });
    }

    // Fixtures Portfolio Projet
    const projects = [
      {
        id: 'project:portfolio-popy-v1',
        name: 'POPY V1 - Industrialisation',
        description: 'Passage du prototype au produit industrialisable avec conformite CE.',
        progress: 72,
        status: 'on-track',
        priority: 'high',
        startDate: '2026-01-10',
        deadline: '2026-08-30',
        budget: { used: 182000, total: 250000 },
        team: ['ME', 'FA', 'SO', 'EM'],
        objectives: [
          { name: 'Validation architecture hardware', progress: 85 },
          { name: 'Stabilisation logiciel embarque', progress: 68 },
          { name: 'Dossier de conformite CE', progress: 60 },
          { name: 'Tests terrain en ecoles pilotes', progress: 55 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'project:portfolio-ia-emotions',
        name: 'IA Emotionnelle Temps Reel',
        description: 'Amelioration des modeles de reconnaissance emotionnelle en local.',
        progress: 54,
        status: 'at-risk',
        priority: 'high',
        startDate: '2026-02-01',
        deadline: '2026-07-15',
        budget: { used: 94000, total: 120000 },
        team: ['ME', 'CL', 'SA'],
        objectives: [
          { name: 'Nouveau dataset enfant multilingue', progress: 70 },
          { name: 'Reduction latence inference', progress: 45 },
          { name: 'Evaluation robustesse offline', progress: 50 },
          { name: 'Plan de mitigation biais IA', progress: 35 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'project:portfolio-app-parent',
        name: 'Application Parent & Portail Enseignant',
        description: 'Creation du portail web de suivi pedagogique et controle parental.',
        progress: 38,
        status: 'on-track',
        priority: 'medium',
        startDate: '2026-03-01',
        deadline: '2026-10-01',
        budget: { used: 62000, total: 170000 },
        team: ['DA', 'EM', 'DL', 'SH'],
        objectives: [
          { name: 'Parcours onboarding parents', progress: 50 },
          { name: 'Dashboard enseignants', progress: 30 },
          { name: 'API de synchronisation robot-cloud', progress: 42 },
          { name: 'Tests UX et accessibilite', progress: 25 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'project:portfolio-cyber-rgpd',
        name: 'Programme Cybersecurite & RGPD',
        description: 'Renforcement securite by-design et gouvernance donnees enfant.',
        progress: 63,
        status: 'on-track',
        priority: 'high',
        startDate: '2026-01-20',
        deadline: '2026-09-15',
        budget: { used: 78000, total: 130000 },
        team: ['MA', 'JU', 'SO', 'DA'],
        objectives: [
          { name: 'Chiffrement bout en bout', progress: 75 },
          { name: 'Audit pentest IoT trimestriel', progress: 60 },
          { name: 'Politique retention des donnees', progress: 65 },
          { name: 'Mecanismes consentement parental', progress: 52 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'project:portfolio-firmware-v2',
        name: 'Firmware Robot V2',
        description: 'Refonte firmware pour stabilite long terme et mises a jour OTA.',
        progress: 29,
        status: 'delayed',
        priority: 'high',
        startDate: '2026-02-10',
        deadline: '2026-06-20',
        budget: { used: 110000, total: 140000 },
        team: ['ER', 'YA', 'FA'],
        objectives: [
          { name: 'Nouveau scheduler temps reel', progress: 35 },
          { name: 'OTA securise avec rollback', progress: 20 },
          { name: 'Optimisation consommation batterie', progress: 28 },
          { name: 'Validation endurance 72h', progress: 15 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'project:portfolio-certification',
        name: 'Certification & Qualite Produit',
        description: 'Campagne de tests, gestion non-conformites et preparation certification.',
        progress: 81,
        status: 'on-track',
        priority: 'medium',
        startDate: '2025-12-15',
        deadline: '2026-05-30',
        budget: { used: 96000, total: 115000 },
        team: ['SO', 'SH', 'ER', 'YA'],
        objectives: [
          { name: 'Plan de tests qualite complet', progress: 100 },
          { name: 'Traitement non-conformites critiques', progress: 75 },
          { name: 'Dossier certificateur', progress: 80 },
          { name: 'Audit interne final', progress: 70 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const project of projects) {
      await kv.set(project.id, project);
    }

    return c.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
