
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
    <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bungee text-white">
          {isTournamentOver 
            ? "Vincitore del Torneo!" 
            : canPlayFinal 
              ? "Qualificazioni Finite!" 
              : `Classifica Round ${gameData.currentRound}/${totalRounds}`
          }
        </h1>
        {canPlayFinal && <p className="text-rose-400 font-bold animate-pulse">Solo i primi 4 accedono alla Finalissima!</p>}
        {!isTournamentOver && !canPlayFinal && <p className="text-slate-400">La competizione è accesa!</p>}
      </header>

      <div className="glass w-full p-4 rounded-3xl flex flex-col gap-2 max-h-[55vh] overflow-y-auto custom-scrollbar relative">
        {sortedPlayers.map((player, idx) => (
          <React.Fragment key={player.id}>
            {/* Divider for the cut */}
            {canPlayFinal && idx === 4 && (
               <div className="relative py-2 text-center">
                 <div className="absolute inset-0 flex items-center" aria-hidden="true">
                   <div className="w-full border-t border-rose-500 border-dashed"></div>
                 </div>
                 <span className="relative bg-slate-900 px-2 text-xs text-rose-500 font-bold uppercase">Eliminati</span>
               </div>
            )}
            
            <div 
              className={`flex items-center p-3 rounded-xl border transition-all ${
                idx === 0 
                  ? 'bg-amber-500/20 border-amber-500/50 scale-[1.02]' 
                  : idx < 4 && canPlayFinal
                  ? 'bg-indigo-500/20 border-indigo-500/50'
                  : idx < 3 && isTournamentOver
                  ? 'bg-slate-700/50 border-slate-600' // Top 3 generic style
                  : 'bg-slate-800/50 border-slate-700 opacity-80'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                 idx === 0 ? 'bg-amber-500 text-black' : 
                 idx === 1 ? 'bg-slate-400 text-black' : 
                 idx === 2 ? 'bg-orange-700 text-white' : 
                 'bg-slate-700 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-grow flex flex-col">
                <span className={`font-bold ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                  {player.name}
                </span>
                {canPlayFinal && idx < 4 && (
                   <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Qualificato</span>
                )}
              </div>
              <div className="font-bungee text-xl text-white">
                {player.score} <span className="text-xs font-sans text-slate-400">pt</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="w-full pt-4">
        {canPlayFinal ? (
           <Button fullWidth size="lg" onClick={onStartFinal} className="bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30">
             <i className="fa-solid fa-fire mr-2"></i>
             Gioca Finalissima
           </Button>
        ) : isTournamentOver ? (
           <Button fullWidth size="lg" onClick={onEndTournament} className="bg-amber-500 hover:bg-amber-600 text-black">
             Nuovo Torneo
           </Button>
        ) : (
           <Button fullWidth size="lg" onClick={onNextRound}>
             Inizia Round {gameData.currentRound + 1}
           </Button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
