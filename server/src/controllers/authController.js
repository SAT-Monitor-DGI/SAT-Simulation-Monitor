import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function register(req, res) {
  try {
    const { username, password, role = 'operator' } = req.body;
    if (!username || !password || password.length < 6)
      return res.status(400).json({ message: 'Username and password (6+ chars) required' });
    const count = await User.countDocuments();
    if (count > 0)
      return res.status(403).json({
        message: 'Initial registration is closed; an admin must create users',
      });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, role: 'admin' });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username });
    if (!u || !(await bcrypt.compare(password, u.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: u.id, username: u.username, role: u.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );
    res.json({ token, user: { id: u.id, username: u.username, role: u.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
