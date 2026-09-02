/**
 * Radar results evaluation and ranking.
 */

export type RadarStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'failed';

export interface RadarTestResult {
  ip: string;
  latency_ms: number;
  status: RadarStatus;
  jitter?: number;
}

export function classifyRadarLatency(latencyMs: number, success: boolean): RadarStatus {
  if (!success || latencyMs <= 0 || latencyMs > 3000) {
    return 'failed';
  }
  if (latencyMs < 100) return 'excellent';
  if (latencyMs < 200) return 'good';
  if (latencyMs < 350) return 'fair';
  return 'poor';
}
