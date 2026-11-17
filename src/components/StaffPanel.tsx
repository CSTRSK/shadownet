import React, { useState } from 'react';
import { AlertTriangle, UserMinus } from 'lucide-react';
import { RARITY_CONFIG, ROLE_INFO, TEAM_DIRECTIVES, WORKLOAD_MODES } from '../game/catalog';
import {
  getCandidateHireCost,
  getEmployeeFireSeverance,
  getEmployeePromotionCost,
  getEmployeeQuitRisk,
  getEmployeeRaiseCost,
  getEmployeeTrainingCost,
} from '../game/engine';
import {
  EconomyMetrics,
  EmployeeRole,
  GameState,
  TeamDirective,
  WorkloadMode,
} from '../game/types';

interface StaffPanelProps {
  gameState: GameState;
  metrics: EconomyMetrics;
  onHire: (candidateId: string) => void;
  onRefreshCandidates: () => void;
  onBoostMotivation: (employeeId: string) => void;
  onTrainEmployee: (employeeId: string) => void;
  onPromoteEmployee: (employeeId: string) => void;
  onFireEmployee: (employeeId: string) => void;
  onRaiseSalary: (employeeId: string) => void;
  onResolveStaffAlert: (keep: boolean) => void;
  onSetTeamDirective: (directive: TeamDirective) => void;
  onSetWorkloadMode: (mode: WorkloadMode) => void;
}

const DIRECTIVE_ORDER: TeamDirective[] = [
  'balanced',
  'contracts',
  'research',
  'growth',
  'defense',
];

const WORKLOAD_ORDER: WorkloadMode[] = ['worklife', 'standard', 'crunch'];

export const StaffPanel: React.FC<StaffPanelProps> = ({
  gameState,
  metrics,
  onHire,
  onRefreshCandidates,
  onBoostMotivation,
  onTrainEmployee,
  onPromoteEmployee,
  onFireEmployee,
  onRaiseSalary,
  onResolveStaffAlert,
  onSetTeamDirective,
  onSetWorkloadMode,
}) => {
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'Alle'>('Alle');
  const [viewMode, setViewMode] = useState<'market' | 'roster'>('market');

  const activeDirective = gameState.teamDirective ?? 'balanced';
  const activeWorkload = gameState.workloadMode ?? 'standard';
  const hasManager = gameState.employees.some((e) => e.role === 'Manager');
  const staffAlert = gameState.staffAlert ?? null;

  const filteredCandidates = gameState.candidates.filter(
    (c) => roleFilter === 'Alle' || c.role === roleFilter
  );

  const filteredRoster = gameState.employees.filter(
    (e) => roleFilter === 'Alle' || e.role === roleFilter
  );

  return (
    <div className="space-y-4">
      {/* Active Resignation Crisis Banner */}
      {staffAlert && (
        <section className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/60 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-xs font-semibold text-rose-200 truncate">
                Kündigung droht: {staffAlert.employeeName} ({staffAlert.role})
              </h3>
            </div>
            <span className="font-mono-num text-xs font-bold text-rose-300 shrink-0">
              {Math.ceil(staffAlert.remainingSeconds)}s
            </span>
          </div>
          <p className="text-xs text-rose-100/90">{staffAlert.reason}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onResolveStaffAlert(true)}
              disabled={gameState.credits < staffAlert.raiseCostCredits}
              className="px-3 py-1.5 rounded bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              Gegenangebot (+{staffAlert.salaryIncreasePerMin} Cr/Min) ·{' '}
              {staffAlert.raiseCostCredits.toLocaleString('de-DE')} Cr
            </button>
            <button
              type="button"
              onClick={() => onResolveStaffAlert(false)}
              className="px-3 py-1.5 rounded bg-[#1D1025] hover:bg-rose-500 hover:text-white text-rose-200 border border-rose-500/45 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Kündigung akzeptieren
            </button>
          </div>
        </section>
      )}

      {/* Workload Mode Selector */}
      <section className="p-3.5 rounded-lg bg-[#0D1834] border border-fuchsia-500/25 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xs font-semibold text-white">
            Arbeitsbelastung & Kultur
          </h3>
          <span className="font-mono-num text-[11px] text-slate-300">
            Ø Kündigungsrisiko:{' '}
            <span
              className={
                metrics.avgQuitRiskPercent >= 35
                  ? 'text-rose-300 font-semibold'
                  : metrics.avgQuitRiskPercent >= 18
                    ? 'text-amber-300 font-semibold'
                    : 'text-emerald-300 font-semibold'
              }
            >
              {metrics.avgQuitRiskPercent}%
            </span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {WORKLOAD_ORDER.map((mode) => {
            const active = activeWorkload === mode;
            const isCrunch = mode === 'crunch';
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onSetWorkloadMode(mode)}
                className={`px-2 py-1.5 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? isCrunch
                      ? 'bg-rose-400 text-[#060B19] font-semibold'
                      : 'bg-cyan-400 text-[#060B19] font-semibold'
                    : 'bg-[#0A1228] text-slate-300 hover:text-white border border-slate-700/80'
                }`}
              >
                {WORKLOAD_MODES[mode].label}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-slate-300">
          {WORKLOAD_MODES[activeWorkload].effectText}
        </div>
      </section>

      {/* Team Directive Tactical Switch */}
      <section className="p-3.5 rounded-lg bg-[#0D1834] border border-cyan-500/25 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xs font-semibold text-white">
            Team-Direktive (Unternehmensfokus)
          </h3>
          <span className="text-[11px] text-cyan-300 font-medium">
            {TEAM_DIRECTIVES[activeDirective].label}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {DIRECTIVE_ORDER.map((dir) => {
            const active = activeDirective === dir;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => onSetTeamDirective(dir)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-cyan-400 text-[#060B19]'
                    : 'bg-[#0A1228] text-slate-300 hover:text-white border border-slate-700/80'
                }`}
              >
                {TEAM_DIRECTIVES[dir].label}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-slate-300">
          {TEAM_DIRECTIVES[activeDirective].effectText}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-300 font-mono-num">
          Belegschaft: {metrics.employeeCount}/{metrics.employeeCapacity} · Gehälter:{' '}
          {Math.round(metrics.salaryPerSec * 60).toLocaleString('de-DE')} Cr/Min
          {(gameState.quitCount ?? 0) > 0 ? ` · Abgänge: ${gameState.quitCount}` : ''}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B142C] border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('market')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              viewMode === 'market'
                ? 'bg-cyan-400 text-[#060B19]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bewerber ({gameState.candidates.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              viewMode === 'roster'
                ? 'bg-cyan-400 text-[#060B19]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Team ({gameState.employees.length})
          </button>
        </div>
      </div>

      {/* Role Filter Segmented Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {(['Alle', 'Entwickler', 'Sysadmin', 'Forscher', 'Manager'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                roleFilter === role
                  ? 'bg-[#172852] text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {viewMode === 'market' && (
          <button
            type="button"
            onClick={onRefreshCandidates}
            disabled={gameState.credits < 75}
            className="px-3 py-1.5 rounded-md bg-[#101C3B] hover:bg-[#172852] disabled:opacity-50 text-xs text-slate-200 border border-slate-700 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
          >
            Neue Suche · 75 Cr
          </button>
        )}
      </div>

      {viewMode === 'market' ? (
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
          {filteredCandidates.map((c) => {
            const cost = getCandidateHireCost(c);
            const rarityStyle = RARITY_CONFIG[c.rarity];
            const canHire =
              gameState.credits >= cost && metrics.employeeCount < metrics.employeeCapacity;
            return (
              <div key={c.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="truncate">{c.name}</span>
                    <span className={`text-xs font-medium shrink-0 ${rarityStyle.colorClass}`}>
                      · {c.rarity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {c.role} · {ROLE_INFO[c.role].focus} · {c.salaryPerMin} Cr/Min
                  </div>
                  <div className="text-xs text-slate-300 font-mono-num mt-1.5">
                    INT {c.intelligence} · MOT {Math.round(c.motivation)}% · LOY {c.loyalty}% · ERF{' '}
                    {Math.round(c.experience)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onHire(c.id)}
                  disabled={!canHire}
                  aria-label={`${c.name} einstellen`}
                  className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Einstellen · {cost.toLocaleString('de-DE')} Cr
                </button>
              </div>
            );
          })}
          {filteredCandidates.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Keine Bewerber in dieser Rolle. Starte eine neue Suche oder wechsle den Filter.
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
          {filteredRoster.map((e) => {
            const rarityStyle = RARITY_CONFIG[e.rarity];
            const trainCount = e.trainingCount ?? 0;
            const trainCost = getEmployeeTrainingCost(e);
            const promo = getEmployeePromotionCost(e);
            const raiseCost = getEmployeeRaiseCost(e);
            const severance = getEmployeeFireSeverance(e);
            const quitRisk = getEmployeeQuitRisk(e, activeWorkload, hasManager);

            const canTrain =
              trainCount < 10 &&
              gameState.credits >= trainCost.credits &&
              gameState.researchPoints >= trainCost.rp;
            const canPromote =
              promo !== null &&
              gameState.credits >= promo.credits &&
              gameState.influence >= promo.influence;

            return (
              <div key={e.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white min-w-0">
                        <span className="truncate">{e.name}</span>
                        <span className={`text-xs font-medium shrink-0 ${rarityStyle.colorClass}`}>
                          · {e.rarity}
                        </span>
                        {trainCount > 0 && (
                          <span className="font-mono-num text-xs text-cyan-300 shrink-0">
                            · T{trainCount}/10
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono-num text-[11px] font-semibold shrink-0 ${
                          quitRisk >= 35
                            ? 'text-rose-300'
                            : quitRisk >= 15
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                        }`}
                      >
                        Risiko {quitRisk}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {e.role} · {ROLE_INFO[e.role].focus} · {e.salaryPerMin} Cr/Min
                    </div>
                    <div className="text-xs text-slate-300 font-mono-num mt-1.5">
                      INT {e.intelligence} · MOT {Math.round(e.motivation)}% · LOY{' '}
                      {Math.round(e.loyalty)}% · ERF {Math.round(e.experience)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onBoostMotivation(e.id)}
                    disabled={gameState.credits < 90 || e.motivation >= 99}
                    className="px-2.5 py-1.5 rounded-md bg-[#15254D] hover:bg-fuchsia-500/30 disabled:opacity-45 text-fuchsia-200 border border-fuchsia-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Motivieren · 90 Cr
                  </button>

                  <button
                    type="button"
                    onClick={() => onRaiseSalary(e.id)}
                    disabled={gameState.credits < raiseCost}
                    title="Erhöht Gehalt um +15%, steigert Loyalität & Motivation dauerhaft"
                    className="px-2.5 py-1.5 rounded-md bg-[#101C3B] hover:bg-emerald-400 hover:text-[#060B19] disabled:opacity-45 text-emerald-200 border border-emerald-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Gehalt +15% · {raiseCost.toLocaleString('de-DE')} Cr
                  </button>

                  <button
                    type="button"
                    onClick={() => onTrainEmployee(e.id)}
                    disabled={!canTrain}
                    className="px-2.5 py-1.5 rounded-md bg-[#101C3B] hover:bg-cyan-400 hover:text-[#060B19] disabled:opacity-45 text-cyan-200 border border-cyan-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {trainCount >= 10
                      ? 'Training Max'
                      : `Weiterbilden · ${trainCost.credits.toLocaleString('de-DE')} Cr · ${trainCost.rp} FP`}
                  </button>

                  {promo && (
                    <button
                      type="button"
                      onClick={() => onPromoteEmployee(e.id)}
                      disabled={!canPromote}
                      className="px-2.5 py-1.5 rounded-md bg-[#101C3B] hover:bg-amber-400 hover:text-[#060B19] disabled:opacity-45 text-amber-200 border border-amber-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      Befördern ({promo.nextRarity}) · {promo.credits.toLocaleString('de-DE')} Cr ·{' '}
                      {promo.influence} Einf.
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onFireEmployee(e.id)}
                    aria-label={`${e.name} kündigen`}
                    className="px-2.5 py-1.5 rounded-md bg-rose-950/50 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/40 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <UserMinus className="w-3 h-3" aria-hidden="true" />
                    <span>Kündigen · {severance.toLocaleString('de-DE')} Cr</span>
                  </button>
                </div>
              </div>
            );
          })}
          {filteredRoster.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Noch keine Mitarbeiter eingestellt. Wähle im Tab &bdquo;Bewerber&ldquo; deine ersten Spezialisten aus.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
