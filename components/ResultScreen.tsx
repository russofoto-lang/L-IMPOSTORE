
import React from 'react';
import { GameData, GameMode } from '../types';
import { Button } from './ui/Button';

interface ResultScreenProps {
  gameData: GameData;
  mode: GameMode;
  onNext: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ gameData, mode, onNext }) => {
  const { winner, winMethod, votedPlayer, secretWord, players } = gameData;

  const civiliansWon = winner === 'players';
  const impostorWon = winner === 'impostor';
  const wolfWon = winner === 'mr_wolf';
  const enemiesWon = winner === 'enemies';

  const getWinnerConfig = () => {
    if (civiliansWon) return {
      icon: 'fa-shield-halved',
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-500/50',
      title: 'I Civili Vincono!',
      titleColor: 'text-indigo-400',
      subtitle: winMethod === 'guess'
        ? "Mr. Wolf non ha indovinato la parola."
        : votedPlayer
        ? `${votedPlayer.name} era il nemico ed è stato eliminato!`
        : 'I civili hanno trovato il nemico!'
    };
    if (wolfWon) return {
      icon: 'fa-dog',
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
      title: 'Mr. Wolf Vince!',
      titleColor: 'text-amber-400',
      subtitle: winMethod === 'guess'
        ? `Ha indovinato la parola! Che intuizione!`
        : 'Ha eliminato un civile!'
    };
    if (impostorWon) return {
      icon: 'fa-user-secret',
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      borderColor: 'border-rose-500/50',
      title: "L'Impostore Vince!",
      titleColor: 'text-rose-400',
      subtitle: votedPlayer
        ? `${votedPlayer.name} era innocente ed è stato eliminato!`
        : "L'impostore è rimasto nell'ombra!"
    };
    if (enemiesWon) return {
      icon: 'fa-user-group',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
      title: 'I Nemici Vincono!',
      titleColor: 'text-purple-400',
      subtitle: votedPlayer
        ? `${votedPlayer.name} era innocente ed è stato eliminato!`
        : 'I nemici hanno avuto la meglio!'
    };
    return {
      icon: 'fa-question',
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/50',
      title: 'Fine Round',
      titleColor: 'text-white',
      subtitle: ''
    };
  };

  const cfg = getWinnerConfig();

  const nextLabel = mode === 'SINGLE'
    ? 'Nuova Partita'
    : 'Vedi Classifica';

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-400 pb-6">
      {/* Winner banner */}
      <div className={`glass w-full p-7 rounded-3xl text-center border ${cfg.borderColor} ${cfg.bgColor} space-y-3`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${cfg.bgColor} border ${cfg.borderColor}`}>
          <i className={`fa-solid ${cfg.icon} text-4xl ${cfg.iconColor}`}></i>
        </div>
        <h1 className={`text-4xl font-bungee ${cfg.titleColor} drop-shadow`}>{cfg.title}</h1>
        <p className="text-slate-300 text-base leading-relaxed">{cfg.subtitle}</p>
      </div>

      {/* Secret word reveal */}
      <div className="glass w-full p-5 rounded-3xl text-center space-y-1">
        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">La parola segreta era</p>
        <p className="text-4xl font-bungee text-indigo-400 uppercase tracking-tight">{secretWord}</p>
      </div>

      {/* Role reveals */}
      <div className="glass w-full p-4 rounded-3xl space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ruoli rivelati</h3>
        {players.map((p) => (
          <div
            key={p.id}
            className={`flex items-center p-3 rounded-xl border ${
              p.role === 'IMPOSTOR' ? 'bg-rose-600/15 border-rose-600/40' :
              p.role === 'MR_WOLF' ? 'bg-amber-600/15 border-amber-600/40' :
              'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <i className={`fa-solid ${
              p.role === 'IMPOSTOR' ? 'fa-user-secret text-rose-400' :
              p.role === 'MR_WOLF' ? 'fa-dog text-amber-400' :
              'fa-user text-indigo-400'
            } w-5 mr-3`}></i>
            <span className={`flex-grow font-medium ${
              p.role !== 'CIVILIAN' ? 'text-white font-bold' : 'text-slate-300'
            }`}>{p.name}</span>
            <span className={`text-xs uppercase font-bold tracking-wide ${
              p.role === 'IMPOSTOR' ? 'text-rose-400' :
              p.role === 'MR_WOLF' ? 'text-amber-400' :
              'text-slate-500'
            }`}>
              {p.role === 'IMPOSTOR' ? 'Impostore' : p.role === 'MR_WOLF' ? 'Mr. Wolf' : 'Civile'}
            </span>
          </div>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={onNext} className="text-xl py-5">
        {nextLabel}
        <i className="fa-solid fa-arrow-right ml-3"></i>
      </Button>
    </div>
  );
};

export default ResultScreen;
