#!/usr/bin/env node

// Simple cron-style ping script for external services
const https = require('https');

const RENDER_URL = 'https://codepad-zs5n.onrender.com';

function pingServer() {
  const url = `${RENDER_URL}/api/health`;
  
  https.get(url, (res) => {
    console.log(`[${new Date().toISOString()}] ✅ Server alive - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`[${new Date().toISOString()}] ❌ Ping failed: ${err.message}`);
  });
}

// Run immediately
pingServer();

// For external cron services like cron-job.org
if (require.main === module) {
  process.exit(0);
}
