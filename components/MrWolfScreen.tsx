
import React, { useState } from 'react';
import { GameData } from '../types';
import { Button } from './ui/Button';

interface MrWolfScreenProps {
  gameData: GameData;
  onGuessResult: (correct: boolean) => void;
}

/**
 * Component for the "Mr. Wolf" last-chance guessing stage.
 * If Mr. Wolf is voted out, they get one final attempt to guess the secret word.
 */
const MrWolfScreen: React.FC<MrWolfScreenProps> = ({ gameData, onGuessResult }) => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    
    // Normalize both strings for comparison
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedSecret = gameData.secretWord.toLowerCase().trim();
    
    onGuessResult(normalizedGuess === normalizedSecret);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">
          Smascherato!
        </div>
        <h2 className="text-4xl font-bungee text-white leading-tight">MR. WOLF</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ultima Possibilità</p>
      </div>

      <div className="glass w-full p-8 rounded-[2.5rem] flex flex-col items-center space-y-6 text-center border-amber-500/30 shadow-xl shadow-amber-500/10">
        <div className="w-24 h-24 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/50 shadow-inner">
          <i className="fa-solid fa-dog text-5xl"></i>
        </div>
        
        <p className="text-slate-200 text-lg leading-relaxed px-2">
          Se indovini la parola segreta adesso, <span className="text-amber-400 font-bold italic">ruberai la vittoria</span> a tutti i civili!
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-left ml-2">Qual è la parola segreta?</label>
            <input
              autoFocus
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Scrivi qui la parola..."
              className="w-full bg-slate-900 border border-slate-700 text-white text-xl rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-700 shadow-inner"
            />
          </div>
          
          <Button 
            fullWidth 
            size="lg" 
            type="submit"
            disabled={!guess.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30 text-xl py-5 border-none"
          >
            Conferma Indovinello
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-3 text-slate-500 bg-slate-800/30 px-5 py-3 rounded-full border border-slate-700/50">
        <i className="fa-solid fa-volume-xmark"></i>
        <p className="text-sm italic font-medium">
          Tutti gli altri devono restare in silenzio!
        </p>
      </div>
    </div>
  );
};

export default MrWolfScreen;
