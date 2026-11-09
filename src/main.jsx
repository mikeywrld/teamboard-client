import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
function App() {
  const [result, setResult] = useState({ state: 'idle', message: 'Ready to check the API.' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!apiUrl) { setResult({ state: 'error', message: 'Set VITE_API_URL and restart or rebuild the client.' }); return; }
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 60000);
    setResult({ state: 'loading', message: 'Connecting… The API may need a moment to wake up.' });
    fetch(`${apiUrl}/api/v1/health`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 'ok' || data.service !== 'teamboard-api') throw new Error('Unexpected health response');
        if (active) setResult({ state: 'success', message: 'Connected to TeamBoard API. Hello World!' });
      })
      .catch(error => { if (active) setResult({ state: 'error', message: `Connection failed (${error.name === 'AbortError' ? 'timeout' : error.message}). Check API URL and CORS, then retry.` }); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [attempt]);
  return <><header><a href="/" className="brand">TeamBoard<span>MSIS207</span></a><span>Week 01 · Foundation</span></header>
    <main><p className="eyebrow">A workspace for student teams</p><h1>Every great project<br/>starts with hello.</h1><p className="intro">Hello World from React. This first milestone connects our interface to an Express API.</p>
      <section aria-labelledby="connection"><h2 id="connection">API connection</h2><p role="status" className={result.state}>{result.message}</p><button disabled={result.state === 'loading'} onClick={() => setAttempt(value => value + 1)}>Check again</button></section>
      <section aria-labelledby="scope"><h2 id="scope">This week’s foundation</h2><ul><li>React client and production build</li><li>Express Hello World and health endpoint</li><li>Configuration for Vercel and Render</li></ul><p>Project boards, accounts and tasks arrive in later milestones.</p></section>
    </main><footer>TeamBoard · A Kanban-based Project Management Web App for Student Teams</footer></>;
}
createRoot(document.getElementById('root')).render(<App />);
