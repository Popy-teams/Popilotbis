import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  user: 'popilot',
  host: 'localhost',
  database: 'popilot',
  password: 'password',
  port: 5432, // Wait, docker exposed port? 
});
