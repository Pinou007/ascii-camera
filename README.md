# ASCII Camera Pro

Transform your camera stream into real-time, high-resolution color ASCII art. Works on Web, Android, and Windows Desktop.

- **Live Web App:** [http://asciicamera.pinou007.fr/](http://asciicamera.pinou007.fr/)
- **Android APK:** [http://l.pinou007.fr/asscicamera-android](http://l.pinou007.fr/asscicamera-android)

---

## Features

- **Real-Time ASCII Engine:** Ultra-low latency camera rendering with high character density.
- **Photo, Video & GIF:** Capture full HD PNG snapshots, recorded MP4/WebM videos with microphone audio, and animated GIFs.
- **22 Color Filters:** Standard, Matrix, Cyberpunk, Amber, Retro CRT, Pure B&W, Sepia, Invert, Neon, Pastel, Pop Art, Game Boy, Manga, X-Ray, Glitch, Thermal, and more.
- **Live Adjustments:**
  - **Background:** Pure Black, Pure White, custom colors, and Live Camera Color Gradient.
  - **Fonts:** 10 Monospace fonts (JetBrains, VT323, Pixel, Space Mono, Fira Code, etc.) with a 5px–24px font size slider.
  - **Fine-Tuning:** Live Saturation, Smoothing, Exposure, Contrast, Hue Rotate (0°–360°), and RGB channel gains.
- **Mobile Controls:** Flash / Torch toggle, 2-finger pinch-to-zoom (1.0x–5.0x), and front/back camera cycling.
- **Native Gallery:** Direct redirection to the phone's native gallery app (Android) or Pictures folder (Windows).
- **Zero Emojis:** Modern, clean, and distraction-free frosted-glass UI.

---

## 1-Click Build Scripts

- **`build-all.bat`**: Compiles both Android APK and Windows Portable Desktop EXE into `./build-output/`.
- **`compile-apk.bat`**: Standalone Gradle APK builder without Android Studio.

```
build-output/
 ├── ASCII-Camera-Pro-v1.2.0.apk
 └── ASCII-Camera-Pro-Windows.exe
```

---

## Local Development

```bash
# Run local web server
python -m http.server 8085
```

Open [http://localhost:8085](http://localhost:8085) in your browser.

---

## License

MIT License. Created by [Pinou007](https://pinou007.fr).
