import React from 'react';
import { EconomyMetrics, GameScreenState, GameState, OfflineReport } from '../game/types';

interface StatusModalsProps {
  screenState: GameScreenState;
  gameState: GameState;
  metrics: EconomyMetrics;
  offlineReport: OfflineReport | null;
  onResume: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onDismissOffline: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  screenState,
  gameState,
  metrics,
  offlineReport,
  onResume,
  onRestart,
  onReturnToTitle,
  onDismissOffline,
}) => {
  if (offlineReport && screenState === 'playing') {
    const mins = Math.round(offlineReport.elapsedSeconds / 60);
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#040814]/85">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="offline-title"
          className="w-full max-w-md rounded-xl bg-[#0B142C] border border-cyan-400/40 p-6 space-y-4"
        >
          <h2 id="offline-title" className="font-display text-xl font-bold text-white">
            Idle-Ertrag während deiner Abwesenheit
          </h2>
          <p className="text-sm text-slate-300">
            Deine Server und Produkte liefen {mins} Minuten autonom weiter (70% Idle-Effizienz).
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-xs text-slate-400">Verdiente Credits</div>
              <div className="font-mono-num text-lg font-bold text-cyan-300">
                +{offlineReport.creditsGained.toLocaleString('de-DE')}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-xs text-slate-400">Forschungspunkte</div>
              <div className="font-mono-num text-lg font-bold text-fuchsia-300">
                +{offlineReport.rpGained.toLocaleString('de-DE')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissOffline}
            className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] font-semibold text-sm cursor-pointer"
          >
            Einnahmen verbuchen
          </button>
        </div>
      </div>
    );
  }

  if (screenState === 'paused') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#040814]/85">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
          className="w-full max-w-sm rounded-xl bg-[#0B142C] border border-cyan-400/40 p-6 space-y-5"
        >
          <div>
            <h2 id="pause-title" className="font-display text-2xl font-bold text-white">
              Simulation pausiert
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {gameState.companyName} · {metrics.phase}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-xs text-slate-400">Marktwert</div>
              <div className="font-mono-num text-base font-bold text-cyan-300">
                {Math.round(metrics.valuation).toLocaleString('de-DE')} Cr
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-xs text-slate-400">Aufträge</div>
              <div className="font-mono-num text-base font-bold text-white">
                {gameState.completedContractsCount}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] font-semibold text-sm cursor-pointer"
            >
              Fortsetzen
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 rounded-lg bg-[#15254D] hover:bg-[#1C3268] text-slate-100 border border-slate-700 font-medium text-sm cursor-pointer"
            >
              Imperium neu gründen
            </button>
            <button
              type="button"
              onClick={onReturnToTitle}
              className="w-full py-2.5 rounded-lg bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-800 font-medium text-sm cursor-pointer"
            >
              Zum Titelbildschirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screenState === 'gameover') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#040814]/88">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ipo-victory-title"
          className="w-full max-w-md rounded-xl bg-[#0B142C] border border-amber-400/50 p-6 space-y-5"
        >
          <div>
            <h2 id="ipo-victory-title" className="font-display text-2xl font-bold text-amber-300">
              Börsengang erfolgreich
            </h2>
            <p className="text-sm text-slate-300 mt-1.5">
              {gameState.companyName} dominiert den globalen Tech-Markt mit eigener KI-Abteilung
              und weltweiten Rechenzentren.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-[11px] text-slate-400">Marktwert</div>
              <div className="font-mono-num text-sm font-bold text-cyan-300 mt-0.5">
                {Math.round(metrics.valuation).toLocaleString('de-DE')}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-[11px] text-slate-400">Forschung</div>
              <div className="font-mono-num text-sm font-bold text-fuchsia-300 mt-0.5">
                {gameState.unlockedResearch.length}/9
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#060B19] border border-slate-800">
              <div className="text-[11px] text-slate-400">Personal</div>
              <div className="font-mono-num text-sm font-bold text-white mt-0.5">
                {gameState.employees.length}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onResume}
              className="flex-1 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] font-semibold text-sm cursor-pointer"
            >
              Endlos weiterspielen
            </button>
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="flex-1 py-2.5 rounded-lg bg-[#15254D] hover:bg-[#1C3268] text-white border border-slate-700 font-medium text-sm cursor-pointer"
            >
              Neu starten
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
