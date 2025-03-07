import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function getLocalIP() {
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

const server = createServer((req, res) => {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  
  try {
    // Clean URL and determine file path
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    // Try to read the file
    try {
      const data = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.'));
      
      // Set appropriate headers
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
      
      console.log(`✅ Serving: ${filePath}`);
      res.end(data);
    } catch (e) {
      // For client-side routing, serve index.html
      if (e.code === 'ENOENT' && !url.pathname.startsWith('/assets/')) {
        const indexHtml = readFileSync(join(DIST, 'index.html'));
        res.writeHead(200, { 
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(indexHtml);
      } else {
        console.error(`❌ File not found: ${filePath}`);
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

const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 ParkMaster is running!

Access your website at:
📱 Local:    http://localhost:${PORT}
🌍 Network:  http://${localIP}:${PORT}

Features enabled:
- Real-time parking spot search with map integration
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications via Nodemailer & Twilio
- Multi-profile management with validation
- Smooth animations using Framer Motion

Server Information:
- Node.js: ${process.version}
- Environment: production
- Serving from: ${DIST}

Share the Network URL with anyone on your local network to access the website!
`);
});
