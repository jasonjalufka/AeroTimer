/** Small, locally synthesized cues: no files, downloads, or audio dependency. */
export class BrewAudio {
  private context: AudioContext | null = null;
  private voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();

  /** Call directly from a tap/click, before awaiting anything, for mobile autoplay rules. */
  async enable(): Promise<boolean> {
    try {
      if (!this.context || this.context.state === 'closed') {
        if (typeof globalThis.AudioContext === 'undefined') return false;
        this.context = new AudioContext();
      }
      const context = this.context;
      if (context.state !== 'running') await context.resume();
      return this.context === context && context.state === 'running';
    } catch {
      return false;
    }
  }

  play(cue: 'tick' | 'ding') {
    const context = this.context;
    if (!context || context.state !== 'running') return;

    const time = context.currentTime;
    // Gentle sine tones with attack/release envelopes avoid clicks and sharp edges.
    const tones = cue === 'tick'
      ? [{ frequency: 740, volume: 0.055, duration: 0.09 }]
      : [
          { frequency: 660, volume: 0.075, duration: 0.8 },
          { frequency: 990, volume: 0.025, duration: 0.65 },
          { frequency: 1320, volume: 0.012, duration: 0.5 },
        ];

    for (const { frequency, volume, duration } of tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const voice = { oscillator, gain };
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      this.voices.add(voice);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this.voices.delete(voice);
      };
      oscillator.start(time);
      oscillator.stop(time + duration + 0.02);
    }
  }

  stop() {
    for (const { oscillator, gain } of this.voices) {
      // Disconnect immediately when pausing, muting, hiding, or leaving the timer.
      gain.disconnect();
      oscillator.stop();
    }
    this.voices.clear();
  }

  dispose() {
    this.stop();
    const context = this.context;
    this.context = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }
}
