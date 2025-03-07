import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = createServer((req, res) => {
  try {
    // Clean URL and determine file path
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    // Try to read the file
    try {
      const data = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.'));
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
      res.end(data);
    } catch (e) {
      // If file not found, serve index.html for client-side routing
      if (e.code === 'ENOENT' && !url.pathname.startsWith('/assets/')) {
        const indexHtml = readFileSync(join(DIST, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexHtml);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Server error');
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`
🚀 ParkMaster is running!
📱 Local: http://localhost:${PORT}

Features enabled:
- Real-time parking spot search with map
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications
- Multi-profile management
- Smooth animations
`);
});
