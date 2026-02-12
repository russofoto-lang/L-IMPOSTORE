
import React, { useState } from 'react';
import { GameSettings, GameMode, EnemyConfig } from '../types';
import { Button } from './ui/Button';

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
  initialSettings: GameSettings;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, initialSettings }) => {
  const [players, setPlayers] = useState<string[]>(initialSettings.players);
  const [timer, setTimer] = useState(initialSettings.timerDuration / 60);
  const [mode, setMode] = useState<GameMode>(initialSettings.mode || 'SINGLE');
  const [rounds, setRounds] = useState(3);
  // Default to what was passed or Impostor Only
  const [enemyConfig, setEnemyConfig] = useState<EnemyConfig>(initialSettings.enemyConfig || 'IMPOSTOR_ONLY');

  const addPlayer = () => {
    if (players.length < 20) {
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

  const handleStart = () => {
    // Force switch to simpler mode if not enough players for BOTH
    let finalConfig = enemyConfig;
    if (enemyConfig === 'BOTH' && players.length < 5) {
      finalConfig = 'IMPOSTOR_ONLY';
    }

    onStart({ 
      players, 
      timerDuration: timer * 60, 
      mode, 
      totalRounds: rounds, 
      enemyConfig: finalConfig 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-bungee text-indigo-500 tracking-tighter italic">L'IMPOSTORE</h1>
        <p className="text-slate-400">Riesci a mimetizzarti nel gruppo?</p>
      </header>

      {/* Mode Selection */}
      <section className="glass p-2 rounded-2xl flex">
        <button
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'SINGLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMode('SINGLE')}
        >
          Singola
        </button>
        <button
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'TOURNAMENT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMode('TOURNAMENT')}
        >
          Torneo
        </button>
      </section>

      {/* Enemy Config Selection */}
      <section className="glass p-4 rounded-3xl space-y-3 border-rose-500/20">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Configurazione Nemici</h3>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => setEnemyConfig('IMPOSTOR_ONLY')}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${enemyConfig === 'IMPOSTOR_ONLY' ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enemyConfig === 'IMPOSTOR_ONLY' ? 'bg-rose-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-user-secret"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Solo Impostore</div>
              <div className="text-[10px] opacity-70">Classico. Scopritelo per vincere.</div>
            </div>
          </button>

          <button 
            onClick={() => setEnemyConfig('WOLF_ONLY')}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${enemyConfig === 'WOLF_ONLY' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enemyConfig === 'WOLF_ONLY' ? 'bg-amber-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-dog"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Solo Mr. Wolf</div>
              <div className="text-[10px] opacity-70">Se scoperto, può indovinare la parola!</div>
            </div>
          </button>

          <button 
            onClick={() => setEnemyConfig('BOTH')}
            disabled={players.length < 5}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${enemyConfig === 'BOTH' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'} ${players.length < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enemyConfig === 'BOTH' ? 'bg-purple-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-user-group"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Entrambi (5+ Gioc.)</div>
              <div className="text-[10px] opacity-70">Caos totale! Due nemici in gioco.</div>
            </div>
          </button>
        </div>
      </section>

      {mode === 'TOURNAMENT' && (
        <section className="glass p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
            <i className="fa-solid fa-trophy"></i>
            Lunghezza Torneo: {rounds} Round
          </h2>
          <input 
            type="range" 
            min="2" 
            max="10" 
            value={rounds} 
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="w-full accent-rose-500"
          />
        </section>
      )}

      <section className="glass p-6 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-users text-indigo-400"></i>
          Giocatori ({players.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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
          disabled={players.length >= 20}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Aggiungi Giocatore
        </Button>
      </section>

      <Button 
        fullWidth 
        size="lg" 
        onClick={handleStart}
      >
        Inizia {mode === 'TOURNAMENT' ? 'Torneo' : 'Partita'}
      </Button>
    </div>
  );
};

export default SetupScreen;
