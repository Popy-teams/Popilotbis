const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/projects',
  method: 'GET',
  headers: {
    // How to bypass auth? 
    // Wait, I can just modify auth.js temporarily to NOT check the token!
  }
};
