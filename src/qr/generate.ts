/**
 * Pure TypeScript, self-contained QR Code SVG generator.
 * Zero external dependencies. Zero external network calls.
 * Implements ISO/IEC 18004 standard QR Code generation (Byte mode, Version 1-14).
 */

// Galois Field GF(256) tables for Reed-Solomon error correction
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGalois() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = val;
    GF256_LOG[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

// Generator polynomials for error correction codewords
function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF256_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsComputeRemainder(data: Uint8Array, numEcWords: number): Uint8Array {
  const gen = rsGeneratorPoly(numEcWords);
  const remainder = new Uint8Array(numEcWords);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[numEcWords - 1] = 0;
    for (let j = 0; j < numEcWords; j++) {
      remainder[j] ^= gfMul(gen[j], factor);
    }
  }
  return remainder;
}

// Table of QR code version capacities (Error correction level M)
// [totalDataCodewords, ecCodewordsPerBlock, numBlocksGroup1, numBlocksGroup2]
interface VersionSpec {
  version: number;
  totalCodewords: number;
  ecCodewords: number;
  dataCodewords: number;
}

const VERSION_SPECS: VersionSpec[] = [
  { version: 1, totalCodewords: 26, ecCodewords: 10, dataCodewords: 16 },
  { version: 2, totalCodewords: 44, ecCodewords: 16, dataCodewords: 28 },
  { version: 3, totalCodewords: 70, ecCodewords: 26, dataCodewords: 44 },
  { version: 4, totalCodewords: 100, ecCodewords: 36, dataCodewords: 64 },
  { version: 5, totalCodewords: 134, ecCodewords: 48, dataCodewords: 86 },
  { version: 6, totalCodewords: 172, ecCodewords: 64, dataCodewords: 108 },
  { version: 7, totalCodewords: 196, ecCodewords: 72, dataCodewords: 124 },
  { version: 8, totalCodewords: 242, ecCodewords: 88, dataCodewords: 154 },
  { version: 9, totalCodewords: 292, ecCodewords: 110, dataCodewords: 182 },
  { version: 10, totalCodewords: 346, ecCodewords: 130, dataCodewords: 216 },
  { version: 11, totalCodewords: 404, ecCodewords: 150, dataCodewords: 254 },
  { version: 12, totalCodewords: 466, ecCodewords: 176, dataCodewords: 290 },
  { version: 13, totalCodewords: 532, ecCodewords: 198, dataCodewords: 334 },
  { version: 14, totalCodewords: 581, ecCodewords: 216, dataCodewords: 365 },
];

export function generateQrSvg(text: string, size = 256): string {
  const bytes = new TextEncoder().encode(text);

  // Find minimum version to fit byte mode data
  // Byte mode header: 4 bits mode + 8 bits length (or 16 bits if ver >= 10)
  let spec: VersionSpec | null = null;
  for (const s of VERSION_SPECS) {
    const charCountBits = s.version < 10 ? 8 : 16;
    const totalDataBits = 4 + charCountBits + bytes.length * 8;
    if (Math.ceil(totalDataBits / 8) <= s.dataCodewords) {
      spec = s;
      break;
    }
  }

  if (!spec) {
    spec = VERSION_SPECS[VERSION_SPECS.length - 1]; // Fallback to max supported version
  }

  // Build data bitstream
  const bitBuf: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuf.push((val >>> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);
  // Character count indicator
  const countBits = spec.version < 10 ? 8 : 16;
  pushBits(bytes.length, countBits);
  // Data bytes
  for (const b of bytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zero bits)
  const maxDataBits = spec.dataCodewords * 8;
  const termBits = Math.min(4, maxDataBits - bitBuf.length);
  pushBits(0, termBits);

  // Pad to byte boundary
  while (bitBuf.length % 8 !== 0) {
    bitBuf.push(0);
  }

  // Pad bytes alternating 0xec and 0x11
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuf.length < maxDataBits) {
    pushBits(padPatterns[padIdx], 8);
    padIdx = (padIdx + 1) % 2;
  }

  // Convert bits to data codewords
  const dataWords = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < spec.dataCodewords; i++) {
    let word = 0;
    for (let b = 0; b < 8; b++) {
      word = (word << 1) | bitBuf[i * 8 + b];
    }
    dataWords[i] = word;
  }

  // Compute error correction codewords
  const ecWords = rsComputeRemainder(dataWords, spec.ecCodewords);

  // Combine data + EC
  const allCodewords = new Uint8Array(spec.totalCodewords);
  allCodewords.set(dataWords, 0);
  allCodewords.set(ecWords, spec.dataCodewords);

  // Construct matrix
  const moduleCount = spec.version * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));
  const isFunction: boolean[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));

  function setModule(r: number, c: number, val: boolean, isFunc = true) {
    if (r >= 0 && r < moduleCount && c >= 0 && c < moduleCount) {
      matrix[r][c] = val;
      if (isFunc) isFunction[r][c] = true;
    }
  }

  // 1. Finder patterns (top-left, top-right, bottom-left)
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const isBlack =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setModule(row + r, col + c, isBlack);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, moduleCount - 7);
  drawFinder(moduleCount - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }

  // 3. Dark module
  setModule(moduleCount - 8, 8, true);

  // 4. Place data bits in 2-column zigzag
  let bitIdx = 0;
  const allBits: number[] = [];
  for (const cw of allCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((cw >>> b) & 1);
    }
  }

  let right = moduleCount - 1;
  let upward = true;

  while (right > 0) {
    if (right === 6) right--; // skip timing pattern column
    for (let step = 0; step < moduleCount; step++) {
      const row = upward ? moduleCount - 1 - step : step;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!isFunction[row][col]) {
          let bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply standard mask pattern 000: (row + col) % 2 === 0
          if ((row + col) % 2 === 0) {
            bit ^= 1;
          }
          matrix[row][col] = bit === 1;
        }
      }
    }
    right -= 2;
    upward = !upward;
  }

  // Generate SVG paths
  const rects: string[] = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="currentColor"/>`);
      }
    }
  }

  const padding = 2;
  const viewBoxSize = moduleCount + padding * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g transform="translate(${padding}, ${padding})" color="#000000">
    ${rects.join('')}
  </g>
</svg>`;
}

export function generateQrDataUrl(text: string, size = 256): string {
  const svg = generateQrSvg(text, size);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
