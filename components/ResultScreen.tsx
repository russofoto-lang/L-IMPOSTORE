
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
    else subTitle = "Avete smascherato il nemico!";
  } else if (winner === 'mr_wolf') {
    title = "Mr. Wolf Vince!";
    headerColor = "text-amber-500";
    subTitle = "Ha rubato la vittoria indovinando!";
  } else if (winner === 'enemies') {
    title = "I Nemici Vincono!";
    headerColor = "text-rose-500";
    subTitle = "Avete accusato un innocente!";
  } else {
    title = "L'Impostore Vince!";
    headerColor = "text-rose-500";
    subTitle = "Avete accusato la persona sbagliata!";
  }

  const renderPlayerBadge = (label: string, name: string | undefined, color: 'rose' | 'amber' | 'indigo' | 'slate') => {
    if (!name) return null;
    const colors = {
      rose: "bg-rose-500/10 border-rose-500/50 text-rose-400",
      amber: "bg-amber-500/10 border-amber-500/50 text-amber-400",
      indigo: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400",
      slate: "bg-slate-700/50 border-slate-600 text-slate-300"
    };

    return (
      <div className={`p-5 rounded-2xl border ${colors[color]} w-full flex justify-between items-center shadow-sm`}>
        <span className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</span>
        <span className="font-bungee text-2xl">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
      <header className="text-center space-y-3">
        <h1 className={`text-5xl font-bungee ${headerColor} leading-tight drop-shadow-lg`}>
          {title}
        </h1>
        <p className="text-slate-400 font-bold text-base uppercase tracking-widest">
          {isFinal ? "FINALISSIMA CONCLUSA" : subTitle}
        </p>
      </header>

      <div className="glass w-full p-8 rounded-[2.5rem] flex flex-col items-center space-y-6 text-center border-slate-700 shadow-xl">

        <div className="w-full space-y-3">
          {gameData.votedPlayer && (
            renderPlayerBadge("Accusato", gameData.votedPlayer.name, 'slate')
          )}
          {renderPlayerBadge("Impostore", impostor?.name, 'rose')}
          {renderPlayerBadge("Mr. Wolf", wolf?.name, 'amber')}
        </div>

        <div className="space-y-2 pt-6 border-t border-slate-700 w-full">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">La parola segreta era:</p>
          <h2 className="text-4xl font-bungee text-indigo-400 uppercase tracking-tight break-all">{gameData.secretWord}</h2>
          <p className="text-slate-500 text-sm mt-1">Categoria: {gameData.wordCategory}</p>
        </div>

        {mode === 'TOURNAMENT' && (
          <div className="w-full p-4 rounded-xl bg-slate-900/50 text-base text-slate-400 border border-slate-800">
            Controlla la classifica per i punteggi!
          </div>
        )}
      </div>

      <div className="w-full space-y-4 pt-2">
        <Button fullWidth size="lg" onClick={onNext} className="text-xl py-5">
          {mode === 'TOURNAMENT' ? 'Vedi Classifica' : 'Nuova Partita'}
        </Button>
        <Button fullWidth variant="ghost" onClick={() => window.location.reload()} className="text-lg">Esci dal Gioco</Button>
      </div>
    </div>
  );
};

export default ResultScreen;
