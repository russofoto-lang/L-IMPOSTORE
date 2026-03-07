
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
  const {
    phase, groups, currentGroupIndex, advancersPerGroup,
    directQualifiers, wildCardPool, wildCardsNeeded,
    groupRounds, finalRounds, numGroups
  } = tournamentState;

  const isFinal = phase === 'FINAL';
  const currentGroup = groups[currentGroupIndex];
  const advancers = isFinal ? Math.min(2, currentGroup.length) : advancersPerGroup[currentGroupIndex];
  const rounds = isFinal ? finalRounds : groupRounds;

  // Wild card display: sort by groupScore desc
  const sortedWildPool = [...wildCardPool].sort((a, b) => b.groupScore - a.groupScore);
  const hasWildCards = !isFinal && wildCardsNeeded > 0;

  // Group letter label (A, B, C, ...)
  const groupLetter = (idx: number) => String.fromCharCode(65 + idx);

  const openDashboard = () => {
    window.open(`${window.location.href.split('?')[0]}?dashboard=1`, '_blank');
  };

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
            : `Girone ${groupLetter(currentGroupIndex)} / ${groups.length}`}
        </h1>
        <p className="text-slate-400 text-sm">
          {isFinal
            ? `I qualificati si sfidano — top ${advancers} vincono il torneo!`
            : `${rounds} round · Top ${advancers} ${advancers === 1 ? 'avanza direttamente' : 'avanzano direttamente'}`}
        </p>
        {/* Projection button */}
        <button
          onClick={openDashboard}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-bold transition-all"
          title="Apri proiezione su grande schermo"
        >
          <i className="fa-solid fa-tv text-indigo-400"></i>
          Proiezione
        </button>
      </header>

      {/* Current group highlight */}
      <div className="glass p-5 rounded-3xl border border-indigo-500/40 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <i className={`fa-solid ${isFinal ? 'fa-trophy' : 'fa-play-circle'} text-indigo-400`}></i>
          <span className="font-bold text-indigo-300 uppercase tracking-widest text-sm">
            {isFinal ? 'Giocano adesso' : `Girone ${groupLetter(currentGroupIndex)} — giocano adesso`}
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
              const directFromGroup = directQualifiers.filter(q =>
                group.includes(q.name)
              );
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/50'
                      : isDone
                      ? 'bg-slate-800/40 border-slate-700/50 opacity-70'
                      : 'bg-slate-800/30 border-slate-700/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-300' : isDone ? 'text-green-400' : 'text-slate-500'}`}>
                      {isDone
                        ? <><i className="fa-solid fa-check mr-1"></i>Girone {groupLetter(idx)} — completato</>
                        : isCurrent
                        ? `▶ Girone ${groupLetter(idx)}`
                        : `Girone ${groupLetter(idx)}`}
                    </span>
                    {isDone && (
                      <span className="ml-auto text-[11px] text-green-400 font-bold">
                        {directFromGroup.length} qualificati diretti
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.map((name) => {
                      const isDirectQ = isDone && directQualifiers.some(q => q.name === name);
                      const isWild = isDone && wildCardPool.some(w => w.name === name);
                      return (
                        <span
                          key={name}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isDirectQ
                              ? 'bg-green-600/30 border border-green-500/50 text-green-300'
                              : isWild
                              ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isDirectQ && <i className="fa-solid fa-arrow-up mr-1 text-[10px]"></i>}
                          {isWild && <i className="fa-solid fa-star mr-1 text-[10px]"></i>}
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

      {/* Direct qualifiers so far */}
      {!isFinal && directQualifiers.length > 0 && (
        <div className="glass p-4 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
            <i className="fa-solid fa-arrow-up"></i>
            Qualificati diretti ({directQualifiers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {directQualifiers.map((q) => (
              <span key={q.name} className="px-3 py-1 rounded-lg bg-green-600/20 border border-green-500/40 text-green-300 text-sm font-bold">
                {q.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wild card pool */}
      {hasWildCards && sortedWildPool.length > 0 && (
        <div className="glass p-4 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-star"></i>
            Ripescaggio — {wildCardsNeeded} {wildCardsNeeded === 1 ? 'posto' : 'posti'} disponibili
          </h3>
          <p className="text-slate-500 text-xs">Ordinati per punteggio — i migliori passeranno</p>
          <div className="flex flex-col gap-1.5 mt-1">
            {sortedWildPool.map((w, i) => (
              <div
                key={w.name}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${
                  i < wildCardsNeeded
                    ? 'bg-amber-600/20 border border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/50 border border-slate-700/30 text-slate-400'
                }`}
              >
                <span className="font-bold">{w.name}</span>
                <span className="font-bungee">
                  {w.groupScore}<span className="text-xs font-sans ml-1 opacity-60">pt</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finalists info (during final) */}
      {isFinal && (
        <div className="glass p-4 rounded-3xl space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-trophy"></i>
            Finalisti ({tournamentState.finalists.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {tournamentState.finalists.map((f) => (
              <span key={f.name} className="px-3 py-1 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 text-sm font-bold">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scoring reminder */}
      {!isFinal && (
        <div className="glass p-4 rounded-3xl space-y-2 border border-slate-700/30">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-star text-indigo-400"></i>
            Sistema Punteggio
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-green-400 font-bold">+3</span>
              <span>Vittoria villaggio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">+5</span>
              <span>Vittoria nemico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-bold">+1</span>
              <span>Bonus Fiuto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">+2</span>
              <span>Bonus Infiltrato</span>
            </div>
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
          {isFinal ? 'Inizia la Finale!' : `Inizia Girone ${groupLetter(currentGroupIndex)}`}
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
