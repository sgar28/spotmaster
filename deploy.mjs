import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
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
