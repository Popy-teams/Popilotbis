import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'popilot-super-secret-key-2026', { expiresIn: '1d' });

const res = await fetch('http://localhost:3001/api/projects', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const json = await res.json();
const projects = json.data || [];
const firstProject = projects.find(p => p.name === 'jaune');
if (!firstProject) {
  console.log('Project "jaune" not found in DB', projects.map(p => p.name));
  process.exit(1);
}
console.log('Found project:', firstProject.id);

const res2 = await fetch(`http://localhost:3001/api/team-members?project_id=${encodeURIComponent(firstProject.id)}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const json2 = await res2.json();
console.log('Team members:', json2);
