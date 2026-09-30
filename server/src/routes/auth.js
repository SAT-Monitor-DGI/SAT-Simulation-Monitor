import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { connectDB } from '../config/db.js';
const r = Router();
r.use(connectDB);
r.post('/register', register);
r.post('/login', login);
export default r;
