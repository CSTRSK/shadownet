import React from 'react';

interface TitleScreenProps {
  hasSavedGame: boolean;
  onStartNew: () => void;
  onContinue: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  onStartNew,
  onContinue,
}) => {
  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-12 pointer-events-none"
      style={{
        background:
          'linear-gradient(90deg, rgba(6, 11, 25, 0.94) 0%, rgba(6, 11, 25, 0.78) 46%, rgba(6, 11, 25, 0.18) 100%)',
      }}
    >
      <div className="max-w-xl mt-8 md:mt-16 pointer-events-auto">
        <div className="flex items-center gap-4 mb-6">
          <svg
            viewBox="0 0 64 64"
            className="w-14 h-14 shrink-0"
            aria-hidden="true"
          >
            <polygon
              points="32,4 58,18 58,46 32,60 6,46 6,18"
              fill="#0B1633"
              stroke="#00E5FF"
              strokeWidth="2.5"
            />
            <polygon
              points="32,12 50,22 32,32 14,22"
              fill="#132A57"
              stroke="#00E5FF"
              strokeWidth="1.4"
            />
            <polygon
              points="14,22 32,32 32,52 14,42"
              fill="#0F1F44"
              stroke="#00E5FF"
              strokeWidth="1.2"
            />
            <polygon
              points="50,22 50,42 32,52 32,32"
              fill="#1E133A"
              stroke="#FF2E93"
              strokeWidth="1.4"
            />
            <circle cx="32" cy="32" r="4" fill="#00E5FF" />
          </svg>
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white">
              ShadowNet
            </h1>
            <p className="font-display text-lg md:text-xl font-medium text-cyan-300 tracking-wide">
              Rise of a Digital Empire
            </p>
          </div>
        </div>

        <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-md mb-8">
          Baue dein Technologieunternehmen von der ersten Garagen-Workstation bis zum
          weltweiten KI-Konzern auf. Verwalte Server, Personal, Forschung und eigene
          Cybersecurity-Produkte.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {hasSavedGame ? (
            <>
              <button
                type="button"
                data-start="true"
                onClick={onContinue}
                className="px-7 py-3.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Imperium fortsetzen
              </button>
              <button
                type="button"
                onClick={onStartNew}
                className="px-6 py-3.5 rounded-lg bg-[#101B38] hover:bg-[#17264D] text-slate-200 border border-slate-700 font-medium text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Neu gründen
              </button>
            </>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onStartNew}
              className="px-7 py-3.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#060B19] font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              Spiel starten
            </button>
          )}
        </div>
      </div>

      <div className="text-xs md:text-sm text-slate-400 font-medium tracking-wide pointer-events-none">
        WASD / Ziehen Kamera · Leertaste Code-Boost · 1–6 Bereiche · P Pause · M Ton
      </div>
    </div>
  );
};
