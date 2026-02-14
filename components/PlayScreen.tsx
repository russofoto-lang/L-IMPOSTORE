
import React, { useState, useEffect, useMemo } from 'react';
import { GameData, GameSettings } from '../types';
import { Button } from './ui/Button';

interface PlayScreenProps {
  gameData: GameData;
  settings: GameSettings;
  onVote: () => void;
  onEnd: (winner: 'players' | 'impostor' | 'mr_wolf') => void;
}

const STRATEGIC_TIPS = [
  "Non essere troppo specifico, o l'impostore capirà la parola!",
  "Non essere troppo vago, o penseranno che sei tu l'impostore!",
  "Osserva le reazioni degli altri quando viene detta una parola chiave.",
  "Cerca di collegarti a quello che ha detto il giocatore precedente.",
  "Se sei l'impostore, rimani calmo e segui la corrente."
];

const WOLF_TIPS = [
  "Attenzione! Se Mr. Wolf capisce la parola, vince anche se lo scoprite!",
  "Siate criptici! Mr. Wolf vi ascolta per indovinare.",
  "Non regalare la parola segreta a Mr. Wolf!",
];

const PlayScreen: React.FC<PlayScreenProps> = ({ gameData, settings, onVote, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [turnIndex, setTurnIndex] = useState(0);
  
  // Combine tips based on mode
  const currentPool = useMemo(() =>
    settings.enemyConfig === 'WOLF_ONLY' || settings.enemyConfig === 'BOTH' ? [...STRATEGIC_TIPS, ...WOLF_TIPS] : STRATEGIC_TIPS,
    [settings.enemyConfig]
  );
  const [currentTip, setCurrentTip] = useState(currentPool[0]);

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
      setCurrentTip(currentPool[Math.floor(Math.random() * currentPool.length)]);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(tipInterval);
    };
  }, [onVote, currentPool]);

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
      <div className="glass p-6 rounded-3xl text-center border-indigo-500/30 flex justify-between items-center shadow-lg">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Tempo</p>
          <div className={`text-4xl font-bungee ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-12 w-px bg-slate-700 mx-2"></div>
        <div className="text-right flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Turno di:</p>
          <div className="text-2xl font-bungee text-indigo-400 truncate w-full">
            {gameData.players[turnIndex].name}
          </div>
        </div>
      </div>

      <div className="glass p-7 rounded-3xl space-y-5 text-center">
        <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <i className="fa-solid fa-bullhorn text-indigo-400"></i>
          Regola del Round
        </h3>
        <p className="text-slate-300 text-base leading-relaxed">
          A turno, ogni giocatore deve dire <span className="text-indigo-400 font-bold">una sola parola</span> attinente alla parola segreta.
        </p>
        <Button variant="secondary" size="md" onClick={nextTurn} className="text-lg">Prossimo Giocatore</Button>
      </div>

      <div className={`glass p-6 rounded-3xl space-y-4 relative overflow-hidden ${settings.enemyConfig !== 'IMPOSTOR_ONLY' ? 'border-amber-500/30' : ''}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className={`fa-solid ${settings.enemyConfig !== 'IMPOSTOR_ONLY' ? 'fa-dog' : 'fa-chess-knight'} text-6xl text-white`}></i>
        </div>
        <h3 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wider relative z-10 ${settings.enemyConfig !== 'IMPOSTOR_ONLY' ? 'text-amber-400' : 'text-indigo-300'}`}>
          <i className="fa-solid fa-lightbulb"></i>
          {settings.enemyConfig !== 'IMPOSTOR_ONLY' ? 'Consiglio Anti-Wolf' : 'Consiglio Strategico'}
        </h3>
        <p className="text-slate-300 text-base italic min-h-[50px] flex items-center relative z-10 transition-opacity duration-500 leading-relaxed">
          "{currentTip}"
        </p>
      </div>

      <div className="glass p-6 rounded-3xl">
        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Ordine di gioco:</h3>
        <div className="flex flex-col gap-3">
          {gameData.players.map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors border ${idx === turnIndex ? 'bg-indigo-600/20 border-indigo-500/50 scale-105' : 'border-transparent opacity-50'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === turnIndex ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {idx + 1}
              </span>
              <span className={`text-lg font-bold ${idx === turnIndex ? 'text-white' : 'text-slate-400'}`}>
                {p.name}
              </span>
              {idx === turnIndex && <i className="fa-solid fa-chevron-left ml-auto text-indigo-400 animate-bounce-horizontal text-xl"></i>}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button fullWidth size="lg" onClick={onVote} className="text-xl py-5">Votazione Ora!</Button>
      </div>
    </div>
  );
};

export default PlayScreen;
