import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = 8080;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getNetworkAddresses() {
  const nets = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  
  return addresses;
}

const server = createServer((req, res) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    try {
      const data = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.'));
      
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
      
      console.log(`✅ Served: ${filePath}`);
      res.end(data);
    } catch (e) {
      if (e.code === 'ENOENT' && !url.pathname.startsWith('/assets/')) {
        const indexHtml = readFileSync(join(DIST, 'index.html'));
        res.writeHead(200, { 
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        });
        console.log(`🔄 Served: index.html (SPA routing)`);
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
  const addresses = getNetworkAddresses();
  
  console.log(`
🚀 ParkMaster is running!

Access your website at:
📱 Local:    http://localhost:${PORT}
${addresses.map(ip => `🌍 Network:  http://${ip}:${PORT}`).join('\n')}

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

To make your website accessible from the internet:
1. Configure your router to forward port ${PORT} to this computer
2. Share your public IP address with others
`);
});
