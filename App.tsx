
import React, { useState } from 'react';
import { GameState, Player, GameSettings, GameData, Role, EnemyConfig } from './types';
import { WORD_CATEGORIES, INITIAL_NAMES } from './constants';
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
    enemyConfig: 'IMPOSTOR_ONLY',
    selectedCategories: WORD_CATEGORIES.map(c => c.name),
    showCategoryHint: false
  });
  const [gameData, setGameData] = useState<GameData | null>(null);

  // Pick a random word avoiding already used words in this tournament
  const pickWord = (selectedCategories: string[], usedWords: string[]): { word: string; category: string } => {
    const availableCategories = WORD_CATEGORIES.filter(c => selectedCategories.includes(c.name));
    const allWords = availableCategories.flatMap(c => c.words.map(w => ({ word: w, category: c.name })));
    const unused = allWords.filter(w => !usedWords.includes(w.word));

    // If all words used, reset pool
    const pool = unused.length > 0 ? unused : allWords;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return picked;
  };

  // Shuffle array utility (Fisher-Yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start Game
  const startGame = (
    newSettings: GameSettings,
    existingPlayers?: Player[],
    nextRoundNum?: number,
    isFinal: boolean = false,
    previousUsedWords: string[] = []
  ) => {
    setSettings(newSettings);

    // Pick a random word from selected categories, avoiding repeats
    const { word, category } = pickWord(newSettings.selectedCategories, previousUsedWords);

    // Role Assignment Logic
    const playerCount = newSettings.players.length;
    const availableIndices = Array.from({ length: playerCount }, (_, i) => i);

    // Shuffle indices for role assignment
    const shuffledRoleIndices = shuffleArray(availableIndices);

    const roles: Role[] = new Array(playerCount).fill('CIVILIAN');

    if (newSettings.enemyConfig === 'BOTH' && playerCount >= 5) {
       roles[shuffledRoleIndices[0]] = 'IMPOSTOR';
       roles[shuffledRoleIndices[1]] = 'MR_WOLF';
    } else if (newSettings.enemyConfig === 'WOLF_ONLY') {
       roles[shuffledRoleIndices[0]] = 'MR_WOLF';
    } else {
       // Default Impostor Only
       roles[shuffledRoleIndices[0]] = 'IMPOSTOR';
    }

    // Shuffle play order
    const shuffledPlayerOrder = shuffleArray(Array.from({ length: playerCount }, (_, i) => i));

    const players: Player[] = shuffledPlayerOrder.map((originalIndex, newIndex) => {
      const name = newSettings.players[originalIndex];
      const existingPlayer = existingPlayers?.find(p => p.name === name);
      return {
        id: `p-${newIndex}`,
        name,
        role: roles[originalIndex],
        isRevealed: false,
        score: existingPlayer ? existingPlayer.score : 0
      };
    });

    setGameData({
      secretWord: word,
      wordCategory: category,
      players,
      startTime: Date.now(),
      currentRound: nextRoundNum || 1,
      isFinalRound: isFinal,
      usedWords: [...previousUsedWords, word]
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

    // Store the voted player
    setGameData(prev => prev ? { ...prev, votedPlayer } : prev);

    if (votedPlayer.role === 'MR_WOLF') {
       // Wolf Caught -> Last Chance
       setGameState(GameState.WOLF_GUESS);
    } else if (votedPlayer.role === 'IMPOSTOR') {
       // Impostor Caught -> Civilians Win
       endGame('players', 'vote', votedPlayer);
    } else {
       // Civilian Caught -> Enemies Win
       const winner = settings.enemyConfig === 'WOLF_ONLY' ? 'mr_wolf' :
                      settings.enemyConfig === 'BOTH' ? 'enemies' : 'impostor';
       endGame(winner, 'vote', votedPlayer);
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

      if (winner === 'players') {
        if (p.role === 'CIVILIAN') pointsToAdd = 100;
      } else if (winner === 'mr_wolf') {
        // Mr. Wolf solo win (guessed the word)
        if (p.role === 'MR_WOLF') pointsToAdd = 500;
      } else if (winner === 'enemies') {
        // Both enemies win (civilian voted out in BOTH mode)
        if (p.role === 'IMPOSTOR' || p.role === 'MR_WOLF') pointsToAdd = 300;
      } else if (winner === 'impostor') {
        // Impostor solo win
        if (p.role === 'IMPOSTOR') pointsToAdd = 300;
      }

      return { ...p, score: p.score + (pointsToAdd * multiplier) };
    });
  };

  const endGame = (winner: 'players' | 'impostor' | 'mr_wolf' | 'enemies', method: 'vote' | 'guess' | 'time' = 'vote', voted?: Player) => {
    if (!gameData) return;

    const updatedPlayers = calculateScores(winner, method, gameData);

    setGameData({
      ...gameData,
      players: updatedPlayers,
      winner,
      winMethod: method,
      votedPlayer: voted || gameData.votedPlayer
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
    startGame(settings, gameData.players, gameData.currentRound + 1, false, gameData.usedWords);
  };

  const startFinalRound = () => {
    if (!gameData) return;
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);
    const top4 = sortedPlayers.slice(0, 4);
    const top4Names = top4.map(p => p.name);
    const finalSettings = { ...settings, players: top4Names };
    // Force simple impostor for final to avoid chaos with few players
    finalSettings.enemyConfig = 'IMPOSTOR_ONLY';
    startGame(finalSettings, top4, gameData.currentRound + 1, true, gameData.usedWords);
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
            settings={settings}
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
          <VotingScreen
            gameData={gameData}
            settings={settings}
            onPlayerVoted={handlePlayerVoted}
          />
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

// Voting screen with confirmation
const VotingScreen: React.FC<{
  gameData: GameData;
  settings: GameSettings;
  onPlayerVoted: (player: Player) => void;
}> = ({ gameData, settings, onPlayerVoted }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="glass p-6 rounded-3xl text-center space-y-4 mb-4">
        <h2 className="text-4xl font-bungee text-white">
          {settings.enemyConfig === 'WOLF_ONLY' ? "Chi è Mr. Wolf?" :
           settings.enemyConfig === 'BOTH' ? "Chi è il nemico?" :
           "Chi è l'impostore?"}
        </h2>
        <p className="text-slate-300 text-base">
          {settings.enemyConfig === 'BOTH'
            ? "Basta trovare uno dei nemici per vincere! Scegliete bene."
            : "Toccate il nome del giocatore che sospettate."}
        </p>
      </div>

      <div className="glass flex-1 p-4 rounded-3xl overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {gameData.players.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayer(p)}
            className={`w-full p-5 rounded-xl border transition-all flex items-center justify-between group ${
              selectedPlayer?.id === p.id
                ? 'bg-rose-600/30 border-rose-500 ring-2 ring-rose-500'
                : 'bg-slate-800 hover:bg-rose-600/20 hover:border-rose-500 border-slate-700'
            }`}
          >
            <span className={`font-bold text-xl ${selectedPlayer?.id === p.id ? 'text-rose-400' : 'text-white group-hover:text-rose-400'}`}>{p.name}</span>
            <i className={`fa-solid fa-crosshairs text-xl ${selectedPlayer?.id === p.id ? 'text-rose-500' : 'text-slate-600 group-hover:text-rose-500'}`}></i>
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <div className="mt-4 glass p-5 rounded-3xl animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          <p className="text-center text-slate-300 text-lg">
            Secondo voi <span className="font-bungee text-rose-400">{selectedPlayer.name}</span> è il nemico?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setSelectedPlayer(null)}
              className="text-lg py-4"
            >
              Annulla
            </Button>
            <button
              onClick={() => onPlayerVoted(selectedPlayer)}
              className="flex-1 py-4 rounded-xl font-bold text-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg"
            >
              Conferma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
