import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  // Default to index.html for SPA routing
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // If path doesn't exist, serve index.html for client-side routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  }[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
🚀 ParkMaster is running!
📱 Local: http://localhost:${PORT}

Features enabled:
- Real-time parking spot search with map integration
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications via Nodemailer & Twilio
- Multi-profile management with validation
- Smooth animations using Framer Motion
`);
});
