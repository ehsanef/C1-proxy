import { describe, it, expect } from 'vitest';
import { generateQrSvg, generateQrDataUrl } from '../src/qr/generate';

describe('Local Pure TypeScript QR Code Generator', () => {
  it('generates valid SVG for VLESS URI', () => {
    const uri = 'vless://12345678-1234-1234-1234-123456789abc@example.com:443?type=ws&security=tls#C1-Node';
    const svg = generateQrSvg(uri);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
    expect(svg).toContain('<rect');
  });

  it('generates Data URI correctly', () => {
    const uri = 'https://example.workers.dev/s/token123';
    const dataUrl = generateQrDataUrl(uri);

    expect(dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(dataUrl).toContain('%3Csvg');
  });
});
