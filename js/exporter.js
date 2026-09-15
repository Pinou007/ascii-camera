/**
 * exporter.js - Handles exporting captured ASCII media into clean files:
 * 1. PNG (High resolution image)
 * 2. JPEG (Standard image)
 * 3. TXT (Raw ASCII text file)
 * 4. PDF (Formatted document report)
 * 5. QR CODE (ASCII Art scanner)
 */

class PhotoExporter {
  static triggerDownload(urlOrBlob, filename) {
    if (!urlOrBlob) return;
    const a = document.createElement('a');
    let url = urlOrBlob;
    let isCreatedUrl = false;

    if (urlOrBlob instanceof Blob) {
      url = URL.createObjectURL(urlOrBlob);
      isCreatedUrl = true;
    }

    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (isCreatedUrl) {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }

  // PNG
  static exportPNG(pngDataUrl, filename) {
    const fn = filename || `ascii-photo-${Date.now()}.png`;
    this.triggerDownload(pngDataUrl, fn);
  }
  static downloadPNG(pngDataUrl, timestamp) {
    this.exportPNG(pngDataUrl, `ascii-photo-${timestamp || Date.now()}.png`);
  }

  // JPEG
  static exportJPEG(pngDataUrl, filename) {
    const fn = filename || `ascii-photo-${Date.now()}.jpg`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) this.triggerDownload(blob, fn);
      }, 'image/jpeg', 0.92);
    };
    img.src = pngDataUrl;
  }
  static downloadJPEG(pngDataUrl, timestamp) {
    this.exportJPEG(pngDataUrl, `ascii-photo-${timestamp || Date.now()}.jpg`);
  }

  // TXT
  static exportTXT(rawText, filename) {
    const fn = filename || `ascii-art-${Date.now()}.txt`;
    const blob = new Blob([rawText || ''], { type: 'text/plain;charset=utf-8' });
    this.triggerDownload(blob, fn);
  }
  static downloadTXT(rawText, timestamp) {
    this.exportTXT(rawText, `ascii-art-${timestamp || Date.now()}.txt`);
  }

  // PDF
  static async exportPDF(pngDataUrl, metadata, filename) {
    const fn = filename || `ascii-report-${Date.now()}.pdf`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        if (window.SimplePdfGenerator && window.SimplePdfGenerator.generatePhotoPdf) {
          const pdfBlob = await window.SimplePdfGenerator.generatePhotoPdf(img, metadata || {});
          this.triggerDownload(pdfBlob, fn);
        }
      } catch (err) {
        console.error('PDF generation error:', err);
      }
    };
    img.src = pngDataUrl;
  }
  static downloadPDF(pngDataUrl, metadata, timestamp) {
    this.exportPDF(pngDataUrl, metadata, `ascii-report-${timestamp || Date.now()}.pdf`);
  }

  // QR Code
  static generateQRCodeOnCanvas(rawText, targetCanvas) {
    const summary = rawText ? rawText.substring(0, 180) : 'ASCII Camera Pro';
    if (window.generateQRCodeCanvas) {
      return window.generateQRCodeCanvas(summary, targetCanvas, { size: 220 });
    }
  }
  static generateQRCode(rawText, targetCanvas) {
    return this.generateQRCodeOnCanvas(rawText, targetCanvas);
  }
}

window.PhotoExporter = PhotoExporter;
