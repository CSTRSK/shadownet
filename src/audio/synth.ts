class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private fanGain: GainNode | null = null;
  private fanOsc: OscillatorNode | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playKeyClick(enabled: boolean, muted: boolean): void {
    if (!enabled || muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 520 + (Math.random() - 0.5) * 90;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playNotify(enabled: boolean, muted: boolean, positive = true): void {
    if (!enabled || muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = positive ? [523.25, 659.25, 783.99] : [349.23, 277.18];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.075;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playUpgrade(enabled: boolean, muted: boolean): void {
    if (!enabled || muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [330, 440, 660].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      const t = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  public updateMusicAndFan(musicEnabled: boolean, muted: boolean, serverLevel: number): void {
    if (typeof window === 'undefined') return;
    if (!musicEnabled || muted) {
      this.stopLoops();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Subtle server fan hum when serverRoom > 0
    if (serverLevel > 0 && !this.fanOsc) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(64, ctx.currentTime);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.fanOsc = osc;
      this.fanGain = gain;
    } else if (serverLevel === 0 && this.fanOsc) {
      try {
        this.fanOsc.stop();
      } catch {
        // ignore
      }
      this.fanOsc = null;
      this.fanGain = null;
    }

    if (this.musicTimer === null) {
      // Gentle LoFi Cyberpunk chord progression
      const progression = [
        [220.0, 261.63, 329.63, 392.0], // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 392.0], // G6
        [164.81, 196.0, 246.94, 293.66], // Em7
      ];
      this.musicTimer = window.setInterval(() => {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const chord = progression[this.stepIndex % progression.length];
        const note = chord[this.stepIndex % chord.length];
        this.stepIndex += 1;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.76);
      }, 650);
    }
  }

  public stopLoops(): void {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.fanOsc) {
      try {
        this.fanOsc.stop();
      } catch {
        // ignore
      }
      this.fanOsc = null;
      this.fanGain = null;
    }
  }
}

export const cyberAudio = new CyberAudioEngine();
