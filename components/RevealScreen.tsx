
import React, { useState } from 'react';
import { GameData } from '../types';
import { Button } from './ui/Button';

interface RevealScreenProps {
  gameData: GameData;
  onFinish: () => void;
}

const RevealScreen: React.FC<RevealScreenProps> = ({ gameData, onFinish }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = gameData.players[currentPlayerIndex];

  const handleNext = () => {
    if (currentPlayerIndex < gameData.players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsRevealed(false);
    } else {
      onFinish();
    }
  };

  const getRoleContent = () => {
    if (currentPlayer.role === 'MR_WOLF') {
      return (
        <>
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50">
            <i className="fa-solid fa-dog text-4xl"></i>
          </div>
          <h3 className="text-3xl font-bungee text-amber-500">SEI MR. WOLF!</h3>
          <p className="mt-4 text-slate-300">Non conosci la parola segreta. Mimetizzati!</p>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
             <strong>Super Potere:</strong> Se ti scoprono, avrai un'ultima possibilità per indovinare la parola e rubare la vittoria!
          </div>
        </>
      );
    }

    if (currentPlayer.role === 'IMPOSTOR') {
      return (
        <>
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/50">
            <i className="fa-solid fa-user-secret text-4xl"></i>
          </div>
          <h3 className="text-3xl font-bungee text-rose-500">SEI L'IMPOSTORE!</h3>
          <p className="mt-4 text-slate-300">Non conosci la parola segreta. Ascolta bene gli altri e dì una parola che ti faccia sembrare uno di loro!</p>
        </>
      );
    }

    return (
      <>
        <div className="w-20 h-20 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
          <i className="fa-solid fa-key text-4xl"></i>
        </div>
        <h3 className="text-xl text-slate-400 uppercase tracking-widest font-bold">La Parola è:</h3>
        <h3 className="text-4xl font-bungee text-indigo-400 mt-2 uppercase tracking-tight">{gameData.secretWord}</h3>
        <p className="mt-4 text-slate-300">Dovrai dire una sola parola attinente senza svelarla troppo a Mr. Wolf o all'Impostore!</p>
      </>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-400">Tocca a:</h2>
        <h1 className="text-4xl font-bungee text-white">{currentPlayer.name}</h1>
      </div>

      <div className="glass w-full p-8 rounded-3xl flex flex-col items-center justify-center min-h-[350px] text-center space-y-6 relative overflow-hidden">
        {!isRevealed ? (
          <>
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-2">
               <i className="fa-solid fa-fingerprint text-4xl text-indigo-500"></i>
            </div>
            <p className="text-slate-300">Passa il telefono a <strong>{currentPlayer.name}</strong> e premi il pulsante per scoprire il tuo ruolo.</p>
            <Button size="lg" onClick={() => setIsRevealed(true)}>Scopri Ruolo</Button>
          </>
        ) : (
          <div className="animate-in zoom-in duration-300 w-full">
            {getRoleContent()}
            <div className="mt-8">
              <Button variant="secondary" onClick={handleNext}>
                {currentPlayerIndex < gameData.players.length - 1 ? "Prossimo Giocatore" : "Inizia il Round"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {gameData.players.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentPlayerIndex ? 'bg-indigo-500 w-6' : idx < currentPlayerIndex ? 'bg-indigo-500/40' : 'bg-slate-700'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RevealScreen;
