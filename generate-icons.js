// Run with: node generate-icons.js
// Generates PNG icons for the Chrome extension using pure Node.js (no dependencies)

const fs = require('fs');
const { createCanvas } = (() => {
  // Minimal canvas-like PNG generator using raw pixel data
  function createCanvas(w, h) {
    const pixels = new Uint8Array(w * h * 4);
    return {
      width: w,
      height: h,
      pixels,
      setPixel(x, y, r, g, b, a = 255) {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const i = (y * w + x) * 4;
        // Alpha blending
        const srcA = a / 255;
        const dstA = pixels[i + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA === 0) return;
        pixels[i]     = Math.round((r * srcA + pixels[i] * dstA * (1 - srcA)) / outA);
        pixels[i + 1] = Math.round((g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA);
        pixels[i + 2] = Math.round((b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA);
        pixels[i + 3] = Math.round(outA * 255);
      },
      fillCircle(cx, cy, radius, r, g, b) {
        for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y++) {
          for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x++) {
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist <= radius + 0.5) {
              const alpha = Math.max(0, Math.min(1, radius + 0.5 - dist));
              this.setPixel(x, y, r, g, b, Math.round(alpha * 255));
            }
          }
        }
      },
      strokeCircle(cx, cy, radius, thickness, r, g, b) {
        for (let y = Math.floor(cy - radius - thickness); y <= Math.ceil(cy + radius + thickness); y++) {
          for (let x = Math.floor(cx - radius - thickness); x <= Math.ceil(cx + radius + thickness); x++) {
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const edgeDist = Math.abs(dist - radius);
            if (edgeDist <= thickness / 2 + 0.5) {
              const alpha = Math.max(0, Math.min(1, thickness / 2 + 0.5 - edgeDist));
              this.setPixel(x, y, r, g, b, Math.round(alpha * 255));
            }
          }
        }
      },
      drawCurve(points, thickness, r, g, b) {
        for (let i = 0; i < points.length - 1; i++) {
          const [x1, y1] = points[i];
          const [x2, y2] = points[i + 1];
          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const steps = Math.ceil(dist * 3);
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t;
            this.fillCircle(px, py, thickness / 2, r, g, b);
          }
        }
      },
      toPNG() {
        // Minimal PNG encoder
        const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

        function crc32(buf) {
          let crc = 0xFFFFFFFF;
          for (let i = 0; i < buf.length; i++) {
            crc ^= buf[i];
            for (let j = 0; j < 8; j++) {
              crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
          }
          return (crc ^ 0xFFFFFFFF) >>> 0;
        }

        function makeChunk(type, data) {
          const len = Buffer.alloc(4);
          len.writeUInt32BE(data.length);
          const typeAndData = Buffer.concat([Buffer.from(type), data]);
          const crc = Buffer.alloc(4);
          crc.writeUInt32BE(crc32(typeAndData));
          return Buffer.concat([len, typeAndData, crc]);
        }

        // IHDR
        const ihdr = Buffer.alloc(13);
        ihdr.writeUInt32BE(w, 0);
        ihdr.writeUInt32BE(h, 4);
        ihdr[8] = 8; // bit depth
        ihdr[9] = 6; // RGBA
        ihdr[10] = 0; // compression
        ihdr[11] = 0; // filter
        ihdr[12] = 0; // interlace

        // IDAT
        const rawData = Buffer.alloc(h * (1 + w * 4));
        for (let y = 0; y < h; y++) {
          rawData[y * (1 + w * 4)] = 0; // filter: none
          for (let x = 0; x < w; x++) {
            const srcIdx = (y * w + x) * 4;
            const dstIdx = y * (1 + w * 4) + 1 + x * 4;
            rawData[dstIdx] = pixels[srcIdx];
            rawData[dstIdx + 1] = pixels[srcIdx + 1];
            rawData[dstIdx + 2] = pixels[srcIdx + 2];
            rawData[dstIdx + 3] = pixels[srcIdx + 3];
          }
        }
        const zlib = require('zlib');
        const compressed = zlib.deflateSync(rawData);

        return Buffer.concat([
          signature,
          makeChunk('IHDR', ihdr),
          makeChunk('IDAT', compressed),
          makeChunk('IEND', Buffer.alloc(0))
        ]);
      }
    };
  }
  return { createCanvas };
})();

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const strokeW = Math.max(1.5, size * 0.06);

  // Background circle
  canvas.fillCircle(cx, cy, r + strokeW, 22, 26, 48); // #16213e dark bg
  canvas.fillCircle(cx, cy, r, 26, 32, 58);            // #1a1a2e inner

  // Circle border
  canvas.strokeCircle(cx, cy, r, strokeW, 45, 112, 179); // #2d70b3

  // Sine-like curve
  const points = [];
  const curveSteps = Math.max(20, size * 2);
  for (let i = 0; i <= curveSteps; i++) {
    const t = i / curveSteps;
    const px = cx - r * 0.7 + t * r * 1.4;
    const py = cy - Math.sin(t * Math.PI * 2 - Math.PI * 0.3) * r * 0.45;
    if (Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) < r - strokeW * 0.5) {
      points.push([px, py]);
    }
  }
  canvas.drawCurve(points, Math.max(1.5, size * 0.07), 126, 184, 230); // #7eb8e6

  return canvas.toPNG();
}

// Generate all sizes
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const png = generateIcon(size);
  const path = `icons/icon${size}.png`;
  fs.writeFileSync(path, png);
  console.log(`Created ${path} (${png.length} bytes)`);
});

console.log('Done! Icons generated successfully.');
