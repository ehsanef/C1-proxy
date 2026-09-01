interface D1Result<T = unknown> { results?: T[] }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  exec(sql: string): Promise<unknown>;
}
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void }

declare class WebSocketPair { 0: WebSocket; 1: WebSocket }
interface WebSocket { accept(): void }
interface ResponseInit { webSocket?: WebSocket }
interface Socket {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  close(): void;
}
declare module 'cloudflare:sockets' {
  export function connect(options: { hostname: string; port: number }): Socket;
}
