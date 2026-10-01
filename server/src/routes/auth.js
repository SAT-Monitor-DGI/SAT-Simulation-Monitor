import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { ensureDB } from '../config/db.js';
const r = Router();
r.use(ensureDB);
r.post('/register', register);
r.post('/login', login);
export default r;
