/**
 * Calm acoustic harmonic chime generator using Web Audio API.
 * Synthesizes a warm Tibetan singing bowl / soft meditative chime tone.
 */
class MeditationAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public voiceCuesEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a warm organic singing bowl tone (fundamental + gentle harmonics)
   */
  public playSingingBowl(freq = 432, duration = 2.4) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      // Fundamental frequency
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + duration);

      // Warm harmonic overtone (1.5x fifth)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.498, now);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Plays a gentle subtle tick/transition tone
   */
  public playTransitionChime() {
    this.playSingingBowl(528, 2.0); // 528Hz love/transformation solfeggio tone
  }

  /**
   * Speaks a calm alignment cue using Web Speech API if enabled
   */
  public speakCue(text: string) {
    if (!this.voiceCuesEnabled || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Calmer, slower cadence
        utterance.pitch = 0.95; // Softer, lower pitch
        
        // Find natural or gentle voice if available
        const voices = window.speechSynthesis.getVoices();
        const gentleVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Serena'))
        );
        if (gentleVoice) {
          utterance.voice = gentleVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Voice synthesis silent failure
      }
    }
  }
}

export const audioEngine = new MeditationAudioEngine();
