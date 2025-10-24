import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/index.js';

const router = Router();

const RegisterSchema = z.object({ email: z.string().email(), password: z.string().min(6), displayName: z.string().min(1) });
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/register', async (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password, displayName } = parse.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await query<{ id: string }>(
      'INSERT INTO users (email, password_hash, display_name, referral_code) VALUES ($1,$2,$3,substr(md5(random()::text),1,8)) RETURNING id',
      [email, hash, displayName]
    );
    const userId = result.rows[0].id;
    const accessToken = jwt.sign({ sub: userId, role: 'user' }, process.env.JWT_ACCESS_SECRET || 'devsecret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET || 'devrefresh', { expiresIn: '7d' });
    res.status(201).json({ accessToken, refreshToken });
  } catch (e: any) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parse.data;
  const result = await query<{ id: string; password_hash: string; role: string }>('SELECT id, password_hash, role FROM users WHERE email=$1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET || 'devsecret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'devrefresh', { expiresIn: '7d' });
  res.json({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: 'Missing refreshToken' });
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'devrefresh') as any;
    const accessToken = jwt.sign({ sub: payload.sub }, process.env.JWT_ACCESS_SECRET || 'devsecret', { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
