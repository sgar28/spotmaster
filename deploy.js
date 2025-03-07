import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES Module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from the Vite build output
app.use(express.static('dist'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 ParkMaster is running!
📱 Local: http://localhost:${PORT}

Features enabled:
- React + TypeScript frontend
- Supabase database connection
- Razorpay payment integration
- Email/SMS notifications
- Location-based search
- Multi-profile management
  `);
});
