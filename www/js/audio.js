/**
 * audio.js - Gentle, Soft Sound Synthesizer for ASCII Camera Pro
 * Volume is calibrated to be very gentle and quiet.
 * Supports complete muting.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  setMuted(muted) {
    this.muted = !!muted;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft, warm, low-volume mechanical shutter click & gentle flash pop
  playPhotoShutter() {
    if (this.muted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Gentle low-frequency click (muffled shutter blade)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);

      // 2. Soft subtle click release
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, now + 0.045);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.05, now + 0.045);
      gain2.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.045);
      osc2.stop(now + 0.08);
    } catch (e) {}
  }

  // Soft, warm marimba-style chime for video start/stop
  playVideoSound(start = true) {
    if (this.muted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.type = 'sine';
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      if (start) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.06); // A4 to C#5 gentle warm major third
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else {
        osc.frequency.setValueAtTime(554.37, now);
        osc.frequency.setValueAtTime(440, now + 0.06); // C#5 to A4 descending
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {}
  }
}

window.soundController = new SoundController();
