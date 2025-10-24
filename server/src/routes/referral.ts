import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.post('/apply', requireAuth, async (req: AuthRequest, res) => {
  const { code } = req.body as { code: string };
  const uid = req.user!.id;
  const found = await query<{ id: string }>('SELECT id FROM users WHERE referral_code=$1', [code]);
  if (!found.rows[0]) return res.status(404).json({ error: 'Referral code not found' });
  await query('UPDATE users SET referred_by=$1 WHERE id=$2', [code, uid]);
  res.json({ success: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const uid = req.user!.id;
  const you = await query('SELECT referral_code, referred_by FROM users WHERE id=$1', [uid]);
  res.json({ referralCode: you.rows[0]?.referral_code, referredBy: you.rows[0]?.referred_by });
});

export default router;
