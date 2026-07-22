import { Router } from 'express';
import { store } from '../data/store';
import { signToken } from '../middleware/auth';

const router = Router();

/** POST /api/auth/login — exchange email + password for a JWT. */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = store.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ sub: user.id, role: user.role });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

export default router;
