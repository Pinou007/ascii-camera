/**
 * storage.js - Settings persistence with localStorage and document.cookie
 * ASCII Camera Pro WebApp
 */

const STORAGE_KEY = 'asciicam_pro_v3_settings';

const DEFAULT_SETTINGS = {
  language: 'fr',
  onboarded: false,
  theme: 'oled', // 'oled' | 'cyber' | 'matrix' | 'amber' | 'light' | 'nordic' | 'sunset'
  soundEnabled: true,
  mode: 'photo', // 'photo' | 'video' | 'gif'
  fx: 'none',
  charset: 'dense',
  customCharset: '@%#*+=-:. ',
  font: 'jetbrains',
  fontSize: 9,
  fps: 10,
  smoothing: 0.2, // 0.0 to 1.0
  tintR: 1.0,
  tintG: 1.0,
  tintB: 1.0,
  saturation: 1.4,
  contrast: 1.2,
  brightness: 1.0,
  invert: false,
  scanlines: false,
  rotation: 0,
  mirror: false,
  audioEnabled: true,
  geoTagEnabled: false
};

class SettingsStorage {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.load();
  }

  load() {
    let loaded = null;

    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        loaded = JSON.parse(localData);
      }
    } catch (e) {}

    if (!loaded) {
      const cookieMatch = document.cookie.match(new RegExp('(^|;)\\s*' + STORAGE_KEY + '=([^;]+)'));
      if (cookieMatch) {
        try {
          loaded = JSON.parse(decodeURIComponent(cookieMatch[2]));
        } catch (e) {}
      }
    }

    if (loaded && typeof loaded === 'object') {
      this.settings = { ...DEFAULT_SETTINGS, ...loaded };
    }
    return this.settings;
  }

  save(newSettings = {}) {
    this.settings = { ...this.settings, ...newSettings };
    const serialized = JSON.stringify(this.settings);

    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {}

    try {
      const date = new Date();
      date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = STORAGE_KEY + '=' + encodeURIComponent(serialized) + '; expires=' + date.toUTCString() + '; path=/; SameSite=Lax';
    } catch (e) {}

    return this.settings;
  }

  get(key) {
    return this.settings[key];
  }

  set(key, val) {
    this.settings[key] = val;
    this.save({ [key]: val });
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS, onboarded: true };
    this.save(this.settings);
    return this.settings;
  }
}

window.appStorage = new SettingsStorage();
