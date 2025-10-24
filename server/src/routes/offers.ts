import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  // In real life, fetch from affiliate networks via API using secure server-side keys
  const offers = [
    { id: 'offer1', title: 'Try a Music App', payoutCents: 200, categories: ['Entertainment'] },
    { id: 'offer2', title: 'Install Finance App', payoutCents: 350, categories: ['Finance'] },
  ];
  res.json({ offers });
});

export default router;
