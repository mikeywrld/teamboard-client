# TeamBoard Client

Week 1 React + Vite foundation for MSIS207. Requires Node.js 24.x and npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Start the API on port 3000, then open http://localhost:5173. The page calls `/api/v1/health` and shows loading, connection success or a retryable error. The 60-second timeout handles a slow start without waiting forever.

Build: `npm run build`. Preview: `npm run preview -- --port 5173` after stopping the dev server. Port 5173 matches the API's default CORS origin.

## Vercel

Import this repository, select Vite, leave root directory blank. Build: `npm run build`; output: `dist`; Node: 24.x. Set `VITE_API_URL` to your Render origin (HTTPS, no `/api/v1` suffix) and redeploy after changing it. Set the API's `CLIENT_URL` to the exact production Vercel origin. Vercel preview origins are not automatically allowed.

All VITE_* variables are public browser configuration. Never put DB credentials or JWT secrets there. This milestone intentionally has no login or Kanban controls.

Repository URL: pending creation. Live UI URL: pending deployment.
