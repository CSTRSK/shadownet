import React from 'react';
import { Volume2, VolumeX, Pause, Save, Zap } from 'lucide-react';
import { EconomyMetrics, GameState } from '../game/types';

interface HudTopBarProps {
  gameState: GameState;
  metrics: EconomyMetrics;
  onManualBoost: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onQuickSave: () => void;
}

function formatCompact(val: number): string {
  const n = Math.round(val);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString('de-DE');
}

export const HudTopBar: React.FC<HudTopBarProps> = ({
  gameState,
  metrics,
  onManualBoost,
  onToggleMute,
  onPause,
  onQuickSave,
}) => {
  const powerOk = metrics.powerProduced >= metrics.powerUsed && metrics.coolingProduced >= metrics.coolingUsed;

  return (
    <div className="pointer-events-auto w-full bg-[#070E22]/95 border-b border-cyan-500/25 px-3 py-2 md:px-5 flex flex-wrap items-center justify-between gap-2.5 md:gap-3">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-6 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 shrink-0" aria-hidden="true">
            <polygon
              points="12,2 22,7 22,17 12,22 2,17 2,7"
              fill="#0E1D3F"
              stroke="#00E5FF"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="12" r="3" fill="#FF2E93" />
          </svg>
          <span className="font-display font-bold text-sm md:text-base text-white whitespace-nowrap">
            {gameState.companyName}
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 whitespace-nowrap">
            · {metrics.phase}
          </span>
        </div>

        <div className="flex items-center gap-3.5 md:gap-6 overflow-x-auto whitespace-nowrap">
          <div className="shrink-0">
            <div className="text-[11px] text-slate-400 leading-none mb-1">Credits</div>
            <div className="font-mono-num text-base md:text-lg font-semibold text-cyan-300 leading-none">
              <span data-testid="hud-credits">{formatCompact(gameState.credits)}</span>
              <span className="text-xs text-slate-400 ml-1.5">
                ({metrics.netCreditsPerSec >= 0 ? '+' : ''}
                {formatCompact(metrics.netCreditsPerSec)}/s)
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <div className="text-[11px] text-slate-400 leading-none mb-1">Forschung (FP)</div>
            <div className="font-mono-num text-base md:text-lg font-semibold text-fuchsia-300 leading-none">
              <span data-testid="hud-rp">{formatCompact(gameState.researchPoints)}</span>
              <span className="text-xs text-slate-400 ml-1.5">
                (+{metrics.rpPerSec.toFixed(1)}/s)
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <div className="text-[11px] text-slate-400 leading-none mb-1">Einfluss</div>
            <div
              data-testid="hud-influence"
              className="font-mono-num text-base md:text-lg font-semibold text-amber-300 leading-none"
            >
              {Math.round(gameState.influence)}
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="text-[11px] text-slate-400 leading-none mb-1">Strom / Kühlung</div>
            <div
              className={`font-mono-num text-sm font-medium leading-none ${
                powerOk ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {metrics.powerUsed}/{metrics.powerProduced} kW · {metrics.coolingUsed}/
              {metrics.coolingProduced} BTU
            </div>
          </div>

          <div className="hidden xl:block shrink-0">
            <div className="text-[11px] text-slate-400 leading-none mb-1">Marktwert</div>
            <div className="font-mono-num text-sm font-semibold text-slate-100 leading-none">
              {formatCompact(metrics.valuation)} Cr
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onManualBoost}
          title="Code-Boost ausführen (Leertaste)"
          className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
        >
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Code-Boost</span>
        </button>

        <button
          type="button"
          onClick={onQuickSave}
          aria-label="Spielstand speichern"
          title="Speichern (S)"
          tabIndex={-1}
          onMouseDown={(e) => e.currentTarget.blur()}
          className="p-2 rounded-lg bg-[#101C3B] hover:bg-[#172852] border border-slate-700/80 text-slate-200 cursor-pointer transition-colors"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={gameState.audio.muted ? 'Ton aktivieren' : 'Ton stummschalten'}
          title="Ton (M)"
          tabIndex={-1}
          onMouseDown={(e) => e.currentTarget.blur()}
          className="p-2 rounded-lg bg-[#101C3B] hover:bg-[#172852] border border-slate-700/80 text-slate-200 cursor-pointer transition-colors"
        >
          {gameState.audio.muted ? (
            <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onPause}
          aria-label="Spiel pausieren"
          title="Pause (P / Esc)"
          tabIndex={-1}
          onMouseDown={(e) => e.currentTarget.blur()}
          className="p-2 rounded-lg bg-[#101C3B] hover:bg-[#172852] border border-slate-700/80 text-slate-200 cursor-pointer transition-colors"
        >
          <Pause className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
