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
const requestLog = [];

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
  const clientIP = req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    clientIP,
    userAgent: req.headers['user-agent']
  };
  requestLog.push(logEntry);
  console.log(`📥 ${timestamp} - ${clientIP} - ${req.method} ${req.url}`);
  
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Special route for connection test
    if (url.pathname === '/test') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'ParkMaster connection test successful!',
        clientInfo: {
          ip: clientIP,
          userAgent: req.headers['user-agent'],
          timestamp
        },
        serverInfo: {
          nodeVersion: process.version,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      }, null, 2));
      return;
    }
    
    // Special route for viewing access logs
    if (url.pathname === '/logs') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        totalRequests: requestLog.length,
        lastRequests: requestLog.slice(-10),
        uniqueIPs: [...new Set(requestLog.map(log => log.clientIP))].length
      }, null, 2));
      return;
    }

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
      
      console.log(`✅ Served: ${filePath} to ${clientIP}`);
      res.end(fileData.content);
    } catch (e) {
      if (e.code === 'ENOENT') {
        if (!url.pathname.startsWith('/assets/')) {
          const indexPath = join(DIST, 'index.html');
          const indexContent = cache.get(indexPath)?.content || readFileSync(indexPath);
          
          if (!cache.has(indexPath)) {
            cache.set(indexPath, { content: indexContent, contentType: 'text/html; charset=utf-8' });
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(indexContent);
          console.log(`🔄 Served: index.html (SPA routing) for ${url.pathname} to ${clientIP}`);
        } else {
          console.error(`❌ Not found: ${filePath} requested by ${clientIP}`);
          res.writeHead(404);
          res.end('Not Found');
        }
      } else {
        throw e;
      }
    }
  } catch (err) {
    console.error(`❌ Server error for ${clientIP}:`, err);
    res.writeHead(500);
    res.end('Server Error');
  }
});

const addresses = getNetworkAddresses();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 ParkMaster Network Test Server

Access your website at:
📱 Local:    http://localhost:${PORT}
${addresses.map(ip => `🌍 Network:  http://${ip}:${PORT}`).join('\n')}

Test your connection:
📡 Test URL:  http://localhost:${PORT}/test
📊 Logs URL:  http://localhost:${PORT}/logs

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

To test network access:
1. Share any of the Network URLs with people on your local network
2. Ask them to visit the Test URL (add /test to the Network URL)
3. Check the Logs URL to see all connections

Network Status:
- Your IP: ${addresses[0]}
- Subnet Mask: 255.255.255.0
- Test Command: curl http://${addresses[0]}:${PORT}/test
`);
});
