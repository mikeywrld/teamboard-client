# TeamBoard Client

React 19 + Vite 7 + Socket.IO Client + PWA frontend for **TeamBoard: A Kanban-based Project Management Web App for Student Teams** (MSIS207). Requires Node.js 24.x+ and npm.

## Design progress

- [User flows and design tokens](docs/ui-design/03_Flows_and_Tokens.md)
- [Five HTML wireframes](docs/ui-design/04_Wireframes.html) — open the downloaded file in a browser.

## Quick Start

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Start the API on port 3000, then open `http://localhost:5173`.
Build: `npm run build`. Preview: `npm run preview -- --port 5173` after stopping the dev server. Port 5173 matches the API's default CORS origin.

## Repository Structure

```text
teamboard-client/
  docs/ui-design/
    03_Flows_and_Tokens.md
    04_Wireframes.html
  public/
    manifest.webmanifest
    icon-512.svg
    sw.js
  src/
    pages/ (Login.jsx, Register.jsx, Projects.jsx, Board.jsx, Stats.jsx)
    components/ (Column.jsx, TaskCard.jsx, TaskModal.jsx, MemberList.jsx, ActivityPanel.jsx, HeaderBar.jsx)
    api/ (client.js, socket.js)
    styles/ (tokens.css, layout.css)
    main.jsx
    style.css
  .env.example
```

## Screens & Features (`F1`–`F13`)

1. **Login & Register (`src/pages/Login.jsx`, `src/pages/Register.jsx`)**:
   - JWT authentication, error alerts, API health/wake-up status indicator (`T10`), and 1-click Demo Sign-In button for **Hoang Long**.
2. **My Projects (`src/pages/Projects.jsx`)**:
   - Create new project, join existing project via `joinCode` (`TB-MSIS207`), view progress bars, and manage projects.
3. **4-Column Kanban Board (`src/pages/Board.jsx`, `src/components/Column.jsx`, `src/components/TaskCard.jsx`)**:
   - `To do`, `Doing`, `Review`, `Done` columns with HTML5 drag-and-drop and 1-click transition buttons for 360px mobile accessibility (`F4`, `F5`, `T8`).
   - Search (`q`), filter by `assignee` / `status` / `priority`, sort (`-created-at`, `due-date`, `-priority`, `title`), and pagination (`F6`, `T7`).
   - Overdue and due-within-48h visual badges and warning banner (`F10`).
   - Live Socket.IO room synchronization (`F11`).
4. **Task Detail & Comments Modal (`src/components/TaskModal.jsx`)**:
   - Create, edit, or delete tasks and post/view task comments (`F3`, `F7`).
5. **Members & Automated Activity Log (`src/components/MemberList.jsx`, `src/components/ActivityPanel.jsx`)**:
   - Copyable project invite code, member roster, and chronological audit log (`F8`).
6. **Contribution Statistics & CSV Export (`src/pages/Stats.jsx`)**:
   - Per-member task and comment metrics + 1-click `.csv` report download (`F9`, `F13`).
7. **PWA Support (`public/manifest.webmanifest`, `public/sw.js`)**:
   - Installable web app manifest, 512x512 SVG icon, and service worker (`F12`).

## Vercel Deployment

Import this repository, select Vite, leave root directory blank. Build: `npm run build`; output: `dist`; Node: 24.x. Set `VITE_API_URL` to your Render origin (HTTPS, no `/api/v1` suffix) and redeploy after changing it. Set the API's `CLIENT_URL` to the exact production Vercel origin.

All `VITE_*` variables are public browser configuration. Never put DB credentials or JWT secrets there.

- Repository: [teamboard-client](https://github.com/mikeywrld/teamboard-client)
- Live UI URL: Pending deployment
