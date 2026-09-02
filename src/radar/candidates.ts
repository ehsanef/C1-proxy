/**
 * Curated Cloudflare Edge IP candidate pools for C1 Radar.
 */

export const RADAR_CANDIDATE_POOLS: string[] = [
  '104.16.132.229',
  '104.16.133.229',
  '104.17.157.100',
  '104.17.158.100',
  '104.18.2.161',
  '104.18.3.161',
  '104.19.143.20',
  '104.19.144.20',
  '104.20.73.18',
  '104.20.74.18',
  '104.21.32.1',
  '104.22.6.22',
  '104.24.100.1',
  '104.25.100.1',
  '104.26.10.1',
  '104.27.150.1',
  '104.28.1.1',
  '172.64.155.209',
  '172.64.156.209',
  '172.67.74.152',
  '172.67.75.152',
  '162.159.138.6',
  '162.159.139.6',
  '198.41.214.162',
  '198.41.215.162',
];

export function getRadarCandidates(customPool: string[] = []): string[] {
  const merged = Array.from(new Set([...customPool, ...RADAR_CANDIDATE_POOLS]));
  return merged;
}
