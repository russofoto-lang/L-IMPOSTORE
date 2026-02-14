
import React, { useState } from 'react';
import { GameSettings, GameMode, EnemyConfig } from '../types';
import { WORD_CATEGORIES } from '../constants';
import { Button } from './ui/Button';

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
  onOpenInstructions: () => void;
  initialSettings: GameSettings;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onOpenInstructions, initialSettings }) => {
  const [players, setPlayers] = useState<string[]>(initialSettings.players);
  const [timer, setTimer] = useState(initialSettings.timerDuration / 60);
  const [mode, setMode] = useState<GameMode>(initialSettings.mode || 'SINGLE');
  const [rounds, setRounds] = useState(3);
  const [enemyConfig, setEnemyConfig] = useState<EnemyConfig>(initialSettings.enemyConfig || 'IMPOSTOR_ONLY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSettings.selectedCategories);
  const [showCategoryHint, setShowCategoryHint] = useState(initialSettings.showCategoryHint);

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

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        // Don't allow deselecting last category
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== categoryName);
      }
      return [...prev, categoryName];
    });
  };

  // Check for duplicate names
  const getDuplicateIndices = (): Set<number> => {
    const duplicates = new Set<number>();
    const trimmed = players.map(p => p.trim().toLowerCase());
    for (let i = 0; i < trimmed.length; i++) {
      if (!trimmed[i]) continue;
      for (let j = i + 1; j < trimmed.length; j++) {
        if (trimmed[i] === trimmed[j]) {
          duplicates.add(i);
          duplicates.add(j);
        }
      }
    }
    return duplicates;
  };

  const duplicateIndices = getDuplicateIndices();
  const hasEmptyNames = players.some(p => !p.trim());
  const canStart = duplicateIndices.size === 0 && !hasEmptyNames && selectedCategories.length > 0;

  const handleStart = () => {
    if (!canStart) return;

    let finalConfig = enemyConfig;
    if (enemyConfig === 'BOTH' && players.length < 5) {
      finalConfig = 'IMPOSTOR_ONLY';
    }

    onStart({
      players: players.map(p => p.trim()),
      timerDuration: timer * 60,
      mode,
      totalRounds: rounds,
      enemyConfig: finalConfig,
      selectedCategories,
      showCategoryHint
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      <button
        onClick={onOpenInstructions}
        className="absolute top-0 right-0 w-11 h-11 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all z-10 border border-slate-600 shadow-lg"
        title="Come Giocare"
      >
        <i className="fa-solid fa-question text-lg"></i>
      </button>

      <header className="text-center space-y-2 pt-2">
        <h1 className="text-6xl font-bungee text-indigo-500 tracking-tighter italic">L'IMPOSTORE</h1>
        <p className="text-slate-400 text-lg">Riesci a mimetizzarti nel gruppo?</p>
      </header>

      {/* Mode Selection */}
      <section className="glass p-2 rounded-2xl flex">
        <button
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${mode === 'SINGLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMode('SINGLE')}
        >
          Singola
        </button>
        <button
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${mode === 'TOURNAMENT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMode('TOURNAMENT')}
        >
          Torneo
        </button>
      </section>

      {/* Enemy Config Selection */}
      <section className="glass p-5 rounded-3xl space-y-4 border-rose-500/20">
        <h3 className="text-base font-bold uppercase tracking-widest text-slate-400">Configurazione Nemici</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setEnemyConfig('IMPOSTOR_ONLY')}
            className={`p-4 rounded-xl flex items-center gap-4 transition-all border ${enemyConfig === 'IMPOSTOR_ONLY' ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enemyConfig === 'IMPOSTOR_ONLY' ? 'bg-rose-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-user-secret text-lg"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-base">Solo Impostore</div>
              <div className="text-xs opacity-70">Classico. Scopritelo per vincere.</div>
            </div>
          </button>

          <button
            onClick={() => setEnemyConfig('WOLF_ONLY')}
            className={`p-4 rounded-xl flex items-center gap-4 transition-all border ${enemyConfig === 'WOLF_ONLY' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enemyConfig === 'WOLF_ONLY' ? 'bg-amber-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-dog text-lg"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-base">Solo Mr. Wolf</div>
              <div className="text-xs opacity-70">Se scoperto, può indovinare la parola!</div>
            </div>
          </button>

          <button
            onClick={() => setEnemyConfig('BOTH')}
            disabled={players.length < 5}
            className={`p-4 rounded-xl flex items-center gap-4 transition-all border ${enemyConfig === 'BOTH' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'} ${players.length < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enemyConfig === 'BOTH' ? 'bg-purple-500 text-white' : 'bg-slate-700'}`}>
              <i className="fa-solid fa-user-group text-lg"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-base">Entrambi (5+ Gioc.)</div>
              <div className="text-xs opacity-70">Caos totale! Due nemici in gioco.</div>
            </div>
          </button>
        </div>
      </section>

      {/* Timer Configuration */}
      <section className="glass p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <i className="fa-solid fa-clock text-indigo-400"></i>
          Timer: {timer} {timer === 1 ? 'minuto' : 'minuti'}
        </h3>
        <input
          type="range"
          min="1"
          max="10"
          value={timer}
          onChange={(e) => setTimer(parseInt(e.target.value))}
          className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1 min</span>
          <span>5 min</span>
          <span>10 min</span>
        </div>
      </section>

      {mode === 'TOURNAMENT' && (
        <section className="glass p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-400">
            <i className="fa-solid fa-trophy"></i>
            Torneo: {rounds} Round
          </h2>
          <input
            type="range"
            min="2"
            max="10"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </section>
      )}

      {/* Category Selection */}
      <section className="glass p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <i className="fa-solid fa-tags text-indigo-400"></i>
            Categorie ({selectedCategories.length}/{WORD_CATEGORIES.length})
          </h3>
          <button
            onClick={() => setSelectedCategories(
              selectedCategories.length === WORD_CATEGORIES.length
                ? [WORD_CATEGORIES[0].name]
                : WORD_CATEGORIES.map(c => c.name)
            )}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider"
          >
            {selectedCategories.length === WORD_CATEGORIES.length ? 'Deseleziona' : 'Seleziona tutte'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {WORD_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              className={`p-3 rounded-xl text-left transition-all border text-sm flex items-center gap-2 ${
                selectedCategories.includes(cat.name)
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                  : 'bg-slate-800 border-transparent text-slate-500'
              }`}
            >
              <i className={`fa-solid ${cat.icon} text-xs`}></i>
              <span className="font-medium truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Category Hint Toggle */}
      <section className="glass p-5 rounded-3xl">
        <button
          onClick={() => setShowCategoryHint(!showCategoryHint)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showCategoryHint ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
              <i className="fa-solid fa-eye text-lg"></i>
            </div>
            <div className="text-left">
              <div className={`font-bold text-base ${showCategoryHint ? 'text-white' : 'text-slate-400'}`}>Aiuto Impostore</div>
              <div className="text-xs text-slate-500">Mostra la categoria della parola ai nemici</div>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full transition-all relative ${showCategoryHint ? 'bg-amber-500' : 'bg-slate-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${showCategoryHint ? 'left-6' : 'left-1'}`}></div>
          </div>
        </button>
      </section>

      <section className="glass p-6 rounded-3xl space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-users text-indigo-400"></i>
          Giocatori ({players.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
          {players.map((name, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(idx, e.target.value)}
                  className={`bg-slate-800 border text-white text-lg rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 transition-all ${
                    duplicateIndices.has(idx)
                      ? 'border-rose-500 focus:ring-rose-500'
                      : !name.trim()
                      ? 'border-amber-500 focus:ring-amber-500'
                      : 'border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                {duplicateIndices.has(idx) && (
                  <span className="absolute -bottom-5 left-2 text-rose-400 text-xs">Nome duplicato</span>
                )}
              </div>
              <button
                onClick={() => removePlayer(idx)}
                className="w-12 h-12 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                disabled={players.length <= 3}
              >
                <i className="fa-solid fa-trash-can text-lg"></i>
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          fullWidth
          onClick={addPlayer}
          disabled={players.length >= 20}
          className="text-lg py-4"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Aggiungi Giocatore
        </Button>
      </section>

      <Button
        fullWidth
        size="lg"
        onClick={handleStart}
        disabled={!canStart}
        className={`text-xl py-5 ${!canStart ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Inizia {mode === 'TOURNAMENT' ? 'Torneo' : 'Partita'}
      </Button>
    </div>
  );
};

export default SetupScreen;
