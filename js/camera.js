/**
 * camera.js - Enhanced Camera Hardware Controller
 * Supports cycling through all available camera devices (front, rear, ultra-wide, external webcams),
 * orientation rotation, torch, microphone, and geolocation.
 */

class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.availableCameras = [];
    this.currentCamIndex = 0;
    this.activeDeviceId = null;
    this.facingMode = 'environment';
    this.torchSupported = false;
    this.torchActive = false;
    this.videoTrack = null;
    this.audioTrack = null;
    this.geoCoordinates = null;

    this.permissions = {
      camera: 'pending',
      microphone: 'pending',
      geolocation: 'pending'
    };
  }

  async enumerateCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(d => d.kind === 'videoinput');
      return this.availableCameras;
    } catch (e) {
      console.warn('Enumerate devices failed:', e);
      return [];
    }
  }

  async checkPermissions() {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const cam = await navigator.permissions.query({ name: 'camera' });
        this.permissions.camera = cam.state;
      } catch (e) {}

      try {
        const mic = await navigator.permissions.query({ name: 'microphone' });
        this.permissions.microphone = mic.state;
      } catch (e) {}

      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' });
        this.permissions.geolocation = geo.state;
      } catch (e) {}
    }
    return this.permissions;
  }

  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.permissions.camera = 'granted';
      stream.getTracks().forEach(t => t.stop());
      await this.enumerateCameras();
      return true;
    } catch (e) {
      this.permissions.camera = 'denied';
      return false;
    }
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.permissions.microphone = 'granted';
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) {
      this.permissions.microphone = 'denied';
      return false;
    }
  }

  async requestGeolocationPermission() {
    if (!('geolocation' in navigator)) return false;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.geoCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          this.permissions.geolocation = 'granted';
          resolve(true);
        },
        () => {
          this.permissions.geolocation = 'denied';
          resolve(false);
        },
        { timeout: 6000 }
      );
    });
  }

  async startCamera(deviceId = null, enableAudio = true) {
    this.stopCamera();

    // Ensure list of cameras is populated
    await this.enumerateCameras();

    let videoConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    };

    if (deviceId) {
      videoConstraints.deviceId = { exact: deviceId };
      this.activeDeviceId = deviceId;
    } else if (this.availableCameras.length > 0) {
      const target = this.availableCameras[this.currentCamIndex];
      if (target && target.deviceId) {
        videoConstraints.deviceId = { exact: target.deviceId };
        this.activeDeviceId = target.deviceId;
      } else {
        videoConstraints.facingMode = { ideal: this.facingMode };
      }
    } else {
      videoConstraints.facingMode = { ideal: this.facingMode };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: enableAudio
      });
    } catch (err) {
      // Fallback: try without audio
      console.warn('Camera with audio failed, falling back to video only:', err);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
      } catch (camErr) {
        console.error('All camera attempts failed:', camErr);
        throw camErr;
      }
    }

    this.video.srcObject = this.stream;
    this.video.setAttribute('playsinline', 'true');
    await this.video.play();

    this.videoTrack = this.stream.getVideoTracks()[0] || null;
    this.audioTrack = this.stream.getAudioTracks()[0] || null;

    // Detect capabilities
    if (this.videoTrack && typeof this.videoTrack.getCapabilities === 'function') {
      const caps = this.videoTrack.getCapabilities();
      this.torchSupported = !!caps.torch;
    } else {
      this.torchSupported = false;
    }
    this.torchActive = false;

    // Update active index in list
    if (this.videoTrack && this.videoTrack.getSettings) {
      const s = this.videoTrack.getSettings();
      if (s.deviceId) {
        this.activeDeviceId = s.deviceId;
        const idx = this.availableCameras.findIndex(c => c.deviceId === s.deviceId);
        if (idx !== -1) this.currentCamIndex = idx;
      }
    }

    this.refreshLocation();
    return true;
  }

  // Cycle through ALL available cameras
  async cycleNextCamera(enableAudio = true) {
    await this.enumerateCameras();
    if (this.availableCameras.length <= 1) {
      // If browser hides deviceIds before permission or only 1 found, toggle facingMode
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      return await this.startCamera(null, enableAudio);
    }

    this.currentCamIndex = (this.currentCamIndex + 1) % this.availableCameras.length;
    const nextDev = this.availableCameras[this.currentCamIndex];
    return await this.startCamera(nextDev.deviceId, enableAudio);
  }

  getCurrentCameraLabel() {
    if (this.availableCameras.length > 0 && this.availableCameras[this.currentCamIndex]) {
      return this.availableCameras[this.currentCamIndex].label || `Cam ${this.currentCamIndex + 1}`;
    }
    return this.facingMode === 'user' ? 'Front Cam' : 'Rear Cam';
  }

  async setTorch(enable) {
    if (!this.videoTrack || !this.torchSupported) return false;
    try {
      await this.videoTrack.applyConstraints({
        advanced: [{ torch: enable }]
      });
      this.torchActive = enable;
      return true;
    } catch (err) {
      console.warn('Torch control failed:', err);
      return false;
    }
  }

  toggleTorch() {
    return this.setTorch(!this.torchActive);
  }

  async setHardwareZoom(zoomLevel) {
    if (!this.videoTrack || typeof this.videoTrack.getCapabilities !== 'function') return false;
    try {
      const caps = this.videoTrack.getCapabilities();
      if (caps.zoom) {
        const min = caps.zoom.min || 1;
        const max = caps.zoom.max || 5;
        const clamped = Math.min(max, Math.max(min, zoomLevel));
        await this.videoTrack.applyConstraints({
          advanced: [{ zoom: clamped }]
        });
        return true;
      }
    } catch (e) {}
    return false;
  }

  refreshLocation() {
    if ('geolocation' in navigator && this.permissions.geolocation === 'granted') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.geoCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.videoTrack = null;
    this.audioTrack = null;
    this.torchActive = false;
  }
}

window.CameraManager = CameraManager;
