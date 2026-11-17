import React, { useState } from 'react';
import {
  BUILDING_CATALOG,
  GLOBAL_REGIONS_CATALOG,
  HARDWARE_TIERS,
  REGION_MODES,
} from '../game/catalog';
import {
  canBuildOrUpgradeBuilding,
  canUpgradeGlobalRegion,
  createDefaultGlobalRegions,
} from '../game/engine';
import {
  BuildingId,
  EconomyMetrics,
  GameState,
  GlobalRegionId,
  RegionMode,
} from '../game/types';

interface BuildingsPanelProps {
  gameState: GameState;
  metrics: EconomyMetrics;
  selectedBuilding: BuildingId;
  onSelectBuilding: (id: BuildingId) => void;
  onUpgradeHardware: () => void;
  onUpgradeBuilding: (id: BuildingId) => void;
  onUpgradeGlobalRegion: (id: GlobalRegionId) => void;
  onSetRegionMode: (id: GlobalRegionId, mode: RegionMode) => void;
}

const BUILDING_ORDER: BuildingId[] = [
  'office',
  'serverRoom',
  'researchLab',
  'marketingDept',
  'aiCenter',
];

const REGION_ORDER: GlobalRegionId[] = [
  'frankfurt',
  'reykjavik',
  'virginia',
  'tokyo',
  'orbital',
];

const MODE_ORDER: RegionMode[] = ['balanced', 'compute', 'eco', 'security'];

export const BuildingsPanel: React.FC<BuildingsPanelProps> = ({
  gameState,
  metrics,
  selectedBuilding,
  onSelectBuilding,
  onUpgradeHardware,
  onUpgradeBuilding,
  onUpgradeGlobalRegion,
  onSetRegionMode,
}) => {
  const [subTab, setSubTab] = useState<'campus' | 'global'>('campus');

  const hwTier = HARDWARE_TIERS[Math.min(HARDWARE_TIERS.length - 1, gameState.hardwareLevel - 1)];
  const nextHwTier =
    gameState.hardwareLevel < HARDWARE_TIERS.length
      ? HARDWARE_TIERS[gameState.hardwareLevel]
      : null;

  const regions = gameState.globalRegions ?? createDefaultGlobalRegions();

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B142C] border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubTab('campus')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              subTab === 'campus'
                ? 'bg-cyan-400 text-[#060B19]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Campus (Basis)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('global')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              subTab === 'global'
                ? 'bg-cyan-400 text-[#060B19]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Globale Rechenzentren ({metrics.globalRegionsCount}/5)
          </button>
        </div>
      </div>

      {subTab === 'campus' ? (
        <div className="space-y-5">
          {/* Early-game / Hardware Upgrade Section */}
          <section className="p-4 rounded-lg bg-[#0D1834] border border-cyan-500/25">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-white">
                  Hardware: {hwTier.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{hwTier.description}</p>
                <div className="text-xs text-cyan-300 font-mono-num mt-2">
                  Stufe {hwTier.level}/{HARDWARE_TIERS.length} · +{hwTier.clickPower} Boost · +
                  {hwTier.powerSupply} kW Strom · +{hwTier.coolingSupply} BTU Kühlung
                </div>
              </div>

              {nextHwTier ? (
                <button
                  type="button"
                  onClick={onUpgradeHardware}
                  disabled={gameState.credits < nextHwTier.costCredits}
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-[#060B19] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Aufrüsten · {nextHwTier.costCredits.toLocaleString('de-DE')} Cr
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-300 whitespace-nowrap shrink-0">
                  Maximalstufe
                </span>
              )}
            </div>
          </section>

          {/* Building System List */}
          <section className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
            {BUILDING_ORDER.map((id) => {
              const def = BUILDING_CATALOG[id];
              const level = gameState.buildings[id];
              const check = canBuildOrUpgradeBuilding(gameState, id);
              const isSelected = selectedBuilding === id;

              return (
                <div
                  key={id}
                  className={`p-4 transition-colors ${
                    isSelected ? 'bg-[#111F42]' : 'hover:bg-[#0E1936]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectBuilding(id)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-sm font-semibold text-white">
                          {def.name}
                        </span>
                        <span className="font-mono-num text-xs text-cyan-300">
                          Stufe {level}/{def.maxLevel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{def.subtitle}</div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {def.description}
                      </p>
                      {id === 'office' && (
                        <div className="text-xs text-slate-400 font-mono-num mt-1.5">
                          Kapazität: {metrics.employeeCount}/{metrics.employeeCapacity} Mitarbeiter ·
                          Produktivität: ×{metrics.productivityMultiplier.toFixed(2)}
                        </div>
                      )}
                      {id === 'serverRoom' && (
                        <div className="text-xs text-slate-400 font-mono-num mt-1.5">
                          Rechenleistung: {metrics.computePower} TFLOPS · Effizienz:{' '}
                          {Math.round(metrics.powerEfficiency * 100)}%
                        </div>
                      )}
                      {check.reason && !check.ok && level < def.maxLevel && (
                        <div className="text-xs text-amber-300 mt-1">{check.reason}</div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpgradeBuilding(id)}
                      disabled={!check.ok}
                      aria-label={`${def.name} ausbauen`}
                      className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-cyan-400 hover:text-[#060B19] disabled:bg-slate-900 disabled:text-slate-600 text-cyan-200 border border-cyan-500/30 disabled:border-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {level >= def.maxLevel
                        ? 'Maximum'
                        : level === 0
                          ? `Bauen · ${check.cost.toLocaleString('de-DE')} Cr`
                          : `Ausbauen · ${check.cost.toLocaleString('de-DE')} Cr`}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-[#0D1834] border border-cyan-500/25 text-xs text-slate-300 leading-relaxed">
            Weltweite Edge-Standorte skalieren Rechenleistung, Kühlung, Umsatz und Einfluss. Jeder
            ausgebaute Knoten lässt sich dynamisch auf einen Betriebsmodus umschalten.
          </div>

          <section className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
            {REGION_ORDER.map((rid) => {
              const def = GLOBAL_REGIONS_CATALOG[rid];
              const rState = regions[rid] ?? { id: rid, level: 0, mode: 'balanced' };
              const check = canUpgradeGlobalRegion(gameState, rid);

              return (
                <div key={rid} className="p-4 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {def.city} · {def.name}
                    </span>
                    <span className="font-mono-num text-xs text-cyan-300 shrink-0">
                      Stufe {rState.level}/{def.maxLevel}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-fuchsia-300">{def.specialty}</div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {def.description}
                      </p>
                      <div className="text-xs text-slate-400 font-mono-num mt-1.5">
                        +{def.computeBonusPerLevel} TFLOPS · +{def.coolingBonusPerLevel} BTU · +
                        {def.revenueBonusPctPerLevel}% Umsatz · +{def.rpBonusPctPerLevel}% FP pro
                        Stufe
                      </div>
                      {check.reason && !check.ok && rState.level < def.maxLevel && (
                        <div className="text-xs text-amber-300 mt-1">{check.reason}</div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpgradeGlobalRegion(rid)}
                      disabled={!check.ok}
                      aria-label={`${def.city} Node ausbauen`}
                      className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-cyan-400 hover:text-[#060B19] disabled:bg-slate-900 disabled:text-slate-600 text-cyan-200 border border-cyan-500/30 disabled:border-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {rState.level >= def.maxLevel
                        ? 'Maximum'
                        : rState.level === 0
                          ? `Errichten · ${check.credits.toLocaleString('de-DE')} Cr · ${check.influence} Einf.`
                          : `Ausbauen · ${check.credits.toLocaleString('de-DE')} Cr · ${check.influence} Einf.`}
                    </button>
                  </div>

                  {rState.level > 0 && (
                    <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {MODE_ORDER.map((mode) => {
                          const active = rState.mode === mode;
                          const cfg = REGION_MODES[mode];
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => onSetRegionMode(rid, mode)}
                              title={cfg.description}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                                active
                                  ? 'bg-cyan-400 text-[#060B19]'
                                  : 'bg-[#0E1936] text-slate-300 hover:text-white border border-slate-700/70'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Modus: {REGION_MODES[rState.mode].description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
};
