/**
 * pdfGenerator.js - Standalone Client-Side PDF Document Generator
 * Generates valid PDF 1.4 documents containing the ASCII image and full metadata report.
 */

class SimplePdfGenerator {
  // Convert an Image or Canvas to JPEG bytes
  static async canvasToJpegBytes(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.readAsArrayBuffer(blob);
      }, 'image/jpeg', 0.85);
    });
  }

  static async generatePhotoPdf(imgElement, metadata) {
    // 1. Create a canvas from image to get clean dimensions & JPEG bytes
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth || imgElement.width || 800;
    canvas.height = imgElement.naturalHeight || imgElement.height || 600;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    const jpegBytes = await this.canvasToJpegBytes(canvas);

    // PDF Dimensions (A4: 595 x 842 pt)
    const pageW = 595;
    const pageH = 842;
    const margin = 40;

    // Calculate image dimensions inside page
    const maxImgW = pageW - margin * 2;
    const maxImgH = 460;
    let imgW = maxImgW;
    let imgH = (canvas.height / canvas.width) * imgW;
    if (imgH > maxImgH) {
      imgH = maxImgH;
      imgW = (canvas.width / canvas.height) * imgH;
    }
    const imgX = (pageW - imgW) / 2;
    const imgY = pageH - margin - 40 - imgH;

    // Metadata lines
    const metaLines = [
      `Date: ${metadata.date || 'N/A'} ${metadata.time || ''}`,
      `Resolution: ${canvas.width} x ${canvas.height} px (${metadata.dimensions || 'N/A'})`,
      `FPS: ${metadata.fps || 10} FPS | Mode: ${metadata.nightVision ? 'Night Vision' : (metadata.fx || 'Normal')}`,
      `Font: ${metadata.font || 'JetBrains Mono'} | Charset: ${metadata.charset || 'Dense'}`,
      `GPS: ${metadata.gps ? `${metadata.gps.latitude.toFixed(4)}, ${metadata.gps.longitude.toFixed(4)}` : 'Not granted'}`,
      `Camera: ${metadata.cameraName || 'Default'}`,
      `App: ASCII Camera Pro WebApp (Mobile & GitHub Pages)`
    ];

    // Build PDF Stream
    let contentStream = `q\n`;
    // Title
    contentStream += `BT /F1 18 Tf 40 800 Td (ASCII Camera Pro - Photo Report) Tj ET\n`;
    contentStream += `BT /F1 10 Tf 40 784 Td (High-Resolution Color ASCII Capture & Metadata) Tj ET\n`;

    // Draw Image
    contentStream += `q ${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm /Im1 Do Q\n`;

    // Metadata Section Box
    const metaY = imgY - 30;
    contentStream += `BT /F1 12 Tf 40 ${metaY} Td (EXIF & Capture Metadata:) Tj ET\n`;

    let curY = metaY - 18;
    for (const line of metaLines) {
      // Escape parentheses in line
      const cleanLine = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      contentStream += `BT /F1 9 Tf 45 ${curY} Td (${cleanLine}) Tj ET\n`;
      curY -= 14;
    }
    contentStream += `Q\n`;

    const encoder = new TextEncoder();
    const contentBytes = encoder.encode(contentStream);

    // Construct PDF Objects
    const objects = [];
    const offsets = [];

    function addObject(strOrBytes) {
      offsets.push(currentOffset);
      let data = typeof strOrBytes === 'string' ? encoder.encode(strOrBytes) : strOrBytes;
      objects.push(data);
      currentOffset += data.length;
    }

    let currentOffset = 0;
    const header = encoder.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    currentOffset += header.length;

    // Object 1: Catalog
    addObject(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // Object 2: Pages
    addObject(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

    // Object 3: Page
    addObject(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> /XObject << /Im1 6 0 R >> >> >>\nendobj\n`);

    // Object 4: Contents
    addObject(`4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

    // Object 5: Font (Helvetica standard)
    addObject(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

    // Object 6: Image XObject
    const imgHeader = encoder.encode(`6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    const imgFooter = encoder.encode(`\nendstream\nendobj\n`);

    offsets.push(currentOffset);
    const combinedImg = new Uint8Array(imgHeader.length + jpegBytes.length + imgFooter.length);
    combinedImg.set(imgHeader, 0);
    combinedImg.set(jpegBytes, imgHeader.length);
    combinedImg.set(imgFooter, imgHeader.length + jpegBytes.length);
    objects.push(combinedImg);
    currentOffset += combinedImg.length;

    // XRef table
    const startXref = currentOffset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      xref += String(off + header.length).padStart(10, '0') + ' 00000 n \n';
    }
    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref + header.length}\n%%EOF\n`;

    const xrefBytes = encoder.encode(xref);
    objects.push(xrefBytes);

    // Combine all chunks into final Blob
    const totalParts = [header, ...objects];
    return new Blob(totalParts, { type: 'application/pdf' });
  }
}

window.SimplePdfGenerator = SimplePdfGenerator;
