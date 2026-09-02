type SoundName = "click" | "correct" | "wrong" | "reward" | "craft" | "level-up";
type MusicTheme = "intro" | "island";

const melodies: Record<MusicTheme, number[]> = {
  intro: [392, 523.25, 659.25, 0, 440, 587.33, 659.25, 0, 349.23, 440, 523.25, 0, 392, 523.25, 587.33, 0],
  island: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 0],
};
const bassLines: Record<MusicTheme, number[]> = {
  intro: [98, 110, 130.81, 110],
  island: [130.81, 146.83, 174.61, 196],
};

class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private enabled = true;
  private musicTimer: number | null = null;
  private beat = 0;
  private theme: MusicTheme = "intro";

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.master) this.master.gain.setTargetAtTime(enabled ? 0.75 : 0.0001, this.context?.currentTime ?? 0, 0.025);
    if (enabled && this.context?.state === "running") this.startMusic();
    if (!enabled) this.stopMusic();
  }

  setTheme(theme: MusicTheme) {
    if (this.theme === theme) return;
    this.stopMusic();
    this.theme = theme;
    this.beat = 0;
    if (this.music && this.context) this.music.gain.setTargetAtTime(theme === "island" ? 0.24 : 0.15, this.context.currentTime, 0.12);
    if (this.enabled && this.context?.state === "running") this.startMusic();
  }

  async unlock() {
    if (!this.enabled || typeof window === "undefined") return;
    if (!this.context) {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.75;
      this.master.connect(this.context.destination);
      this.music = this.context.createGain();
      this.music.gain.value = 0.22;
      this.music.connect(this.master);

      // A one-frame silent source unlocks Web Audio reliably on iOS Safari.
      const unlockSource = this.context.createBufferSource();
      unlockSource.buffer = this.context.createBuffer(1, 1, 22050);
      unlockSource.connect(this.master);
      unlockSource.start(0);
    }
    if (this.context.state === "suspended") await this.context.resume();
    this.startMusic();
  }

  async activate(sound: SoundName = "click") {
    await this.unlock();
    if (this.context?.state === "running") this.play(sound);
  }

  play(sound: SoundName) {
    if (!this.enabled || !this.context || !this.master) return;
    const now = this.context.currentTime;
    const notes: Record<SoundName, Array<[number, number, number, OscillatorType]>> = {
      click: [[520, 0, 0.065, "square"], [760, 0.035, 0.055, "sine"]],
      correct: [[659.25, 0, 0.12, "triangle"], [783.99, 0.09, 0.14, "triangle"]],
      wrong: [[293.66, 0, 0.11, "sine"], [261.63, 0.1, 0.16, "sine"]],
      reward: [[523.25, 0, 0.14, "triangle"], [659.25, 0.1, 0.14, "triangle"], [783.99, 0.2, 0.22, "triangle"]],
      craft: [[220, 0, 0.06, "square"], [330, 0.08, 0.06, "square"], [659.25, 0.18, 0.2, "triangle"]],
      "level-up": [[523.25, 0, 0.15, "triangle"], [659.25, 0.12, 0.15, "triangle"], [783.99, 0.24, 0.15, "triangle"], [1046.5, 0.36, 0.35, "triangle"]],
    };
    for (const [frequency, delay, duration, wave] of notes[sound]) this.tone(frequency, now + delay, duration, sound === "click" ? 0.09 : 0.1, wave, this.master);
  }

  private startMusic() {
    if (this.musicTimer !== null || !this.enabled || !this.context || !this.music) return;
    this.playMusicBeat();
    this.musicTimer = window.setInterval(() => this.playMusicBeat(), this.theme === "intro" ? 440 : 310);
  }

  private stopMusic() {
    if (this.musicTimer === null || typeof window === "undefined") return;
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private playMusicBeat() {
    if (!this.context || !this.music || this.context.state !== "running") return;
    const melody = melodies[this.theme];
    const bass = bassLines[this.theme];
    const frequency = melody[this.beat % melody.length];
    const now = this.context.currentTime;
    if (frequency) this.tone(frequency, now, this.theme === "intro" ? 0.32 : 0.22, this.theme === "intro" ? 0.12 : 0.16, "triangle", this.music);
    if (this.beat % 4 === 0) this.tone(bass[Math.floor(this.beat / 4) % bass.length], now, this.theme === "intro" ? 1.1 : 0.75, 0.11, "sine", this.music);
    if (this.beat % 8 === 6 && frequency) this.tone(frequency / 2, now + 0.08, 0.18, 0.07, "sine", this.music);
    this.beat += 1;
  }

  private tone(frequency: number, start: number, duration: number, volume: number, wave: OscillatorType, destination: AudioNode) {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }
}

export const audioManager = new AudioManager();
