import React, { useState } from 'react';
import {
  GitCommitHorizontal,
  Landmark,
  Megaphone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import {
  MARKETING_CAMPAIGNS,
  PRODUCT_CATALOG,
  PRODUCT_STANCES,
  RESEARCH_CATALOG,
} from '../game/catalog';
import {
  createDefaultSecurityState,
  getContractRerollCost,
  getMarketingCampaignCost,
  getMaxLoanLimit,
  getProductHotfixCost,
  getProductReleaseCost,
  getSecurityAuditCost,
  getShareBuybackCost,
} from '../game/engine';
import {
  CyberIncidentResolution,
  EconomyMetrics,
  GameState,
  MarketingCampaignId,
  ProductId,
  ProductPricingStance,
} from '../game/types';

interface ContractsProductsPanelProps {
  gameState: GameState;
  metrics: EconomyMetrics;
  onAcceptContract: (contractId: string) => void;
  onCancelContract: (contractId: string) => void;
  onRerollContracts: () => void;
  onUnlockOrUpgradeProduct: (productId: ProductId) => void;
  onSetProductStance: (productId: ProductId, stance: ProductPricingStance) => void;
  onReleaseProductUpdate: (productId: ProductId) => void;
  onStabilizeProduct: (productId: ProductId) => void;
  onLaunchMarketingCampaign: (campaignId: MarketingCampaignId) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount?: number) => void;
  onResolveDilemma: (choiceId: string) => void;
  onResolveIncident: (method: CyberIncidentResolution) => void;
  onRunSecurityAudit: () => void;
  onToggleAutoSoc: () => void;
  onBuybackShares: () => void;
  onTriggerIPO: () => void;
}

const PRODUCT_ORDER: ProductId[] = [
  'antivirus',
  'cloudStorage',
  'messenger',
  'streaming',
  'aiAssistant',
];

const STANCE_ORDER: ProductPricingStance[] = ['freemium', 'balanced', 'enterprise'];

export const ContractsProductsPanel: React.FC<ContractsProductsPanelProps> = ({
  gameState,
  metrics,
  onAcceptContract,
  onCancelContract,
  onRerollContracts,
  onUnlockOrUpgradeProduct,
  onSetProductStance,
  onReleaseProductUpdate,
  onStabilizeProduct,
  onLaunchMarketingCampaign,
  onTakeLoan,
  onRepayLoan,
  onResolveDilemma,
  onResolveIncident,
  onRunSecurityAudit,
  onToggleAutoSoc,
  onBuybackShares,
  onTriggerIPO,
}) => {
  const [subTab, setSubTab] = useState<'contracts' | 'products'>('contracts');

  const sec = gameState.security ?? createDefaultSecurityState();
  const auditCost = getSecurityAuditCost(gameState);
  const autoSocAvailable =
    gameState.unlockedResearch.includes('full_automation') || gameState.buildings.aiCenter >= 1;

  const unlockedProductsCount = Object.values(gameState.products).filter((p) => p.unlocked).length;
  const ipoReady =
    !gameState.ipoCompleted &&
    metrics.valuation >= 250000 &&
    unlockedProductsCount >= 2 &&
    gameState.buildings.aiCenter >= 1;

  const buybackCost = getShareBuybackCost(gameState);
  const rerollCost = getContractRerollCost(gameState);
  const activeDilemma = gameState.activeDilemma ?? null;

  const loanBalance = gameState.loanBalance ?? 0;
  const maxLoan = getMaxLoanLimit(gameState, metrics);
  const availableLoanRoom = Math.max(0, maxLoan - loanBalance);
  const borrowChunk = Math.max(2500, Math.round(maxLoan * 0.25));
  const campaignSeconds = Math.ceil(gameState.marketingBoostSeconds ?? 0);

  return (
    <div className="space-y-4">
      {/* Active Strategic Management Dilemma */}
      {activeDilemma && (
        <section className="p-3.5 rounded-lg bg-[#161233] border border-amber-400/55 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <GitCommitHorizontal
                className="w-4 h-4 text-amber-300 shrink-0"
                aria-hidden="true"
              />
              <h3 className="font-display text-xs font-semibold text-amber-200 truncate">
                Entscheidung: {activeDilemma.title}
              </h3>
            </div>
            <span className="font-mono-num text-xs font-semibold text-amber-300 shrink-0">
              {Math.ceil(activeDilemma.remainingSeconds)}s
            </span>
          </div>
          <p className="text-xs text-slate-200">{activeDilemma.description}</p>
          <div className="space-y-1.5">
            {activeDilemma.choices.map((ch) => {
              const needsCredits = ch.creditsDelta < 0 && gameState.credits < Math.abs(ch.creditsDelta);
              const creditTag =
                ch.creditsDelta !== 0
                  ? `${ch.creditsDelta > 0 ? '+' : ''}${ch.creditsDelta.toLocaleString('de-DE')} Cr · `
                  : '';
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onResolveDilemma(ch.id)}
                  disabled={needsCredits}
                  className="w-full text-left p-2.5 rounded-md bg-[#0B142C] hover:bg-[#172852] disabled:opacity-45 border border-amber-400/35 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <div className="text-xs font-semibold text-white">{ch.label}</div>
                  <div className="text-[11px] text-amber-200/90 mt-0.5 font-mono-num">
                    {creditTag}
                    {ch.effectHint}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Segmented Sub-Tab */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B142C] border border-slate-800 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setSubTab('contracts')}
          className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
            subTab === 'contracts'
              ? 'bg-cyan-400 text-[#060B19]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Aufträge & Security
        </button>
        <button
          type="button"
          onClick={() => setSubTab('products')}
          className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
            subTab === 'products'
              ? 'bg-cyan-400 text-[#060B19]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Produkte & Finanzen ({unlockedProductsCount}/5)
        </button>
      </div>

      {subTab === 'contracts' ? (
        <div className="space-y-5">
          {/* Cybersecurity Defense & Incident Console */}
          <section
            className={`p-3.5 rounded-lg border space-y-2.5 ${
              sec.activeIncident
                ? 'bg-rose-950/35 border-rose-500/50'
                : 'bg-[#0D1834] border-cyan-500/25'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {sec.activeIncident ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                )}
                <span className="font-display text-xs font-semibold text-white truncate">
                  Cyber-Defense · Firewall {Math.round(sec.firewallIntegrity)}%
                </span>
                <span className="font-mono-num text-[11px] text-cyan-300 shrink-0">
                  · Rating {metrics.securityRating}/100 · Abgewehrt {sec.incidentsBlockedCount}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onRunSecurityAudit}
                  disabled={gameState.credits < auditCost || sec.firewallIntegrity >= 99}
                  className="px-2.5 py-1 rounded bg-[#101C3B] hover:bg-cyan-400 hover:text-[#060B19] disabled:opacity-45 text-cyan-200 border border-cyan-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Audit · {auditCost.toLocaleString('de-DE')} Cr
                </button>
                <button
                  type="button"
                  onClick={onToggleAutoSoc}
                  disabled={!autoSocAvailable}
                  title={
                    autoSocAvailable
                      ? 'Schaltet automatische Abwehr von Cyber-Angriffen um'
                      : 'Erfordert KI-Zentrum Lv 1 oder Vollautomatisierung'
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${
                    sec.autoSocEnabled
                      ? 'bg-emerald-400 text-[#060B19]'
                      : 'bg-[#101C3B] text-slate-300 border border-slate-700 hover:text-white'
                  }`}
                >
                  Auto-SOC: {sec.autoSocEnabled ? 'AN' : 'AUS'}
                </button>
              </div>
            </div>

            {sec.activeIncident && (
              <div className="pt-2 border-t border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-rose-200 truncate">
                    Vorfall: {sec.activeIncident.title} ({sec.activeIncident.targetLabel})
                  </span>
                  <span className="font-mono-num text-rose-300 shrink-0">
                    -{Math.round((1 - sec.activeIncident.revenuePenaltyMult) * 100)}% Umsatz ·{' '}
                    {Math.ceil(sec.activeIncident.remainingSeconds)}s
                  </span>
                </div>
                <p className="text-[11px] text-rose-100/90">{sec.activeIncident.description}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onResolveIncident('patch')}
                    disabled={gameState.credits < sec.activeIncident.patchCostCredits}
                    className="px-3 py-1.5 rounded bg-rose-400 hover:bg-rose-300 disabled:opacity-45 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Notfall-Patch · {sec.activeIncident.patchCostCredits.toLocaleString('de-DE')} Cr
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolveIncident('counter')}
                    disabled={metrics.computePower < sec.activeIncident.counterMinCompute}
                    className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Gegenangriff ({sec.activeIncident.counterMinCompute} TFLOPS) · +Einfluss & FP
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Active Contracts */}
          <section className="space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-white whitespace-nowrap">
                Laufende Aufträge ({gameState.activeContracts.length}/3)
              </h3>
              <span className="text-xs text-cyan-300 font-mono-num whitespace-nowrap">
                {metrics.workSpeedPerSec.toFixed(1)} Arbeit/s · {gameState.completedContractsCount}{' '}
                erledigt
              </span>
            </div>

            <div className="min-h-[156px] flex flex-col">
              {gameState.activeContracts.length > 0 ? (
                <div className="divide-y divide-slate-800/80 border border-cyan-500/30 rounded-lg bg-[#0C1734]">
                  {gameState.activeContracts.map((c, idx) => {
                    const pct = Math.min(100, Math.round((c.progress / c.requiredWork) * 100));
                    return (
                      <div key={`active-slot-${idx}`} className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white truncate">{c.title}</div>
                            <div className="text-xs text-slate-300 truncate">
                              {c.client} · {c.category} · +{c.rewardCredits.toLocaleString('de-DE')}{' '}
                              Cr · +{c.rewardRP} FP
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono-num text-xs font-semibold text-cyan-300 w-10 text-right">
                              {pct}%
                            </span>
                            <button
                              type="button"
                              onClick={() => onCancelContract(c.id)}
                              title="Auftrag abbrechen und Slot freigeben"
                              aria-label={`Auftrag ${c.title} abbrechen`}
                              className="p-1 rounded bg-[#101C3B] hover:bg-rose-500/30 text-slate-400 hover:text-rose-200 border border-slate-700 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-slate-800 bg-[#0A1228] text-xs text-slate-400 flex-1 flex items-center">
                  Kein aktiver Auftrag. Wähle unten einen Kundenauftrag aus oder nutze
                  &bdquo;Code-Boost&ldquo; für Sofort-Einkommen.
                </div>
              )}
            </div>
          </section>

          {/* Available Contracts */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-white">Auftragsbörse</h3>
              <button
                type="button"
                onClick={onRerollContracts}
                disabled={gameState.credits < rerollCost}
                className="px-2.5 py-1 rounded bg-[#101C3B] hover:bg-[#172852] disabled:opacity-45 text-xs text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>Neu verhandeln · {rerollCost.toLocaleString('de-DE')} Cr</span>
              </button>
            </div>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
              {gameState.availableContracts.map((c, idx) => (
                <div key={`avail-slot-${idx}`} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{c.title}</div>
                    <div className="text-xs text-slate-300 mt-0.5 truncate">
                      {c.client} · {c.category} · Aufwand {c.requiredWork}
                    </div>
                    <div className="text-xs text-cyan-300 font-mono-num mt-1 truncate">
                      Belohnung: {c.rewardCredits.toLocaleString('de-DE')} Cr · {c.rewardRP} FP
                      {c.rewardInfluence > 0 ? ` · ${c.rewardInfluence} Einfluss` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAcceptContract(c.id)}
                    disabled={gameState.activeContracts.length >= 3}
                    aria-label={`Auftrag ${c.title} annehmen`}
                    className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Annehmen
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Marketing Campaigns */}
          <section className="p-3.5 rounded-lg bg-[#0D1834] border border-fuchsia-500/30 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Megaphone className="w-4 h-4 text-fuchsia-300 shrink-0" aria-hidden="true" />
                <h3 className="font-display text-xs font-semibold text-white truncate">
                  Marketing-Kampagnen
                </h3>
              </div>
              {campaignSeconds > 0 ? (
                <span className="font-mono-num text-xs font-semibold text-emerald-300 shrink-0">
                  Aktiv: +{Math.round(((gameState.marketingBoostMult ?? 1) - 1) * 100)}% Umsatz ·{' '}
                  {campaignSeconds}s
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 shrink-0">Bereit für Launch</span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {MARKETING_CAMPAIGNS.map((camp) => {
                const cost = getMarketingCampaignCost(gameState, camp.id);
                const canLaunch = gameState.credits >= cost;
                return (
                  <div
                    key={camp.id}
                    className="p-2.5 rounded bg-[#0A1228] border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{camp.name}</div>
                      <div className="text-[11px] text-slate-300 truncate">
                        +{Math.round((camp.revBoostMult - 1) * 100)}% Produkt-Umsatz ({camp.durationSeconds}s) · +{camp.influenceGain} Einfluss
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLaunchMarketingCampaign(camp.id)}
                      disabled={!canLaunch}
                      className="px-2.5 py-1.5 rounded bg-fuchsia-500/20 hover:bg-fuchsia-400 hover:text-[#060B19] disabled:opacity-45 text-fuchsia-200 border border-fuchsia-500/40 text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      Starten · {cost.toLocaleString('de-DE')} Cr
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Own Products with Stances, Stability & Feature Releases */}
          <section className="space-y-2.5">
            <h3 className="font-display text-sm font-semibold text-fuchsia-300">
              Eigene Produkte · Qualität, Preismodell & Releases
            </h3>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
              {PRODUCT_ORDER.map((pid) => {
                const def = PRODUCT_CATALOG[pid];
                const state = gameState.products[pid];
                const reqResearchName = def.requiredResearch
                  ? RESEARCH_CATALOG.find((r) => r.id === def.requiredResearch)?.name
                  : null;
                const researchMet =
                  !def.requiredResearch || gameState.unlockedResearch.includes(def.requiredResearch);

                const actionCost = state.unlocked
                  ? Math.round(def.upgradeBaseCost * Math.pow(1.65, state.level - 1))
                  : def.unlockCredits;
                const canAfford =
                  researchMet &&
                  gameState.credits >= actionCost &&
                  (state.unlocked || gameState.researchPoints >= def.unlockRP);

                const currentStance = state.stance ?? 'balanced';
                const currentVer = state.releaseVersion ?? 1;
                const stability = Math.round(state.stability ?? 100);
                const hotfixCost = getProductHotfixCost(gameState, pid);
                const releaseCost = getProductReleaseCost(pid, currentVer);
                const canRelease =
                  state.unlocked &&
                  gameState.credits >= releaseCost.credits &&
                  gameState.researchPoints >= releaseCost.rp;

                return (
                  <div key={pid} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-display text-sm font-semibold text-white">
                            {def.name}
                          </span>
                          {state.unlocked && (
                            <span className="font-mono-num text-xs text-emerald-300 shrink-0">
                              Lv {state.level} · v{currentVer}.0
                            </span>
                          )}
                          {state.unlocked && (
                            <span
                              className={`font-mono-num text-xs shrink-0 ${
                                stability >= 70
                                  ? 'text-cyan-300'
                                  : stability >= 45
                                    ? 'text-amber-300'
                                    : 'text-rose-300'
                              }`}
                            >
                              · Qualität {stability}%{stability < 70 ? ' (Abo-Verlust!)' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-fuchsia-300 mt-0.5">{def.modelLabel}</div>
                        <p className="text-xs text-slate-300 mt-1">{def.description}</p>
                        {state.unlocked ? (
                          <div className="text-xs text-cyan-300 font-mono-num mt-1 truncate">
                            Nutzer: {state.subscribers.toLocaleString('de-DE')} · +
                            {state.revenuePerSec.toLocaleString('de-DE')} Cr/s
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 font-mono-num mt-1 truncate">
                            Start: {def.unlockCredits.toLocaleString('de-DE')} Cr · {def.unlockRP} FP
                            {!researchMet && reqResearchName ? ` · Erfordert ${reqResearchName}` : ''}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onUnlockOrUpgradeProduct(pid)}
                        disabled={!canAfford}
                        className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-fuchsia-500 hover:text-white disabled:bg-slate-900 disabled:text-slate-600 text-fuchsia-200 border border-fuchsia-500/35 disabled:border-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      >
                        {state.unlocked
                          ? `Skalieren · ${actionCost.toLocaleString('de-DE')} Cr`
                          : `Entwickeln · ${actionCost.toLocaleString('de-DE')} Cr`}
                      </button>
                    </div>

                    {state.unlocked && (
                      <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {STANCE_ORDER.map((st) => {
                            const active = currentStance === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => onSetProductStance(pid, st)}
                                title={PRODUCT_STANCES[st].hint}
                                className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                                  active
                                    ? 'bg-cyan-400 text-[#060B19]'
                                    : 'bg-[#0E1936] text-slate-300 hover:text-white border border-slate-700/70'
                                }`}
                              >
                                {PRODUCT_STANCES[st].label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {stability < 99 && (
                            <button
                              type="button"
                              onClick={() => onStabilizeProduct(pid)}
                              disabled={gameState.credits < hotfixCost}
                              className="px-2.5 py-1 rounded bg-[#101C3B] hover:bg-amber-400 hover:text-[#060B19] disabled:opacity-45 text-amber-200 border border-amber-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3" aria-hidden="true" />
                              <span>QA-Hotfix · {hotfixCost.toLocaleString('de-DE')} Cr</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onReleaseProductUpdate(pid)}
                            disabled={!canRelease}
                            className="px-2.5 py-1 rounded bg-[#101C3B] hover:bg-emerald-400 hover:text-[#060B19] disabled:opacity-45 text-emerald-300 border border-emerald-500/35 text-[11px] font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            Release v{currentVer + 1}.0 · {releaseCost.credits.toLocaleString('de-DE')}{' '}
                            Cr · {releaseCost.rp} FP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Corporate Credit Line (Loans) */}
          <section className="p-4 rounded-lg bg-[#0D1834] border border-cyan-500/25 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Landmark className="w-4 h-4 text-cyan-300 shrink-0" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold text-white truncate">
                  Unternehmens-Kreditlinie
                </h3>
              </div>
              <span className="font-mono-num text-xs text-slate-300 shrink-0">
                Limit: {maxLoan.toLocaleString('de-DE')} Cr
              </span>
            </div>
            <div className="text-xs font-mono-num text-slate-300">
              Offenes Darlehen:{' '}
              <span className={loanBalance > 0 ? 'text-rose-300 font-semibold' : 'text-emerald-300'}>
                {loanBalance.toLocaleString('de-DE')} Cr
              </span>{' '}
              · Zinslast: -{metrics.loanInterestPerSec.toLocaleString('de-DE')} Cr/s (1,2%/s)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onTakeLoan(Math.min(availableLoanRoom, borrowChunk))}
                disabled={availableLoanRoom < 500}
                className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                Kredit aufnehmen (+{Math.min(availableLoanRoom, borrowChunk).toLocaleString('de-DE')} Cr)
              </button>
              {loanBalance > 0 && (
                <button
                  type="button"
                  onClick={() => onRepayLoan()}
                  disabled={gameState.credits < loanBalance}
                  className="px-3 py-1.5 rounded bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Voll tilgen · {loanBalance.toLocaleString('de-DE')} Cr
                </button>
              )}
            </div>
          </section>

          {/* Börsengang & Aktienrückkauf */}
          <section className="p-4 rounded-lg bg-[#101A38] border border-amber-400/35 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-semibold text-amber-300">
                  Börse & Marktdominanz
                </h3>
                <div className="text-xs text-cyan-300 font-mono-num mt-1">
                  Aktienkurs: {metrics.sharePrice.toLocaleString('de-DE')} Cr · Marktanteil:{' '}
                  {metrics.marketSharePercent}% · Rückkäufe: {gameState.shareBuybacks ?? 0}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Voraussetzungen IPO: 250.000 Cr Marktwert (
                  {Math.round(metrics.valuation).toLocaleString('de-DE')}), mind. 2 Produkte (
                  {unlockedProductsCount}/2) & KI-Zentrum Lv 1 ({gameState.buildings.aiCenter}/1).
                </p>
              </div>

              {!gameState.ipoCompleted ? (
                <button
                  type="button"
                  onClick={onTriggerIPO}
                  disabled={!ipoReady}
                  className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Börsengang starten
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBuybackShares}
                  disabled={gameState.credits < buybackCost}
                  className="px-3.5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Aktienrückkauf · {buybackCost.toLocaleString('de-DE')} Cr
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
