
import React from 'react';
import { GroupTournamentState } from '../types';
import { Button } from './ui/Button';

interface TournamentWinnersScreenProps {
  tournamentState: GroupTournamentState;
  onRestart: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [
  'bg-amber-500/20 border-amber-500 text-amber-300',
  'bg-slate-400/20 border-slate-400 text-slate-300',
  'bg-orange-700/20 border-orange-700 text-orange-400'
];

const TournamentWinnersScreen: React.FC<TournamentWinnersScreenProps> = ({
  tournamentState,
  onRestart
}) => {
  const { finalists } = tournamentState;

  // finalists are already sorted (they came from the final leaderboard)
  const sortedWinners = [...finalists].sort((a, b) => b.groupScore - a.groupScore);
  const winners = sortedWinners.slice(0, 2);
  const others = sortedWinners.slice(2);

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500 pb-8">
      {/* Header */}
      <header className="text-center space-y-2 pt-4">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-5xl font-bungee text-amber-400 drop-shadow-lg">
          {winners.length === 1 ? 'Vincitore!' : 'Vincitori!'}
        </h1>
        <p className="text-slate-400 text-base">Il torneo a gironi è terminato</p>
      </header>

      {/* Winners podium */}
      <div className="glass w-full p-5 rounded-3xl space-y-3">
        {winners.map((w, idx) => (
          <div
            key={w.name}
            className={`flex items-center p-4 rounded-2xl border ${MEDAL_COLORS[idx]} scale-[${idx === 0 ? '1.03' : '1'}]`}
            style={{ transform: idx === 0 ? 'scale(1.03)' : 'scale(1)' }}
          >
            <span className="text-3xl mr-4">{MEDALS[idx]}</span>
            <div className="flex-grow">
              <div className="font-bold text-2xl">{w.name}</div>
              <div className="text-xs opacity-70 uppercase tracking-widest font-bold">
                {idx === 0 ? 'Campione del Torneo' : '2° Classificato'}
              </div>
            </div>
            <div className="font-bungee text-2xl">
              {w.groupScore}
              <span className="text-sm font-sans opacity-60 ml-1">pt</span>
            </div>
          </div>
        ))}
      </div>

      {/* Other finalists */}
      {others.length > 0 && (
        <div className="glass w-full p-4 rounded-3xl space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Altri finalisti
          </h3>
          {others.map((f, idx) => (
            <div
              key={f.name}
              className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm mr-3">
                {idx + 3}
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
      <div className="glass w-full p-4 rounded-3xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
          Riepilogo torneo
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bungee text-indigo-400">
              {tournamentState.allGroupResults.filter((_, i) => i < tournamentState.groups.length - (tournamentState.phase === 'FINAL' ? 1 : 0)).length}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Gironi giocati</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bungee text-rose-400">
              {tournamentState.allGroupResults.reduce((acc, g) => acc + g.players.length, 0)}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Partecipanti totali</div>
          </div>
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={onRestart}
        className="text-xl py-5 bg-amber-500 hover:bg-amber-400 text-black"
      >
        <i className="fa-solid fa-rotate-right mr-3"></i>
        Nuovo Torneo
      </Button>
    </div>
  );
};

export default TournamentWinnersScreen;
