
import React, { useState } from 'react';
import { GameState, Player, GameSettings, GameData, Role, EnemyConfig, GroupTournamentState } from './types';
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
import GroupLobbyScreen from './components/GroupLobbyScreen';
import TournamentWinnersScreen from './components/TournamentWinnersScreen';

const USED_WORDS_KEY = 'impostore_used_words';

const loadUsedWordsFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(USED_WORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsedWordsToStorage = (words: string[]) => {
  try {
    localStorage.setItem(USED_WORDS_KEY, JSON.stringify(words));
  } catch {}
};

// Splits N players into groups of 4 or 5.
// Uses a greedy approach: maximize groups of 5 first, then fill with 4s.
// Falls back to even distribution if no clean split is possible.
const splitIntoGroups = (playerNames: string[], shuffleArray: <T>(a: T[]) => T[]): string[][] => {
  const shuffled = shuffleArray([...playerNames]);
  const n = shuffled.length;

  // Find a combination of groups of 4 and 5 that covers n players.
  // n = 4*a + 5*b  — maximize b (prefer groups of 5).
  let bestA = -1, bestB = -1;
  for (let b = Math.floor(n / 5); b >= 0; b--) {
    const remaining = n - 5 * b;
    if (remaining >= 0 && remaining % 4 === 0) {
      bestA = remaining / 4;
      bestB = b;
      break;
    }
  }

  let sizes: number[];
  if (bestA >= 0) {
    sizes = [...Array(bestB).fill(5), ...Array(bestA).fill(4)];
  } else {
    // Fallback: distribute as evenly as possible into ceil(n/5) groups
    const numGroups = Math.ceil(n / 5);
    const base = Math.floor(n / numGroups);
    const extra = n % numGroups;
    sizes = Array.from({ length: numGroups }, (_, i) => base + (i < extra ? 1 : 0));
  }

  const groups: string[][] = [];
  let start = 0;
  for (const size of sizes) {
    groups.push(shuffled.slice(start, start + size));
    start += size;
  }
  return groups;
};

// Calculate how many players advance from each group.
// Target: 4–5 total finalists.
const calcAdvancersPerGroup = (groups: string[][]): number[] => {
  const G = groups.length;
  // Find A such that G * A is in [4, 5]
  for (let A = 1; A <= Math.max(...groups.map(g => g.length)) - 1; A++) {
    if (G * A >= 4 && G * A <= 5) return Array(G).fill(A);
  }
  // No clean fit: target ceil(4.5 / G) but adjust so total ≈ 4–5
  const base = Math.floor(5 / G);
  const extra = 5 - base * G;
  return Array.from({ length: G }, (_, i) => base + (i < extra ? 1 : 0));
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [globalUsedWords, setGlobalUsedWords] = useState<string[]>(loadUsedWordsFromStorage);
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
  const [groupTournamentState, setGroupTournamentState] = useState<GroupTournamentState | null>(null);

  // Pick a random word avoiding already used words
  const pickWord = (selectedCategories: string[], sessionUsedWords: string[]): { word: string; category: string; resetGlobal: boolean } => {
    const availableCategories = WORD_CATEGORIES.filter(c => selectedCategories.includes(c.name));
    const allWords = availableCategories.flatMap(c => c.words.map(w => ({ word: w, category: c.name })));

    const allUsed = Array.from(new Set([...globalUsedWords, ...sessionUsedWords]));
    const unused = allWords.filter(w => !allUsed.includes(w.word));

    const resetGlobal = unused.length === 0;
    const pool = resetGlobal ? allWords : unused;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return { ...picked, resetGlobal };
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

    const { word, category, resetGlobal } = pickWord(newSettings.selectedCategories, previousUsedWords);

    const newGlobalUsedWords = resetGlobal ? [word] : Array.from(new Set([...globalUsedWords, word]));
    setGlobalUsedWords(newGlobalUsedWords);
    saveUsedWordsToStorage(newGlobalUsedWords);

    const playerCount = newSettings.players.length;
    const availableIndices = Array.from({ length: playerCount }, (_, i) => i);
    const shuffledRoleIndices = shuffleArray(availableIndices);

    const roles: Role[] = new Array(playerCount).fill('CIVILIAN');

    if (newSettings.enemyConfig === 'BOTH' && playerCount >= 5) {
       roles[shuffledRoleIndices[0]] = 'IMPOSTOR';
       roles[shuffledRoleIndices[1]] = 'MR_WOLF';
    } else if (newSettings.enemyConfig === 'WOLF_ONLY') {
       roles[shuffledRoleIndices[0]] = 'MR_WOLF';
    } else {
       roles[shuffledRoleIndices[0]] = 'IMPOSTOR';
    }

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

  // ─── GROUP TOURNAMENT ─────────────────────────────────────────────────────

  const startGroupTournament = (newSettings: GameSettings) => {
    setSettings(newSettings);
    const groups = splitIntoGroups(newSettings.players, shuffleArray);
    const advancers = calcAdvancersPerGroup(groups);
    const gt: GroupTournamentState = {
      phase: 'GROUPS',
      groups,
      currentGroupIndex: 0,
      groupRounds: newSettings.totalRounds,
      finalRounds: Math.max(2, newSettings.totalRounds),
      advancersPerGroup: advancers,
      finalists: [],
      allGroupResults: []
    };
    setGroupTournamentState(gt);
    setGameState(GameState.GROUP_LOBBY);
  };

  // Called when user presses "Inizia Girone" on the lobby screen
  const startCurrentGroup = () => {
    if (!groupTournamentState) return;
    const { groups, currentGroupIndex, groupRounds, phase, finalRounds } = groupTournamentState;
    const groupPlayers = groups[currentGroupIndex];
    const rounds = phase === 'FINAL' ? finalRounds : groupRounds;
    const groupSettings: GameSettings = {
      ...settings,
      players: groupPlayers,
      mode: 'TOURNAMENT',
      totalRounds: rounds,
      enemyConfig: groupPlayers.length < 5 ? 'IMPOSTOR_ONLY' : settings.enemyConfig
    };
    startGame(groupSettings, undefined, 1, false, []);
  };

  // Called after a group's multi-round result → transitions to leaderboard then next group
  const handleGroupTournamentResultNext = () => {
    setGameState(GameState.LEADERBOARD);
  };

  // Called when user clicks "Avanza" on the leaderboard after a group finishes
  const advanceGroupTournament = () => {
    if (!gameData || !groupTournamentState) return;
    const { groups, currentGroupIndex, advancersPerGroup, phase, finalists, allGroupResults } = groupTournamentState;

    // Sort this group's players by score
    const sorted = [...gameData.players].sort((a, b) => b.score - a.score);
    const advanceCount = phase === 'FINAL' ? sorted.length : advancersPerGroup[currentGroupIndex];
    const advancing = sorted.slice(0, advanceCount);

    const groupResult = {
      groupIndex: currentGroupIndex,
      players: sorted.map(p => ({ name: p.name, score: p.score }))
    };

    const newAllGroupResults = [...allGroupResults, groupResult];

    if (phase === 'FINAL') {
      // Tournament is over — show winners
      const winners = advancing.map(p => ({ name: p.name, groupScore: p.score }));
      setGroupTournamentState(prev => prev ? {
        ...prev,
        allGroupResults: newAllGroupResults,
        finalists: winners
      } : prev);
      setGameState(GameState.TOURNAMENT_WINNERS);
      return;
    }

    // Add advancing players to finalists
    const newFinalists = [
      ...finalists,
      ...advancing.map(p => ({ name: p.name, groupScore: p.score }))
    ];

    const nextGroupIndex = currentGroupIndex + 1;
    const allGroupsDone = nextGroupIndex >= groups.length;

    if (allGroupsDone) {
      // Start final round
      const finalistNames = newFinalists.map(f => f.name);
      const finalGroups = splitIntoGroups(finalistNames, shuffleArray);
      const newGt: GroupTournamentState = {
        ...groupTournamentState,
        phase: 'FINAL',
        groups: finalGroups,
        currentGroupIndex: 0,
        advancersPerGroup: finalGroups.map(g => Math.min(2, g.length)),
        finalists: newFinalists,
        allGroupResults: newAllGroupResults
      };
      setGroupTournamentState(newGt);
      setGameState(GameState.GROUP_LOBBY);
    } else {
      // Move to next group
      setGroupTournamentState(prev => prev ? {
        ...prev,
        currentGroupIndex: nextGroupIndex,
        finalists: newFinalists,
        allGroupResults: newAllGroupResults
      } : prev);
      setGameState(GameState.GROUP_LOBBY);
    }
  };

  // ─── REGULAR GAME FLOW ────────────────────────────────────────────────────

  const finishReveal = () => {
    setGameState(GameState.PLAYING);
  };

  const goToVoting = () => {
    setGameState(GameState.VOTING);
  };

  const handlePlayerVoted = (votedPlayer: Player) => {
    if (!gameData) return;
    setGameData(prev => prev ? { ...prev, votedPlayer } : prev);
    if (votedPlayer.role === 'MR_WOLF') {
       setGameState(GameState.WOLF_GUESS);
    } else if (votedPlayer.role === 'IMPOSTOR') {
       endGame('players', 'vote', votedPlayer);
    } else {
       const winner = settings.enemyConfig === 'WOLF_ONLY' ? 'mr_wolf' :
                      settings.enemyConfig === 'BOTH' ? 'enemies' : 'impostor';
       endGame(winner, 'vote', votedPlayer);
    }
  };

  const handleWolfGuess = (correct: boolean) => {
    if (correct) {
      endGame('mr_wolf', 'guess');
    } else {
      endGame('players', 'guess');
    }
  };

  const calculateScores = (winner: 'players' | 'impostor' | 'mr_wolf' | 'enemies', method: 'vote' | 'guess' | 'time', currentData: GameData): Player[] => {
    // Score calculation applies to TOURNAMENT and GROUP_TOURNAMENT modes
    if (settings.mode === 'SINGLE') return currentData.players;

    return currentData.players.map(p => {
      let pointsToAdd = 0;
      const multiplier = currentData.isFinalRound ? 2 : 1;

      if (winner === 'players') {
        if (p.role === 'CIVILIAN') pointsToAdd = 100;
      } else if (winner === 'mr_wolf') {
        if (p.role === 'MR_WOLF') pointsToAdd = 500;
      } else if (winner === 'enemies') {
        if (p.role === 'IMPOSTOR' || p.role === 'MR_WOLF') pointsToAdd = 300;
      } else if (winner === 'impostor') {
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
    if (settings.mode === 'GROUP_TOURNAMENT') {
      handleGroupTournamentResultNext();
    } else if (settings.mode === 'TOURNAMENT') {
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
    finalSettings.enemyConfig = 'IMPOSTOR_ONLY';
    startGame(finalSettings, top4, gameData.currentRound + 1, true, gameData.usedWords);
  };

  const restart = () => {
    setGameState(GameState.SETUP);
    setGameData(null);
    setGroupTournamentState(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[100px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 blur-[120px] rounded-full -z-10"></div>

      <main className="w-full h-full flex flex-col">
        {gameState === GameState.SETUP && (
          <SetupScreen
            onStart={(s) => {
              if (s.mode === 'GROUP_TOURNAMENT') {
                startGroupTournament(s);
              } else {
                startGame(s);
              }
            }}
            initialSettings={settings}
            onOpenInstructions={() => setGameState(GameState.INSTRUCTIONS)}
          />
        )}

        {gameState === GameState.INSTRUCTIONS && (
          <InstructionsScreen onBack={() => setGameState(GameState.SETUP)} />
        )}

        {gameState === GameState.GROUP_LOBBY && groupTournamentState && (
          <GroupLobbyScreen
            tournamentState={groupTournamentState}
            onStartGroup={startCurrentGroup}
            onAbort={restart}
          />
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
          settings.mode === 'GROUP_TOURNAMENT' ? (
            <LeaderboardScreen
              gameData={gameData}
              totalRounds={settings.totalRounds}
              onNextRound={nextRound}
              onStartFinal={startFinalRound}
              onEndTournament={restart}
              groupTournamentState={groupTournamentState}
              onAdvanceGroup={advanceGroupTournament}
            />
          ) : (
            <LeaderboardScreen
              gameData={gameData}
              totalRounds={settings.totalRounds}
              onNextRound={nextRound}
              onStartFinal={startFinalRound}
              onEndTournament={restart}
            />
          )
        )}

        {gameState === GameState.TOURNAMENT_WINNERS && groupTournamentState && (
          <TournamentWinnersScreen
            tournamentState={groupTournamentState}
            onRestart={restart}
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
