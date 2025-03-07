import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    // Remove any query parameters from the path
    filePath = filePath.split('?')[0];

    try {
      const data = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.')) || '.html';
      
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      
      console.log(`✅ Serving: ${filePath}`);
      res.end(data);
    } catch (e) {
      // For client-side routing, serve index.html for non-asset requests
      if (e.code === 'ENOENT' && !url.pathname.startsWith('/assets/')) {
        const indexHtml = readFileSync(join(DIST, 'index.html'));
        res.writeHead(200, { 
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        });
        console.log(`🔄 Serving: index.html (SPA routing)`);
        res.end(indexHtml);
      } else {
        console.error(`❌ Not found: ${filePath}`);
        res.writeHead(404);
        res.end('Not found');
      }
    }
  } catch (err) {
    console.error('❌ Server error:', err);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 ParkMaster is running!

📱 Local: http://localhost:${PORT}
🌍 Network: http://${getLocalIP()}:${PORT}

Features enabled:
- Real-time parking spot search with map integration
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications
- Multi-profile management
- Smooth animations using Framer Motion

Server Information:
- Node.js: ${process.version}
- Environment: production
- Serving from: ${DIST}
`);
});

function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
