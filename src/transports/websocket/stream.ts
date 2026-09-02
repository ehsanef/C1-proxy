/**
 * High-performance bidirectional stream pump between WebSocket and TCP socket.
 * Buffers usage accounting and enforces bounded memory allocations.
 */

export interface UsageAccumulator {
  uploadBytes: number;
  downloadBytes: number;
  flushThreshold: number; // e.g. 1 MiB (1048576 bytes)
  onFlush: (upload: number, download: number) => Promise<void> | void;
}

export class StreamAccounting {
  private pendingUpload = 0;
  private pendingDownload = 0;
  private totalUpload = 0;
  private totalDownload = 0;
  private isFlushing = false;

  constructor(
    private threshold: number = 1024 * 1024,
    private onFlushCallback: (upload: number, download: number) => Promise<void> | void
  ) {}

  addUpload(bytes: number): void {
    this.pendingUpload += bytes;
    this.totalUpload += bytes;
    if (this.pendingUpload + this.pendingDownload >= this.threshold) {
      this.triggerFlush();
    }
  }

  addDownload(bytes: number): void {
    this.pendingDownload += bytes;
    this.totalDownload += bytes;
    if (this.pendingUpload + this.pendingDownload >= this.threshold) {
      this.triggerFlush();
    }
  }

  async flush(): Promise<void> {
    const up = this.pendingUpload;
    const down = this.pendingDownload;
    if (up === 0 && down === 0) return;

    this.pendingUpload = 0;
    this.pendingDownload = 0;

    try {
      await this.onFlushCallback(up, down);
    } catch {
      // Re-add on failure so stats are not lost
      this.pendingUpload += up;
      this.pendingDownload += down;
    }
  }

  private triggerFlush(): void {
    if (this.isFlushing) return;
    this.isFlushing = true;
    Promise.resolve(this.flush()).finally(() => {
      this.isFlushing = false;
    });
  }

  getTotals(): { upload: number; download: number } {
    return { upload: this.totalUpload, download: this.totalDownload };
  }
}

/**
 * Pipes data from a ReadableStream (TCP socket) to a WebSocket
 */
export async function pipeSocketToWebSocket(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  ws: WebSocket,
  accounting: StreamAccounting,
  initialPrefix?: Uint8Array
): Promise<void> {
  if (initialPrefix && initialPrefix.length > 0) {
    ws.send(initialPrefix);
    accounting.addDownload(initialPrefix.byteLength);
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || !value) {
        break;
      }
      ws.send(value);
      accounting.addDownload(value.byteLength);
    }
  } catch {
    // Socket closed or errored
  } finally {
    try {
      reader.releaseLock();
    } catch {}
    try {
      ws.close(1000, 'Stream ended');
    } catch {}
  }
}
