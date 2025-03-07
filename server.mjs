import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env.PORT || 5000;

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

const server = createServer((req, res) => {
  console.log(` ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    try {
      const data = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.')) || '.html';
      
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff'
      });
      
      console.log(` Served: ${filePath}`);
      res.end(data);
    } catch (e) {
      if (e.code === 'ENOENT') {
        // For client-side routing, serve index.html for all non-asset requests
        if (!url.pathname.startsWith('/assets/')) {
          const indexHtml = readFileSync(join(DIST, 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          console.log(` Served: index.html (SPA routing)`);
          res.end(indexHtml);
        } else {
          console.error(` Not found: ${filePath}`);
          res.writeHead(404);
          res.end('Not found');
        }
      } else {
        throw e;
      }
    }
  } catch (err) {
    console.error(' Server error:', err);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
 ParkMaster is running on http://localhost:${PORT}

Features available:
- Real-time parking spot search with map
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications
- Multi-profile management
- Smooth animations between pages
`);
});
