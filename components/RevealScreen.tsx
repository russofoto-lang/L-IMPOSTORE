
import React, { useState } from 'react';
import { GameData, GameSettings } from '../types';
import { Button } from './ui/Button';

interface RevealScreenProps {
  gameData: GameData;
  settings: GameSettings;
  onFinish: () => void;
}

const RevealScreen: React.FC<RevealScreenProps> = ({ gameData, settings, onFinish }) => {
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
          <div className="w-24 h-24 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-500/50">
            <i className="fa-solid fa-dog text-5xl"></i>
          </div>
          <h3 className="text-4xl font-bungee text-amber-500 leading-tight">SEI MR. WOLF!</h3>
          <p className="mt-5 text-slate-300 text-lg">Non conosci la parola segreta. Mimetizzati!</p>
          {settings.showCategoryHint && (
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-sm text-indigo-200 leading-relaxed">
              <i className="fa-solid fa-eye mr-2"></i>
              <strong>Categoria:</strong> {gameData.wordCategory}
            </div>
          )}
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-sm text-amber-200 leading-relaxed">
             <strong>Super Potere:</strong> Se ti scoprono, avrai un'ultima possibilità per indovinare la parola e rubare la vittoria!
          </div>
        </>
      );
    }

    if (currentPlayer.role === 'IMPOSTOR') {
      return (
        <>
          <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-500/50">
            <i className="fa-solid fa-user-secret text-5xl"></i>
          </div>
          <h3 className="text-4xl font-bungee text-rose-500 leading-tight">SEI L'IMPOSTORE!</h3>
          <p className="mt-5 text-slate-300 text-lg">Non conosci la parola segreta. Ascolta bene e mimetizzati!</p>
          {settings.showCategoryHint && (
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-sm text-indigo-200 leading-relaxed">
              <i className="fa-solid fa-eye mr-2"></i>
              <strong>Categoria:</strong> {gameData.wordCategory}
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <div className="w-24 h-24 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-indigo-500/50">
          <i className="fa-solid fa-key text-5xl"></i>
        </div>
        <h3 className="text-xl text-slate-400 uppercase tracking-widest font-bold">La Parola è:</h3>
        <h3 className="text-5xl font-bungee text-indigo-400 mt-3 uppercase tracking-tight break-all px-2">{gameData.secretWord}</h3>
        <p className="mt-6 text-slate-300 text-lg leading-relaxed">Dì una sola parola attinente senza svelarla troppo ai nemici!</p>
      </>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Tocca a:</h2>
        <h1 className="text-5xl font-bungee text-white drop-shadow-lg">{currentPlayer.name}</h1>
      </div>

      <div className="glass w-full p-8 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 relative overflow-hidden">
        {!isRevealed ? (
          <>
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
               <i className="fa-solid fa-fingerprint text-5xl text-indigo-500"></i>
            </div>
            <div className="w-full px-4 space-y-4">
              <p className="text-slate-300 text-xl leading-relaxed">
                Passa il telefono a <strong className="text-white">{currentPlayer.name}</strong>
              </p>
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
                <p className="text-indigo-400 font-bold text-lg">
                  <strong>{currentPlayer.name}</strong>, quando sei pronto premi qui sotto!
                </p>
                <p className="text-slate-500 text-sm mt-1">Nessun altro deve guardare lo schermo</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setIsRevealed(true)} className="text-xl px-10 py-5">
              <i className="fa-solid fa-eye mr-3"></i>Scopri il tuo Ruolo
            </Button>
          </>
        ) : (
          <div className="animate-in zoom-in duration-300 w-full flex flex-col items-center">
            {getRoleContent()}
            <div className="mt-10 w-full space-y-3">
              <p className="text-slate-500 text-sm text-center">Hai memorizzato il tuo ruolo?</p>
              {currentPlayerIndex < gameData.players.length - 1 ? (
                <Button variant="secondary" onClick={handleNext} className="text-lg py-4 w-full">
                  <i className="fa-solid fa-arrow-right mr-2"></i>
                  Clicca qui, poi passa il telefono a {gameData.players[currentPlayerIndex + 1].name}
                </Button>
              ) : (
                <Button onClick={handleNext} className="text-lg py-4 w-full">
                  <i className="fa-solid fa-play mr-2"></i>
                  Ho capito! Inizia il Round
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {gameData.players.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentPlayerIndex ? 'bg-indigo-500 w-8' : idx < currentPlayerIndex ? 'bg-indigo-500/40' : 'bg-slate-700'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RevealScreen;
