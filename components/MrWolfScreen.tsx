
import React, { useState } from 'react';
import { GameData } from '../types';
import { Button } from './ui/Button';

interface MrWolfScreenProps {
  gameData: GameData;
  onGuessResult: (correct: boolean) => void;
}

const MrWolfScreen: React.FC<MrWolfScreenProps> = ({ gameData, onGuessResult }) => {
  const [showWord, setShowWord] = useState(false);
  const wolf = gameData.players.find(p => p.role === 'MR_WOLF');

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bungee text-amber-500">MR. WOLF È STATO PRESO!</h1>
        <p className="text-slate-300">Ma non è ancora finita...</p>
      </header>

      <div className="glass w-full p-6 rounded-3xl text-center space-y-6 border-amber-500/30">
        <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500">
          <i className="fa-solid fa-dog text-5xl text-amber-500"></i>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{wolf?.name}, indovina la parola!</h2>
          <p className="text-sm text-slate-400">
             Hai <strong>un solo tentativo</strong> per indovinare la parola segreta e rubare la vittoria ai civili.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
           <p className="text-xs text-slate-500 uppercase font-bold mb-2">Parola Segreta (Solo per verifica)</p>
           {showWord ? (
             <h3 className="text-2xl font-bungee text-indigo-400">{gameData.secretWord}</h3>
           ) : (
             <Button size="sm" variant="ghost" onClick={() => setShowWord(true)}>Mostra Parola al Gruppo</Button>
           )}
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm font-bold text-white">Il gruppo giudichi la risposta:</p>
          <Button fullWidth className="bg-amber-600 hover:bg-amber-500 border-amber-400" onClick={() => onGuessResult(true)}>
            <i className="fa-solid fa-check mr-2"></i>
            Ha Indovinato! (Vince Wolf)
          </Button>
          <Button fullWidth variant="secondary" onClick={() => onGuessResult(false)}>
            <i className="fa-solid fa-xmark mr-2"></i>
            Ha Sbagliato (Vincono Civili)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MrWolfScreen;
