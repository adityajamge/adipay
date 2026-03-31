# AdiPay

## Deploy Backend On Render

This repository includes a Render blueprint in `render.yaml` for the API service.

### Option 1: One-click Blueprint Deploy

1. Push this repository to GitHub.
2. In Render dashboard, click `New` -> `Blueprint`.
3. Select this repository.
4. Render will detect `render.yaml` and create `adipay-api`.
5. Add required environment values when prompted:
	- `DATABASE_URL` (your Neon Postgres connection string)
	- `JWT_SECRET` (strong random secret)
	- `CORS_ORIGIN` (comma-separated list of allowed origins, or `*`)
6. Deploy and wait for build to finish.

Health check endpoint:

- `/api/health`

### Option 2: Manual Service Setup

If you prefer manual setup, create a `Web Service` with:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm run start`
- Environment: `Node`

Then add the same environment variables listed above.

### Local DB Reset

From the `server` folder, run:

```bash
npm run db:init
```

This drops all existing public tables and re-creates the schema from `server/src/db/migrations/001_initial_schema.sql`.
