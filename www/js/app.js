/**
 * app.js - Main Application Controller for ASCII Camera Pro
 * Features:
 * - 22 Calibrated Filters
 * - 10 Monospace Font Families & Dynamic Size Slider (5px - 24px)
 * - Background Control: Noir, Couleurs, Dégradé Auto 9x12 Points
 * - Responsive Pictogram Subtabs
 * - Zero Emojis
 * - Update Checker (version.html)
 * - Android App Download Banner
 * - Compact Social Icon Grid
 */

const CURRENT_APP_VERSION = '1.2.0';

document.addEventListener('DOMContentLoaded', async () => {
  const storage = window.appStorage;
  const i18n = window.i18n;
  const sound = window.soundController;
  const gallery = window.galleryStore;

  const settings = storage.load();
  i18n.init(settings.language || 'fr');

  // OLED Theme
  document.body.classList.remove('theme-light', 'theme-cyber', 'theme-matrix', 'theme-amber', 'theme-nordic', 'theme-sunset');
  document.body.classList.add('theme-oled');
  settings.theme = 'oled';
  storage.save(settings);

  // Sound preference
  sound.setMuted(!settings.soundEnabled);

  // DOM Elements
  const videoFeed = document.getElementById('video-feed');
  const asciiCanvas = document.getElementById('ascii-canvas');
  const shutterFlash = document.getElementById('shutter-flash');
  const fileInput = document.getElementById('hidden-file-input');
  const imageModeBanner = document.getElementById('image-mode-banner');
  const gifProgressOverlay = document.getElementById('gif-progress-overlay');
  const gifProgressText = document.getElementById('gif-progress-text');
  const mobileAppBanner = document.getElementById('mobile-app-banner');
  const btnCloseAppBanner = document.getElementById('btn-close-app-banner');

  // Quick Control and Subtabs
  const quickControlContent = document.getElementById('quick-control-content');
  const adjustSubtabsRow = document.getElementById('adjust-subtabs-row');

  // Carousel Modes
  const carouselPhoto = document.getElementById('carousel-mode-photo');
  const carouselVideo = document.getElementById('carousel-mode-video');
  const carouselGif = document.getElementById('carousel-mode-gif');
  const carouselSettings = document.getElementById('carousel-mode-settings');

  // Shutter Line Controls
  const btnShutter = document.getElementById('btn-shutter');
  const btnSwitchCamera = document.getElementById('btn-switch-camera');
  const btnOpenGallery = document.getElementById('btn-open-gallery');
  const galleryThumbPreview = document.getElementById('gallery-thumb-preview');
  const recordingPill = document.getElementById('recording-pill');
  const recordingTimer = document.getElementById('recording-timer');

  // Settings Modal Elements
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const toggleSoundSettings = document.getElementById('toggle-sound-settings');
  const fpsGroup = document.getElementById('fps-group');
  const rotGroup = document.getElementById('rot-group');
  const toggleMirror = document.getElementById('toggle-mirror');
  const toggleAudioMic = document.getElementById('toggle-audio-mic');
  const toggleGpsWatermark = document.getElementById('toggle-gps-watermark');
  const btnResetAll = document.getElementById('btn-reset-all');

  // Gallery Modal Elements
  const modalGallery = document.getElementById('modal-gallery');
  const btnCloseGallery = document.getElementById('btn-close-gallery');
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryEmptyState = document.getElementById('gallery-empty-state');
  const btnImportGalleryImage = document.getElementById('btn-import-gallery-image');

  // Detail Modal Elements
  const modalDetail = document.getElementById('modal-detail');
  const detailImg = document.getElementById('detail-img');
  const qrDisplayBox = document.getElementById('qr-display-box');
  const qrCanvas = document.getElementById('qr-canvas');
  const btnExportPng = document.getElementById('btn-export-png');
  const btnExportJpeg = document.getElementById('btn-export-jpeg');
  const btnExportTxt = document.getElementById('btn-export-txt');
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const btnExportQr = document.getElementById('btn-export-qr');
  const btnDeletePhoto = document.getElementById('btn-delete-photo');
  const btnCloseDetail = document.getElementById('btn-close-detail');
  const btnCloseDetailHeader = document.getElementById('btn-close-detail-header');

  // Metadata Display
  const metaDate = document.getElementById('meta-date');
  const metaTime = document.getElementById('meta-time');
  const metaRes = document.getElementById('meta-res');
  const metaFps = document.getElementById('meta-fps');
  const metaMode = document.getElementById('meta-mode');
  const metaFont = document.getElementById('meta-font');
  const metaGps = document.getElementById('meta-gps');
  const metaCam = document.getElementById('meta-cam');

  // Onboarding Elements
  const onboardingContainer = document.getElementById('onboarding-container');
  const btnOnboardLangNext = document.getElementById('btn-onboard-lang-next');
  const btnPermCam = document.getElementById('btn-perm-cam');
  const btnSkipCam = document.getElementById('btn-skip-cam');
  const btnPermMic = document.getElementById('btn-perm-mic');
  const btnSkipMic = document.getElementById('btn-skip-mic');
  const btnPermGeo = document.getElementById('btn-perm-geo');
  const btnFinishOnboard = document.getElementById('btn-finish-onboard');

  // Toast System
  const toastNotice = document.getElementById('toast-notice');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastNotice || !toastText) return;
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toastNotice.classList.add('active');
    toastTimer = setTimeout(() => toastNotice.classList.remove('active'), 2500);
  }

  // 1. Initialize Engines
  const camera = new CameraManager(videoFeed);
  const asciiEngine = new AsciiEngine(asciiCanvas);
  const recorder = new VideoRecorder(asciiCanvas, camera);

  asciiEngine.setConfig({
    fx: settings.fx || 'none',
    charset: settings.charset || 'dense',
    customCharset: settings.customCharset || '@%#*+=-:. ',
    font: settings.font || 'jetbrains',
    fontSize: settings.fontSize || 9,
    smoothing: settings.smoothing !== undefined ? settings.smoothing : 0.2,
    saturation: settings.saturation !== undefined ? settings.saturation : 1.4,
    contrast: settings.contrast !== undefined ? settings.contrast : 1.2,
    brightness: settings.brightness !== undefined ? settings.brightness : 1.0,
    hue: settings.hue || 0,
    temperature: settings.temperature || 0,
    invert: settings.invert || false,
    scanlines: settings.scanlines || false,
    bgMode: settings.bgMode || 'black',
    bgColor: settings.bgColor || '#000000',
    tintR: settings.tintR !== undefined ? settings.tintR : 1.0,
    tintG: settings.tintG !== undefined ? settings.tintG : 1.0,
    tintB: settings.tintB !== undefined ? settings.tintB : 1.0,
    rotation: settings.rotation || 0,
    mirror: settings.mirror || false,
    geoTagEnabled: settings.geoTagEnabled || false
  });
  asciiEngine.setTargetFps(settings.fps || 10);

  let currentMode = settings.mode || 'photo';
  let activeSelectedPhoto = null;
  let isViewingImportedImage = false;
  let activeSubtab = 'effects';

  // 2. 22 Filters Definition
  const ALL_EFFECTS = [
    { id: 'none', label: 'Standard' },
    { id: 'matrix', label: 'Matrice' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'amber', label: 'Ambre' },
    { id: 'crt', label: 'Rétro CRT' },
    { id: 'pure_bw', label: 'Noir & Blanc' },
    { id: 'sepia', label: 'Sépia' },
    { id: 'invert', label: 'Négatif' },
    { id: 'neon_blue', label: 'Néon Bleu' },
    { id: 'neon_pink', label: 'Néon Rose' },
    { id: 'pastel', label: 'Pastels' },
    { id: 'popart', label: 'Pop Art' },
    { id: 'gameboy', label: 'Game Boy' },
    { id: 'manga', label: 'Manga' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'hyper_contrast', label: 'Hyper Contraste' },
    { id: 'aqua', label: 'Ciel & Mer' },
    { id: 'sunset', label: 'Coucher Soleil' },
    { id: 'forest', label: 'Forêt' },
    { id: 'xray', label: 'Radiographie' },
    { id: 'glitch', label: 'Glitch' },
    { id: 'thermal', label: 'Thermique' }
  ];

  // 10 Monospace Font Families
  const ALL_FONTS = [
    { id: 'jetbrains', label: 'JetBrains' },
    { id: 'vt323', label: 'Terminal VT' },
    { id: 'pixel', label: '8-Bit Pixel' },
    { id: 'space', label: 'Space Mono' },
    { id: 'fira', label: 'Fira Code' },
    { id: 'roboto', label: 'Roboto Mono' },
    { id: 'source', label: 'Source Code' },
    { id: 'tech', label: 'Tech Mono' },
    { id: 'courier', label: 'Courier New' },
    { id: 'system', label: 'Monospace' }
  ];

  // Mouse Drag Scrolling Helper (allows interacting with inputs without blocking)
  function enableDragScroll(container) {
    if (!container) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      // Never block dragging or clicking on range sliders, color pickers, or inputs
      if (e.target.closest('input') || e.target.closest('select')) {
        return;
      }
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => { isDown = false; });
    container.addEventListener('mouseup', () => { isDown = false; });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        container.scrollLeft += e.deltaY;
      }
    }, { passive: true });
  }

  enableDragScroll(adjustSubtabsRow);

  // 3. Render Quick Control Bar
  function renderSubtabContent(subtab) {
    if (!quickControlContent) return;
    activeSubtab = subtab;

    if (adjustSubtabsRow) {
      adjustSubtabsRow.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
      });
    }

    if (subtab === 'effects') {
      let html = '<div class="filters-strip" id="filters-strip-container">';
      ALL_EFFECTS.forEach(fx => {
        const isActive = (settings.fx || 'none') === fx.id;
        html += `<button class="filter-btn ${isActive ? 'active' : ''}" data-fx-id="${fx.id}">${fx.label}</button>`;
      });
      html += '</div>';
      quickControlContent.innerHTML = html;

      const strip = document.getElementById('filters-strip-container');
      enableDragScroll(strip);

      quickControlContent.querySelectorAll('[data-fx-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const fxId = btn.getAttribute('data-fx-id');
          settings.fx = fxId;
          asciiEngine.setConfig({ fx: fxId });
          storage.save(settings);
          quickControlContent.querySelectorAll('[data-fx-id]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }
    else if (subtab === 'background') {
      const isBlack = (settings.bgMode || 'black') === 'black';
      const isGrad = (settings.bgMode || 'black') === 'adaptive_gradient';
      const isColor = (settings.bgMode || 'black') === 'color';

      let html = '<div class="filters-strip" id="bg-strip-container">';
      html += `<button class="filter-btn ${isBlack ? 'active' : ''}" data-bg-mode="black">Noir Pur</button>`;
      html += `<button class="filter-btn ${isGrad ? 'active' : ''}" data-bg-mode="adaptive_gradient">Dégradé Caméra</button>`;
      
      const PRESET_BG_COLORS = [
        { c: '#ffffff', label: 'Blanc' },
        { c: '#08081a', label: 'Nuit' },
        { c: '#1c0724', label: 'Violet' },
        { c: '#061c16', label: 'Émeraude' },
        { c: '#240808', label: 'Bordeaux' },
        { c: '#121624', label: 'Bleu' },
        { c: '#161616', label: 'Gris' }
      ];

      PRESET_BG_COLORS.forEach(item => {
        const isSelected = isColor && settings.bgColor === item.c;
        html += `<button class="filter-btn ${isSelected ? 'active' : ''}" data-bg-color="${item.c}">${item.label}</button>`;
      });

      html += `
        <div style="display: flex; align-items: center; gap: 4px; margin-left: 6px; flex-shrink: 0;">
          <input type="color" id="dyn-bg-custom-color" value="${settings.bgColor || '#000000'}" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border-glass); background: transparent; cursor: pointer;">
        </div>
      </div>`;
      quickControlContent.innerHTML = html;

      const bgStrip = document.getElementById('bg-strip-container');
      enableDragScroll(bgStrip);

      quickControlContent.querySelectorAll('[data-bg-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-bg-mode');
          settings.bgMode = mode;
          asciiEngine.setConfig({ bgMode: mode });
          storage.save(settings);
          renderSubtabContent('background');
        });
      });

      quickControlContent.querySelectorAll('[data-bg-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          const col = btn.getAttribute('data-bg-color');
          settings.bgMode = 'color';
          settings.bgColor = col;
          asciiEngine.setConfig({ bgMode: 'color', bgColor: col });
          storage.save(settings);
          renderSubtabContent('background');
        });
      });

      const colorPicker = document.getElementById('dyn-bg-custom-color');
      if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
          const col = e.target.value;
          settings.bgMode = 'color';
          settings.bgColor = col;
          asciiEngine.setConfig({ bgMode: 'color', bgColor: col });
          storage.save(settings);
        });
      }
    }
    else if (subtab === 'saturation') {
      quickControlContent.innerHTML = `
        <div class="single-slider-box">
          <span class="slider-label">Saturation</span>
          <input type="range" class="flat-slider" id="dyn-saturation" min="0.0" max="3.0" step="0.1" value="${settings.saturation}">
          <span class="slider-badge" id="dyn-sat-badge">${parseFloat(settings.saturation).toFixed(1)}x</span>
        </div>
      `;
      const slider = document.getElementById('dyn-saturation');
      const badge = document.getElementById('dyn-sat-badge');
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badge.textContent = `${val.toFixed(1)}x`;
        settings.saturation = val;
        asciiEngine.setConfig({ saturation: val });
        storage.save(settings);
      });
    }
    else if (subtab === 'smoothing') {
      quickControlContent.innerHTML = `
        <div class="single-slider-box">
          <span class="slider-label">Lissage</span>
          <input type="range" class="flat-slider" id="dyn-smoothing" min="0.0" max="1.0" step="0.05" value="${settings.smoothing}">
          <span class="slider-badge" id="dyn-smooth-badge">${Math.round(settings.smoothing * 100)}%</span>
          <button class="filter-btn ${settings.scanlines ? 'active' : ''}" id="dyn-scanlines" style="margin-left: 6px;">Scanlines</button>
        </div>
      `;
      const slider = document.getElementById('dyn-smoothing');
      const badge = document.getElementById('dyn-smooth-badge');
      const scanBtn = document.getElementById('dyn-scanlines');

      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badge.textContent = `${Math.round(val * 100)}%`;
        settings.smoothing = val;
        asciiEngine.setConfig({ smoothing: val });
        storage.save(settings);
      });

      scanBtn.addEventListener('click', () => {
        settings.scanlines = !settings.scanlines;
        asciiEngine.setConfig({ scanlines: settings.scanlines });
        scanBtn.classList.toggle('active', settings.scanlines);
        storage.save(settings);
      });
    }
    else if (subtab === 'brightness') {
      quickControlContent.innerHTML = `
        <div class="single-slider-box">
          <span class="slider-label">Exposition</span>
          <input type="range" class="flat-slider" id="dyn-brightness" min="0.2" max="2.5" step="0.05" value="${settings.brightness}">
          <span class="slider-badge" id="dyn-bri-badge">${parseFloat(settings.brightness).toFixed(2)}x</span>
        </div>
      `;
      const slider = document.getElementById('dyn-brightness');
      const badge = document.getElementById('dyn-bri-badge');
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badge.textContent = `${val.toFixed(2)}x`;
        settings.brightness = val;
        asciiEngine.setConfig({ brightness: val });
        storage.save(settings);
      });
    }
    else if (subtab === 'contrast') {
      quickControlContent.innerHTML = `
        <div class="single-slider-box">
          <span class="slider-label">Contraste</span>
          <input type="range" class="flat-slider" id="dyn-contrast" min="0.2" max="3.0" step="0.1" value="${settings.contrast}">
          <span class="slider-badge" id="dyn-con-badge">${parseFloat(settings.contrast).toFixed(1)}x</span>
          <button class="filter-btn ${settings.invert ? 'active' : ''}" id="dyn-invert" style="margin-left: 6px;">Inverser</button>
        </div>
      `;
      const slider = document.getElementById('dyn-contrast');
      const badge = document.getElementById('dyn-con-badge');
      const invBtn = document.getElementById('dyn-invert');

      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badge.textContent = `${val.toFixed(1)}x`;
        settings.contrast = val;
        asciiEngine.setConfig({ contrast: val });
        storage.save(settings);
      });

      invBtn.addEventListener('click', () => {
        settings.invert = !settings.invert;
        asciiEngine.setConfig({ invert: settings.invert });
        invBtn.classList.toggle('active', settings.invert);
        storage.save(settings);
      });
    }
    else if (subtab === 'hue') {
      quickControlContent.innerHTML = `
        <div class="single-slider-box">
          <span class="slider-label">Teinte</span>
          <input type="range" class="flat-slider" id="dyn-hue" min="0" max="360" step="5" value="${settings.hue || 0}">
          <span class="slider-badge" id="dyn-hue-badge">${settings.hue || 0}°</span>
        </div>
      `;
      const slider = document.getElementById('dyn-hue');
      const badge = document.getElementById('dyn-hue-badge');
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        badge.textContent = `${val}°`;
        settings.hue = val;
        asciiEngine.setConfig({ hue: val });
        storage.save(settings);
      });
    }
    else if (subtab === 'rgb') {
      quickControlContent.innerHTML = `
        <div style="display: flex; gap: 8px; width: 100%; align-items: center;">
          <div style="flex: 1; display: flex; align-items: center; gap: 4px;">
            <span style="color: #ff5252; font-weight: 800; font-size: 11px;">R</span>
            <input type="range" class="flat-slider" id="dyn-tint-r" min="0.0" max="2.5" step="0.05" value="${settings.tintR}">
            <span class="slider-badge" id="dyn-r-badge" style="min-width: 26px; font-size: 10px;">${parseFloat(settings.tintR).toFixed(1)}</span>
          </div>
          <div style="flex: 1; display: flex; align-items: center; gap: 4px;">
            <span style="color: #4caf50; font-weight: 800; font-size: 11px;">V</span>
            <input type="range" class="flat-slider" id="dyn-tint-g" min="0.0" max="2.5" step="0.05" value="${settings.tintG}">
            <span class="slider-badge" id="dyn-g-badge" style="min-width: 26px; font-size: 10px;">${parseFloat(settings.tintG).toFixed(1)}</span>
          </div>
          <div style="flex: 1; display: flex; align-items: center; gap: 4px;">
            <span style="color: #448aff; font-weight: 800; font-size: 11px;">B</span>
            <input type="range" class="flat-slider" id="dyn-tint-b" min="0.0" max="2.5" step="0.05" value="${settings.tintB}">
            <span class="slider-badge" id="dyn-b-badge" style="min-width: 26px; font-size: 10px;">${parseFloat(settings.tintB).toFixed(1)}</span>
          </div>
        </div>
      `;
      const sliderR = document.getElementById('dyn-tint-r');
      const badgeR = document.getElementById('dyn-r-badge');
      const sliderG = document.getElementById('dyn-tint-g');
      const badgeG = document.getElementById('dyn-g-badge');
      const sliderB = document.getElementById('dyn-tint-b');
      const badgeB = document.getElementById('dyn-b-badge');

      sliderR.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badgeR.textContent = val.toFixed(1);
        settings.tintR = val;
        asciiEngine.setConfig({ tintR: val });
        storage.save(settings);
      });
      sliderG.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badgeG.textContent = val.toFixed(1);
        settings.tintG = val;
        asciiEngine.setConfig({ tintG: val });
        storage.save(settings);
      });
      sliderB.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        badgeB.textContent = val.toFixed(1);
        settings.tintB = val;
        asciiEngine.setConfig({ tintB: val });
        storage.save(settings);
      });
    }
    else if (subtab === 'font') {
      let html = '<div class="filters-strip" id="font-strip-container">';
      ALL_FONTS.forEach(f => {
        const isF = (settings.font || 'jetbrains') === f.id;
        html += `<button class="filter-btn font-pick-btn ${isF ? 'active' : ''}" data-font-id="${f.id}">${f.label}</button>`;
      });
      html += `
        <div style="display: flex; align-items: center; gap: 6px; margin-left: 8px; flex-shrink: 0;">
          <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Taille</span>
          <input type="range" class="flat-slider" id="dyn-font-size" min="5" max="24" step="1" value="${settings.fontSize || 9}" style="width: 85px;">
          <span class="slider-badge" id="dyn-font-badge" style="min-width: 32px;">${settings.fontSize || 9}px</span>
        </div>
      </div>`;
      quickControlContent.innerHTML = html;

      const fStrip = document.getElementById('font-strip-container');
      enableDragScroll(fStrip);

      quickControlContent.querySelectorAll('[data-font-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const fid = btn.getAttribute('data-font-id');
          settings.font = fid;
          asciiEngine.setConfig({ font: fid });
          storage.save(settings);
          quickControlContent.querySelectorAll('[data-font-id]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      const sizeSlider = document.getElementById('dyn-font-size');
      const sizeBadge = document.getElementById('dyn-font-badge');
      if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          if (sizeBadge) sizeBadge.textContent = `${val}px`;
          settings.fontSize = val;
          asciiEngine.setConfig({ fontSize: val });
          storage.save(settings);
        });
      }
    }
  }

  // Bind subtab buttons
  if (adjustSubtabsRow) {
    adjustSubtabsRow.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const st = btn.getAttribute('data-subtab');
        renderSubtabContent(st);
      });
    });
  }

  renderSubtabContent('effects');

  // 4. Mobile Android App Banner Logic (Web only, NEVER inside native Android/Electron app)
  const isCapacitorNative = (typeof window.Capacitor !== 'undefined' && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) || window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
  const isElectronApp = !!window.isNativeElectronApp || /electron/i.test(navigator.userAgent);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || isCapacitorNative || isElectronApp;
  const isBannerDismissed = sessionStorage.getItem('dismiss_app_banner');

  if (isMobile && !isStandalone && !isCapacitorNative && !isElectronApp && !isBannerDismissed && mobileAppBanner) {
    mobileAppBanner.classList.add('active');
  }

  if (btnCloseAppBanner) {
    btnCloseAppBanner.addEventListener('click', () => {
      mobileAppBanner.classList.remove('active');
      sessionStorage.setItem('dismiss_app_banner', 'true');
    });
  }

  // Handle external link clicks across Web, Electron, and Capacitor
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:'))) {
      if (isCapacitorNative) {
        e.preventDefault();
        window.open(href, '_system');
      }
    }
  });

  // 5. Update Checker (checks version.html)
  async function checkForAppUpdates() {
    try {
      const resp = await fetch('version.html?t=' + Date.now(), { cache: 'no-store' });
      if (resp.ok) {
        const remoteVersion = (await resp.text()).trim();
        if (remoteVersion && remoteVersion !== CURRENT_APP_VERSION) {
          showToast(`Mise à jour disponible : v${remoteVersion} !`);
        }
      }
    } catch (e) {}
  }
  checkForAppUpdates();

  // 6. Camera Launch
  async function launchCamera() {
    isViewingImportedImage = false;
    imageModeBanner.classList.remove('active');
    try {
      await camera.startCamera(camera.activeDeviceId, settings.audioEnabled);
      asciiEngine.setSource(videoFeed, false);
      asciiEngine.start();
      if (camera.geoCoordinates) {
        asciiEngine.setConfig({ geoCoordinates: camera.geoCoordinates });
      }
    } catch (e) {
      console.warn('Camera launch error:', e);
    }
  }

  imageModeBanner.addEventListener('click', async () => {
    await launchCamera();
    showToast(i18n.t('toastCameraResumed'));
  });

  // 7. Carousel Modes (PHOTO | VIDÉO | GIF | PARAMÈTRES)
  function switchCameraMode(mode) {
    if (mode === 'settings') {
      modalSettings.classList.add('active');
      syncSettingsModal();
      return;
    }

    currentMode = mode;
    settings.mode = mode;
    storage.save(settings);

    [carouselPhoto, carouselVideo, carouselGif].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (mode === 'photo' && carouselPhoto) carouselPhoto.classList.add('active');
    if (mode === 'video' && carouselVideo) carouselVideo.classList.add('active');
    if (mode === 'gif' && carouselGif) carouselGif.classList.add('active');

    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.classList.remove('mode-photo', 'mode-video', 'mode-gif');
      appEl.classList.add(`mode-${mode}`);
    }

    if (isViewingImportedImage) {
      launchCamera();
    }

    if (mode === 'photo' || mode === 'gif') {
      asciiEngine.setTargetFps(settings.fps || 10);
    } else if (mode === 'video') {
      asciiEngine.setTargetFps(15);
    }
  }

  if (carouselPhoto) carouselPhoto.addEventListener('click', () => switchCameraMode('photo'));
  if (carouselVideo) carouselVideo.addEventListener('click', () => switchCameraMode('video'));
  if (carouselGif) carouselGif.addEventListener('click', () => switchCameraMode('gif'));
  if (carouselSettings) carouselSettings.addEventListener('click', () => switchCameraMode('settings'));

  // 8. Shutter Button Trigger
  btnShutter.addEventListener('click', () => {
    if (currentMode === 'video') {
      handleVideoRecording();
    } else if (currentMode === 'gif') {
      handleGifRecording();
    } else {
      handlePhotoSnapshot();
    }
  });

  let screenFlashActive = false;
  const screenFlashOverlay = document.getElementById('screen-flash-overlay');

  // Photo Snapshot
  async function handlePhotoSnapshot() {
    const isFrontOrNoTorch = !camera.torchSupported || camera.facingMode === 'user';
    
    if (isFrontOrNoTorch && screenFlashActive && screenFlashOverlay) {
      // 2-second screen flash illumination for front camera
      screenFlashOverlay.classList.add('active');
      await new Promise(r => setTimeout(r, 1800));
    } else {
      shutterFlash.classList.add('flash');
      setTimeout(() => shutterFlash.classList.remove('flash'), 100);
    }

    sound.playPhotoShutter();

    const pngData = asciiEngine.exportImagePNG();
    const rawText = asciiEngine.exportRawText();
    const now = new Date();
    const filename = `ascii_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.png`;

    if (screenFlashOverlay) {
      setTimeout(() => screenFlashOverlay.classList.remove('active'), 200);
    }

    const photoRecord = {
      id: `photo_${now.getTime()}`,
      pngData: pngData,
      rawText: rawText,
      createdAt: now.toISOString(),
      metadata: {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        dimensions: `${asciiCanvas.width}x${asciiCanvas.height} px`,
        fps: settings.fps || 10,
        charset: settings.charset,
        font: settings.font,
        fx: settings.fx,
        gps: camera.geoCoordinates || null,
        cameraName: camera.getCurrentCameraLabel()
      }
    };

    await gallery.savePhoto(photoRecord);

    // Save to /Pictures/ASCII-Camera/ according to platform
    if (window.AndroidBridge && typeof window.AndroidBridge.savePhotoToGallery === 'function') {
      window.AndroidBridge.savePhotoToGallery(pngData, filename);
      showToast('Photo enregistrée dans Pictures/ASCII-Camera !');
    } else if (window.electronAPI && typeof window.electronAPI.savePhoto === 'function') {
      await window.electronAPI.savePhoto(pngData, filename);
      showToast('Photo enregistrée dans Images/ASCII-Camera !');
    } else {
      window.PhotoExporter.exportPNG(pngData, filename);
      showToast('Photo PNG téléchargée !');
    }

    if (galleryThumbPreview) {
      galleryThumbPreview.src = pngData;
      galleryThumbPreview.style.display = 'block';
    }
  }

  // Video Recording (25 FPS with audio + direct download)
  async function handleVideoRecording() {
    if (!recorder.isRecording) {
      btnShutter.classList.add('recording');
      recordingPill.classList.add('active');
      recordingTimer.textContent = '00:00';

      sound.playVideoSound(true);
      recorder.onTimerUpdate = (formatted) => { recordingTimer.textContent = formatted; };
      recorder.startRecording(settings.audioEnabled);
      showToast('Enregistrement vidéo lancé...');
    } else {
      btnShutter.classList.remove('recording');
      recordingPill.classList.remove('active');

      sound.playVideoSound(false);
      const result = await recorder.stopRecording();
      if (result && result.blob) {
        const ext = result.blob.type.includes('mp4') ? 'mp4' : 'webm';
        window.PhotoExporter.triggerDownload(result.blob, `ascii-video-${Date.now()}.${ext}`);
        showToast('Vidéo enregistrée et téléchargée !');
      }
    }
  }

  // Animated GIF Recording
  let isRecordingGif = false;
  async function handleGifRecording() {
    if (isRecordingGif) return;
    isRecordingGif = true;

    btnShutter.classList.add('recording');
    gifProgressOverlay.classList.add('active');
    gifProgressText.textContent = 'Capture des images...';

    const numFrames = 15;
    const intervalMs = 100;
    const gifEncoder = new window.SimpleGifEncoder(asciiCanvas.width, asciiCanvas.height, intervalMs);

    let frameCount = 0;
    const captureInterval = setInterval(() => {
      gifEncoder.addFrame(asciiCanvas);
      frameCount++;
      gifProgressText.textContent = `Capture ${frameCount} / ${numFrames}...`;

      if (frameCount >= numFrames) {
        clearInterval(captureInterval);
        gifProgressText.textContent = 'Compilation du GIF...';

        setTimeout(async () => {
          try {
            const gifBlob = gifEncoder.buildGifBlob();
            btnShutter.classList.remove('recording');
            gifProgressOverlay.classList.remove('active');
            isRecordingGif = false;

            if (gifBlob) {
              const gifUrl = URL.createObjectURL(gifBlob);
              const now = new Date();
              const photoRecord = {
                id: `gif_${now.getTime()}`,
                pngData: gifUrl,
                rawText: '[Animated GIF]',
                createdAt: now.toISOString(),
                metadata: {
                  date: now.toLocaleDateString(),
                  time: now.toLocaleTimeString(),
                  dimensions: '320xAUTO px',
                  fps: 10,
                  charset: settings.charset,
                  font: settings.font,
                  fx: settings.fx,
                  gps: camera.geoCoordinates || null,
                  cameraName: 'GIF Animation'
                }
              };

              await gallery.savePhoto(photoRecord);
              window.PhotoExporter.triggerDownload(gifBlob, `ascii-anim-${Date.now()}.gif`);
              showToast('GIF animé téléchargé !');

              if (galleryThumbPreview) {
                galleryThumbPreview.src = gifUrl;
                galleryThumbPreview.style.display = 'block';
              }
            }
          } catch (err) {
            console.error('GIF build error:', err);
            btnShutter.classList.remove('recording');
            gifProgressOverlay.classList.remove('active');
            isRecordingGif = false;
            showToast('Erreur génération GIF');
          }
        }, 80);
      }
    }, intervalMs);
  }

  // Camera Switcher
  btnSwitchCamera.addEventListener('click', async () => {
    if (isViewingImportedImage) {
      await launchCamera();
      return;
    }
    try {
      await camera.cycleNextCamera(settings.audioEnabled);
      asciiEngine.setSource(videoFeed, false);
      showToast(`${i18n.t('toastCamSwitched')}: ${camera.getCurrentCameraLabel()}`);
    } catch (e) {}
  });

  // 9. Settings Modal
  function syncSettingsModal() {
    fpsGroup.querySelectorAll('.segment-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-fps'), 10) === (settings.fps || 10));
    });

    rotGroup.querySelectorAll('.segment-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-rot'), 10) === (settings.rotation || 0));
    });

    toggleMirror.checked = !!settings.mirror;
    toggleAudioMic.checked = !!settings.audioEnabled;
    toggleGpsWatermark.checked = !!settings.geoTagEnabled;
    toggleSoundSettings.checked = !!settings.soundEnabled;
  }

  toggleSoundSettings.addEventListener('change', (e) => {
    settings.soundEnabled = e.target.checked;
    sound.setMuted(!settings.soundEnabled);
    storage.save(settings);
  });

  fpsGroup.querySelectorAll('.segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fps = parseInt(btn.getAttribute('data-fps'), 10);
      settings.fps = fps;
      asciiEngine.setTargetFps(fps);
      fpsGroup.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      storage.save(settings);
    });
  });

  rotGroup.querySelectorAll('.segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rot = parseInt(btn.getAttribute('data-rot'), 10);
      settings.rotation = rot;
      asciiEngine.setConfig({ rotation: rot });
      rotGroup.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      storage.save(settings);
    });
  });

  toggleMirror.addEventListener('change', (e) => {
    settings.mirror = e.target.checked;
    asciiEngine.setConfig({ mirror: settings.mirror });
    storage.save(settings);
  });

  toggleAudioMic.addEventListener('change', (e) => {
    settings.audioEnabled = e.target.checked;
    storage.save(settings);
  });

  toggleGpsWatermark.addEventListener('change', (e) => {
    settings.geoTagEnabled = e.target.checked;
    asciiEngine.setConfig({
      geoTagEnabled: settings.geoTagEnabled,
      geoCoordinates: camera.geoCoordinates
    });
    storage.save(settings);
  });

  btnResetAll.addEventListener('click', () => {
    storage.reset();
    const defaults = storage.load();
    Object.assign(settings, defaults);
    asciiEngine.setConfig(defaults);
    syncSettingsModal();
    renderSubtabContent(activeSubtab);
    showToast(i18n.t('toastSettingsSaved'));
  });

  btnCloseSettings.addEventListener('click', () => modalSettings.classList.remove('active'));

  // 10. Gallery System & Platform Redirection
  btnOpenGallery.addEventListener('click', () => {
    // 1. Android Native App: Open real device Gallery
    if (window.AndroidBridge && typeof window.AndroidBridge.openSystemGallery === 'function') {
      window.AndroidBridge.openSystemGallery();
      return;
    }
    // 2. Windows Desktop App: Open Pictures/Downloads Explorer folder
    if (window.electronAPI && typeof window.electronAPI.openGalleryFolder === 'function') {
      window.electronAPI.openGalleryFolder();
      return;
    }
    // 3. Web Browser: Open Web Gallery modal
    loadGalleryGrid();
    modalGallery.classList.add('active');
  });

  // 11. Viewfinder Flash / Torch Control
  const btnViewfinderTorch = document.getElementById('btn-viewfinder-torch');
  if (btnViewfinderTorch) {
    btnViewfinderTorch.addEventListener('click', async () => {
      const isFrontOrNoTorch = !camera.torchSupported || camera.facingMode === 'user';
      if (isFrontOrNoTorch) {
        screenFlashActive = !screenFlashActive;
        btnViewfinderTorch.classList.toggle('active', screenFlashActive);
        showToast(screenFlashActive ? 'Flash Écran Frontal activé (2s)' : 'Flash désactivé');
      } else {
        const ok = await camera.toggleTorch();
        if (ok) {
          btnViewfinderTorch.classList.toggle('active', camera.torchActive);
        } else {
          screenFlashActive = !screenFlashActive;
          btnViewfinderTorch.classList.toggle('active', screenFlashActive);
          showToast(screenFlashActive ? 'Flash Écran activé (2s)' : 'Flash désactivé');
        }
      }
    });
  }

  // 12. 2-Finger Pinch-to-Zoom Gesture (Zoom avec les doigts)
  let initialPinchDist = null;
  let initialPinchZoom = 1.0;
  let currentPinchZoom = 1.0;
  let zoomPillTimer = null;
  const zoomPillEl = document.getElementById('zoom-pill');
  const vfWrapperEl = document.getElementById('viewfinder-wrapper');

  function applyZoomLevel(newZoom) {
    currentPinchZoom = Math.max(1.0, Math.min(5.0, newZoom));
    asciiEngine.setConfig({ zoom: currentPinchZoom });
    camera.setHardwareZoom(currentPinchZoom);

    if (zoomPillEl) {
      zoomPillEl.textContent = `${currentPinchZoom.toFixed(1)}x`;
      zoomPillEl.classList.add('visible');
      if (zoomPillTimer) clearTimeout(zoomPillTimer);
      zoomPillTimer = setTimeout(() => {
        zoomPillEl.classList.remove('visible');
      }, 1400);
    }
  }

  if (vfWrapperEl) {
    vfWrapperEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchZoom = currentPinchZoom;
      }
    }, { passive: true });

    vfWrapperEl.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDist) {
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = curDist / initialPinchDist;
        applyZoomLevel(initialPinchZoom * scaleFactor);
      }
    }, { passive: true });

    vfWrapperEl.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        initialPinchDist = null;
      }
    }, { passive: true });
  }

  btnCloseGallery.addEventListener('click', () => modalGallery.classList.remove('active'));

  async function loadGalleryGrid() {
    const photos = await gallery.getAllPhotos();
    galleryGrid.innerHTML = '';

    if (!photos || photos.length === 0) {
      galleryGrid.appendChild(galleryEmptyState);
      return;
    }

    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      const img = document.createElement('img');
      img.src = photo.pngData;
      img.alt = 'Photo';
      img.loading = 'lazy';

      const badge = document.createElement('div');
      badge.className = 'gallery-card-badge';
      badge.textContent = photo.metadata ? (photo.metadata.fx || 'photo') : 'photo';

      card.appendChild(img);
      card.appendChild(badge);
      card.addEventListener('click', () => openPhotoDetail(photo));
      galleryGrid.appendChild(card);
    });
  }

  function openPhotoDetail(photo) {
    activeSelectedPhoto = photo;
    detailImg.src = photo.pngData;

    const m = photo.metadata || {};
    metaDate.textContent = m.date || '-';
    metaTime.textContent = m.time || '-';
    metaRes.textContent = m.dimensions || '-';
    metaFps.textContent = m.fps ? `${m.fps} FPS` : '-';
    metaMode.textContent = m.fx ? m.fx.toUpperCase() : 'STANDARD';
    metaFont.textContent = m.font || '-';
    metaGps.textContent = m.gps ? `${m.gps.lat.toFixed(4)}, ${m.gps.lng.toFixed(4)}` : 'Non disponible';
    metaCam.textContent = m.cameraName || 'Caméra';

    qrDisplayBox.style.display = 'none';
    modalGallery.classList.remove('active');
    modalDetail.classList.add('active');
  }

  function closeDetailModal() {
    modalDetail.classList.remove('active');
    modalGallery.classList.add('active');
  }

  if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeDetailModal);
  if (btnCloseDetailHeader) btnCloseDetailHeader.addEventListener('click', closeDetailModal);

  btnDeletePhoto.addEventListener('click', async () => {
    if (activeSelectedPhoto) {
      await gallery.deletePhoto(activeSelectedPhoto.id);
      showToast(i18n.t('toastDeleted'));
      modalDetail.classList.remove('active');
      loadGalleryGrid();
      modalGallery.classList.add('active');
    }
  });

  // Export Buttons
  btnExportPng.addEventListener('click', () => {
    if (activeSelectedPhoto) {
      window.PhotoExporter.exportPNG(activeSelectedPhoto.pngData, `ascii-${activeSelectedPhoto.id}.png`);
      showToast('Fichier PNG téléchargé !');
    }
  });

  btnExportJpeg.addEventListener('click', () => {
    if (activeSelectedPhoto) {
      window.PhotoExporter.exportJPEG(activeSelectedPhoto.pngData, `ascii-${activeSelectedPhoto.id}.jpg`);
      showToast('Fichier JPEG téléchargé !');
    }
  });

  btnExportTxt.addEventListener('click', () => {
    if (activeSelectedPhoto) {
      window.PhotoExporter.exportTXT(activeSelectedPhoto.rawText, `ascii-${activeSelectedPhoto.id}.txt`);
      showToast('Fichier TXT téléchargé !');
    }
  });

  btnExportPdf.addEventListener('click', () => {
    if (activeSelectedPhoto) {
      window.PhotoExporter.exportPDF(activeSelectedPhoto.pngData, activeSelectedPhoto.metadata, `ascii-${activeSelectedPhoto.id}.pdf`);
      showToast('Fichier PDF téléchargé !');
    }
  });

  btnExportQr.addEventListener('click', () => {
    if (activeSelectedPhoto && window.PhotoExporter.generateQRCodeOnCanvas) {
      qrDisplayBox.style.display = 'flex';
      window.PhotoExporter.generateQRCodeOnCanvas(activeSelectedPhoto.rawText, qrCanvas);
      showToast('QR Code généré !');
    }
  });

  // 11. Import Image Flow (triggers native device picker)
  btnImportGalleryImage.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        asciiEngine.setSource(img, true);
        isViewingImportedImage = true;
        imageModeBanner.classList.add('active');
        modalGallery.classList.remove('active');
        showToast('Image importée !');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  // 12. Onboarding Flow
  const onboardSteps = [
    document.getElementById('onboard-step-1'),
    document.getElementById('onboard-step-2'),
    document.getElementById('onboard-step-3'),
    document.getElementById('onboard-step-4')
  ];

  function showOnboardStep(stepIndex) {
    onboardSteps.forEach((s, idx) => {
      if (s) s.classList.toggle('active', idx === stepIndex);
    });
  }

  document.querySelectorAll('.lang-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-onboard-lang');
      document.querySelectorAll('.lang-card-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      i18n.setLanguage(lang);
      settings.language = lang;
      storage.save(settings);
    });
  });

  btnOnboardLangNext.addEventListener('click', () => showOnboardStep(1));

  btnPermCam.addEventListener('click', async () => {
    try {
      await camera.requestCameraPermission();
      showOnboardStep(2);
    } catch (e) {
      showOnboardStep(2);
    }
  });

  btnSkipCam.addEventListener('click', () => showOnboardStep(2));

  btnPermMic.addEventListener('click', async () => {
    try {
      await camera.requestMicPermission();
      settings.audioEnabled = true;
      storage.save(settings);
      showOnboardStep(3);
    } catch (e) {
      showOnboardStep(3);
    }
  });

  btnSkipMic.addEventListener('click', () => {
    settings.audioEnabled = false;
    storage.save(settings);
    showOnboardStep(3);
  });

  btnPermGeo.addEventListener('click', async () => {
    try {
      await camera.requestGeoLocation();
      settings.geoTagEnabled = true;
      storage.save(settings);
      finishOnboarding();
    } catch (e) {
      finishOnboarding();
    }
  });

  btnFinishOnboard.addEventListener('click', finishOnboarding);

  async function finishOnboarding() {
    settings.onboarded = true;
    settings.onboardingCompleted = true;
    storage.save(settings);
    if (onboardingContainer) onboardingContainer.classList.remove('active');
    await launchCamera();
  }

  // App Startup (Immediately launches camera on native apps and when onboarded)
  const isNativeApp = isCapacitorNative || isElectronApp;
  if (isNativeApp || settings.onboarded || settings.onboardingCompleted) {
    if (onboardingContainer) onboardingContainer.classList.remove('active');
    await launchCamera();
  } else {
    if (onboardingContainer) {
      onboardingContainer.classList.add('active');
      showOnboardStep(0);
    } else {
      await launchCamera();
    }
  }
});
