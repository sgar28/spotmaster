import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

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

// Cache for better performance
const cache = new Map();

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
      let fileData;
      
      if (cache.has(filePath)) {
        fileData = cache.get(filePath);
      } else {
        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        fileData = {
          content,
          contentType: MIME[ext] || 'application/octet-stream'
        };
        cache.set(filePath, fileData);
      }

      res.writeHead(200, {
        'Content-Type': fileData.contentType,
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff'
      });
      
      console.log(`✅ Served: ${filePath}`);
      res.end(fileData.content);
    } catch (e) {
      if (e.code === 'ENOENT') {
        // For SPA routing, serve index.html
        if (!url.pathname.startsWith('/assets/')) {
          const indexPath = join(DIST, 'index.html');
          const indexContent = cache.get(indexPath)?.content || readFileSync(indexPath);
          
          if (!cache.has(indexPath)) {
            cache.set(indexPath, { content: indexContent, contentType: 'text/html; charset=utf-8' });
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(indexContent);
          console.log(`🔄 Served: index.html (SPA routing) for ${url.pathname}`);
        } else {
          console.error(`❌ Not found: ${filePath}`);
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

const addresses = getNetworkAddresses();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 ParkMaster is running!

Access your website at:
📱 Local:    http://localhost:${PORT}
${addresses.map(ip => `🌍 Network:  http://${ip}:${PORT}`).join('\n')}

Features enabled:
- Real-time parking spot search with map integration
- Location-based search with manual toggle
- UPI and credit card payments via Razorpay
- Email/SMS notifications
- Multi-profile management with validation
- Smooth animations using Framer Motion

Server Information:
- Node.js: ${process.version}
- Environment: production
- Serving from: ${DIST}

Share any of the Network URLs with people on your local network to access the website!
`);
});
