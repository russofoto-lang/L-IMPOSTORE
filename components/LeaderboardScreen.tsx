
import React from 'react';
import { GameData, Player } from '../types';
import { Button } from './ui/Button';

interface LeaderboardScreenProps {
  gameData: GameData;
  totalRounds: number;
  onNextRound: () => void;
  onStartFinal: () => void;
  onEndTournament: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ 
  gameData, 
  totalRounds, 
  onNextRound,
  onStartFinal,
  onEndTournament 
}) => {
  // Sort players by score (descending)
  const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);
  
  const isRegularRoundsDone = gameData.currentRound >= totalRounds;
  const isFinalRound = gameData.isFinalRound;
  // Condition for Finalissima: Regular rounds done, not yet final, and enough players
  const canPlayFinal = isRegularRoundsDone && !isFinalRound && sortedPlayers.length > 4;
  
  const isTournamentOver = (isRegularRoundsDone && !canPlayFinal) || isFinalRound;

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-right duration-500">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bungee text-white drop-shadow-md">
          {isTournamentOver 
            ? "Vincitore Torneo!" 
            : canPlayFinal 
              ? "Qualificazioni!" 
              : `Round ${gameData.currentRound}/${totalRounds}`
          }
        </h1>
        {canPlayFinal && <p className="text-rose-400 font-bold text-lg animate-pulse uppercase tracking-widest">Top 4 Qualificati!</p>}
        {!isTournamentOver && !canPlayFinal && <p className="text-slate-400 text-lg">La sfida continua!</p>}
      </header>

      <div className="glass w-full p-5 rounded-[2.5rem] flex flex-col gap-3 max-h-[55vh] overflow-y-auto custom-scrollbar relative border-slate-700 shadow-xl">
        {sortedPlayers.map((player, idx) => (
          <React.Fragment key={player.id}>
            {/* Divider for the cut */}
            {canPlayFinal && idx === 4 && (
               <div className="relative py-4 text-center">
                 <div className="absolute inset-0 flex items-center" aria-hidden="true">
                   <div className="w-full border-t border-rose-500 border-dashed opacity-50"></div>
                 </div>
                 <span className="relative bg-[#1e293b] px-4 text-sm text-rose-500 font-bold uppercase tracking-widest">Eliminati</span>
               </div>
            )}
            
            <div 
              className={`flex items-center p-4 rounded-2xl border transition-all ${
                idx === 0 
                  ? 'bg-amber-500/20 border-amber-500/50 scale-[1.03] shadow-lg' 
                  : idx < 4 && canPlayFinal
                  ? 'bg-indigo-500/20 border-indigo-500/50 shadow-sm'
                  : idx < 3 && isTournamentOver
                  ? 'bg-slate-700/50 border-slate-600 shadow-sm'
                  : 'bg-slate-800/50 border-slate-700 opacity-80'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 shadow-sm ${
                 idx === 0 ? 'bg-amber-500 text-black' : 
                 idx === 1 ? 'bg-slate-400 text-black' : 
                 idx === 2 ? 'bg-orange-700 text-white' : 
                 'bg-slate-700 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-grow flex flex-col min-w-0">
                <span className={`font-bold text-xl truncate ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                  {player.name}
                </span>
                {canPlayFinal && idx < 4 && (
                   <span className="text-[11px] text-indigo-300 uppercase font-bold tracking-widest">Qualificato</span>
                )}
              </div>
              <div className="font-bungee text-2xl text-white ml-2">
                {player.score}<span className="text-sm font-sans text-slate-400 ml-1">pt</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="w-full pt-4 space-y-3">
        {canPlayFinal ? (
           <Button fullWidth size="lg" onClick={onStartFinal} className="bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30 text-xl py-5">
             <i className="fa-solid fa-fire mr-3"></i>
             Gioca Finalissima
           </Button>
        ) : isTournamentOver ? (
           <Button fullWidth size="lg" onClick={onEndTournament} className="bg-amber-500 hover:bg-amber-600 text-black text-xl py-5">
             Nuovo Torneo
           </Button>
        ) : (
           <Button fullWidth size="lg" onClick={onNextRound} className="text-xl py-5">
             Round {gameData.currentRound + 1}
           </Button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
