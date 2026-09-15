/**
 * gifEncoder.js - Rock-solid, RFC-compliant animated GIF89a encoder in pure JavaScript.
 * Supports full LZW compression with dynamic code length (9..12 bits) and color quantizing.
 */

class SimpleGifEncoder {
  constructor(width, height, delayMs = 100) {
    this.width = width;
    this.height = height;
    this.delayMs = delayMs;
    this.frames = [];
  }

  addFrame(canvas) {
    const maxDim = 320;
    let w = canvas.width;
    let h = canvas.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.max(1, Math.round((h / w) * maxDim));
        w = maxDim;
      } else {
        w = Math.max(1, Math.round((w / h) * maxDim));
        h = maxDim;
      }
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    this.frames.push({
      width: w,
      height: h,
      data: imgData.data
    });
  }

  buildGifBlob() {
    if (this.frames.length === 0) return null;

    const f0 = this.frames[0];
    const width = f0.width;
    const height = f0.height;

    const buffer = [];

    function writeByte(b) {
      buffer.push(b & 0xff);
    }

    function writeShort(val) {
      writeByte(val & 0xff);
      writeByte((val >> 8) & 0xff);
    }

    function writeString(str) {
      for (let i = 0; i < str.length; i++) {
        writeByte(str.charCodeAt(i));
      }
    }

    function writeBytes(arr) {
      for (let i = 0; i < arr.length; i++) {
        writeByte(arr[i]);
      }
    }

    // 1. Header GIF89a
    writeString('GIF89a');

    // 2. Logical Screen Descriptor
    writeShort(width);
    writeShort(height);
    writeByte(0xf7); // Global color table (256 entries), 8 bpp
    writeByte(0x00); // Background color index
    writeByte(0x00); // Pixel aspect ratio

    // 3. Global Color Table (6x6x6 color cube + 40 grayscale levels = 256 colors)
    const palette = [];
    for (let r = 0; r < 6; r++) {
      for (let g = 0; g < 6; g++) {
        for (let b = 0; b < 6; b++) {
          palette.push(Math.round((r / 5) * 255));
          palette.push(Math.round((g / 5) * 255));
          palette.push(Math.round((b / 5) * 255));
        }
      }
    }
    for (let i = 0; i < 40; i++) {
      const v = Math.round((i / 39) * 255);
      palette.push(v, v, v);
    }
    writeBytes(palette);

    // 4. Netscape 2.0 Loop Extension (Infinite Looping)
    writeByte(0x21); // Extension Introducer
    writeByte(0xff); // App Extension Label
    writeByte(0x0b); // Block Size = 11
    writeString('NETSCAPE2.0');
    writeByte(0x03); // Sub-block Length
    writeByte(0x01);
    writeShort(0);   // Loop count = 0 (infinite)
    writeByte(0x00); // Block Terminator

    const delayHundreds = Math.max(2, Math.round(this.delayMs / 10));

    // 5. Add Each Frame
    for (let fIdx = 0; fIdx < this.frames.length; fIdx++) {
      const frame = this.frames[fIdx];

      // Graphic Control Extension
      writeByte(0x21);
      writeByte(0xf9);
      writeByte(0x04);
      writeByte(0x04); // Disposal: Restore to background
      writeShort(delayHundreds); // Delay in 1/100s
      writeByte(0x00); // Transparent color index
      writeByte(0x00); // Terminator

      // Image Descriptor
      writeByte(0x2c);
      writeShort(0); // Left
      writeShort(0); // Top
      writeShort(width);
      writeShort(height);
      writeByte(0x00); // No local color table

      // Quantize RGBA pixels to Palette Indexes
      const numPixels = width * height;
      const indexedPixels = new Uint8Array(numPixels);
      const rgba = frame.data;

      for (let i = 0; i < numPixels; i++) {
        const r = rgba[i * 4];
        const g = rgba[i * 4 + 1];
        const b = rgba[i * 4 + 2];

        // Color cube indexing
        const ri = Math.min(5, Math.round((r / 255) * 5));
        const gi = Math.min(5, Math.round((g / 255) * 5));
        const bi = Math.min(5, Math.round((b / 255) * 5));
        indexedPixels[i] = ri * 36 + gi * 6 + bi;
      }

      // LZW Compression
      this.encodeLZW(indexedPixels, 8, writeByte, writeBytes);
    }

    // 6. GIF Trailer
    writeByte(0x3b);

    return new Blob([new Uint8Array(buffer)], { type: 'image/gif' });
  }

  encodeLZW(pixels, minCodeSize, writeByte, writeBytes) {
    writeByte(minCodeSize);

    const clearCode = 1 << minCodeSize; // 256
    const eoiCode = clearCode + 1;       // 257

    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    let maxCode = (1 << codeSize);

    const dictionary = new Map();

    function resetDict() {
      dictionary.clear();
      codeSize = minCodeSize + 1;
      maxCode = (1 << codeSize);
      nextCode = eoiCode + 1;
    }

    let curAccum = 0;
    let curBits = 0;
    const packet = [];

    function flushPacket() {
      if (packet.length > 0) {
        writeByte(packet.length);
        writeBytes(packet);
        packet.length = 0;
      }
    }

    function emitCode(code) {
      curAccum |= (code << curBits);
      curBits += codeSize;

      while (curBits >= 8) {
        packet.push(curAccum & 0xff);
        if (packet.length === 254) {
          flushPacket();
        }
        curAccum >>= 8;
        curBits -= 8;
      }

      if (code === clearCode) {
        resetDict();
      } else if (nextCode >= maxCode && codeSize < 12) {
        codeSize++;
        maxCode = (1 << codeSize);
      }
    }

    emitCode(clearCode);

    if (pixels.length > 0) {
      let currentPrefix = pixels[0];

      for (let i = 1; i < pixels.length; i++) {
        const k = pixels[i];
        const key = (currentPrefix << 8) | k;

        if (dictionary.has(key)) {
          currentPrefix = dictionary.get(key);
        } else {
          emitCode(currentPrefix);

          if (nextCode < 4096) {
            dictionary.set(key, nextCode++);
          } else {
            emitCode(clearCode);
          }

          currentPrefix = k;
        }
      }

      emitCode(currentPrefix);
    }

    emitCode(eoiCode);

    // Flush any remaining bits
    if (curBits > 0) {
      packet.push(curAccum & 0xff);
    }
    flushPacket();

    // Terminator block
    writeByte(0x00);
  }
}

window.SimpleGifEncoder = SimpleGifEncoder;
