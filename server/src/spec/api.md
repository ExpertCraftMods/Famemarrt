# API Spec (Prototype)

Base URL: `/api`

Auth:
- POST `/auth/register`
  - body: `{ email, password, displayName }`
  - 201: `{ accessToken, refreshToken }`
- POST `/auth/login`
  - body: `{ email, password }`
  - 200: `{ accessToken, refreshToken }`
- POST `/auth/refresh`
  - body: `{ refreshToken }`
  - 200: `{ accessToken }`

Tasks:
- GET `/tasks` (auth)
  - 200: `{ tasks: [ { id, title, description, type, points, url, active } ] }`
- POST `/tasks/:taskId/complete` (auth)
  - 200: `{ success: true, pointsAwarded }`

Offers:
- GET `/offers` (auth)
  - 200: `{ offers: [ { id, title, payoutCents, categories } ] }`

Profile:
- GET `/profile` (auth)
  - 200: `{ user: { id, email, display_name, points, referral_code }, transactions: [...] }`

Points:
- POST `/points/cashout` (auth)
  - body: `{ provider, destination, amountCents }`
  - 200: `{ success, requestId, debitedPoints }`

Referral:
- POST `/referral/apply` (auth)
  - body: `{ code }`
- GET `/referral/me` (auth)

Admin:
- GET `/admin/users` (admin)
- POST `/admin/tasks` (admin)
- POST `/admin/cashouts/:id/approve` (admin)
