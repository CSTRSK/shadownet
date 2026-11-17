import React from 'react';
import { REPEATABLE_RESEARCH_CATALOG, RESEARCH_CATALOG } from '../game/catalog';
import { createDefaultRepeatableResearch, getRepeatableTechCost } from '../game/engine';
import { GameState, RepeatableTechId, ResearchTier } from '../game/types';

interface ResearchPanelProps {
  gameState: GameState;
  onUnlockResearch: (researchId: string) => void;
  onUnlockRepeatableTech: (id: RepeatableTechId) => void;
}

const TIERS: Array<{ tier: ResearchTier; title: string }> = [
  { tier: 1, title: 'Stufe 1 · Basis-Infrastruktur' },
  { tier: 2, title: 'Stufe 2 · KI & Rechenzentren' },
  { tier: 3, title: 'Stufe 3 · Quanten & Globalisierung' },
  { tier: 4, title: 'Stufe 4 · Singularität' },
];

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  gameState,
  onUnlockResearch,
  onUnlockRepeatableTech,
}) => {
  const repMap = gameState.repeatableResearch ?? createDefaultRepeatableResearch();
  const tier5Unlocked = gameState.unlockedResearch.includes('super_ai');

  return (
    <div className="space-y-5">
      <div className="text-xs text-slate-300 font-mono-num">
        Freigeschaltet: {gameState.unlockedResearch.length}/{RESEARCH_CATALOG.length} Technologien ·
        Verfügbar: {Math.floor(gameState.researchPoints).toLocaleString('de-DE')} FP
      </div>

      {TIERS.map(({ tier, title }) => {
        const nodes = RESEARCH_CATALOG.filter((r) => r.tier === tier);
        return (
          <section key={tier} className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-cyan-300">{title}</h3>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
              {nodes.map((node) => {
                const unlocked = gameState.unlockedResearch.includes(node.id);
                const prereqsMet = node.prerequisites.every((p) =>
                  gameState.unlockedResearch.includes(p)
                );
                const affordable =
                  gameState.researchPoints >= node.costRP && gameState.credits >= node.costCredits;
                const canResearch = !unlocked && prereqsMet && affordable;

                const prereqNames = node.prerequisites
                  .map((pid) => RESEARCH_CATALOG.find((r) => r.id === pid)?.name ?? pid)
                  .join(', ');

                return (
                  <div key={node.id} className="p-3.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-sm font-semibold text-white">
                          {node.name}
                        </span>
                        <span className="text-xs text-fuchsia-300 font-medium">
                          · {node.effectLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {node.description}
                      </p>
                      {!prereqsMet && prereqNames && (
                        <div className="text-xs text-amber-300 mt-1">
                          Erfordert: {prereqNames}
                        </div>
                      )}
                    </div>

                    {unlocked ? (
                      <span className="text-xs font-semibold text-emerald-300 whitespace-nowrap shrink-0">
                        Erforscht
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUnlockResearch(node.id)}
                        disabled={!canResearch}
                        aria-label={`${node.name} erforschen`}
                        className="px-3.5 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-slate-900 disabled:text-slate-600 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      >
                        {node.costRP} FP · {node.costCredits.toLocaleString('de-DE')} Cr
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Stufe 5 Endgame Wiederholbare Forschung */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-amber-300">
            Stufe 5 · Wiederholbare Endgame-Optimierung
          </h3>
          {!tier5Unlocked && (
            <span className="text-[11px] text-amber-300/90">Erfordert: Super-KI</span>
          )}
        </div>

        <div className="divide-y divide-slate-800/80 border border-amber-500/25 rounded-lg bg-[#0A1228]">
          {REPEATABLE_RESEARCH_CATALOG.map((tech) => {
            const level = repMap[tech.id] ?? 0;
            const cost = getRepeatableTechCost(tech.id, level);
            const canBuy =
              tier5Unlocked &&
              gameState.researchPoints >= cost.rp &&
              gameState.credits >= cost.credits;

            return (
              <div key={tech.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {tech.name}
                    </span>
                    <span className="font-mono-num text-xs text-amber-300">
                      · Stufe {level}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-300 mt-0.5">{tech.effectLabel}</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tech.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onUnlockRepeatableTech(tech.id)}
                  disabled={!canBuy}
                  aria-label={`${tech.name} weiterforschen`}
                  className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-900 disabled:text-slate-600 text-[#060B19] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {cost.rp.toLocaleString('de-DE')} FP · {cost.credits.toLocaleString('de-DE')} Cr
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
