// Gentle WebAudio synth: soft sine/triangle tones in a pentatonic scale (nothing harsh or sudden).

const PENTA = [0, 2, 4, 7, 9]; // major pentatonic semitone offsets

function noteFreq(base: number, step: number): number {
  const octave = Math.floor(step / PENTA.length);
  const idx = ((step % PENTA.length) + PENTA.length) % PENTA.length;
  return base * Math.pow(2, (PENTA[idx] + octave * 12) / 12);
}

class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicGain: GainNode | null = null;
  soundOn = true;
  musicOn = true;
  private musicTimer: number | null = null;
  private nextBeat = 0;
  private beat = 0;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      // gentle compressor keeps volume even and never startling
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      this.master.connect(comp).connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.25, dest?: AudioNode, slideTo?: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(dest || this.master);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  private get now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  catch(combo: number) {
    if (!this.soundOn || !this.ctx) return;
    const step = 5 + (combo % 10);
    const f = noteFreq(392, step);
    this.tone(f, this.now, 0.22, "sine", 0.22);
    this.tone(f * 2, this.now + 0.02, 0.12, "triangle", 0.06);
  }

  rainbow() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    for (let i = 0; i < 6; i++) this.tone(noteFreq(523, i * 2), t + i * 0.06, 0.25, "triangle", 0.15);
  }

  heart() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.tone(659, t, 0.18, "sine", 0.2);
    this.tone(880, t + 0.1, 0.3, "sine", 0.2);
  }

  bonk() {
    if (!this.soundOn || !this.ctx) return;
    // soft "boing" - a downward slide, rounded sine
    this.tone(330, this.now, 0.35, "sine", 0.25, undefined, 160);
  }

  miss() {
    if (!this.soundOn || !this.ctx) return;
    this.tone(260, this.now, 0.12, "sine", 0.06, undefined, 220);
  }

  levelUp() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    [0, 2, 4, 5, 7].forEach((s, i) => this.tone(noteFreq(523, s), t + i * 0.09, 0.35, "triangle", 0.16));
  }

  cheer() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    [0, 2, 4].forEach((s, i) => this.tone(noteFreq(659, s), t + i * 0.07, 0.2, "sine", 0.14));
  }

  click() {
    if (!this.soundOn || !this.ctx) return;
    this.tone(700, this.now, 0.08, "sine", 0.12);
  }

  tada() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    [0, 4, 7, 12].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), t + i * 0.12, 0.5, "triangle", 0.16));
  }

  /** Four soft meadow instruments for Music Meadow — pentatonic, so any combination sounds sweet. */
  pad(i: number) {
    if (!this.soundOn || !this.ctx) return;
    const steps = [0, 2, 4, 7];
    const f = noteFreq(523, steps[Math.max(0, Math.min(3, i))]);
    this.tone(f, this.now, 0.6, "sine", 0.2);
    this.tone(f * 2, this.now + 0.015, 0.3, "triangle", 0.05);
  }

  // ---- Music Meadow instruments: each one has its own gentle voice ----
  // Every voice is built only from plain oscillators + gain envelopes (+ one
  // filtered noise burst for the drum), so they behave the same everywhere.
  // Each plays a short, distinctive motif so instruments are easy to tell apart.
  private noiseBuf: AudioBuffer | null = null;

  private noise(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuf) {
      const sr = this.ctx.sampleRate;
      const len = Math.floor(sr * 0.6);
      this.noiseBuf = this.ctx.createBuffer(1, len, sr);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }

  /** Warm pluck: triangle fundamental + soft harmonics with a quick, rounded decay. */
  private pluckNote(freq: number, start: number, dur = 1.0, vol = 0.28) {
    this.tone(freq, start, dur, "triangle", vol);
    this.tone(freq * 2, start + 0.004, dur * 0.5, "sine", vol * 0.35);
    this.tone(freq * 3, start + 0.004, dur * 0.28, "sine", vol * 0.14);
  }

  /** Soft brass note: mellow sawtooth through a low filter with a gentle attack. */
  private brassNote(freq: number, start: number, dur: number, vol = 0.2) {
    if (!this.soundOn || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(freq, start);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(1100, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + Math.min(0.09, dur * 0.3));
    g.gain.setValueAtTime(vol, start + Math.max(0.09, dur - 0.15));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(f);
    f.connect(g);
    g.connect(this.master);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  /** Guitar: a friendly strummed chord, low to high. */
  guitar() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.pluckNote(196, t, 1.1, 0.3);
    this.pluckNote(261.6, t + 0.09, 1.0, 0.24);
    this.pluckNote(329.6, t + 0.18, 0.9, 0.2);
  }

  /** Toy piano: three clear ascending notes. */
  piano() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.pluckNote(261.6, t, 0.9, 0.3);
    this.pluckNote(329.6, t + 0.15, 0.9, 0.28);
    this.pluckNote(392, t + 0.3, 1.0, 0.28);
  }

  /** Trumpet: a little two-note fanfare, kept mellow. */
  trumpet() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.brassNote(392, t, 0.24, 0.2);
    this.brassNote(523.2, t + 0.22, 0.55, 0.22);
  }

  /** Drum: tap … tap-tap! A soft thump plus a light tap each time. */
  drum() {
    if (!this.soundOn || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const buf = this.noise();
    const hits: Array<[number, number]> = [
      [0, 0.26],
      [0.22, 0.22],
      [0.4, 0.3],
    ];
    for (const [off, vol] of hits) {
      const t = this.now + off;
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        src.connect(f);
        f.connect(g);
        g.connect(this.master);
        src.start(t, Math.random() * 0.3);
        src.stop(t + 0.25);
      }
      this.tone(140, t, 0.22, "sine", vol, undefined, 55);
    }
  }

  /** Violin: one long, warm, singing note with a gentle wobble. */
  violin() {
    if (!this.soundOn || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = this.now;
    const dur = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.22);
    g.gain.setValueAtTime(0.16, t + 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 5.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    for (const freq of [440, 440]) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, t);
      lfoGain.connect(o.frequency);
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    g.connect(this.master);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }

  /** Bell: two sweet chimes that fade slowly. */
  bell() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.tone(659.2, t, 1.2, "sine", 0.24);
    this.tone(659.2 * 2.4, t + 0.004, 0.6, "sine", 0.06);
    this.tone(880, t + 0.38, 1.2, "sine", 0.22);
    this.tone(880 * 2.4, t + 0.384, 0.6, "sine", 0.05);
  }

  instrument(kind: string) {
    switch (kind) {
      case "guitar": return this.guitar();
      case "piano": return this.piano();
      case "trumpet": return this.trumpet();
      case "drum": return this.drum();
      case "violin": return this.violin();
      case "bell": return this.bell();
      default: return this.pad(0);
    }
  }

  /** Soft bell for Calm Cove — always gentle, never startling. */
  bloom(step: number) {
    if (!this.soundOn || !this.ctx) return;
    const f = noteFreq(523, step);
    this.tone(f, this.now, 0.7, "sine", 0.16);
    this.tone(f * 2, this.now + 0.015, 0.35, "triangle", 0.04);
  }

  giggle() {
    if (!this.soundOn || !this.ctx) return;
    const t = this.now;
    this.tone(784, t, 0.12, "sine", 0.14);
    this.tone(988, t + 0.1, 0.16, "sine", 0.12);
  }

  // ---- gentle background music (lullaby-like arpeggios) ----
  startMusic() {
    if (!this.ctx || !this.musicOn || this.musicTimer !== null) return;
    this.nextBeat = this.ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 100);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic() {
    if (!this.ctx || !this.musicGain) return;
    const beatLen = 60 / 96 / 2; // eighth notes at 96 bpm
    const chords = [0, 3, 4, 2]; // pentatonic degrees for roots
    const melody = [0, 2, 4, 2, 5, 4, 2, 4];
    while (this.nextBeat < this.ctx.currentTime + 0.3) {
      const bar = Math.floor(this.beat / 8) % chords.length;
      const root = chords[bar];
      const b = this.beat % 8;
      this.tone(noteFreq(262, root + melody[b]), this.nextBeat, beatLen * 1.6, "sine", 0.22, this.musicGain);
      if (b === 0 || b === 4) this.tone(noteFreq(131, root), this.nextBeat, beatLen * 3.5, "triangle", 0.25, this.musicGain);
      this.nextBeat += beatLen;
      this.beat++;
    }
  }
}

export const audio = new AudioEngine();
