
import React from 'react';
import { GameData } from '../types';
import { Button } from './ui/Button';

interface ResultScreenProps {
  gameData: GameData;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ gameData, onRestart }) => {
  const impostor = gameData.players.find(p => p.isImpostor);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-bungee text-white">Fine Partita</h1>
        <p className="text-indigo-400 font-bold text-xl uppercase tracking-widest">Siete pronti alla verità?</p>
      </header>

      <div className="glass w-full p-8 rounded-3xl flex flex-col items-center space-y-6 text-center border-indigo-500/50">
        <div className="space-y-1">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">L'Impostore era:</p>
          <h2 className="text-4xl font-bungee text-rose-500">{impostor?.name}</h2>
        </div>

        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-rose-500 shadow-xl shadow-rose-500/20">
          <i className="fa-solid fa-user-mask text-5xl text-rose-500"></i>
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-700 w-full">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">La parola segreta era:</p>
          <h2 className="text-3xl font-bungee text-indigo-400 uppercase">{gameData.secretWord}</h2>
        </div>
      </div>

      <div className="w-full space-y-3 pt-4">
        <Button fullWidth size="lg" onClick={onRestart}>Nuova Partita</Button>
        <Button fullWidth variant="ghost" onClick={() => window.location.reload()}>Esci</Button>
      </div>
    </div>
  );
};

export default ResultScreen;
