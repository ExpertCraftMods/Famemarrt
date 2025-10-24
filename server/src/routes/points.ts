import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.post('/cashout', requireAuth, async (req: AuthRequest, res) => {
  const { provider = 'mock', destination, amountCents } = req.body as { provider?: string; destination?: string; amountCents: number };
  const uid = req.user!.id;
  if (!amountCents || amountCents <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const user = await query<{ points: number }>('SELECT points FROM users WHERE id=$1', [uid]);
  const points = user.rows[0]?.points || 0;
  const pointsNeeded = Math.ceil(amountCents / 100) * 100; // e.g., 100 pts == $1 for demo
  if (points < pointsNeeded) return res.status(400).json({ error: 'Not enough points' });

  await query('UPDATE users SET points = points - $1 WHERE id=$2', [pointsNeeded, uid]);
  await query('INSERT INTO transactions (user_id, type, amount, note) VALUES ($1,$2,$3,$4)', [uid, 'redeem', -pointsNeeded, `Cash out ${provider}`]);
  const result = await query('INSERT INTO cash_out_requests (user_id, amount_cents, provider, destination, status) VALUES ($1,$2,$3,$4,$5) RETURNING id', [uid, amountCents, provider, destination, 'pending']);

  // Simulate async payout processing
  setTimeout(async () => {
    try {
      await query('UPDATE cash_out_requests SET status=\'paid\' WHERE id=$1', [result.rows[0].id]);
    } catch {}
  }, 500);

  res.json({ success: true, requestId: result.rows[0].id, debitedPoints: pointsNeeded });
});

export default router;
