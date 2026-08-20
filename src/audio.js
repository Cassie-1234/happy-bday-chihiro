// Web Audio API Synthesizer & Sound Effects Engine

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.2, volume = 0.15) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  // Sound Effect 1: Envelope Wax Seal Open
  playWaxSealOpen() {
    this.init();
    // Warm rich swell
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.4, 0.2);
      }, idx * 70);
    });
  }

  // Sound Effect 2: Button Hover / Tap
  playClick() {
    this.playTone(587.33, 'sine', 0.08, 0.1);
  }

  // Sound Effect 3: Card Flip
  playFlip() {
    this.playTone(440, 'triangle', 0.1, 0.12);
  }

  // Sound Effect 4: Macaron Catch / Item Match
  playCatch() {
    this.init();
    this.playTone(523.25, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2), 80);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.25), 160);
  }

  // Sound Effect 5: Fireworks / Cannon Blast
  playBlast() {
    if (this.muted) return;
    this.init();
    try {
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch(e) {}
  }

  // Sound Effect 6: Grand Birthday Fanfare
  playFanfare() {
    this.init();
    const melody = [
      { f: 523.25, d: 0.2 },
      { f: 523.25, d: 0.2 },
      { f: 587.33, d: 0.4 },
      { f: 523.25, d: 0.4 },
      { f: 698.46, d: 0.4 },
      { f: 659.25, d: 0.8 },
      // Happy birthday second phrase
      { f: 523.25, d: 0.2 },
      { f: 523.25, d: 0.2 },
      { f: 587.33, d: 0.4 },
      { f: 523.25, d: 0.4 },
      { f: 783.99, d: 0.4 },
      { f: 698.46, d: 0.8 }
    ];
    let timeOffset = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.2);
      }, timeOffset);
      timeOffset += note.d * 1000 + 40;
    });
  }

  // Background Ambient Music (Fontaine Tea Party Chimes)
  startBGM() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.init();

    const sequence = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25];
    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.bgmPlaying) return;
      const freq = sequence[step % sequence.length];
      this.playTone(freq, 'sine', 0.6, 0.05);
      step++;
    }, 600);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.muted;
  }
}

export const sound = new SoundEngine();
