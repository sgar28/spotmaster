import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Verify dist directory exists
if (!existsSync(DIST)) {
  console.error('❌ Error: dist directory not found. Please run npm run build first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2'
};

// Cache frequently accessed files
const cache = new Map();
const CACHE_ENABLED = true;

function loadFileIntoCache(filePath) {
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();
    cache.set(filePath, {
      content,
      contentType: MIME[ext] || 'application/octet-stream'
    });
    return cache.get(filePath);
  } catch (error) {
    console.error(`❌ Failed to cache file ${filePath}:`, error);
    return null;
  }
}

// Pre-cache index.html
const indexHtmlPath = join(DIST, 'index.html');
loadFileIntoCache(indexHtmlPath);

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
  const startTime = Date.now();
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname);

    // Security check for path traversal
    if (!filePath.startsWith(DIST)) {
      console.error(`🚫 Attempted path traversal: ${filePath}`);
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // Try to serve the file
    try {
      let fileData;

      if (CACHE_ENABLED) {
        fileData = cache.get(filePath) || loadFileIntoCache(filePath);
      }

      if (!fileData) {
        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        fileData = { content, contentType: MIME[ext] || 'application/octet-stream' };
      }

      const headers = {
        'Content-Type': fileData.contentType,
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      };

      res.writeHead(200, headers);
      res.end(fileData.content);

      const duration = Date.now() - startTime;
      console.log(`✅ Served ${filePath} in ${duration}ms`);

    } catch (e) {
      if (e.code === 'ENOENT') {
        // For client-side routing, serve index.html for non-asset requests
        if (!url.pathname.startsWith('/assets/')) {
          const indexData = cache.get(indexHtmlPath) || loadFileIntoCache(indexHtmlPath);
          if (indexData) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexData.content);
            console.log(`🔄 Served index.html for ${url.pathname} (SPA routing)`);
          } else {
            console.error('❌ Failed to serve index.html');
            res.writeHead(500);
            res.end('Server Error');
          }
        } else {
          console.error(`❌ File not found: ${filePath}`);
          res.writeHead(404);
          res.end('Not Found');
        }
      } else {
        throw e;
      }
    }
  } catch (err) {
    console.error('❌ Server error:', err);
    res.writeHead(500);
    res.end('Server Error');
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
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
- File caching: ${CACHE_ENABLED ? 'enabled' : 'disabled'}

To make your website accessible from the internet:
1. Configure your router to forward port ${PORT} to this computer
2. Share your public IP address with others
`);
});
