import React, { useState } from 'react';
import { COSMETIC_SKINS } from '../game/catalog';
import { getLeaderboard } from '../game/engine';
import { CosmeticSkinId, GameState } from '../game/types';

interface MultiplayerEventsPanelProps {
  gameState: GameState;
  onToggleAlliance: () => void;
  onContributeAllianceCoop: () => void;
  onSendAllianceMessage: (text: string) => void;
  onEquipOrBuySkin: (skinId: CosmeticSkinId) => void;
  onAcquireRival: (rivalId: string) => void;
}

export const MultiplayerEventsPanel: React.FC<MultiplayerEventsPanelProps> = ({
  gameState,
  onToggleAlliance,
  onContributeAllianceCoop,
  onSendAllianceMessage,
  onEquipOrBuySkin,
  onAcquireRival,
}) => {
  const [chatText, setChatText] = useState('');
  const leaderboard = getLeaderboard(gameState);
  const coopCost = Math.max(250, gameState.buildings.office * 120);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    onSendAllianceMessage(chatText);
    setChatText('');
  };

  return (
    <div className="space-y-6">
      {/* Live Events */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">Marktereignisse</h3>
          <span className="font-mono-num text-xs text-slate-400">
            Nächstes Event in {Math.ceil(gameState.nextEventInSeconds)}s
          </span>
        </div>

        {gameState.activeEvents.length > 0 && (
          <div className="space-y-2">
            {gameState.activeEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-3 rounded-lg border text-xs ${
                  evt.sentiment === 'positive'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : evt.sentiment === 'negative'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                      : 'bg-slate-900 border-cyan-500/35 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{evt.title}</span>
                  <span className="font-mono-num">{Math.ceil(evt.remainingSeconds)}s</span>
                </div>
                <p className="mt-1 opacity-90">{evt.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228] max-h-40 overflow-y-auto">
          {gameState.eventLog.map((entry) => (
            <div key={entry.id} className="px-3.5 py-2 text-xs">
              <span className="font-semibold text-white">{entry.title}</span>
              <span className="text-slate-400"> · {entry.summary}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Firmenranking & M&A Übernahmen */}
      <section className="space-y-2.5">
        <h3 className="font-display text-sm font-semibold text-white">
          Firmenranking &amp; M&amp;A-Übernahmen
        </h3>
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
          {leaderboard.map((row, idx) => {
            const canAcquire =
              !row.isPlayer &&
              !row.acquired &&
              typeof row.acquisitionCost === 'number' &&
              gameState.credits >= row.acquisitionCost;

            const costMillions =
              (row.acquisitionCost ?? 0) >= 1_000_000
                ? `${((row.acquisitionCost ?? 0) / 1_000_000).toFixed(1)}M Cr`
                : `${Math.round((row.acquisitionCost ?? 0) / 1_000)}k Cr`;

            return (
              <div
                key={row.id}
                className={`p-3.5 space-y-2 ${row.isPlayer ? 'bg-cyan-950/30' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0 flex items-baseline gap-2">
                    <span className="font-mono-num text-xs font-semibold text-cyan-300 shrink-0">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        row.isPlayer ? 'text-cyan-200' : 'text-white'
                      }`}
                    >
                      {row.companyName}
                    </span>
                  </div>
                  <span className="font-mono-num text-xs text-slate-300 shrink-0">
                    {row.marketSharePercent ?? 0}% · {row.valuation.toLocaleString('de-DE')} Cr
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-[11px] text-slate-400">
                    <span>{row.tierLabel}</span>
                    {row.perkLabel && <span className="text-fuchsia-300"> · {row.perkLabel}</span>}
                  </div>

                  {row.isPlayer ? (
                    <span className="text-[11px] font-medium text-cyan-300 shrink-0">
                      Dein Konzern
                    </span>
                  ) : row.acquired ? (
                    <span className="text-[11px] font-semibold text-emerald-300 shrink-0">
                      Übernommen
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAcquireRival(row.id)}
                      disabled={!canAcquire}
                      className="px-2.5 py-1 rounded bg-[#15254D] hover:bg-amber-400 hover:text-[#060B19] disabled:opacity-40 text-amber-200 border border-amber-500/35 text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      Übernehmen · {costMillions}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verband (Allianz bis 30 Spieler) */}
      <section className="p-4 rounded-lg border border-slate-800 bg-[#0A1228] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-white">
              Verband: {gameState.alliance.name} [{gameState.alliance.tag}]
            </h3>
            <div className="text-xs text-slate-400 mt-0.5 font-mono-num">
              {gameState.alliance.memberCount}/{gameState.alliance.maxMembers} Spieler · Bonus: +
              {gameState.alliance.sharedBonusPercent}% Produktivität & Einfluss
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleAlliance}
            className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {gameState.alliance.joined ? 'Verlassen' : 'Beitreten'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-mono-num">
          <span>
            Gemeinsames Verbands-Event: {gameState.alliance.coopProgress}/
            {gameState.alliance.coopGoal} Punkte
          </span>
          {gameState.alliance.joined && (
            <button
              type="button"
              onClick={onContributeAllianceCoop}
              disabled={gameState.credits < coopCost}
              className="px-2.5 py-1 rounded bg-[#15254D] hover:bg-emerald-400 hover:text-[#060B19] disabled:opacity-45 text-emerald-300 border border-emerald-500/35 text-[11px] font-sans font-medium whitespace-nowrap cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              Koop-Beitrag (+50 Pkt) · {coopCost.toLocaleString('de-DE')} Cr
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-32 overflow-y-auto border-t border-slate-800 pt-2">
          {gameState.alliance.messages.map((m) => (
            <div key={m.id} className="text-xs text-slate-300">
              <span className="font-mono-num text-slate-500 mr-1.5">{m.timeLabel}</span>
              <span className="font-semibold text-cyan-300 mr-1.5">{m.author}:</span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        {gameState.alliance.joined && (
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <label htmlFor="alliance-chat-input" className="sr-only">
              Verbands-Nachricht
            </label>
            <input
              id="alliance-chat-input"
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Nachricht an Verband senden..."
              className="flex-1 px-3 py-1.5 rounded-md bg-[#060B19] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-[#15254D] hover:bg-cyan-400 hover:text-[#060B19] text-cyan-200 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Senden
            </button>
          </form>
        )}
      </section>

      {/* Saisonmodell (90 Tage) & Kosmetik-Shop (ohne Gameplay-Vorteile) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-fuchsia-300">
            Saison-Pass (90 Tage) & Kosmetik-Shop
          </h3>
          <span className="font-mono-num text-xs text-slate-400">
            Tag {gameState.seasonDay}/90 · {Math.round(gameState.seasonXp)} XP
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-[#0A1228]">
          {COSMETIC_SKINS.map((skin) => {
            const owned = gameState.unlockedSkins.includes(skin.id);
            const active = gameState.activeSkin === skin.id;
            return (
              <div key={skin.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm inline-block shrink-0"
                      style={{ backgroundColor: skin.primaryHex }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-white">{skin.name}</span>
                    <span className="text-xs text-slate-400">· Titel: {skin.frameTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{skin.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onEquipOrBuySkin(skin.id)}
                  disabled={!owned && gameState.influence < skin.costInfluence}
                  className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-cyan-400 hover:text-[#060B19] disabled:bg-slate-900 disabled:text-slate-600 text-cyan-200 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {active
                    ? 'Aktiv'
                    : owned
                      ? 'Ausrüsten'
                      : `Freischalten · ${skin.costInfluence} Einfluss`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
