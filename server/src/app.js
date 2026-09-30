import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import satellites from './routes/satellites.js';
const app = express();
const whitelist = [process.env.CORS_ALLOWED_HOST, 'http://localhost:3000']
  .flatMap((origin) => origin?.split(',') || [])
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || whitelist.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
};
app.use(cors(corsOptions));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/satellites', satellites);
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
export default app;
