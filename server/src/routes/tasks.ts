import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const tasks = await query('SELECT id, title, description, type, points, url, active FROM tasks WHERE active=true ORDER BY created_at DESC');
  res.json({ tasks: tasks.rows });
});

router.post('/:taskId/complete', requireAuth, async (req: AuthRequest, res) => {
  const { taskId } = req.params;
  const userId = req.user!.id;
  try {
    await query('INSERT INTO task_completions (user_id, task_id) VALUES ($1,$2) ON CONFLICT (user_id, task_id) DO NOTHING', [userId, taskId]);
    const t = await query<{ points: number }>('SELECT points FROM tasks WHERE id=$1', [taskId]);
    const points = t.rows[0]?.points || 0;
    await query('UPDATE users SET points = points + $1 WHERE id=$2', [points, userId]);
    await query('INSERT INTO transactions (user_id, type, amount, note) VALUES ($1,$2,$3,$4)', [userId, 'earn', points, 'Task completion']);
    res.json({ success: true, pointsAwarded: points });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark task complete' });
  }
});

export default router;
