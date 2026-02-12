
import React, { useState } from 'react';
import { GameSettings } from '../types';
import { Button } from './ui/Button';

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
  initialSettings: GameSettings;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, initialSettings }) => {
  const [players, setPlayers] = useState<string[]>(initialSettings.players);
  const [timer, setTimer] = useState(initialSettings.timerDuration / 60);

  const addPlayer = () => {
    if (players.length < 12) {
      setPlayers([...players, `Giocatore ${players.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 3) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-bungee text-indigo-500 tracking-tighter italic">L'IMPOSTORE</h1>
        <p className="text-slate-400">Riesci a mimetizzarti nel gruppo?</p>
      </header>

      <section className="glass p-6 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-users text-indigo-400"></i>
          Giocatori ({players.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {players.map((name, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayerName(idx, e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={() => removePlayer(idx)}
                className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                disabled={players.length <= 3}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={addPlayer}
          disabled={players.length >= 12}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Aggiungi Giocatore
        </Button>
      </section>

      <section className="glass p-6 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-clock text-indigo-400"></i>
          Timer: {timer} minuti
        </h2>
        <input 
          type="range" 
          min="1" 
          max="15" 
          value={timer} 
          onChange={(e) => setTimer(parseInt(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </section>

      <Button 
        fullWidth 
        size="lg" 
        onClick={() => onStart({ players, timerDuration: timer * 60 })}
      >
        Inizia Partita
      </Button>
    </div>
  );
};

export default SetupScreen;
