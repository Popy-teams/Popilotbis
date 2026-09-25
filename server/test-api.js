import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
const token = jwt.sign({ id: 'user-1', name: 'Admin', role: 'admin' }, 'popilot-super-secret-key-2026', { expiresIn: '1d' });
const res = await fetch('http://localhost:3001/api/projects', { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
