## PointPilot — Rewards/Points Prototype

A lightweight prototype inspired by rewards platforms (not affiliated). Includes a responsive front-end and a Node.js/Express API skeleton with PostgreSQL.

### Features
- Responsive, accessible UI (vanilla HTML/CSS/JS)
- Demo tasks/offers with client-side state (localStorage)
- Points balance, task completion, recent activity
- Referral code demo page
- Mock cash-out flow (no real payments)
- Express API skeleton with routes for auth, tasks, profile, referrals, admin
- PostgreSQL schema and seed
- Basic Jest + Supertest test harness

### Front-end (prototype)
- Open `frontend/index.html` directly with a static server (or VS Code Live Server). Pages: `index.html`, `tasks.html`, `offers.html`, `referral.html`, `profile.html`, `admin.html`.
- State is stored in localStorage for the demo. Completing a task increases points; completed tasks are marked.

### Back-end (API)
- Node.js + Express with TypeScript.
- Routes under `/api/...`:
  - `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
  - `GET /tasks`, `POST /tasks/:taskId/complete`
  - `GET /offers`
  - `GET /profile`
  - `POST /points/cashout`
  - `POST /referral/apply`, `GET /referral/me`
  - `GET /admin/users`, `POST /admin/tasks`, `POST /admin/cashouts/:id/approve`

#### Example request
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}'
```

### Setup
Requirements: Node 18+, PostgreSQL 14+

1. Server
```bash
cd server
cp .env.example .env # edit values
npm install
npm run migrate
npm run seed
npm run dev
```

2. Front-end
- Serve `frontend/` statically, e.g.:
```bash
npx serve ../frontend
```

### Environment variables (.env)
```
PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/rewards
PGSSLMODE=
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
MIGRATE_ON_START=0
```

Create `.env` from the example and adjust for your environment.

### Database schema
See `server/src/db/schema.sql`. Includes `users`, `tasks`, `task_completions`, `transactions`, `cash_out_requests`.

### Security & scaling notes
- Auth: JWT access + refresh tokens; store refresh token in httpOnly cookie or secure store; rotate and revoke on logout.
- Rate limiting: `express-rate-limit` applied to `/api/*`.
- Input validation: use `zod` per-route.
- Secrets: keep affiliate network keys only on the server; never expose in client JS; use env vars or secret manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault).
- CORS: restrict origins in production.
- Headers: `helmet` enabled.
- Logging: `morgan`; prefer structured logs in prod.
- Scaling: run stateless API behind a load balancer; DB with read replicas; cache hot reads; queue for async payouts; idempotent operations; use background workers for webhooks.

### Payments / Withdrawal (mock)
- Endpoint `POST /api/points/cashout` records a pending cash-out and simulates payment by marking as `paid`.
- For real providers: integrate PayPal Payouts or Stripe Connect Transfers using server-side SDKs and webhooks.

### Third-party services (for real offers)
- Affiliate networks: Impact, CJ Affiliate, Rakuten Advertising, Awin
- Offerwalls / surveys: TheoremReach, Pollfish, TapResearch, InBrain
- Video ads: AdGate Media, Adscend Media

### Legal disclaimers (not legal advice)
- Publish clear Terms of Service and Privacy Policy.
- Disclose that rewards are contingent on partner verification and anti-fraud checks.
- Comply with CAN-SPAM, TCPA, CASL for communications; GDPR/CCPA for data privacy.
- Include disclosures for affiliate links per FTC guidelines.

### Tests
Run:
```bash
cd server
npm test
```

A sample test ensures the health endpoint works.

### Deployment notes
- API: containerize with Docker; use `MIGRATE_ON_START=1` in non-prod or run migrations via CI step.
- DB: managed PostgreSQL (RDS, Cloud SQL); apply migrations on deploy.
- Front-end: static hosting (Vercel, Netlify, S3+CloudFront). Configure API base URL via env-injected config.
