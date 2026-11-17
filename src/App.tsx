import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Users,
  Cpu,
  Briefcase,
  Trophy,
  SlidersHorizontal,
} from 'lucide-react';
import { cyberAudio } from './audio/synth';
import { BuildingsPanel } from './components/BuildingsPanel';
import { ContractsProductsPanel } from './components/ContractsProductsPanel';
import { CyberCampusCanvas } from './components/CyberCampusCanvas';
import { HudTopBar } from './components/HudTopBar';
import { MultiplayerEventsPanel } from './components/MultiplayerEventsPanel';
import { ResearchPanel } from './components/ResearchPanel';
import { SaveAudioPanel } from './components/SaveAudioPanel';
import { StaffPanel } from './components/StaffPanel';
import { StatusModals } from './components/StatusModals';
import { TitleScreen } from './components/TitleScreen';
import { BUILDING_CATALOG } from './game/catalog';
import {
  acceptContract,
  acquireRivalCompany,
  applyOfflineProgress,
  boostEmployeeMotivation,
  buybackShares,
  cancelContract,
  computeEconomyMetrics,
  contributeAllianceCoop,
  createInitialGameState,
  deserializeGameState,
  fireEmployee,
  hireCandidate,
  launchMarketingCampaign,
  performManualWorkBoost,
  promoteEmployee,
  purchaseOrEquipSkin,
  raiseEmployeeSalary,
  refreshCandidates,
  releaseProductUpdate,
  repayLoan,
  rerollContracts,
  resolveCyberIncident,
  resolveDilemma,
  resolveStaffAlert,
  runSecurityAudit,
  sendAllianceMessage,
  serializeGameState,
  setProductStance,
  setRegionMode,
  setTeamDirective,
  setWorkloadMode,
  stabilizeProduct,
  takeLoan,
  tickSimulation,
  toggleAllianceMembership,
  toggleAutoSoc,
  trainEmployee,
  triggerIPO,
  unlockOrUpgradeProduct,
  unlockRepeatableTech,
  unlockResearch,
  upgradeBuilding,
  upgradeGlobalRegion,
  upgradeHardware,
} from './game/engine';
import {
  BuildingId,
  CosmeticSkinId,
  CyberIncidentResolution,
  GameScreenState,
  GameState,
  GlobalRegionId,
  MarketingCampaignId,
  OfflineReport,
  ProductId,
  ProductPricingStance,
  RegionMode,
  RepeatableTechId,
  TeamDirective,
  WorkloadMode,
} from './game/types';

type DockTab = 'buildings' | 'staff' | 'research' | 'contracts' | 'multiplayer' | 'system';

const SAVE_STORAGE_KEY = 'shadownet_empire_save_v1';

const DOCK_TABS: Array<{ id: DockTab; label: string; keyNum: string; icon: React.ReactNode }> = [
  { id: 'buildings', label: 'Gebäude', keyNum: '1', icon: <Building2 className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'staff', label: 'Personal', keyNum: '2', icon: <Users className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'research', label: 'Forschung', keyNum: '3', icon: <Cpu className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'contracts', label: 'Aufträge', keyNum: '4', icon: <Briefcase className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'multiplayer', label: 'Liga', keyNum: '5', icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'system', label: 'System', keyNum: '6', icon: <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" /> },
];

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    return deserializeGameState(raw);
  } catch {
    return null;
  }
}

export default function App() {
  const initialSave = useMemo(() => loadSavedState(), []);
  const autostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [screenState, setScreenState] = useState<GameScreenState>(
    autostart ? 'playing' : 'title'
  );
  const [gameState, setGameState] = useState<GameState>(() => {
    if (autostart && initialSave) {
      return applyOfflineProgress(initialSave, Date.now()).state;
    }
    return initialSave ?? createInitialGameState();
  });
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(() => {
    if (autostart && initialSave) {
      return applyOfflineProgress(initialSave, Date.now()).report;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<DockTab>('contracts');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId>('office');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [boostPulseTick, setBoostPulseTick] = useState(0);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const screenStateRef = useRef(screenState);
  screenStateRef.current = screenState;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  // Sync body[data-state] for accessibility and verification
  useEffect(() => {
    document.body.dataset.state = screenState;
    if (screenState === 'paused' || screenState === 'title') {
      cyberAudio.stopLoops();
    } else if (screenState === 'playing') {
      cyberAudio.updateMusicAndFan(
        gameState.audio.musicEnabled,
        gameState.audio.muted,
        gameState.buildings.serverRoom
      );
    }
  }, [screenState, gameState.audio.musicEnabled, gameState.audio.muted, gameState.buildings.serverRoom]);

  const persistNow = useCallback((stateToSave: GameState) => {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, serializeGameState(stateToSave));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  // Core 4Hz economy simulation loop (decoupled from 60Hz Canvas RAF)
  useEffect(() => {
    if (screenState !== 'playing') return;
    let lastTick = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      setGameState((prev) => {
        const res = tickSimulation(prev, dt, now);
        if (res.completedContracts.length > 0) {
          cyberAudio.playNotify(prev.audio.sfxEnabled, prev.audio.muted, true);
          showToast(
            `Auftrag abgeschlossen: ${res.completedContracts[0].title} (+${res.completedContracts[0].rewardCredits} Cr)`
          );
        }
        if (res.triggeredEvent) {
          cyberAudio.playNotify(
            prev.audio.sfxEnabled,
            prev.audio.muted,
            res.triggeredEvent.sentiment !== 'negative'
          );
          showToast(`Ereignis: ${res.triggeredEvent.title}`);
        }
        if (res.quitEmployeeName) {
          cyberAudio.playNotify(prev.audio.sfxEnabled, prev.audio.muted, false);
          showToast(`Kündigung: ${res.quitEmployeeName} hat das Unternehmen verlassen!`);
        }
        return res.state;
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [screenState, showToast]);

  // Periodic autosave every 10s + on unload
  useEffect(() => {
    const autosave = window.setInterval(() => {
      if (screenStateRef.current === 'playing') {
        persistNow(gameStateRef.current);
      }
    }, 10000);

    const onUnload = () => persistNow(gameStateRef.current);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.clearInterval(autosave);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [persistNow]);

  const handleStartNew = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const fresh = createInitialGameState();
    setGameState(fresh);
    setOfflineReport(null);
    persistNow(fresh);
    setScreenState('playing');
    cyberAudio.playUpgrade(fresh.audio.sfxEnabled, fresh.audio.muted);
  }, [persistNow]);

  const handleContinue = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const saved = loadSavedState();
    if (saved) {
      const { state, report } = applyOfflineProgress(saved, Date.now());
      setGameState(state);
      setOfflineReport(report);
    }
    setScreenState('playing');
  }, []);

  const handleManualBoost = useCallback(() => {
    setBoostPulseTick((t) => t + 1);
    setGameState((prev) => {
      cyberAudio.playKeyClick(prev.audio.sfxEnabled, prev.audio.muted);
      return performManualWorkBoost(prev);
    });
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (screenStateRef.current === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (initialSave) handleContinue();
          else handleStartNew();
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setScreenState((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));
        return;
      }

      if (screenStateRef.current !== 'playing') return;

      if (e.key === ' ') {
        e.preventDefault();
        handleManualBoost();
      } else if (e.key.toLowerCase() === 'm') {
        setGameState((prev) => ({
          ...prev,
          audio: { ...prev.audio, muted: !prev.audio.muted },
        }));
      } else if (e.key.toLowerCase() === 's') {
        persistNow(gameStateRef.current);
        showToast('Spielstand gespeichert.');
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (DOCK_TABS[idx]) setActiveTab(DOCK_TABS[idx].id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleContinue, handleManualBoost, handleStartNew, initialSave, persistNow, showToast]);

  const metrics = useMemo(() => computeEconomyMetrics(gameState), [gameState]);

  const runAction = useCallback(
    (
      action: (prev: GameState) => { state: GameState; error?: string },
      successMsg?: string,
      soundType: 'upgrade' | 'notify' = 'upgrade'
    ) => {
      setGameState((prev) => {
        const res = action(prev);
        if (res.error) {
          showToast(res.error);
          cyberAudio.playNotify(prev.audio.sfxEnabled, prev.audio.muted, false);
          return prev;
        }
        if (soundType === 'upgrade') {
          cyberAudio.playUpgrade(prev.audio.sfxEnabled, prev.audio.muted);
        } else {
          cyberAudio.playNotify(prev.audio.sfxEnabled, prev.audio.muted, true);
        }
        if (successMsg) showToast(successMsg);
        return res.state;
      });
    },
    [showToast]
  );

  const handleSelectBuildingOnCanvas = useCallback((id: BuildingId) => {
    setSelectedBuilding(id);
    setActiveTab('buildings');
  }, []);

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#060B19] select-none">
      {/* Live Low-Poly Isometric Cyberpunk World */}
      <CyberCampusCanvas
        gameState={gameState}
        screenState={screenState}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={handleSelectBuildingOnCanvas}
        onManualBoost={handleManualBoost}
        boostPulseTick={boostPulseTick}
      />

      {screenState === 'title' && (
        <TitleScreen
          hasSavedGame={Boolean(initialSave)}
          onStartNew={handleStartNew}
          onContinue={handleContinue}
        />
      )}

      {screenState !== 'title' && (
        <div className="fixed inset-0 z-10 flex flex-col pointer-events-none">
          <HudTopBar
            gameState={gameState}
            metrics={metrics}
            onManualBoost={handleManualBoost}
            onToggleMute={() =>
              setGameState((prev) => ({
                ...prev,
                audio: { ...prev.audio, muted: !prev.audio.muted },
              }))
            }
            onPause={() => setScreenState('paused')}
            onQuickSave={() => {
              persistNow(gameState);
              showToast('Spielstand gespeichert.');
            }}
          />

          {/* Floating Non-Shifting Toast */}
          {toastMessage && (
            <div
              role="status"
              className="fixed bottom-3 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 md:bottom-14 z-30 pointer-events-none px-3.5 py-2 rounded-lg bg-[#081128]/95 border border-cyan-400/50 text-xs font-medium text-cyan-200 max-w-[90vw] truncate"
            >
              {toastMessage}
            </div>
          )}

          <div className="flex-1 flex flex-col md:flex-row justify-end md:justify-between min-h-0 p-2 md:p-4 gap-3">
            {/* Left Canvas Info Strip (Desktop bottom-left) */}
            <div className="hidden md:flex flex-col justify-end items-start gap-2 pointer-events-none">
              <div className="px-3.5 py-2 rounded-lg bg-[#070E22]/90 border border-slate-800 text-xs text-slate-300 pointer-events-auto">
                <span className="font-semibold text-white">
                  {BUILDING_CATALOG[selectedBuilding].name}
                </span>
                <span className="text-slate-400">
                  {' '}
                  · Stufe {gameState.buildings[selectedBuilding]} · Klick auf Gebäude zum Auswählen ·
                  Leertaste Code-Boost
                </span>
              </div>
            </div>

            {/* Right / Bottom Command Dock */}
            <aside
              aria-label="Unternehmens-Kommandozentrale"
              className="pointer-events-auto w-full md:w-[460px] lg:w-[500px] h-[62%] md:h-full flex flex-col rounded-xl bg-[#070E22]/95 border border-cyan-500/25 overflow-hidden shrink-0"
            >
              {/* Tab Strip */}
              <nav
                aria-label="Bereiche"
                className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-800 bg-[#050A18]"
              >
                {DOCK_TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2.5 px-2 flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
                        active
                          ? 'border-cyan-400 text-cyan-300 bg-[#0B1530]'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#091126]'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Actionable Crisis / Dilemma Strip */}
              {(gameState.staffAlert || gameState.activeDilemma) && (
                <div className="px-3 py-1.5 bg-[#151232] border-b border-amber-400/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {gameState.staffAlert ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('staff')}
                      className="text-rose-200 hover:text-white font-medium truncate cursor-pointer text-left"
                    >
                      Kündigung droht: {gameState.staffAlert.employeeName} ({Math.ceil(gameState.staffAlert.remainingSeconds)}s) &rarr; Personal
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('contracts')}
                      className="text-amber-200 hover:text-white font-medium truncate cursor-pointer text-left"
                    >
                      Entscheidung nötig: {gameState.activeDilemma!.title} ({Math.ceil(gameState.activeDilemma!.remainingSeconds)}s) &rarr; Aufträge
                    </button>
                  )}
                </div>
              )}

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 [overflow-anchor:none]">
                {activeTab === 'buildings' && (
                  <BuildingsPanel
                    gameState={gameState}
                    metrics={metrics}
                    selectedBuilding={selectedBuilding}
                    onSelectBuilding={setSelectedBuilding}
                    onUpgradeHardware={() =>
                      runAction(upgradeHardware, 'Hardware aufgerüstet!')
                    }
                    onUpgradeBuilding={(id) =>
                      runAction(
                        (s) => upgradeBuilding(s, id),
                        `${BUILDING_CATALOG[id].name} ausgebaut!`
                      )
                    }
                    onUpgradeGlobalRegion={(rid: GlobalRegionId) =>
                      runAction((s) => upgradeGlobalRegion(s, rid), 'Globaler Knoten ausgebaut!')
                    }
                    onSetRegionMode={(rid: GlobalRegionId, mode: RegionMode) =>
                      runAction((s) => setRegionMode(s, rid, mode), 'Knoten-Modus gewechselt.', 'notify')
                    }
                  />
                )}

                {activeTab === 'staff' && (
                  <StaffPanel
                    gameState={gameState}
                    metrics={metrics}
                    onHire={(cid) =>
                      runAction((s) => hireCandidate(s, cid), 'Mitarbeiter eingestellt!')
                    }
                    onRefreshCandidates={() =>
                      runAction(refreshCandidates, 'Neue Bewerberliste geladen.')
                    }
                    onBoostMotivation={(eid) =>
                      runAction((s) => boostEmployeeMotivation(s, eid), 'Motivation gesteigert.')
                    }
                    onTrainEmployee={(eid) =>
                      runAction((s) => trainEmployee(s, eid), 'Weiterbildung abgeschlossen!')
                    }
                    onPromoteEmployee={(eid) =>
                      runAction((s) => promoteEmployee(s, eid), 'Mitarbeiter befördert!')
                    }
                    onFireEmployee={(eid) =>
                      runAction((s) => fireEmployee(s, eid), 'Mitarbeiter gekündigt.', 'notify')
                    }
                    onRaiseSalary={(eid) =>
                      runAction((s) => raiseEmployeeSalary(s, eid), 'Gehalt um +15% erhöht!')
                    }
                    onResolveStaffAlert={(keep) =>
                      runAction(
                        (s) => resolveStaffAlert(s, keep),
                        keep ? 'Gegenangebot angenommen!' : 'Mitarbeiter hat gekündigt.',
                        keep ? 'upgrade' : 'notify'
                      )
                    }
                    onSetTeamDirective={(dir: TeamDirective) => {
                      setGameState((prev) => setTeamDirective(prev, dir));
                      showToast('Team-Direktive aktualisiert.');
                    }}
                    onSetWorkloadMode={(mode: WorkloadMode) => {
                      setGameState((prev) => setWorkloadMode(prev, mode));
                      showToast('Arbeitsbelastung angepasst.');
                    }}
                  />
                )}

                {activeTab === 'research' && (
                  <ResearchPanel
                    gameState={gameState}
                    onUnlockResearch={(rid) =>
                      runAction((s) => unlockResearch(s, rid), 'Technologie erforscht!')
                    }
                    onUnlockRepeatableTech={(id: RepeatableTechId) =>
                      runAction((s) => unlockRepeatableTech(s, id), 'Endgame-Optimierung abgeschlossen!')
                    }
                  />
                )}

                {activeTab === 'contracts' && (
                  <ContractsProductsPanel
                    gameState={gameState}
                    metrics={metrics}
                    onAcceptContract={(cid) =>
                      runAction((s) => acceptContract(s, cid), 'Auftrag gestartet.', 'notify')
                    }
                    onCancelContract={(cid) =>
                      runAction((s) => cancelContract(s, cid), 'Auftrag abgebrochen.', 'notify')
                    }
                    onRerollContracts={() =>
                      runAction(rerollContracts, 'Auftragsbörse aktualisiert.', 'notify')
                    }
                    onUnlockOrUpgradeProduct={(pid: ProductId) =>
                      runAction((s) => unlockOrUpgradeProduct(s, pid), 'Produkt aktualisiert!')
                    }
                    onSetProductStance={(pid: ProductId, stance: ProductPricingStance) =>
                      runAction((s) => setProductStance(s, pid, stance), 'Preisstrategie geändert.', 'notify')
                    }
                    onReleaseProductUpdate={(pid: ProductId) =>
                      runAction((s) => releaseProductUpdate(s, pid), 'Major-Release veröffentlicht!')
                    }
                    onStabilizeProduct={(pid: ProductId) =>
                      runAction((s) => stabilizeProduct(s, pid), 'QA-Hotfix ausgerollt (100%).')
                    }
                    onLaunchMarketingCampaign={(cid: MarketingCampaignId) =>
                      runAction((s) => launchMarketingCampaign(s, cid), 'Marketing-Kampagne aktiv!')
                    }
                    onTakeLoan={(amount: number) =>
                      runAction((s) => takeLoan(s, amount), 'Unternehmenskredit ausgezahlt.')
                    }
                    onRepayLoan={(amount?: number) =>
                      runAction((s) => repayLoan(s, amount), 'Darlehen vollständig getilgt!')
                    }
                    onResolveDilemma={(choiceId: string) =>
                      runAction((s) => resolveDilemma(s, choiceId), 'Management-Entscheidung umgesetzt.')
                    }
                    onResolveIncident={(method: CyberIncidentResolution) =>
                      runAction((s) => resolveCyberIncident(s, method), 'Cyber-Bedrohung abgewehrt!')
                    }
                    onRunSecurityAudit={() =>
                      runAction(runSecurityAudit, 'Security-Audit abgeschlossen: Firewall 100%.')
                    }
                    onToggleAutoSoc={() =>
                      runAction(toggleAutoSoc, 'Auto-SOC Status aktualisiert.', 'notify')
                    }
                    onBuybackShares={() =>
                      runAction(buybackShares, 'Aktienrückkauf durchgeführt!')
                    }
                    onTriggerIPO={() => {
                      setGameState((prev) => {
                        const res = triggerIPO(prev);
                        if (res.error) {
                          showToast(res.error);
                          return prev;
                        }
                        cyberAudio.playNotify(prev.audio.sfxEnabled, prev.audio.muted, true);
                        setScreenState('gameover');
                        return res.state;
                      });
                    }}
                  />
                )}

                {activeTab === 'multiplayer' && (
                  <MultiplayerEventsPanel
                    gameState={gameState}
                    onToggleAlliance={() =>
                      setGameState((prev) => toggleAllianceMembership(prev))
                    }
                    onContributeAllianceCoop={() =>
                      runAction(contributeAllianceCoop, 'Koop-Fortschritt beigetragen!')
                    }
                    onSendAllianceMessage={(txt) =>
                      setGameState((prev) => sendAllianceMessage(prev, txt))
                    }
                    onEquipOrBuySkin={(skinId: CosmeticSkinId) =>
                      runAction((s) => purchaseOrEquipSkin(s, skinId), 'Design aktiviert!')
                    }
                    onAcquireRival={(rivalId) =>
                      runAction((s) => acquireRivalCompany(s, rivalId), 'Unternehmensübernahme abgeschlossen!')
                    }
                  />
                )}

                {activeTab === 'system' && (
                  <SaveAudioPanel
                    gameState={gameState}
                    onToggleMusic={() =>
                      setGameState((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, musicEnabled: !prev.audio.musicEnabled },
                      }))
                    }
                    onToggleSfx={() =>
                      setGameState((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, sfxEnabled: !prev.audio.sfxEnabled },
                      }))
                    }
                    onToggleMute={() =>
                      setGameState((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, muted: !prev.audio.muted },
                      }))
                    }
                    onManualSave={() => persistNow(gameState)}
                    onExportSave={() => serializeGameState(gameState)}
                    onImportSave={(raw) => {
                      const restored = deserializeGameState(raw);
                      if (!restored) return false;
                      setGameState(restored);
                      persistNow(restored);
                      return true;
                    }}
                    onSimulateOffline={() => {
                      const past = { ...gameState, lastSavedAt: Date.now() - 3600 * 1000 };
                      const { state, report } = applyOfflineProgress(past, Date.now());
                      setGameState(state);
                      setOfflineReport(report);
                    }}
                    onResetGame={handleStartNew}
                    onRenameCompany={(name) =>
                      setGameState((prev) => ({ ...prev, companyName: name }))
                    }
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
      )}

      <StatusModals
        screenState={screenState}
        gameState={gameState}
        metrics={metrics}
        offlineReport={offlineReport}
        onResume={() => setScreenState('playing')}
        onRestart={handleStartNew}
        onReturnToTitle={() => setScreenState('title')}
        onDismissOffline={() => setOfflineReport(null)}
      />
    </main>
  );
}
