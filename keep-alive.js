// Keep-alive script to prevent server hibernation
const https = require('https');
const http = require('http');

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
const MAX_RETRIES = 3;

class KeepAlive {
  constructor(url) {
    this.url = url;
    this.isRunning = false;
    this.retryCount = 0;
  }

  ping() {
    const protocol = this.url.startsWith('https') ? https : http;
    const healthUrl = `${this.url}/api/health`;
    
    console.log(`[${new Date().toISOString()}] Pinging: ${healthUrl}`);
    
    const req = protocol.get(healthUrl, (res) => {
      console.log(`✅ Ping successful - Status: ${res.statusCode}`);
      this.retryCount = 0;
    });

    req.on('error', (err) => {
      this.retryCount++;
      console.log(`❌ Ping failed (${this.retryCount}/${MAX_RETRIES}): ${err.message}`);
      
      if (this.retryCount >= MAX_RETRIES) {
        console.log('🛑 Max retries reached. Stopping keep-alive.');
        this.stop();
      }
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log('⏰ Ping timeout');
    });
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`🚀 Keep-alive started for: ${this.url}`);
    console.log(`📡 Pinging every ${PING_INTERVAL / 1000 / 60} minutes`);
    
    // Initial ping
    this.ping();
    
    // Set interval
    this.interval = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('🛑 Keep-alive stopped');
  }
}

// Usage
const SERVER_URL = process.env.SERVER_URL || 'https://codepad-zs5n.onrender.com';
const keepAlive = new KeepAlive(SERVER_URL);

// Start keep-alive
keepAlive.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Graceful shutdown...');
  keepAlive.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Graceful shutdown...');
  keepAlive.stop();
  process.exit(0);
});

module.exports = KeepAlive;
