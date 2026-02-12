
import React, { useState } from 'react';
import { GameState, Player, GameSettings, GameData } from './types';
import { WORDS, INITIAL_NAMES } from './constants';
import { Button } from './components/ui/Button';

// Sub-components
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import PlayScreen from './components/PlayScreen';
import ResultScreen from './components/ResultScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [settings, setSettings] = useState<GameSettings>({
    players: INITIAL_NAMES,
    timerDuration: 300 // 5 minutes
  });
  const [gameData, setGameData] = useState<GameData | null>(null);
  
  const startGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    
    // Pick a random word from the local list
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    
    const impostorIndex = Math.floor(Math.random() * newSettings.players.length);
    const players: Player[] = newSettings.players.map((name, index) => ({
      id: `p-${index}`,
      name,
      isImpostor: index === impostorIndex,
      isRevealed: false
    }));

    setGameData({
      secretWord: word,
      players,
      impostorId: players[impostorIndex].id,
      startTime: Date.now()
    });
    
    setGameState(GameState.REVEAL);
  };

  const finishReveal = () => {
    setGameState(GameState.PLAYING);
  };

  const goToVoting = () => {
    setGameState(GameState.VOTING);
  };

  const endGame = (winner: 'players' | 'impostor') => {
    setGameState(GameState.RESULT);
  };

  const restart = () => {
    setGameState(GameState.SETUP);
    setGameData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[100px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 blur-[120px] rounded-full -z-10"></div>

      <main className="w-full h-full flex flex-col">
        {gameState === GameState.SETUP && (
          <SetupScreen onStart={startGame} initialSettings={settings} />
        )}
        
        {gameState === GameState.REVEAL && gameData && (
          <RevealScreen 
            gameData={gameData} 
            onFinish={finishReveal} 
          />
        )}

        {gameState === GameState.PLAYING && gameData && (
          <PlayScreen 
            gameData={gameData} 
            settings={settings}
            onVote={goToVoting} 
            onEnd={endGame}
          />
        )}

        {gameState === GameState.VOTING && gameData && (
          <div className="glass p-8 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <h2 className="text-3xl font-bungee text-white">Votazione!</h2>
              <p className="text-slate-300">Discutete e decidete chi è l'impostore. Poi clicca per vedere il risultato.</p>
              <Button fullWidth size="lg" onClick={() => endGame('players')}>Rivela l'Impostore</Button>
          </div>
        )}

        {gameState === GameState.RESULT && gameData && (
          <ResultScreen 
            gameData={gameData} 
            onRestart={restart} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
