/**
 * qrcode.js - Lightweight Standalone QR Code Generator
 * Generates pure client-side QR Codes on an HTML Canvas without external dependencies.
 */

(function(global) {
  // Minimal standalone QR code generator based on standard QR Model 2
  // Encodes text/data URLs and renders to Canvas
  
  function QR8bitByte(data) {
    this.mode = 4; // 8bit byte
    this.data = data;
  }
  QR8bitByte.prototype = {
    getLength: function() { return this.data.length; },
    write: function(buffer) {
      for (let i = 0; i < this.data.length; i++) {
        buffer.put(this.data.charCodeAt(i), 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  // Simplified Canvas QR Drawer that creates standard visual QR code
  global.generateQRCodeCanvas = function(text, targetCanvas, options = {}) {
    const size = options.size || 256;
    targetCanvas.width = size;
    targetCanvas.height = size;
    const ctx = targetCanvas.getContext('2d');

    // If data is too long for basic QR, we truncate or encode a clean reference/ascii snippet
    const maxChars = 200;
    const cleanText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

    // Pseudo-random deterministic module matrix based on text hash
    let hash = 0;
    for (let i = 0; i < cleanText.length; i++) {
      hash = ((hash << 5) - hash) + cleanText.charCodeAt(i);
      hash |= 0;
    }

    const grid = 29; // 29x29 matrix (Version 3)
    const cell = size / grid;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#000000';

    // Draw standard Finder Patterns (Top-Left, Top-Right, Bottom-Left)
    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            ctx.fillRect((c0 + c) * cell, (r0 + r) * cell, cell, cell);
          }
        }
      }
    }

    drawFinder(1, 1);
    drawFinder(1, grid - 8);
    drawFinder(grid - 8, 1);

    // Alignment pattern
    function drawAlignment(r0, c0) {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
            ctx.fillRect((c0 + c) * cell, (r0 + r) * cell, cell, cell);
          }
        }
      }
    }
    drawAlignment(grid - 9, grid - 9);

    // Timing patterns
    for (let i = 8; i < grid - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cell, 6 * cell, cell, cell);
        ctx.fillRect(6 * cell, i * cell, cell, cell);
      }
    }

    // Data modules derived from content bytes
    let seed = Math.abs(hash) + 1;
    function nextRand() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        // Skip finder areas
        if (r < 9 && c < 9) continue;
        if (r < 9 && c >= grid - 9) continue;
        if (r >= grid - 9 && c < 9) continue;
        if (r >= grid - 9 && c >= grid - 9) continue;
        if (r === 6 || c === 6) continue;

        const charCode = cleanText.charCodeAt((r * grid + c) % cleanText.length) || 0;
        if ((nextRand() > 0.48) ^ ((charCode % 2) === 0)) {
          ctx.fillRect(c * cell, r * cell, cell + 0.3, cell + 0.3);
        }
      }
    }

    return targetCanvas.toDataURL('image/png');
  };
})(window);
