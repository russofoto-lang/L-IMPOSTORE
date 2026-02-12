
import React, { useState } from 'react';
import { GameState, Player, GameSettings, GameData, Role, EnemyConfig } from './types';
import { WORDS, INITIAL_NAMES } from './constants';
import { Button } from './components/ui/Button';

// Sub-components
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import PlayScreen from './components/PlayScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import MrWolfScreen from './components/MrWolfScreen';
import InstructionsScreen from './components/InstructionsScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [settings, setSettings] = useState<GameSettings>({
    players: INITIAL_NAMES,
    timerDuration: 300,
    mode: 'SINGLE',
    totalRounds: 3,
    enemyConfig: 'IMPOSTOR_ONLY'
  });
  const [gameData, setGameData] = useState<GameData | null>(null);
  
  // Start Game
  const startGame = (
    newSettings: GameSettings, 
    existingPlayers?: Player[], 
    nextRoundNum?: number,
    isFinal: boolean = false
  ) => {
    setSettings(newSettings);
    
    // Pick a random word
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    
    // Role Assignment Logic
    const playerCount = newSettings.players.length;
    const availableIndices = Array.from({ length: playerCount }, (_, i) => i);
    
    // Shuffle indices
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }

    const roles: Role[] = new Array(playerCount).fill('CIVILIAN');
    
    if (newSettings.enemyConfig === 'BOTH' && playerCount >= 5) {
       roles[availableIndices[0]] = 'IMPOSTOR';
       roles[availableIndices[1]] = 'MR_WOLF';
    } else if (newSettings.enemyConfig === 'WOLF_ONLY') {
       roles[availableIndices[0]] = 'MR_WOLF';
    } else {
       // Default Impostor Only
       roles[availableIndices[0]] = 'IMPOSTOR';
    }
    
    const players: Player[] = newSettings.players.map((name, index) => {
      const existingPlayer = existingPlayers?.find(p => p.name === name);
      return {
        id: `p-${index}`,
        name,
        role: roles[index],
        isRevealed: false,
        score: existingPlayer ? existingPlayer.score : 0
      };
    });

    setGameData({
      secretWord: word,
      players,
      impostorId: players[availableIndices[0]].id, // Legacy support
      startTime: Date.now(),
      currentRound: nextRoundNum || 1,
      isFinalRound: isFinal
    });
    
    setGameState(GameState.REVEAL);
  };

  const finishReveal = () => {
    setGameState(GameState.PLAYING);
  };

  const goToVoting = () => {
    setGameState(GameState.VOTING);
  };

  // Logic to handle vote outcome: Player selection
  const handlePlayerVoted = (votedPlayer: Player) => {
    if (!gameData) return;

    if (votedPlayer.role === 'MR_WOLF') {
       // Wolf Caught -> Last Chance
       setGameState(GameState.WOLF_GUESS);
    } else if (votedPlayer.role === 'IMPOSTOR') {
       // Impostor Caught -> Civilians Win
       endGame('players', 'vote');
    } else {
       // Civilian Caught -> Enemies Win
       // In 'BOTH' mode, this is a win for "enemies" generally.
       const winner = settings.enemyConfig === 'WOLF_ONLY' ? 'mr_wolf' : 
                      settings.enemyConfig === 'BOTH' ? 'enemies' : 'impostor';
       endGame(winner, 'vote');
    }
  };

  // Logic for Mr Wolf guessing result
  const handleWolfGuess = (correct: boolean) => {
    if (correct) {
      endGame('mr_wolf', 'guess');
    } else {
      endGame('players', 'guess');
    }
  };

  const calculateScores = (winner: 'players' | 'impostor' | 'mr_wolf' | 'enemies', method: 'vote' | 'guess' | 'time', currentData: GameData): Player[] => {
    if (settings.mode !== 'TOURNAMENT') return currentData.players;

    return currentData.players.map(p => {
      let pointsToAdd = 0;
      const multiplier = currentData.isFinalRound ? 2 : 1;
      const isBadGuy = p.role === 'IMPOSTOR' || p.role === 'MR_WOLF';

      if (winner === 'players') {
        if (p.role === 'CIVILIAN') pointsToAdd = 100;
      } else {
        // Bad guys won
        if (isBadGuy) {
           // Wolf Solo Win
           if (winner === 'mr_wolf' && p.role === 'MR_WOLF') pointsToAdd = 500; // Big bonus for stealing win
           else if (winner === 'enemies') pointsToAdd = 300; // Standard win
           else if (winner === 'impostor') pointsToAdd = 300;
           
           // If Enemies win generically (Civilian voted out), both get points
           if (winner === 'enemies') pointsToAdd = 300;
        }
      }
      
      return { ...p, score: p.score + (pointsToAdd * multiplier) };
    });
  };

  const endGame = (winner: 'players' | 'impostor' | 'mr_wolf' | 'enemies', method: 'vote' | 'guess' | 'time' = 'vote') => {
    if (!gameData) return;

    const updatedPlayers = calculateScores(winner, method, gameData);
    
    setGameData({
      ...gameData,
      players: updatedPlayers,
      winner,
      winMethod: method
    });

    setGameState(GameState.RESULT);
  };

  const handleResultNext = () => {
    if (settings.mode === 'TOURNAMENT') {
      setGameState(GameState.LEADERBOARD);
    } else {
      restart();
    }
  };

  const nextRound = () => {
    if (!gameData) return;
    startGame(settings, gameData.players, gameData.currentRound + 1);
  };

  const startFinalRound = () => {
    if (!gameData) return;
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);
    const top4 = sortedPlayers.slice(0, 4);
    const top4Names = top4.map(p => p.name);
    const finalSettings = { ...settings, players: top4Names };
    // Force simple impostor for final to avoid chaos with few players
    finalSettings.enemyConfig = 'IMPOSTOR_ONLY'; 
    startGame(finalSettings, top4, gameData.currentRound + 1, true);
  };

  const restart = () => {
    setGameState(GameState.SETUP);
    setGameData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[100px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 blur-[120px] rounded-full -z-10"></div>

      <main className="w-full h-full flex flex-col">
        {gameState === GameState.SETUP && (
          <SetupScreen 
            onStart={(s) => startGame(s)} 
            initialSettings={settings} 
            onOpenInstructions={() => setGameState(GameState.INSTRUCTIONS)}
          />
        )}

        {gameState === GameState.INSTRUCTIONS && (
          <InstructionsScreen onBack={() => setGameState(GameState.SETUP)} />
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
            onEnd={(w) => endGame(w)}
          />
        )}

        {gameState === GameState.VOTING && gameData && (
          <div className="w-full flex flex-col h-full animate-in fade-in zoom-in duration-300">
             <div className="glass p-6 rounded-3xl text-center space-y-4 mb-4">
               <h2 className="text-3xl font-bungee text-white">Chi volete eliminare?</h2>
               <p className="text-slate-300 text-sm">
                 {settings.enemyConfig === 'BOTH' 
                   ? "Basta trovare uno dei nemici per vincere! Scegliete bene." 
                   : "Toccate il nome del giocatore che sospettate."}
               </p>
             </div>
             
             <div className="glass flex-1 p-4 rounded-3xl overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {gameData.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlayerVoted(p)}
                    className="w-full p-4 rounded-xl bg-slate-800 hover:bg-rose-600/20 hover:border-rose-500 border border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold text-lg text-white group-hover:text-rose-400">{p.name}</span>
                    <i className="fa-solid fa-skull text-slate-600 group-hover:text-rose-500"></i>
                  </button>
                ))}
             </div>
          </div>
        )}

        {gameState === GameState.WOLF_GUESS && gameData && (
          <MrWolfScreen gameData={gameData} onGuessResult={handleWolfGuess} />
        )}

        {gameState === GameState.RESULT && gameData && (
          <ResultScreen 
            gameData={gameData} 
            mode={settings.mode}
            onNext={handleResultNext} 
          />
        )}

        {gameState === GameState.LEADERBOARD && gameData && (
          <LeaderboardScreen
            gameData={gameData}
            totalRounds={settings.totalRounds}
            onNextRound={nextRound}
            onStartFinal={startFinalRound}
            onEndTournament={restart}
          />
        )}
      </main>
    </div>
  );
};

export default App;
