
import React from 'react';
import { GameData, GameMode } from '../types';
import { Button } from './ui/Button';

interface ResultScreenProps {
  gameData: GameData;
  mode: GameMode;
  onNext: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ gameData, mode, onNext }) => {
  const winner = gameData.winner;
  const isFinal = gameData.isFinalRound;
  
  // Identify Enemies
  const impostor = gameData.players.find(p => p.role === 'IMPOSTOR');
  const wolf = gameData.players.find(p => p.role === 'MR_WOLF');

  let title = "";
  let subTitle = "";
  let headerColor = "";

  if (winner === 'players') {
    title = "I Civili Vincono!";
    headerColor = "text-indigo-500";
    if (gameData.winMethod === 'guess') subTitle = "Mr. Wolf ha sbagliato la parola!";
    else subTitle = "L'intruso è stato eliminato.";
  } else if (winner === 'mr_wolf') {
    title = "Mr. Wolf Vince!";
    headerColor = "text-amber-500";
    subTitle = "Ha rubato la vittoria indovinando!";
  } else if (winner === 'enemies') {
    title = "I Nemici Vincono!";
    headerColor = "text-rose-500";
    subTitle = "Avete eliminato un innocente!";
  } else {
    title = "L'Impostore Vince!";
    headerColor = "text-rose-500";
    subTitle = "È riuscito a scappare.";
  }

  const renderPlayerBadge = (label: string, name: string | undefined, color: 'rose' | 'amber' | 'indigo') => {
    if (!name) return null;
    const colors = {
      rose: "bg-rose-500/10 border-rose-500/50 text-rose-400",
      amber: "bg-amber-500/10 border-amber-500/50 text-amber-400",
      indigo: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
    };

    return (
      <div className={`p-3 rounded-xl border ${colors[color]} w-full flex justify-between items-center`}>
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
        <span className="font-bungee text-xl">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
      <header className="text-center space-y-2">
        <h1 className={`text-4xl font-bungee ${headerColor}`}>
          {title}
        </h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
          {isFinal ? "FINALISSIMA CONCLUSA" : subTitle}
        </p>
      </header>

      <div className="glass w-full p-6 rounded-3xl flex flex-col items-center space-y-4 text-center border-slate-700">
        
        <div className="w-full space-y-2">
          {renderPlayerBadge("Impostore", impostor?.name, 'rose')}
          {renderPlayerBadge("Mr. Wolf", wolf?.name, 'amber')}
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-700 w-full">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">La parola segreta era:</p>
          <h2 className="text-3xl font-bungee text-indigo-400 uppercase">{gameData.secretWord}</h2>
        </div>

        {mode === 'TOURNAMENT' && (
          <div className="w-full p-3 rounded-xl bg-slate-900/50 text-sm text-slate-400">
            Controlla la classifica per i punteggi aggiornati.
          </div>
        )}
      </div>

      <div className="w-full space-y-3 pt-2">
        <Button fullWidth size="lg" onClick={onNext}>
          {mode === 'TOURNAMENT' ? 'Vedi Classifica' : 'Nuova Partita'}
        </Button>
        <Button fullWidth variant="ghost" onClick={() => window.location.reload()}>Esci</Button>
      </div>
    </div>
  );
};

export default ResultScreen;
