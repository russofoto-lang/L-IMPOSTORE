
import React from 'react';
import { GroupTournamentState } from '../types';
import { Button } from './ui/Button';

interface GroupLobbyScreenProps {
  tournamentState: GroupTournamentState;
  onStartGroup: () => void;
  onAbort: () => void;
}

const GroupLobbyScreen: React.FC<GroupLobbyScreenProps> = ({
  tournamentState,
  onStartGroup,
  onAbort
}) => {
  const { phase, groups, currentGroupIndex, advancersPerGroup, finalists, groupRounds, finalRounds } = tournamentState;

  const isFinal = phase === 'FINAL';
  const currentGroup = groups[currentGroupIndex];
  const advancers = isFinal ? Math.min(2, currentGroup.length) : advancersPerGroup[currentGroupIndex];
  const rounds = isFinal ? finalRounds : groupRounds;

  // Names of players who already advanced (from previous groups)
  const advancedNames = new Set(finalists.map(f => f.name));

  return (
    <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      {/* Header */}
      <header className="text-center space-y-2 pt-2">
        <div className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">
          {isFinal ? 'FASE FINALE' : 'FASE A GIRONI'}
        </div>
        <h1 className="text-4xl font-bungee text-white">
          {isFinal
            ? `Finale`
            : `Girone ${currentGroupIndex + 1} / ${groups.length}`}
        </h1>
        <p className="text-slate-400 text-sm">
          {isFinal
            ? `I qualificati si sfidano — top ${advancers} vincono il torneo!`
            : `${rounds} round · Top ${advancers} ${advancers === 1 ? 'avanza' : 'avanzano'} alla finale`}
        </p>
      </header>

      {/* Current group highlight */}
      <div className="glass p-5 rounded-3xl border border-indigo-500/40 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <i className={`fa-solid ${isFinal ? 'fa-trophy' : 'fa-play-circle'} text-indigo-400`}></i>
          <span className="font-bold text-indigo-300 uppercase tracking-widest text-sm">
            {isFinal ? 'Giocano adesso' : `Girone ${currentGroupIndex + 1} — giocano adesso`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentGroup.map((name) => (
            <span
              key={name}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-white font-bold text-sm"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* All groups overview */}
      {!isFinal && (
        <div className="glass p-5 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Tutti i gironi
          </h3>
          <div className="space-y-3">
            {groups.map((group, idx) => {
              const isDone = idx < currentGroupIndex;
              const isCurrent = idx === currentGroupIndex;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/50'
                      : isDone
                      ? 'bg-slate-800/40 border-slate-700/50 opacity-60'
                      : 'bg-slate-800/30 border-slate-700/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-300' : isDone ? 'text-green-400' : 'text-slate-500'}`}>
                      {isDone
                        ? <><i className="fa-solid fa-check mr-1"></i>Girone {idx + 1} — completato</>
                        : isCurrent
                        ? `▶ Girone ${idx + 1}`
                        : `Girone ${idx + 1}`}
                    </span>
                    {isDone && (
                      <span className="ml-auto text-[11px] text-green-400 font-bold">
                        Top {advancersPerGroup[idx]} qualificati
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.map((name) => {
                      const hasAdvanced = isDone && advancedNames.has(name);
                      return (
                        <span
                          key={name}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            hasAdvanced
                              ? 'bg-green-600/30 border border-green-500/50 text-green-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {hasAdvanced && <i className="fa-solid fa-arrow-up mr-1 text-[10px]"></i>}
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Finalists so far (during group stage) */}
      {!isFinal && finalists.length > 0 && (
        <div className="glass p-4 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
            <i className="fa-solid fa-arrow-up"></i>
            Qualificati alla finale ({finalists.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {finalists.map((f) => (
              <span key={f.name} className="px-3 py-1 rounded-lg bg-green-600/20 border border-green-500/40 text-green-300 text-sm font-bold">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Finalists info (during final) */}
      {isFinal && (
        <div className="glass p-4 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-star"></i>
            Finalisti ({finalists.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {finalists.map((f) => (
              <span key={f.name} className="px-3 py-1 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 text-sm font-bold">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          fullWidth
          size="lg"
          onClick={onStartGroup}
          className={`text-xl py-5 ${isFinal ? 'bg-amber-500 hover:bg-amber-400 text-black' : ''}`}
        >
          <i className={`fa-solid ${isFinal ? 'fa-trophy' : 'fa-play'} mr-3`}></i>
          {isFinal ? 'Inizia la Finale!' : `Inizia Girone ${currentGroupIndex + 1}`}
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={onAbort}
          className="text-slate-500 text-sm"
        >
          Abbandona torneo
        </Button>
      </div>
    </div>
  );
};

export default GroupLobbyScreen;
