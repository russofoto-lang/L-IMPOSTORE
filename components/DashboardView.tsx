
/**
 * DashboardView — Vista proiezione torneo (16:9, grande schermo)
 *
 * Sync priority:
 *  1. GET /_sync  — cross-device (telefono + TV sulla stessa WiFi, via Vite dev server)
 *  2. BroadcastChannel — stesso browser, tab diverse
 *  3. localStorage — fallback stesso dispositivo
 */
import React, { useState, useEffect, useRef } from 'react';
import { DashboardState, WildCardCandidate } from '../types';

const DASHBOARD_KEY = 'impostore_dashboard';

// Try network sync first, fall back to localStorage
const fetchDashboard = async (): Promise<DashboardState | null> => {
  try {
    const res = await fetch('/_sync', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data) return data as DashboardState;
    }
  } catch {}
  // Fallback: localStorage (same device)
  try {
    const raw = localStorage.getItem(DASHBOARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Confetti for winners ──────────────────────────────────────────────────────
const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#CE93D8', '#FFB74D'];
    const particles = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 400,
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: 10 + Math.random() * 10,
      h: 5 + Math.random() * 5,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;
      for (const p of particles) {
        if (p.y < canvas.height + 20) allDone = false;
        p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.015;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (!allDone) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const groupLetter = (i: number) => String.fromCharCode(65 + i);

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_BG = [
  'bg-amber-500/30 border-amber-500 text-amber-200',
  'bg-slate-400/20 border-slate-400 text-slate-200',
  'bg-orange-700/20 border-orange-600 text-orange-300',
];

// ── Main ─────────────────────────────────────────────────────────────────────
const DashboardView: React.FC = () => {
  const [ds, setDs] = useState<DashboardState | null>(null);
  const [syncMode, setSyncMode] = useState<'network' | 'local' | 'waiting'>('waiting');

  // Multi-source sync: /_sync (network) > BroadcastChannel > localStorage
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch('/_sync', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && !cancelled) { setDs(data); setSyncMode('network'); return; }
        }
      } catch {}
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(DASHBOARD_KEY);
        if (raw && !cancelled) { setDs(JSON.parse(raw)); setSyncMode('local'); }
      } catch {}
    };

    refresh();
    const interval = setInterval(refresh, 1500);

    // BroadcastChannel for instant same-browser updates
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(DASHBOARD_KEY);
      bc.onmessage = (e) => { try { if (!cancelled) { setDs(JSON.parse(e.data)); setSyncMode('local'); } } catch {} };
    } catch {}

    // StorageEvent fallback
    const onStorage = (e: StorageEvent) => {
      if (e.key === DASHBOARD_KEY && e.newValue && !cancelled) {
        try { setDs(JSON.parse(e.newValue)); setSyncMode('local'); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      clearInterval(interval);
      bc?.close();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // URL that other devices can use to view this dashboard
  const dashboardUrl = `${window.location.origin}/?dashboard=1`;

  if (!ds) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-lg px-8">
          <div className="text-8xl">📺</div>
          <h1 className="text-5xl font-bungee text-indigo-400">Proiezione Torneo</h1>
          <p className="text-slate-300 text-2xl">In attesa del torneo...</p>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-2 text-left">
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">URL proiezione</p>
            <p className="text-indigo-300 font-mono text-lg break-all">{dashboardUrl}</p>
            <p className="text-slate-600 text-sm">
              Apri questo link sul dispositivo del proiettore mentre giochi sul telefono
            </p>
          </div>
          <div className="flex items-center gap-2 justify-center text-slate-600 text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span>In ascolto aggiornamenti...</span>
          </div>
        </div>
      </div>
    );
  }

  const isWinners = ds.gameState === 'TOURNAMENT_WINNERS';

  if (isWinners) {
    const sortedFinalists = [...ds.finalists].sort((a, b) => b.groupScore - a.groupScore);
    const podium = sortedFinalists.slice(0, 3);
    const rest = sortedFinalists.slice(3);
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-8 font-sans">
        <ConfettiCanvas />
        <div className="relative z-10 text-center space-y-8 w-full max-w-4xl">
          <div>
            <div className="text-8xl mb-4 animate-bounce inline-block">🏆</div>
            <h1 className="text-7xl font-bungee text-amber-400 drop-shadow-2xl">PODIO FINALE</h1>
            <p className="text-slate-400 text-2xl mt-2">Il torneo a gironi è terminato!</p>
          </div>
          <div className="grid gap-4">
            {podium.map((w, i) => (
              <div
                key={w.name}
                className={`flex items-center px-8 py-6 rounded-3xl border-2 ${MEDAL_BG[i]} transition-all`}
                style={{ transform: i === 0 ? 'scale(1.05)' : 'scale(1)' }}
              >
                <span className="text-5xl mr-6">{MEDALS[i]}</span>
                <div className="flex-grow text-left">
                  <div className={`font-bungee text-4xl ${i === 0 ? 'text-amber-300' : 'text-white'}`}>{w.name}</div>
                  <div className="text-slate-400 uppercase text-sm tracking-widest font-bold mt-1">
                    {i === 0 ? 'Campione del Torneo' : i === 1 ? '2° Classificato' : '3° Classificato'}
                  </div>
                </div>
                <div className="font-bungee text-4xl text-white">
                  {w.groupScore}<span className="text-lg font-sans text-slate-400 ml-2">pt</span>
                </div>
              </div>
            ))}
          </div>
          {rest.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {rest.map((f, i) => (
                <div key={f.name} className="px-5 py-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-300">
                  <span className="text-slate-500 font-bold mr-2">{i + 4}°</span>
                  <span className="font-bold text-lg">{f.name}</span>
                  <span className="text-slate-500 font-bungee ml-3">{f.groupScore}pt</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main tournament dashboard ─────────────────────────────────────────────

  const isPlaying = ['PLAYING', 'VOTING', 'RESULT', 'LEADERBOARD'].includes(ds.gameState);
  const sortedWild: WildCardCandidate[] = [...ds.wildCardPool].sort((a, b) => b.groupScore - a.groupScore);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col font-sans overflow-hidden">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-10 py-5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bungee text-indigo-500 italic tracking-tighter">L'IMPOSTORE</span>
          <span className="text-slate-600 text-2xl">|</span>
          <span className="text-slate-300 text-xl font-bold uppercase tracking-wider">
            {ds.tournamentPhase === 'FINAL' ? 'FASE FINALE' : 'TORNEO A GIRONI'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bungee text-white">{ds.groupLabel}</div>
          {ds.roundLabel && (
            <div className="text-slate-400 text-sm uppercase tracking-widest font-bold">{ds.roundLabel}</div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Sync mode indicator */}
          <div className="flex items-center gap-2" title={syncMode === 'network' ? 'Sync rete attiva' : 'Sync locale'}>
            <div className={`w-2.5 h-2.5 rounded-full ${syncMode === 'network' ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`}></div>
            <span className={`text-xs uppercase tracking-wider font-bold ${syncMode === 'network' ? 'text-green-500' : 'text-amber-500'}`}>
              {syncMode === 'network' ? 'RETE' : 'LOCALE'}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-slate-400 text-sm uppercase tracking-wider font-bold">
            {isPlaying ? 'IN CORSO' : ds.gameState === 'GROUP_LOBBY' ? 'IN ATTESA' : ds.gameState}
          </span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 grid grid-cols-3 gap-6 px-8 py-6 min-h-0">

        {/* ── Left: All groups overview ── */}
        <div className="flex flex-col gap-4 overflow-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Struttura gironi</h2>
          {ds.allGroups.map((group, idx) => {
            const isDone = idx < ds.currentGroupIndex || ds.gameState === 'LEADERBOARD';
            const isCurrent = idx === ds.currentGroupIndex;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-4 transition-all ${
                  isCurrent
                    ? 'bg-indigo-900/30 border-indigo-500/60'
                    : isDone
                    ? 'bg-slate-800/30 border-slate-700/40 opacity-60'
                    : 'bg-slate-800/20 border-slate-800/40 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bungee text-lg ${isCurrent ? 'text-indigo-300' : isDone ? 'text-green-400' : 'text-slate-500'}`}>
                    {isDone && !isCurrent && <i className="fa-solid fa-check mr-2 text-sm"></i>}
                    Girone {groupLetter(idx)}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-indigo-600/50 text-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Ora
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.map(name => {
                    const isDirect = ds.directQualifiers.some(q => q.name === name);
                    const isWild = ds.wildCardPool.some(w => w.name === name);
                    return (
                      <span
                        key={name}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isDirect ? 'bg-green-600/30 border border-green-500/50 text-green-300'
                          : isWild ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300'
                          : isCurrent ? 'bg-slate-700 text-white'
                          : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDirect && <i className="fa-solid fa-arrow-up mr-1 text-[9px]"></i>}
                        {isWild && !isDirect && <i className="fa-solid fa-star mr-1 text-[9px]"></i>}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Center: Live scoreboard ── */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            {isPlaying ? 'Classifica live' : 'Prossimo girone'}
          </h2>

          {isPlaying && ds.currentPlayers.length > 0 ? (
            <div className="flex flex-col gap-2 flex-1">
              {ds.currentPlayers.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center px-5 py-4 rounded-2xl border transition-all ${
                    i === 0
                      ? 'bg-amber-500/20 border-amber-500/60 scale-[1.02]'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base mr-4 ${
                    i === 0 ? 'bg-amber-500 text-black'
                    : i === 1 ? 'bg-slate-400 text-black'
                    : i === 2 ? 'bg-orange-700 text-white'
                    : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`flex-grow font-bold text-xl ${i === 0 ? 'text-amber-300' : 'text-white'}`}>
                    {p.name}
                  </span>
                  <div className="font-bungee text-2xl text-white">
                    {p.score}<span className="text-sm font-sans text-slate-400 ml-1">pt</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <i className="fa-solid fa-hourglass-half text-4xl text-slate-600"></i>
                <p className="text-slate-500 text-lg font-bold uppercase tracking-wider">
                  {ds.gameState === 'GROUP_LOBBY'
                    ? `In attesa — Girone ${groupLetter(ds.currentGroupIndex)}`
                    : 'Caricamento...'}
                </p>
                {ds.allGroups[ds.currentGroupIndex] && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {ds.allGroups[ds.currentGroupIndex].map(name => (
                      <span key={name} className="px-4 py-2 rounded-xl bg-indigo-700/30 border border-indigo-500/40 text-indigo-200 font-bold text-lg">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Qualifiers ── */}
        <div className="flex flex-col gap-4">
          {/* Direct qualifiers */}
          {ds.directQualifiers.length > 0 && (
            <div className="glass-dash rounded-2xl p-5 border border-green-600/30 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                <i className="fa-solid fa-arrow-up"></i>
                Qualificati diretti ({ds.directQualifiers.length})
              </h2>
              <div className="flex flex-col gap-2">
                {ds.directQualifiers.map(q => (
                  <div key={q.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-800/20 border border-green-700/30">
                    <span className="font-bold text-green-200 text-lg">{q.name}</span>
                    <span className="font-bungee text-green-400">{q.groupScore}<span className="text-xs text-green-700 ml-1">pt</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wild card pool */}
          {ds.wildCardsNeeded > 0 && sortedWild.length > 0 && (
            <div className="glass-dash rounded-2xl p-5 border border-amber-600/30 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <i className="fa-solid fa-star"></i>
                Ripescaggio ({ds.wildCardsNeeded} {ds.wildCardsNeeded === 1 ? 'posto' : 'posti'})
              </h2>
              <div className="flex flex-col gap-2">
                {sortedWild.map((w, i) => (
                  <div
                    key={w.name}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                      i < ds.wildCardsNeeded
                        ? 'bg-amber-800/20 border-amber-700/40 text-amber-200'
                        : 'bg-slate-800/30 border-slate-700/30 text-slate-500'
                    }`}
                  >
                    <span className="font-bold text-lg">{w.name}</span>
                    <span className="font-bungee">{w.groupScore}<span className="text-xs ml-1 opacity-50">pt</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finalists (final phase) */}
          {ds.tournamentPhase === 'FINAL' && ds.finalists.length > 0 && (
            <div className="glass-dash rounded-2xl p-5 border border-amber-500/40 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <i className="fa-solid fa-trophy"></i>
                Finalisti ({ds.finalists.length})
              </h2>
              <div className="flex flex-col gap-2">
                {[...ds.finalists]
                  .sort((a, b) => b.groupScore - a.groupScore)
                  .map(f => (
                    <div key={f.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-800/20 border border-amber-700/30">
                      <span className="font-bold text-amber-200 text-lg">{f.name}</span>
                      <span className="font-bungee text-amber-400">{f.groupScore}<span className="text-xs text-amber-700 ml-1">pt</span></span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Scoring legend */}
          <div className="mt-auto glass-dash rounded-2xl p-4 border border-slate-700/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Sistema Punteggio</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-400">
              <div><span className="text-green-400 font-bold mr-1">+3</span> Villaggio vince</div>
              <div><span className="text-rose-400 font-bold mr-1">+5</span> Nemico vince</div>
              <div><span className="text-indigo-400 font-bold mr-1">+1</span> Bonus Fiuto</div>
              <div><span className="text-amber-400 font-bold mr-1">+2</span> Bonus Infiltrato</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-10 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
        <div className="text-slate-600 text-sm uppercase tracking-wider font-bold">
          {ds.allGroups.length > 0
            ? `${Math.min(ds.currentGroupIndex, ds.allGroups.length)} / ${ds.allGroups.length} gironi completati`
            : ''}
        </div>
        {/* Next group preview */}
        {ds.gameState !== 'GROUP_LOBBY' && ds.currentGroupIndex + 1 < ds.allGroups.length && (
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <span className="uppercase tracking-wider font-bold">Prossimo:</span>
            <span className="font-bold text-slate-400">Girone {groupLetter(ds.currentGroupIndex + 1)}</span>
            <div className="flex gap-1.5">
              {ds.allGroups[ds.currentGroupIndex + 1]?.map(n => (
                <span key={n} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs">{n}</span>
              ))}
            </div>
          </div>
        )}
        <div className="text-slate-700 text-xs font-bold uppercase tracking-widest">
          Aggiornato {new Date(ds.timestamp).toLocaleTimeString('it-IT')}
        </div>
      </footer>
    </div>
  );
};

export default DashboardView;
