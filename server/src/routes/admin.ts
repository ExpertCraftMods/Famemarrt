import { Router } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.get('/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await query('SELECT id, email, display_name, role, points, created_at FROM users ORDER BY created_at DESC');
  res.json({ users: users.rows });
});

router.post('/tasks', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { title, description, type, points, url } = req.body;
  try {
    const result = await query('INSERT INTO tasks (title, description, type, points, url) VALUES ($1,$2,$3,$4,$5) RETURNING id', [title, description, type, points, url]);
    res.status(201).json({ id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

router.post('/cashouts/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await query('UPDATE cash_out_requests SET status=\'approved\' WHERE id=$1', [id]);
  res.json({ success: true });
});

export default router;
