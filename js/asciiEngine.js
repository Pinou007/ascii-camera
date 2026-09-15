/**
 * asciiEngine.js - Ultra High-Performance Color ASCII Rendering Engine
 * Supports:
 * - 10 Monospace ASCII Font Families with dynamic pixel sizing (5px - 24px)
 * - 22 Calibrated Creative Filters
 * - Adaptive Background Modes (Black, Custom Colors, 9x12 Grid Auto-Gradient)
 * - Live Controls: Saturation, Smoothing, Brightness, Contrast, Hue, RVB Channels, Font, Size
 */

const FONT_FAMILIES = {
  jetbrains: "'JetBrains Mono', monospace",
  vt323: "'VT323', monospace",
  pixel: "'Press Start 2P', monospace",
  space: "'Space Mono', monospace",
  fira: "'Fira Code', monospace",
  roboto: "'Roboto Mono', monospace",
  source: "'Source Code Pro', monospace",
  tech: "'Share Tech Mono', monospace",
  courier: "'Courier New', monospace",
  system: "monospace"
};

const CHARSETS = {
  dense: '@%#*+=-:. ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  blocks: '█▓▒░ ',
  minimal: '#. ',
  matrix: 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789:・."=*+-<> '
};

class AsciiEngine {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.ctx = targetCanvas.getContext('2d', { alpha: false });

    this.sampleCanvas = document.createElement('canvas');
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    this.rotCanvas = document.createElement('canvas');
    this.rotCtx = this.rotCanvas.getContext('2d');

    this.activeSource = null;
    this.isImageSource = false;
    this.isRunning = false;
    this.animationFrameId = null;

    this.config = {
      fps: 10,
      font: 'jetbrains',
      fontSize: 9,
      charset: 'dense',
      customCharset: '@%#*+=-:. ',
      fx: 'none',
      smoothing: 0.2,
      saturation: 1.4,
      contrast: 1.2,
      brightness: 1.0,
      hue: 0,
      temperature: 0,
      invert: false,
      scanlines: false,
      tintR: 1.0,
      tintG: 1.0,
      tintB: 1.0,
      rotation: 0,
      mirror: false,
      bgMode: 'black', // 'black' | 'color' | 'adaptive_gradient'
      bgColor: '#000000',
      geoTagEnabled: false,
      geoCoordinates: null
    };

    this.cachedChars = CHARSETS.dense.split('');
    this.lastFrameTime = 0;
    this.targetInterval = 1000 / 10;
  }

  setConfig(newConfig) {
    Object.assign(this.config, newConfig);

    if (newConfig.charset !== undefined || newConfig.customCharset !== undefined) {
      if (this.config.charset === 'custom' && this.config.customCharset) {
        this.cachedChars = this.config.customCharset.split('');
      } else {
        const set = CHARSETS[this.config.charset] || CHARSETS.dense;
        this.cachedChars = set.split('');
      }
    }

    if (newConfig.fps !== undefined) {
      this.setTargetFps(newConfig.fps);
    }

    if (this.isImageSource && this.activeSource) {
      this.renderFrame();
    }
  }

  setTargetFps(fps) {
    this.config.fps = Math.max(1, Math.min(60, fps));
    this.targetInterval = 1000 / this.config.fps;
  }

  setSource(sourceElement, isImage = false) {
    this.activeSource = sourceElement;
    this.isImageSource = isImage;
    if (this.isImageSource) {
      this.renderFrame();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop(timestamp = 0) {
    if (!this.isRunning) return;

    if (this.isImageSource) {
      this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed >= this.targetInterval) {
      this.lastFrameTime = timestamp - (elapsed % this.targetInterval);
      this.renderFrame();
    }

    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  renderFrame() {
    if (!this.activeSource) return;

    if (!this.isImageSource) {
      if (this.activeSource.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (this.activeSource.videoWidth === 0 || this.activeSource.videoHeight === 0) return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = this.canvas.clientWidth || window.innerWidth;
    const displayHeight = this.canvas.clientHeight || window.innerHeight;

    if (this.canvas.width !== displayWidth * dpr || this.canvas.height !== displayHeight * dpr) {
      this.canvas.width = displayWidth * dpr;
      this.canvas.height = displayHeight * dpr;
    }

    const cW = this.canvas.width;
    const cH = this.canvas.height;

    const fontSizePx = Math.max(5, Math.round((this.config.fontSize || 9) * dpr));
    
    // Character width ratio by font family
    let charWidthRatio = 0.52;
    if (this.config.font === 'vt323') charWidthRatio = 0.45;
    if (this.config.font === 'pixel') charWidthRatio = 0.88;
    if (this.config.font === 'space') charWidthRatio = 0.56;

    const charW = Math.max(3, Math.round(fontSizePx * charWidthRatio));
    const charH = Math.max(5, fontSizePx);

    const cols = Math.floor(cW / charW);
    const rows = Math.floor(cH / charH);

    if (cols <= 0 || rows <= 0) return;

    if (this.sampleCanvas.width !== cols || this.sampleCanvas.height !== rows) {
      this.sampleCanvas.width = cols;
      this.sampleCanvas.height = rows;
    }

    const srcW = this.isImageSource ? this.activeSource.naturalWidth : this.activeSource.videoWidth;
    const srcH = this.isImageSource ? this.activeSource.naturalHeight : this.activeSource.videoHeight;

    const rot = this.config.rotation || 0;
    const mirror = this.config.mirror;

    const zoom = Math.max(1.0, Math.min(5.0, this.config.zoom || 1.0));

    if (rot !== 0 || mirror) {
      const isQuarter = rot === 90 || rot === 270;
      this.rotCanvas.width = isQuarter ? srcH : srcW;
      this.rotCanvas.height = isQuarter ? srcW : srcH;

      this.rotCtx.save();
      this.rotCtx.translate(this.rotCanvas.width / 2, this.rotCanvas.height / 2);
      this.rotCtx.rotate((rot * Math.PI) / 180);
      if (mirror) this.rotCtx.scale(-1, 1);
      this.rotCtx.drawImage(this.activeSource, -srcW / 2, -srcH / 2);
      this.rotCtx.restore();

      let rW = this.rotCanvas.width;
      let rH = this.rotCanvas.height;
      let rx = 0, ry = 0;
      if (zoom > 1.0) {
        const cWz = rW / zoom;
        const cHz = rH / zoom;
        rx = (rW - cWz) / 2;
        ry = (rH - cHz) / 2;
        rW = cWz;
        rH = cHz;
      }
      this.sampleCtx.drawImage(this.rotCanvas, rx, ry, rW, rH, 0, 0, cols, rows);
    } else {
      const srcAspect = srcW / srcH;
      const targetAspect = cW / cH;
      let sx = 0, sy = 0, sw = srcW, sh = srcH;

      if (srcAspect > targetAspect) {
        sw = srcH * targetAspect;
        sx = (srcW - sw) / 2;
      } else {
        sh = srcW / targetAspect;
        sy = (srcH - sh) / 2;
      }

      if (zoom > 1.0) {
        const cSw = sw / zoom;
        const cSh = sh / zoom;
        sx += (sw - cSw) / 2;
        sy += (sh - cSh) / 2;
        sw = cSw;
        sh = cSh;
      }

      this.sampleCtx.drawImage(this.activeSource, sx, sy, sw, sh, 0, 0, cols, rows);
    }

    let imgData;
    try {
      imgData = this.sampleCtx.getImageData(0, 0, cols, rows);
    } catch (err) {
      return;
    }

    const pixels = imgData.data;

    // ========================================================================
    // BACKGROUND RENDERING (Pure Black, Solid Color, or Live Camera Color Gradient)
    // ========================================================================
    if (this.config.bgMode === 'adaptive_gradient') {
      // Sample 9 (cols) x 12 (rows) points across the actual camera frame
      const sampleCols = 9;
      const sampleRows = 12;
      let topR = 0, topG = 0, topB = 0, topCount = 0;
      let midR = 0, midG = 0, midB = 0, midCount = 0;
      let botR = 0, botG = 0, botB = 0, botCount = 0;

      for (let gy = 0; gy < sampleRows; gy++) {
        const sampleY = Math.min(rows - 1, Math.floor((gy / (sampleRows - 1)) * (rows - 1)));
        for (let gx = 0; gx < sampleCols; gx++) {
          const sampleX = Math.min(cols - 1, Math.floor((gx / (sampleCols - 1)) * (cols - 1)));
          const idx = (sampleY * cols + sampleX) * 4;
          const rS = pixels[idx];
          const gS = pixels[idx + 1];
          const bS = pixels[idx + 2];

          if (gy < 4) {
            topR += rS; topG += gS; topB += bS; topCount++;
          } else if (gy < 8) {
            midR += rS; midG += gS; midB += bS; midCount++;
          } else {
            botR += rS; botG += gS; botB += bS; botCount++;
          }
        }
      }

      // Live vibrant colors from the camera
      const tColor = `rgb(${Math.round(topR / (topCount || 1))}, ${Math.round(topG / (topCount || 1))}, ${Math.round(topB / (topCount || 1))})`;
      const mColor = `rgb(${Math.round(midR / (midCount || 1))}, ${Math.round(midG / (midCount || 1))}, ${Math.round(midB / (midCount || 1))})`;
      const bColor = `rgb(${Math.round(botR / (botCount || 1))}, ${Math.round(botG / (botCount || 1))}, ${Math.round(botB / (botCount || 1))})`;

      const grad = this.ctx.createLinearGradient(0, 0, 0, cH);
      grad.addColorStop(0, tColor);
      grad.addColorStop(0.5, mColor);
      grad.addColorStop(1, bColor);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, cW, cH);
    } else if (this.config.bgMode === 'color') {
      this.ctx.fillStyle = this.config.bgColor || '#000000';
      this.ctx.fillRect(0, 0, cW, cH);
    } else {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, cW, cH);
    }

    const fontFamily = FONT_FAMILIES[this.config.font] || FONT_FAMILIES.jetbrains;
    this.ctx.font = `700 ${fontSizePx}px ${fontFamily}`;
    this.ctx.textBaseline = 'top';

    const numChars = this.cachedChars.length;
    const fx = this.config.fx || 'none';
    const sat = this.config.saturation !== undefined ? this.config.saturation : 1.4;
    const con = this.config.contrast !== undefined ? this.config.contrast : 1.2;
    const bri = this.config.brightness !== undefined ? this.config.brightness : 1.0;
    const invert = this.config.invert;
    const smooth = this.config.smoothing || 0;
    const tR = this.config.tintR !== undefined ? this.config.tintR : 1.0;
    const tG = this.config.tintG !== undefined ? this.config.tintG : 1.0;
    const tB = this.config.tintB !== undefined ? this.config.tintB : 1.0;
    const hueDeg = this.config.hue || 0;
    const temp = this.config.temperature || 0;

    let pIdx = 0;
    for (let r = 0; r < rows; r++) {
      const y = r * charH;
      for (let c = 0; c < cols; c++) {
        let red = pixels[pIdx];
        let grn = pixels[pIdx + 1];
        let blu = pixels[pIdx + 2];

        // Lissage / Smoothing
        if (smooth > 0 && c > 0) {
          const prevIdx = pIdx - 4;
          red = red * (1 - smooth * 0.45) + pixels[prevIdx] * (smooth * 0.45);
          grn = grn * (1 - smooth * 0.45) + pixels[prevIdx + 1] * (smooth * 0.45);
          blu = blu * (1 - smooth * 0.45) + pixels[prevIdx + 2] * (smooth * 0.45);
        }

        pIdx += 4;

        // RGB Channel Multipliers
        if (tR !== 1.0) red *= tR;
        if (tG !== 1.0) grn *= tG;
        if (tB !== 1.0) blu *= tB;

        // Color Temperature
        if (temp !== 0) {
          red += temp * 0.4;
          blu -= temp * 0.4;
        }

        // Brightness
        if (bri !== 1.0) {
          red *= bri;
          grn *= bri;
          blu *= bri;
        }

        // Contrast
        if (con !== 1.0) {
          red = (red - 128) * con + 128;
          grn = (grn - 128) * con + 128;
          blu = (blu - 128) * con + 128;
        }

        // Saturation
        if (sat !== 1.0) {
          const luma = 0.299 * red + 0.587 * grn + 0.114 * blu;
          red = luma + (red - luma) * sat;
          grn = luma + (grn - luma) * sat;
          blu = luma + (blu - luma) * sat;
        }

        // Hue Rotate
        if (hueDeg !== 0) {
          const angle = (hueDeg * Math.PI) / 180;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const rH = red * (0.213 + cosA * 0.787 - sinA * 0.213) + grn * (0.715 - cosA * 0.715 - sinA * 0.715) + blu * (0.072 - cosA * 0.072 + sinA * 0.928);
          const gH = red * (0.213 - cosA * 0.213 + sinA * 0.143) + grn * (0.715 + cosA * 0.285 + sinA * 0.140) + blu * (0.072 - cosA * 0.072 - sinA * 0.283);
          const bH = red * (0.213 - cosA * 0.213 - sinA * 0.787) + grn * (0.715 - cosA * 0.715 + sinA * 0.715) + blu * (0.072 + cosA * 0.928 + sinA * 0.072);
          red = rH; grn = gH; blu = bH;
        }

        red = Math.min(255, Math.max(0, red));
        grn = Math.min(255, Math.max(0, grn));
        blu = Math.min(255, Math.max(0, blu));

        let lum = 0.299 * red + 0.587 * grn + 0.114 * blu;
        if (invert) lum = 255 - lum;

        const charIndex = Math.min(numChars - 1, Math.floor((lum / 256) * numChars));
        const char = this.cachedChars[charIndex];

        if (char === ' ') continue;

        // 22 Filters Engine
        if (fx === 'matrix') {
          this.ctx.fillStyle = `rgb(15, ${Math.min(255, Math.round(lum * 0.95 + 40))}, 35)`;
        } else if (fx === 'amber') {
          const intensity = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.round(255 * intensity)}, ${Math.round(175 * intensity)}, 0)`;
        } else if (fx === 'cyberpunk') {
          const ratio = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.round(ratio * 255)}, ${Math.round((1 - ratio) * 220)}, 255)`;
        } else if (fx === 'crt') {
          const crtVal = Math.min(255, Math.round(lum * 1.05 + 20));
          this.ctx.fillStyle = `rgb(${Math.round(crtVal * 0.2)}, ${crtVal}, ${Math.round(crtVal * 0.3)})`;
        } else if (fx === 'pure_bw') {
          const val = Math.round(lum);
          this.ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        } else if (fx === 'sepia') {
          this.ctx.fillStyle = `rgb(${Math.min(255, Math.round(lum * 1.12))}, ${Math.min(255, Math.round(lum * 0.88))}, ${Math.round(lum * 0.62)})`;
        } else if (fx === 'invert') {
          this.ctx.fillStyle = `rgb(${255 - Math.round(red)}, ${255 - Math.round(grn)}, ${255 - Math.round(blu)})`;
        } else if (fx === 'neon_blue') {
          const ratio = lum / 255;
          this.ctx.fillStyle = `rgb(0, ${Math.round(ratio * 240 + 15)}, ${Math.min(255, Math.round(ratio * 255 + 50))})`;
        } else if (fx === 'neon_pink') {
          const ratio = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.min(255, Math.round(ratio * 255 + 60))}, 0, ${Math.round(ratio * 160 + 50)})`;
        } else if (fx === 'pastel') {
          const rP = Math.min(255, Math.round(red * 0.65 + 90));
          const gP = Math.min(255, Math.round(grn * 0.65 + 90));
          const bP = Math.min(255, Math.round(blu * 0.65 + 90));
          this.ctx.fillStyle = `rgb(${rP}, ${gP}, ${bP})`;
        } else if (fx === 'popart') {
          if (lum < 64) this.ctx.fillStyle = '#110033';
          else if (lum < 128) this.ctx.fillStyle = '#ff0055';
          else if (lum < 192) this.ctx.fillStyle = '#00e5ff';
          else this.ctx.fillStyle = '#ffe600';
        } else if (fx === 'gameboy') {
          if (lum < 64) this.ctx.fillStyle = '#0f380f';
          else if (lum < 128) this.ctx.fillStyle = '#306230';
          else if (lum < 192) this.ctx.fillStyle = '#8bac0f';
          else this.ctx.fillStyle = '#9bbc0f';
        } else if (fx === 'manga') {
          const ink = lum > 118 ? 255 : 0;
          this.ctx.fillStyle = `rgb(${ink}, ${ink}, ${ink})`;
        } else if (fx === 'minimal') {
          const minVal = Math.round(Math.pow(lum / 255, 1.4) * 230 + 25);
          this.ctx.fillStyle = `rgb(${minVal}, ${minVal}, ${minVal})`;
        } else if (fx === 'hyper_contrast') {
          const hypVal = lum < 128 ? Math.max(0, (lum - 60) * 1.6) : Math.min(255, 128 + (lum - 128) * 1.8);
          this.ctx.fillStyle = `rgb(${Math.round(hypVal)}, ${Math.round(hypVal)}, ${Math.round(hypVal)})`;
        } else if (fx === 'aqua') {
          const aRatio = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.round(aRatio * 40)}, ${Math.round(aRatio * 210 + 45)}, ${Math.min(255, Math.round(aRatio * 255 + 60))})`;
        } else if (fx === 'sunset') {
          const sRatio = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.min(255, Math.round(sRatio * 255 + 80))}, ${Math.round(sRatio * 130)}, ${Math.round((1 - sRatio) * 180 + 30)})`;
        } else if (fx === 'forest') {
          const fRatio = lum / 255;
          this.ctx.fillStyle = `rgb(${Math.round(fRatio * 45)}, ${Math.min(255, Math.round(fRatio * 220 + 35))}, ${Math.round(fRatio * 65)})`;
        } else if (fx === 'xray') {
          const xVal = 255 - lum;
          this.ctx.fillStyle = `rgb(${Math.round(xVal * 0.4)}, ${Math.round(xVal * 0.75 + 30)}, ${Math.min(255, Math.round(xVal * 1.1 + 40))})`;
        } else if (fx === 'glitch') {
          const rG = Math.min(255, Math.round(red * 1.35));
          const bG = Math.min(255, Math.round(blu * 1.45));
          this.ctx.fillStyle = `rgb(${rG}, ${Math.round(grn * 0.65)}, ${bG})`;
        } else if (fx === 'thermal') {
          const t = lum / 255;
          let rT = 0, gT = 0, bT = 0;
          if (t < 0.25) { rT = 0; gT = Math.round(t * 4 * 255); bT = 255; }
          else if (t < 0.5) { rT = 0; gT = 255; bT = Math.round((1 - (t - 0.25) * 4) * 255); }
          else if (t < 0.75) { rT = Math.round((t - 0.5) * 4 * 255); gT = 255; bT = 0; }
          else { rT = 255; gT = Math.round((1 - (t - 0.75) * 4) * 255); bT = 0; }
          this.ctx.fillStyle = `rgb(${rT}, ${gT}, ${bT})`;
        } else {
          this.ctx.fillStyle = `rgb(${Math.round(red)}, ${Math.round(grn)}, ${Math.round(blu)})`;
        }

        const x = c * charW;
        this.ctx.fillText(char, x, y);
      }
    }

    // CRT Scanlines Overlay
    if (this.config.scanlines || fx === 'crt') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      for (let y = 0; y < cH; y += Math.round(4 * dpr)) {
        this.ctx.fillRect(0, y, cW, Math.round(1.5 * dpr));
      }
    }

    if (this.config.geoTagEnabled && this.config.geoCoordinates) {
      this.renderGeoTag(dpr, cW, cH);
    }
  }

  renderGeoTag(dpr, width, height) {
    const coords = this.config.geoCoordinates;
    if (!coords) return;
    const text = `GPS ${coords.lat.toFixed(4)}N, ${coords.lng.toFixed(4)}E`;
    const fSize = Math.round(10 * dpr);
    this.ctx.font = `600 ${fSize}px 'JetBrains Mono', monospace`;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillText(text, 14 * dpr, height - 16 * dpr);
  }

  exportImagePNG() {
    return this.canvas.toDataURL('image/png', 1.0);
  }

  exportRawText() {
    if (!this.sampleCanvas || this.sampleCanvas.width === 0) return '';
    const cols = this.sampleCanvas.width;
    const rows = this.sampleCanvas.height;
    let imgData;
    try {
      imgData = this.sampleCtx.getImageData(0, 0, cols, rows);
    } catch (e) {
      return '';
    }

    const pixels = imgData.data;
    const numChars = this.cachedChars.length;
    let result = '';

    let pIdx = 0;
    for (let r = 0; r < rows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        const red = pixels[pIdx];
        const grn = pixels[pIdx + 1];
        const blu = pixels[pIdx + 2];
        pIdx += 4;
        const lum = 0.299 * red + 0.587 * grn + 0.114 * blu;
        const charIndex = Math.min(numChars - 1, Math.floor((lum / 256) * numChars));
        line += this.cachedChars[charIndex];
      }
      result += line + '\n';
    }
    return result;
  }
}

window.AsciiEngine = AsciiEngine;
