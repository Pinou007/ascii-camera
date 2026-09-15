/**
 * i18n.js - Multi-language translation dictionary (FR, EN, ES)
 * ASCII Camera Pro WebApp
 */

const TRANSLATIONS = {
  fr: {
    // Top Bar
    flash: "Flash / Torche",
    themeToggle: "Mode Sombre / Clair",
    soundToggle: "Sons Déclencheur",
    settings: "Paramètres",

    // Native Modes
    modePhoto: "PHOTO",
    modeVideo: "VIDÉO",

    // Adjustments
    btnAdjustments: "Ajustements",
    lblSmoothing: "Lissage / Douceur",
    lblSaturation: "Saturation",
    lblBrightness: "Exposition",
    lblContrast: "Contraste",
    btnReturnCamera: "Revenir à la caméra",

    // 11 Filters
    fxNone: "Réel",
    fxMatrix: "Matrix",
    fxAmber: "Ambre",
    fxCyber: "Cyber",
    fxBw: "N&B",
    fxSepia: "Sépia",
    fxNight: "Nuit",
    fxVaporwave: "Vaporwave",
    fxThermal: "Thermique",
    fxGameboy: "GameBoy",
    fxNeonInvert: "Invert",

    // Onboarding
    onboardTitleLang: "Choisissez votre langue",
    onboardDescLang: "Sélectionnez la langue d'affichage de l'application.",
    onboardTitleCam: "Accès à la Caméra",
    onboardDescCam: "Nécessaire pour le rendu vidéo ASCII en direct.",
    onboardTitleMic: "Accès au Microphone",
    onboardDescMic: "Pour enregistrer le son de vos vidéos. Vous pouvez refuser sans bloquer l'app.",
    onboardTitleGeo: "Accès à la Localisation",
    onboardDescGeo: "Optionnel pour horodater vos coordonnées GPS sur les clichés.",
    btnGrant: "Autoriser l'accès",
    btnSkip: "Passer",
    btnStart: "Commencer",

    // Settings
    settingsTitle: "Paramètres",
    secTheme: "Thème d'affichage",
    themeDark: "Mode Sombre",
    themeLight: "Mode Clair",
    secFps: "Cadence d'images (FPS)",
    secOrientation: "Orientation de la caméra",
    rotNormal: "0°",
    rot90: "90°",
    rot180: "180°",
    rot270: "270°",
    mirrorToggle: "Effet Miroir (Selfie)",
    secTypography: "Police & Caractères",
    lblDensity: "Densité des caractères (Taille)",
    lblCustomCharset: "Caractères personnalisés",
    secHardware: "Capteurs & Options",
    lblAudioMic: "Enregistrer l'audio en vidéo",
    lblGpsTag: "Filigrane GPS",
    lblSound: "Effets sonores (Déclencheur)",
    btnResetAll: "Réinitialiser par défaut",

    // Gallery & Exports
    galleryTitle: "Galerie Photos",
    galleryImport: "Importer une image",
    galleryEmpty: "Aucune photo capturée pour le moment",
    modalDetailTitle: "Détails & Exportations",
    btnExportPng: "PNG",
    btnExportJpeg: "JPEG",
    btnExportTxt: "TXT",
    btnExportPdf: "PDF",
    btnExportQr: "QR CODE",
    qrScanHint: "Scannez avec un téléphone pour lire l'art ASCII !",
    btnClose: "Fermer",
    btnDelete: "Supprimer",

    // Metadata
    metaDate: "Date",
    metaTime: "Heure",
    metaResolution: "Résolution",
    metaFps: "Cadence",
    metaMode: "Filtre",
    metaFont: "Police",
    metaGps: "Position GPS",
    metaCamera: "Caméra",

    // Toasts
    toastPhotoCaptured: "Photo enregistrée !",
    toastRecordingStarted: "Enregistrement vidéo démarré (25 FPS)",
    toastRecordingSaved: "Vidéo enregistrée !",
    toastCamSwitched: "Caméra changée",
    toastSettingsSaved: "Paramètres mis à jour",
    toastImageImported: "Image convertie en ASCII !",
    toastCameraResumed: "Caméra active"
  },

  en: {
    // Top Bar
    flash: "Flash / Torch",
    themeToggle: "Dark / Light Mode",
    soundToggle: "Shutter Sounds",
    settings: "Settings",

    // Native Modes
    modePhoto: "PHOTO",
    modeVideo: "VIDEO",

    // Adjustments
    btnAdjustments: "Adjustments",
    lblSmoothing: "Smoothing / Softness",
    lblSaturation: "Saturation",
    lblBrightness: "Exposure",
    lblContrast: "Contrast",
    btnReturnCamera: "Back to Camera",

    // 11 Filters
    fxNone: "True Color",
    fxMatrix: "Matrix",
    fxAmber: "Amber",
    fxCyber: "Cyber",
    fxBw: "B&W",
    fxSepia: "Sepia",
    fxNight: "Night",
    fxVaporwave: "Vaporwave",
    fxThermal: "Thermal",
    fxGameboy: "GameBoy",
    fxNeonInvert: "Invert",

    // Onboarding
    onboardTitleLang: "Choose your language",
    onboardDescLang: "Select your preferred display language.",
    onboardTitleCam: "Camera Access",
    onboardDescCam: "Required for live color ASCII art.",
    onboardTitleMic: "Microphone Access",
    onboardDescMic: "To capture sound during video recordings. You can skip if preferred.",
    onboardTitleGeo: "Location Access",
    onboardDescGeo: "Optional to stamp GPS coordinates into capture metadata.",
    btnGrant: "Grant Access",
    btnSkip: "Skip",
    btnStart: "Get Started",

    // Settings
    settingsTitle: "Settings",
    secTheme: "Display Theme",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    secFps: "Framerate (FPS)",
    secOrientation: "Camera Orientation",
    rotNormal: "0°",
    rot90: "90°",
    rot180: "180°",
    rot270: "270°",
    mirrorToggle: "Mirror Mode (Selfie)",
    secTypography: "Font & Characters",
    lblDensity: "Character Density (Size)",
    lblCustomCharset: "Custom Character Set",
    secHardware: "Sensors & Features",
    lblAudioMic: "Record audio in video",
    lblGpsTag: "GPS Watermark",
    lblSound: "Sound Effects (Shutter)",
    btnResetAll: "Reset to defaults",

    // Gallery & Exports
    galleryTitle: "Photo Gallery",
    galleryImport: "Import Image",
    galleryEmpty: "No photos taken yet",
    modalDetailTitle: "Details & Export",
    btnExportPng: "PNG",
    btnExportJpeg: "JPEG",
    btnExportTxt: "TXT",
    btnExportPdf: "PDF",
    btnExportQr: "QR CODE",
    qrScanHint: "Scan with any phone to read the ASCII art!",
    btnClose: "Close",
    btnDelete: "Delete",

    // Metadata
    metaDate: "Date",
    metaTime: "Time",
    metaResolution: "Resolution",
    metaFps: "Framerate",
    metaMode: "Filter",
    metaFont: "Font",
    metaGps: "GPS Location",
    metaCamera: "Camera",

    // Toasts
    toastPhotoCaptured: "Photo saved!",
    toastRecordingStarted: "Video recording started (25 FPS)",
    toastRecordingSaved: "Video saved!",
    toastCamSwitched: "Camera switched",
    toastSettingsSaved: "Settings updated",
    toastImageImported: "Image converted to ASCII!",
    toastCameraResumed: "Camera resumed"
  },

  es: {
    // Top Bar
    flash: "Flash / Linterna",
    themeToggle: "Modo Oscuro / Claro",
    soundToggle: "Sonido Disparador",
    settings: "Ajustes",

    // Native Modes
    modePhoto: "FOTO",
    modeVideo: "VÍDEO",

    // Adjustments
    btnAdjustments: "Ajustes",
    lblSmoothing: "Suavizado",
    lblSaturation: "Saturación",
    lblBrightness: "Exposición",
    lblContrast: "Contraste",
    btnReturnCamera: "Volver a la cámara",

    // 11 Filters
    fxNone: "Real",
    fxMatrix: "Matrix",
    fxAmber: "Ámbar",
    fxCyber: "Cyber",
    fxBw: "B&N",
    fxSepia: "Sepia",
    fxNight: "Noche",
    fxVaporwave: "Vaporwave",
    fxThermal: "Térmico",
    fxGameboy: "GameBoy",
    fxNeonInvert: "Invert",

    // Onboarding
    onboardTitleLang: "Elige tu idioma",
    onboardDescLang: "Selecciona el idioma de la aplicación.",
    onboardTitleCam: "Acceso a la Cámara",
    onboardDescCam: "Requerido para arte ASCII a color en vivo.",
    onboardTitleMic: "Acceso al Micrófono",
    onboardDescMic: "Para grabar audio en tus vídeos. Puedes omitir si lo prefieres.",
    onboardTitleGeo: "Acceso a la Ubicación",
    onboardDescGeo: "Opcional para incluir coordenadas GPS en tus capturas.",
    btnGrant: "Conceder acceso",
    btnSkip: "Omitir",
    btnStart: "Comenzar",

    // Settings
    settingsTitle: "Ajustes",
    secTheme: "Tema de pantalla",
    themeDark: "Modo Oscuro",
    themeLight: "Modo Claro",
    secFps: "Velocidad de fotogramas (FPS)",
    secOrientation: "Orientación de la cámara",
    rotNormal: "0°",
    rot90: "90°",
    rot180: "180°",
    rot270: "270°",
    mirrorToggle: "Modo Espejo (Selfie)",
    secTypography: "Fuente y Caracteres",
    lblDensity: "Densidad de caracteres",
    lblCustomCharset: "Juego de caracteres personalizado",
    secHardware: "Sensores y Opciones",
    lblAudioMic: "Grabar audio en vídeo",
    lblGpsTag: "Marca de agua GPS",
    lblSound: "Efectos de sonido (Disparador)",
    btnResetAll: "Restablecer ajustes",

    // Gallery & Exports
    galleryTitle: "Galería de Fotos",
    galleryImport: "Importar imagen",
    galleryEmpty: "No hay fotos capturadas aún",
    modalDetailTitle: "Detalles y Exportación",
    btnExportPng: "PNG",
    btnExportJpeg: "JPEG",
    btnExportTxt: "TXT",
    btnExportPdf: "PDF",
    btnExportQr: "CÓDIGO QR",
    qrScanHint: "¡Escanea con otro móvil para leer el arte ASCII!",
    btnClose: "Cerrar",
    btnDelete: "Eliminar",

    // Metadata
    metaDate: "Fecha",
    metaTime: "Hora",
    metaResolution: "Resolución",
    metaFps: "FPS",
    metaMode: "Filtro",
    metaFont: "Fuente",
    metaGps: "Ubicación GPS",
    metaCamera: "Cámara",

    // Toasts
    toastPhotoCaptured: "¡Foto guardada!",
    toastRecordingStarted: "Grabación iniciada (25 FPS)",
    toastRecordingSaved: "¡Vídeo guardado!",
    toastCamSwitched: "Cámara cambiada",
    toastSettingsSaved: "Ajustes actualizados",
    toastImageImported: "¡Imagen convertida a ASCII!",
    toastCameraResumed: "Cámara reanudada"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'fr';
  }

  init(lang = 'fr') {
    this.setLanguage(lang);
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'fr';
    this.currentLang = lang;
    document.documentElement.lang = lang;
    this.updateDOM();
  }

  t(key) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.fr;
    return dict[key] || key;
  }

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        el.setAttribute('placeholder', translation);
      } else {
        el.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', this.t(key));
      el.setAttribute('aria-label', this.t(key));
    });
  }
}

window.i18n = new I18nManager();
