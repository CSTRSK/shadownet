import React, { useState } from 'react';
import { GameState } from '../game/types';

interface SaveAudioPanelProps {
  gameState: GameState;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onToggleMute: () => void;
  onManualSave: () => void;
  onExportSave: () => string;
  onImportSave: (raw: string) => boolean;
  onSimulateOffline: () => void;
  onResetGame: () => void;
  onRenameCompany: (name: string) => void;
}

export const SaveAudioPanel: React.FC<SaveAudioPanelProps> = ({
  gameState,
  onToggleMusic,
  onToggleSfx,
  onToggleMute,
  onManualSave,
  onExportSave,
  onImportSave,
  onSimulateOffline,
  onResetGame,
  onRenameCompany,
}) => {
  const [importText, setImportText] = useState('');
  const [companyInput, setCompanyInput] = useState(gameState.companyName);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleExport = () => {
    const data = onExportSave();
    setImportText(data);
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(data).catch(() => {});
    }
    setStatusMsg('Cloud-Save JSON exportiert und in das Textfeld kopiert.');
  };

  const handleImport = () => {
    const ok = onImportSave(importText);
    setStatusMsg(ok ? 'Spielstand erfolgreich geladen.' : 'Ungültiges Save-Format.');
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInput.trim()) return;
    onRenameCompany(companyInput.trim());
    setStatusMsg('Firmenname aktualisiert.');
  };

  return (
    <div className="space-y-5">
      {/* Company Name */}
      <form
        onSubmit={handleRename}
        className="p-4 rounded-lg border border-slate-800 bg-[#0A1228] space-y-2.5"
      >
        <label htmlFor="company-name-input" className="block text-xs font-semibold text-white">
          Firmenname
        </label>
        <div className="flex gap-2">
          <input
            id="company-name-input"
            type="text"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            maxLength={28}
            className="flex-1 px-3 py-2 rounded-md bg-[#060B19] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-cyan-400 hover:bg-cyan-300 text-[#060B19] text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            Speichern
          </button>
        </div>
      </form>

      {/* Audio Controls */}
      <section className="p-4 rounded-lg border border-slate-800 bg-[#0A1228] space-y-3">
        <h3 className="font-display text-sm font-semibold text-white">
          Sound & LoFi Cyberpunk Musik
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              gameState.audio.musicEnabled
                ? 'bg-cyan-400 text-[#060B19] border-cyan-300'
                : 'bg-[#101C3B] text-slate-300 border-slate-700'
            }`}
          >
            LoFi Cyberpunk: {gameState.audio.musicEnabled ? 'An' : 'Aus'}
          </button>

          <button
            type="button"
            onClick={onToggleSfx}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              gameState.audio.sfxEnabled
                ? 'bg-cyan-400 text-[#060B19] border-cyan-300'
                : 'bg-[#101C3B] text-slate-300 border-slate-700'
            }`}
          >
            Tastatur & UI-SFX: {gameState.audio.sfxEnabled ? 'An' : 'Aus'}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="px-3.5 py-2 rounded-lg bg-[#101C3B] hover:bg-[#172852] text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            {gameState.audio.muted ? 'Stummschaltung aufheben' : 'Alles stummschalten'}
          </button>
        </div>
      </section>

      {/* Cloud Save & Idle Simulation */}
      <section className="p-4 rounded-lg border border-slate-800 bg-[#0A1228] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">
            Cloud-Save & Idle-System
          </h3>
          <span className="font-mono-num text-xs text-slate-400">
            Spielzeit: {Math.floor(gameState.playTimeSeconds)}s
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onManualSave();
              setStatusMsg('Spielstand lokal gesichert.');
            }}
            className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] text-xs font-semibold cursor-pointer"
          >
            Jetzt speichern
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-[#1C3268] text-cyan-200 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
          >
            Save exportieren
          </button>
          <button
            type="button"
            onClick={onSimulateOffline}
            className="px-3.5 py-2 rounded-lg bg-[#15254D] hover:bg-[#1C3268] text-fuchsia-200 border border-fuchsia-500/30 text-xs font-semibold cursor-pointer"
          >
            1h Idle-Ertrag testen
          </button>
          <button
            type="button"
            onClick={onResetGame}
            className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-500/40 text-xs font-semibold cursor-pointer"
          >
            Neu starten
          </button>
        </div>

        <label htmlFor="cloud-save-json" className="block text-xs text-slate-400 pt-1">
          Save-JSON einfügen zum Importieren:
        </label>
        <textarea
          id="cloud-save-json"
          rows={4}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='{"version": 1, ...}'
          className="w-full p-2.5 rounded-md bg-[#060B19] border border-slate-700 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!importText.trim()}
          className="px-3.5 py-2 rounded-lg bg-[#101C3B] hover:bg-[#172852] disabled:opacity-45 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed"
        >
          Save importieren
        </button>

        {statusMsg && <div className="text-xs text-cyan-300">{statusMsg}</div>}
      </section>
    </div>
  );
};
