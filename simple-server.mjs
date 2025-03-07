import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

async function serveFile(url) {
  try {
    // Remove query parameters and decode URL
    const cleanUrl = decodeURIComponent(url.split('?')[0]);
    
    // Determine file path
    let filePath;
    if (cleanUrl === '/') {
      filePath = join(DIST, 'index.html');
    } else {
      filePath = join(DIST, cleanUrl.slice(1));
    }

    // Read the file
    const content = await readFile(filePath);
    
    // Determine content type
    const ext = '.' + filePath.split('.').pop();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return {
      status: 200,
      headers: { 'Content-Type': contentType },
      content
    };
  } catch (err) {
    // For client-side routing, serve index.html for non-asset paths
    if (!url.startsWith('/assets/')) {
      try {
        const content = await readFile(join(DIST, 'index.html'));
        return {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
          content
        };
      } catch (error) {
        console.error('Error serving index.html:', error);
      }
    }
    
    console.error(`Error serving ${url}:`, err);
    return {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
      content: 'Not found'
    };
  }
}

const server = createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  const { status, headers, content } = await serveFile(req.url);
  
  res.writeHead(status, headers);
  res.end(content);
});

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

Server Information:
- Node.js: ${process.version}
- Serving from: ${DIST}
`);
});
