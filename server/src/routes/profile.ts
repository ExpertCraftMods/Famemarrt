import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const uid = req.user!.id;
  const user = await query('SELECT id, email, display_name, points, referral_code FROM users WHERE id=$1', [uid]);
  const tx = await query('SELECT id, type, amount, note, created_at FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [uid]);
  res.json({ user: user.rows[0], transactions: tx.rows });
});

export default router;
