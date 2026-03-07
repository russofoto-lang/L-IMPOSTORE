
import React, { useEffect, useRef } from 'react';
import { GroupTournamentState } from '../types';
import { Button } from './ui/Button';

interface TournamentWinnersScreenProps {
  tournamentState: GroupTournamentState;
  onRestart: () => void;
}

// ── Confetti canvas ──────────────────────────────────────────────────────────
const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#CE93D8', '#FFB74D', '#F06292', '#4DB6AC'];

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      color: string;
      w: number; h: number;
      angle: number; spin: number;
      opacity: number;
    };

    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: 8 + Math.random() * 8,
        h: 4 + Math.random() * 4,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 8,
        opacity: 1,
      });
    }

    let animId: number;
    let done = false;

    const animate = () => {
      if (done) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allBelow = true;
      for (const p of particles) {
        if (p.y < canvas.height + 20) allBelow = false;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        // Fade near bottom
        if (p.y > canvas.height * 0.75) {
          p.opacity -= 0.02;
        }
      }

      if (!allBelow) {
        animId = requestAnimationFrame(animate);
      } else {
        done = true;
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      done = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];
const MEDAL_STYLES = [
  'bg-amber-500/20 border-amber-500 text-amber-300',
  'bg-slate-400/20 border-slate-400 text-slate-300',
  'bg-orange-700/20 border-orange-600 text-orange-400',
];
const PLACE_LABELS = ['Campione del Torneo', '2° Classificato', '3° Classificato'];

const TournamentWinnersScreen: React.FC<TournamentWinnersScreenProps> = ({
  tournamentState,
  onRestart
}) => {
  const { finalists, allGroupResults } = tournamentState;

  const sortedWinners = [...finalists].sort((a, b) => b.groupScore - a.groupScore);
  const podium = sortedWinners.slice(0, 3);
  const rest = sortedWinners.slice(3);

  const totalGroups = allGroupResults.filter(r => r.groupIndex < (tournamentState.numGroups)).length;
  const totalParticipants = new Set(
    allGroupResults.flatMap(g => g.players.map(p => p.name))
  ).size;

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-700 pb-8 relative">
      <ConfettiCanvas />

      {/* Header */}
      <header className="text-center space-y-2 pt-4 relative z-10">
        <div className="text-6xl mb-2 animate-bounce">🏆</div>
        <h1 className="text-5xl font-bungee text-amber-400 drop-shadow-lg">
          {podium.length === 1 ? 'Vincitore!' : 'Podio Finale!'}
        </h1>
        <p className="text-slate-400 text-base">Il torneo a gironi è terminato</p>
      </header>

      {/* Podium — top 3 */}
      <div className="glass w-full p-5 rounded-3xl space-y-3 relative z-10">
        {podium.map((w, idx) => (
          <div
            key={w.name}
            className={`flex items-center p-4 rounded-2xl border transition-all ${MEDAL_STYLES[idx]}`}
            style={{ transform: idx === 0 ? 'scale(1.04)' : 'scale(1)' }}
          >
            <span className="text-3xl mr-4">{MEDAL_EMOJIS[idx]}</span>
            <div className="flex-grow min-w-0">
              <div className="font-bold text-2xl truncate">{w.name}</div>
              <div className="text-xs opacity-70 uppercase tracking-widest font-bold">
                {PLACE_LABELS[idx]}
              </div>
            </div>
            <div className="font-bungee text-2xl ml-2 shrink-0">
              {w.groupScore}
              <span className="text-sm font-sans opacity-60 ml-1">pt</span>
            </div>
          </div>
        ))}
      </div>

      {/* Other finalists */}
      {rest.length > 0 && (
        <div className="glass w-full p-4 rounded-3xl space-y-2 relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Altri finalisti
          </h3>
          {rest.map((f, idx) => (
            <div
              key={f.name}
              className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm mr-3">
                {idx + 4}
              </div>
              <span className="flex-grow text-slate-300 font-medium">{f.name}</span>
              <span className="font-bungee text-slate-400">
                {f.groupScore}
                <span className="text-xs font-sans ml-1 opacity-60">pt</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div className="glass w-full p-4 rounded-3xl relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
          Riepilogo torneo
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bungee text-indigo-400">{totalGroups}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Gironi giocati</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bungee text-rose-400">{totalParticipants}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Partecipanti</div>
          </div>
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={onRestart}
        className="text-xl py-5 bg-amber-500 hover:bg-amber-400 text-black relative z-10"
      >
        <i className="fa-solid fa-rotate-right mr-3"></i>
        Nuovo Torneo
      </Button>
    </div>
  );
};

export default TournamentWinnersScreen;
