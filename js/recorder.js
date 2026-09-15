/**
 * recorder.js - 25 FPS Video Recording with MediaRecorder, canvas.captureStream(25) and Audio
 * ASCII Camera Pro WebApp
 */

class VideoRecorder {
  constructor(canvasElement, cameraManager) {
    this.canvas = canvasElement;
    this.cameraManager = cameraManager;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = 0;
    this.timerInterval = null;
    this.recordedBlob = null;
    this.recordedUrl = null;

    this.onTimerUpdate = null; // callback(formattedTime)
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined' && typeof this.canvas.captureStream === 'function';
  }

  startRecording(audioEnabled = true) {
    if (this.isRecording) return;
    this.recordedChunks = [];
    this.recordedBlob = null;
    if (this.recordedUrl) {
      URL.revokeObjectURL(this.recordedUrl);
      this.recordedUrl = null;
    }

    // 1. Capture stream from ASCII canvas at precisely 25 FPS
    const canvasStream = this.canvas.captureStream(25);

    // 2. Mix audio if available and enabled
    if (audioEnabled && this.cameraManager.audioTrack && this.cameraManager.audioTrack.readyState === 'live') {
      try {
        canvasStream.addTrack(this.cameraManager.audioTrack);
      } catch (e) {
        console.warn('Could not attach audio track:', e);
      }
    }

    // 3. Find optimal supported MIME type
    const mimeTypes = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];

    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const options = selectedMime ? { mimeType: selectedMime, videoBitsPerSecond: 2500000 } : {};

    try {
      this.mediaRecorder = new MediaRecorder(canvasStream, options);
    } catch (err) {
      console.warn('MediaRecorder with options failed, fallback to default:', err);
      this.mediaRecorder = new MediaRecorder(canvasStream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // flush chunks every 250ms
    this.isRecording = true;
    this.startTime = Date.now();

    // Timer loop for 00:00 UI pill
    this.timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const secs = String(elapsedSec % 60).padStart(2, '0');
      const formatted = `${mins}:${secs}`;
      if (this.onTimerUpdate) {
        this.onTimerUpdate(formatted);
      }
    }, 500);
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.mediaRecorder) {
        return resolve(null);
      }

      clearInterval(this.timerInterval);
      this.timerInterval = null;

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const mime = this.mediaRecorder.mimeType || 'video/webm';
        this.recordedBlob = new Blob(this.recordedChunks, { type: mime });
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        resolve({
          blob: this.recordedBlob,
          url: this.recordedUrl,
          mime: mime
        });
      };

      this.mediaRecorder.onerror = (e) => {
        this.isRecording = false;
        reject(e);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording = false;
        resolve(null);
      }
    });
  }
}

window.VideoRecorder = VideoRecorder;
