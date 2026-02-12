
import React, { useState, useEffect } from 'react';
import { GameData, GameSettings } from '../types';
import { Button } from './ui/Button';

interface PlayScreenProps {
  gameData: GameData;
  settings: GameSettings;
  onVote: () => void;
  onEnd: (winner: 'players' | 'impostor') => void;
}

const STRATEGIC_TIPS = [
  "Non essere troppo specifico, o l'impostore capirà la parola!",
  "Non essere troppo vago, o penseranno che sei tu l'impostore!",
  "Osserva le reazioni degli altri quando viene detta una parola chiave.",
  "Cerca di collegarti a quello che ha detto il giocatore precedente.",
  "Se sei l'impostore, rimani calmo e segui la corrente."
];

const PlayScreen: React.FC<PlayScreenProps> = ({ gameData, settings, onVote, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentTip, setCurrentTip] = useState(STRATEGIC_TIPS[0]);

  useEffect(() => {
    // Timer Logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onVote();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Random Tip Logic
    const tipInterval = setInterval(() => {
      setCurrentTip(STRATEGIC_TIPS[Math.floor(Math.random() * STRATEGIC_TIPS.length)]);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(tipInterval);
    };
  }, [onVote]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextTurn = () => {
    setTurnIndex((prev) => (prev + 1) % gameData.players.length);
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="glass p-6 rounded-3xl text-center border-indigo-500/30 flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tempo</p>
          <div className={`text-2xl font-bungee ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-10 w-px bg-slate-700"></div>
        <div className="text-right">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Turno di:</p>
          <div className="text-xl font-bungee text-indigo-400 truncate max-w-[150px]">
            {gameData.players[turnIndex].name}
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl space-y-4 text-center">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <i className="fa-solid fa-bullhorn text-indigo-400"></i>
          Regola del Round
        </h3>
        <p className="text-slate-300 text-sm">
          A turno, ogni giocatore deve dire <span className="text-indigo-400 font-bold">una sola parola</span> attinente alla parola segreta.
        </p>
        <Button variant="secondary" size="sm" onClick={nextTurn}>Prossimo Giocatore</Button>
      </div>

      <div className="glass p-6 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className="fa-solid fa-chess-knight text-6xl text-white"></i>
        </div>
        <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-300 uppercase tracking-wider relative z-10">
          <i className="fa-solid fa-lightbulb"></i>
          Consiglio Strategico
        </h3>
        <p className="text-slate-300 text-sm italic min-h-[40px] flex items-center relative z-10 transition-opacity duration-500">
          "{currentTip}"
        </p>
      </div>

      <div className="glass p-6 rounded-3xl">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Ordine di gioco:</h3>
        <div className="flex flex-col gap-2">
          {gameData.players.map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${idx === turnIndex ? 'bg-indigo-600/20 border border-indigo-500/50' : 'opacity-50'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === turnIndex ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {idx + 1}
              </span>
              <span className={`text-sm font-medium ${idx === turnIndex ? 'text-white' : 'text-slate-400'}`}>
                {p.name}
              </span>
              {idx === turnIndex && <i className="fa-solid fa-chevron-left ml-auto text-indigo-400 animate-bounce-horizontal"></i>}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button fullWidth size="lg" onClick={onVote}>Passa alla Votazione</Button>
      </div>
    </div>
  );
};

export default PlayScreen;
