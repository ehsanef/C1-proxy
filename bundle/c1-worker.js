var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/app/router.ts
var Router = class {
  routes = [];
  add(method, path, handler) {
    const paramNames = [];
    const regexPattern = path.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    }).replace(/\*/g, ".*");
    const pattern = new RegExp(`^${regexPattern}$`);
    this.routes.push({ method, pattern, paramNames, handler });
    return this;
  }
  get(path, handler) {
    return this.add("GET", path, handler);
  }
  post(path, handler) {
    return this.add("POST", path, handler);
  }
  patch(path, handler) {
    return this.add("PATCH", path, handler);
  }
  delete(path, handler) {
    return this.add("DELETE", path, handler);
  }
  async handle(request, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();
    for (const route of this.routes) {
      if (route.method !== "ALL" && route.method !== method) {
        continue;
      }
      const match = pathname.match(route.pattern);
      if (match) {
        const params = {};
        for (let i = 0; i < route.paramNames.length; i++) {
          params[route.paramNames[i]] = decodeURIComponent(match[i + 1]);
        }
        return route.handler(request, params, ctx);
      }
    }
    return null;
  }
};
__name(Router, "Router");

// src/utils/bytes.ts
function hexToBytes(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}
__name(hexToBytes, "hexToBytes");
function bytesToHex(bytes) {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}
__name(bytesToHex, "bytesToHex");
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}
__name(stringToBytes, "stringToBytes");
function bytesToString(bytes) {
  return new TextDecoder().decode(bytes);
}
__name(bytesToString, "bytesToString");
function readUint16BE(buf, offset) {
  return buf[offset] << 8 | buf[offset + 1];
}
__name(readUint16BE, "readUint16BE");
function bytesToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
__name(bytesToBase64, "bytesToBase64");
function base64ToBytes(b64) {
  const binary = atob(b64.replace(/\s/g, ""));
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(base64ToBytes, "base64ToBytes");
function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(bytesToBase64Url, "bytesToBase64Url");
function base64UrlToBytes(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  return base64ToBytes(b64);
}
__name(base64UrlToBytes, "base64UrlToBytes");
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
function bytesToUuid(buf, offset = 0) {
  if (buf.length < offset + 16) {
    throw new Error("Buffer too small for UUID");
  }
  const hex = bytesToHex(buf.subarray(offset, offset + 16));
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
__name(bytesToUuid, "bytesToUuid");
function randomToken(byteLength = 16) {
  const buf = new Uint8Array(byteLength);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}
__name(randomToken, "randomToken");
function randomUuid() {
  return crypto.randomUUID();
}
__name(randomUuid, "randomUuid");

// src/database/repo.ts
var C1Repository = class {
  constructor(db) {
    this.db = db;
  }
  // ---------------- ADMINS ----------------
  async getAdminCount() {
    const res = await this.db.prepare("SELECT COUNT(*) as count FROM admins;").first();
    return res?.count ?? 0;
  }
  async getAdminByUsername(username) {
    return this.db.prepare("SELECT * FROM admins WHERE username = ?;").bind(username).first();
  }
  async getAdminById(id) {
    return this.db.prepare("SELECT * FROM admins WHERE id = ?;").bind(id).first();
  }
  async createAdmin(username, passwordHash, salt) {
    const id = randomUuid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare("INSERT INTO admins (id, username, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);").bind(id, username, passwordHash, salt, now, now).run();
    return {
      id,
      username,
      password_hash: passwordHash,
      salt,
      created_at: now,
      updated_at: now
    };
  }
  // ---------------- USERS ----------------
  async listUsers() {
    const res = await this.db.prepare("SELECT * FROM users ORDER BY created_at DESC;").all();
    return res.results || [];
  }
  async getUserById(id) {
    return this.db.prepare("SELECT * FROM users WHERE id = ?;").bind(id).first();
  }
  async getUserByUsername(username) {
    return this.db.prepare("SELECT * FROM users WHERE username = ?;").bind(username).first();
  }
  async getUserBySubscriptionToken(token) {
    return this.db.prepare("SELECT * FROM users WHERE subscription_token = ?;").bind(token).first();
  }
  async getUserByVlessUuid(uuid) {
    return this.db.prepare("SELECT * FROM users WHERE vless_uuid = ?;").bind(uuid).first();
  }
  async getUserByTrojanPassword(password) {
    return this.db.prepare("SELECT * FROM users WHERE trojan_password = ?;").bind(password).first();
  }
  async getUserByShadowsocksPassword(password) {
    return this.db.prepare("SELECT * FROM users WHERE shadowsocks_password = ?;").bind(password).first();
  }
  async createUser(user) {
    const id = randomUuid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare(
      `INSERT INTO users (
          id, name, username, enabled, created_at, updated_at,
          subscription_token, vless_uuid, trojan_password, shadowsocks_password, shadowsocks_method,
          quota_bytes, used_bytes, daily_quota_bytes, daily_used_bytes, daily_key,
          expires_at, max_ips, max_connections, clean_ip_mode, clean_ip, notes,
          protocol_vless_enabled, protocol_trojan_enabled, protocol_shadowsocks_enabled, last_seen_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        );`
    ).bind(
      id,
      user.name,
      user.username,
      user.enabled,
      now,
      now,
      user.subscription_token,
      user.vless_uuid,
      user.trojan_password,
      user.shadowsocks_password,
      user.shadowsocks_method,
      user.quota_bytes,
      user.used_bytes,
      user.daily_quota_bytes,
      user.daily_used_bytes,
      user.daily_key,
      user.expires_at,
      user.max_ips,
      user.max_connections,
      user.clean_ip_mode,
      user.clean_ip,
      user.notes,
      user.protocol_vless_enabled,
      user.protocol_trojan_enabled,
      user.protocol_shadowsocks_enabled,
      user.last_seen_at
    ).run();
    return {
      ...user,
      id,
      created_at: now,
      updated_at: now
    };
  }
  async updateUser(id, updates) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0)
      return;
    fields.push("updated_at = ?");
    values.push(now);
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?;`;
    await this.db.prepare(sql).bind(...values).run();
  }
  async deleteUser(id) {
    await this.db.batch([
      this.db.prepare("DELETE FROM user_inbounds WHERE user_id = ?;").bind(id),
      this.db.prepare("DELETE FROM usage_events WHERE user_id = ?;").bind(id),
      this.db.prepare("DELETE FROM users WHERE id = ?;").bind(id)
    ]);
  }
  async incrementUserUsage(userId, bytesDelta) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const todayKey = now.slice(0, 10);
    await this.db.prepare(
      `UPDATE users
         SET used_bytes = used_bytes + ?,
             daily_used_bytes = CASE WHEN daily_key = ? THEN daily_used_bytes + ? ELSE ? END,
             daily_key = ?,
             last_seen_at = ?,
             updated_at = ?
         WHERE id = ?;`
    ).bind(bytesDelta, todayKey, bytesDelta, bytesDelta, todayKey, now, now, userId).run();
  }
  async resetUserTraffic(userId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare("UPDATE users SET used_bytes = 0, daily_used_bytes = 0, updated_at = ? WHERE id = ?;").bind(now, userId).run();
  }
  // ---------------- INBOUNDS ----------------
  async listInbounds() {
    const res = await this.db.prepare("SELECT * FROM inbounds ORDER BY created_at ASC;").all();
    return res.results || [];
  }
  async getInboundById(id) {
    return this.db.prepare("SELECT * FROM inbounds WHERE id = ?;").bind(id).first();
  }
  async createInbound(inbound) {
    const id = randomUuid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare(
      `INSERT INTO inbounds (
          id, name, enabled, protocol, transport, tls_mode, port,
          path_template, host, sni, fingerprint, allow_udp, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    ).bind(
      id,
      inbound.name,
      inbound.enabled,
      inbound.protocol,
      inbound.transport,
      inbound.tls_mode,
      inbound.port,
      inbound.path_template,
      inbound.host,
      inbound.sni,
      inbound.fingerprint,
      inbound.allow_udp,
      inbound.notes,
      now,
      now
    ).run();
    return {
      ...inbound,
      id,
      created_at: now,
      updated_at: now
    };
  }
  async updateInbound(id, updates) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0)
      return;
    fields.push("updated_at = ?");
    values.push(now);
    values.push(id);
    const sql = `UPDATE inbounds SET ${fields.join(", ")} WHERE id = ?;`;
    await this.db.prepare(sql).bind(...values).run();
  }
  async deleteInbound(id) {
    await this.db.batch([
      this.db.prepare("DELETE FROM user_inbounds WHERE inbound_id = ?;").bind(id),
      this.db.prepare("DELETE FROM inbounds WHERE id = ?;").bind(id)
    ]);
  }
  async getUserInbounds(userId) {
    const res = await this.db.prepare(
      `SELECT i.* FROM inbounds i
         INNER JOIN user_inbounds ui ON i.id = ui.inbound_id
         WHERE ui.user_id = ? AND i.enabled = 1
         ORDER BY i.created_at ASC;`
    ).bind(userId).all();
    return res.results || [];
  }
  async setUserInbounds(userId, inboundIds) {
    const statements = [
      this.db.prepare("DELETE FROM user_inbounds WHERE user_id = ?;").bind(userId)
    ];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const inboundId of inboundIds) {
      statements.push(
        this.db.prepare("INSERT INTO user_inbounds (user_id, inbound_id, created_at) VALUES (?, ?, ?);").bind(userId, inboundId, now)
      );
    }
    await this.db.batch(statements);
  }
  // ---------------- SETTINGS ----------------
  async getSetting(key) {
    const res = await this.db.prepare("SELECT value FROM settings WHERE key = ?;").bind(key).first();
    return res ? res.value : null;
  }
  async setSetting(key, value) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`
    ).bind(key, value, now).run();
  }
  async getAllSettings() {
    const res = await this.db.prepare("SELECT key, value FROM settings;").all();
    const map = {};
    for (const row of res.results || []) {
      map[row.key] = row.value;
    }
    return map;
  }
  // ---------------- AUDIT LOG ----------------
  async createAuditLog(action, actor, details, ip = "") {
    const id = randomUuid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare("INSERT INTO audit_log (id, action, actor, details, ip, created_at) VALUES (?, ?, ?, ?, ?, ?);").bind(id, action, actor, JSON.stringify(details), ip, now).run();
  }
  async listAuditLogs(limit = 100) {
    const res = await this.db.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?;").bind(limit).all();
    return res.results || [];
  }
  // ---------------- RADAR RESULTS ----------------
  async saveRadarResults(results) {
    if (results.length === 0)
      return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmts = results.map(
      (r) => this.db.prepare("INSERT INTO radar_results (id, ip, latency_ms, status, jitter, tested_at) VALUES (?, ?, ?, ?, ?, ?);").bind(randomUuid(), r.ip, r.latency_ms, r.status, r.jitter || 0, now)
    );
    await this.db.batch(stmts);
  }
  async getRecentRadarResults(limit = 50) {
    const res = await this.db.prepare("SELECT * FROM radar_results ORDER BY tested_at DESC, latency_ms ASC LIMIT ?;").bind(limit).all();
    return res.results || [];
  }
};
__name(C1Repository, "C1Repository");

// src/app/errors.ts
var ErrorCode = {
  // Database / Migration
  DB_MIGRATION_MISSING: "C1-DB-001",
  DB_QUERY_FAILED: "C1-DB-002",
  DB_NOT_INITIALIZED: "C1-DB-003",
  DB_RECORD_NOT_FOUND: "C1-DB-004",
  DB_RECORD_CONFLICT: "C1-DB-005",
  // Authentication & Session
  AUTH_CLAIM_REQUIRED: "C1-AUTH-001",
  AUTH_INVALID_CREDENTIALS: "C1-AUTH-002",
  AUTH_KDF_FAILED: "C1-AUTH-003",
  AUTH_UNAUTHORIZED: "C1-AUTH-004",
  AUTH_SESSION_EXPIRED: "C1-AUTH-005",
  AUTH_CSRF_INVALID: "C1-AUTH-006",
  AUTH_RATE_LIMITED: "C1-AUTH-007",
  // Protocol & Data Plane
  PROTO_INVALID_PACKET: "C1-PROTO-001",
  PROTO_AUTH_FAILED: "C1-PROTO-002",
  PROTO_UNSUPPORTED_VERSION: "C1-PROTO-003",
  PROTO_UNSUPPORTED_COMMAND: "C1-PROTO-004",
  PROTO_UNSUPPORTED_ADDRESS: "C1-PROTO-005",
  PROTO_ACCOUNT_DISABLED: "C1-PROTO-006",
  PROTO_QUOTA_EXCEEDED: "C1-PROTO-007",
  PROTO_EXPIRED: "C1-PROTO-008",
  PROTO_IP_LIMIT_EXCEEDED: "C1-PROTO-009",
  // Network & Transport
  NET_CONNECT_FAILED: "C1-NET-001",
  NET_TARGET_BLOCKED: "C1-NET-002",
  NET_STREAM_ABORTED: "C1-NET-003",
  NET_DNS_FAILED: "C1-NET-004",
  // Subscription
  SUB_TOKEN_INVALID: "C1-SUB-001",
  SUB_FORMAT_UNSUPPORTED: "C1-SUB-002",
  SUB_USER_NOT_FOUND: "C1-SUB-003",
  // Validation
  VAL_INVALID_INPUT: "C1-VAL-001",
  VAL_PASSWORD_TOO_SHORT: "C1-VAL-002"
};
var C1Error = class extends Error {
  code;
  status;
  safeMessage;
  constructor(code, safeMessage, status = 400, internalDetail) {
    super(internalDetail ? `${safeMessage} (${internalDetail})` : safeMessage);
    this.name = "C1Error";
    this.code = code;
    this.status = status;
    this.safeMessage = safeMessage;
  }
};
__name(C1Error, "C1Error");

// src/database/migrations.ts
var MIGRATIONS = [
  {
    version: 1,
    name: "0001_initial",
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        subscription_token TEXT NOT NULL UNIQUE,
        vless_uuid TEXT NOT NULL UNIQUE,
        trojan_password TEXT NOT NULL,
        shadowsocks_password TEXT NOT NULL,
        shadowsocks_method TEXT NOT NULL DEFAULT 'aes-128-gcm',
        quota_bytes INTEGER NOT NULL DEFAULT 0,
        used_bytes INTEGER NOT NULL DEFAULT 0,
        daily_quota_bytes INTEGER NOT NULL DEFAULT 0,
        daily_used_bytes INTEGER NOT NULL DEFAULT 0,
        daily_key TEXT NOT NULL DEFAULT '',
        expires_at TEXT,
        max_ips INTEGER NOT NULL DEFAULT 0,
        max_connections INTEGER NOT NULL DEFAULT 0,
        clean_ip_mode TEXT NOT NULL DEFAULT 'auto',
        clean_ip TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        protocol_vless_enabled INTEGER NOT NULL DEFAULT 1,
        protocol_trojan_enabled INTEGER NOT NULL DEFAULT 1,
        protocol_shadowsocks_enabled INTEGER NOT NULL DEFAULT 1,
        last_seen_at TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_users_subscription_token ON users (subscription_token);`,
      `CREATE INDEX IF NOT EXISTS idx_users_vless_uuid ON users (vless_uuid);`,
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);`,
      `CREATE INDEX IF NOT EXISTS idx_users_enabled ON users (enabled);`,
      `CREATE TABLE IF NOT EXISTS inbounds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        protocol TEXT NOT NULL,
        transport TEXT NOT NULL DEFAULT 'ws',
        tls_mode TEXT NOT NULL DEFAULT 'tls',
        port INTEGER NOT NULL DEFAULT 443,
        path_template TEXT NOT NULL,
        host TEXT NOT NULL DEFAULT '',
        sni TEXT NOT NULL DEFAULT '',
        fingerprint TEXT NOT NULL DEFAULT 'chrome',
        allow_udp INTEGER NOT NULL DEFAULT 1,
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS user_inbounds (
        user_id TEXT NOT NULL,
        inbound_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, inbound_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (inbound_id) REFERENCES inbounds(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT NOT NULL,
        ip TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at DESC);`,
      `CREATE TABLE IF NOT EXISTS usage_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        bytes_up INTEGER NOT NULL DEFAULT 0,
        bytes_down INTEGER NOT NULL DEFAULT 0,
        recorded_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_usage_events_user_time ON usage_events (user_id, recorded_at DESC);`,
      `CREATE TABLE IF NOT EXISTS radar_results (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL,
        latency_ms REAL NOT NULL,
        status TEXT NOT NULL,
        jitter REAL NOT NULL DEFAULT 0,
        tested_at TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_radar_results_tested_at ON radar_results (tested_at DESC);`
    ]
  }
];
var migrationsChecked = false;
async function ensureMigrations(db, force = false) {
  if (migrationsChecked && !force) {
    return;
  }
  try {
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );`
    ).run();
    const result = await db.prepare("SELECT version FROM schema_migrations ORDER BY version ASC;").all();
    const appliedVersions = new Set((result.results || []).map((r) => r.version));
    for (const migration of MIGRATIONS) {
      if (!appliedVersions.has(migration.version)) {
        for (const statement of migration.statements) {
          await db.prepare(statement).run();
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);").bind(migration.version, migration.name, now).run();
      }
    }
    migrationsChecked = true;
  } catch (err) {
    migrationsChecked = false;
    const msg = err instanceof Error ? err.message : String(err);
    throw new C1Error(ErrorCode.DB_MIGRATION_MISSING, "Failed to run database migrations", 500, msg);
  }
}
__name(ensureMigrations, "ensureMigrations");

// src/auth/password.ts
var DEFAULT_PBKDF2_ITERATIONS = 1e5;
var HASH_ALGORITHM = "SHA-256";
var KEY_LENGTH_BITS = 256;
async function hashPassword(password, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  if (!password || password.length < 8) {
    throw new C1Error(ErrorCode.VAL_PASSWORD_TOO_SHORT, "Password must be at least 8 characters", 400);
  }
  try {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const baseKey = await crypto.subtle.importKey(
      "raw",
      stringToBytes(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: HASH_ALGORITHM
      },
      baseKey,
      KEY_LENGTH_BITS
    );
    const hashBytes = new Uint8Array(derivedBits);
    const saltHex = bytesToHex(salt);
    const hashHex = bytesToHex(hashBytes);
    return `$pbkdf2$sha256$${iterations}$${saltHex}$${hashHex}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new C1Error(ErrorCode.AUTH_KDF_FAILED, "Failed to hash password", 500, msg);
  }
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedRecord) {
  if (!password || !storedRecord) {
    return false;
  }
  const parts = storedRecord.split("$");
  if (parts.length !== 6 || parts[1] !== "pbkdf2" || parts[2] !== "sha256") {
    return false;
  }
  const iterations = parseInt(parts[3], 10);
  if (isNaN(iterations) || iterations < 1e3 || iterations > 5e5) {
    return false;
  }
  const salt = hexToBytes(parts[4]);
  const expectedHash = hexToBytes(parts[5]);
  try {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      stringToBytes(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: HASH_ALGORITHM
      },
      baseKey,
      KEY_LENGTH_BITS
    );
    const actualHash = new Uint8Array(derivedBits);
    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");

// src/auth/session.ts
var SESSION_COOKIE_NAME = "c1_session";
var CSRF_HEADER_NAME = "x-c1-csrf";
var DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 3600;
async function createSessionToken(adminId, username, secretKey, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1e3) + ttlSeconds;
  const csrfToken = randomToken(16);
  const payload = {
    adminId,
    username,
    exp,
    csrfToken
  };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = bytesToBase64Url(stringToBytes(payloadJson));
  const signature = await signHmacSha256(payloadB64, secretKey);
  const token = `${payloadB64}.${signature}`;
  return { token, csrfToken };
}
__name(createSessionToken, "createSessionToken");
async function verifySessionToken(token, secretKey) {
  if (!token || !secretKey)
    return null;
  const parts = token.split(".");
  if (parts.length !== 2)
    return null;
  const [payloadB64, providedSigB64] = parts;
  try {
    const expectedSigB64 = await signHmacSha256(payloadB64, secretKey);
    const expectedSigBytes = base64UrlToBytes(expectedSigB64);
    const providedSigBytes = base64UrlToBytes(providedSigB64);
    if (!timingSafeEqual(expectedSigBytes, providedSigBytes)) {
      return null;
    }
    const payloadJson = bytesToString(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
__name(verifySessionToken, "verifySessionToken");
async function signHmacSha256(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, stringToBytes(data));
  return bytesToBase64Url(new Uint8Array(signatureBytes));
}
__name(signHmacSha256, "signHmacSha256");
function buildSetCookieHeader(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
__name(buildSetCookieHeader, "buildSetCookieHeader");
function buildClearCookieHeader(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
__name(buildClearCookieHeader, "buildClearCookieHeader");
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader)
    return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}
__name(parseCookies, "parseCookies");

// src/auth/csrf.ts
function validateCsrfToken(request, session) {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return;
  }
  const headerVal = request.headers.get(CSRF_HEADER_NAME);
  if (!headerVal || headerVal !== session.csrfToken) {
    throw new C1Error(ErrorCode.AUTH_CSRF_INVALID, "Invalid or missing CSRF token", 403);
  }
}
__name(validateCsrfToken, "validateCsrfToken");

// src/auth/rate-limit.ts
var memoryStore = /* @__PURE__ */ new Map();
async function checkRateLimit(kv, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1e3);
  if (kv) {
    try {
      const kvKey = `rl:${key}`;
      const recordStr = await kv.get(kvKey);
      let count3 = 0;
      let expiresAt = now + windowSeconds;
      if (recordStr) {
        const parsed = JSON.parse(recordStr);
        if (parsed.expiresAt > now) {
          count3 = parsed.count;
          expiresAt = parsed.expiresAt;
        }
      }
      if (count3 >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetIn: Math.max(1, expiresAt - now)
        };
      }
      count3 += 1;
      await kv.put(kvKey, JSON.stringify({ count: count3, expiresAt }), {
        expirationTtl: Math.max(60, windowSeconds)
      });
      return {
        allowed: true,
        remaining: limit - count3,
        resetIn: Math.max(1, expiresAt - now)
      };
    } catch {
    }
  }
  const mem = memoryStore.get(key);
  if (mem && mem.resetAt > now) {
    if (mem.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.max(1, mem.resetAt - now)
      };
    }
    mem.count += 1;
    return {
      allowed: true,
      remaining: limit - mem.count,
      resetIn: Math.max(1, mem.resetAt - now)
    };
  }
  const resetAt = now + windowSeconds;
  memoryStore.set(key, { count: 1, resetAt });
  if (memoryStore.size > 2e3) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.resetAt <= now) {
        memoryStore.delete(k);
      }
    }
  }
  return {
    allowed: true,
    remaining: limit - 1,
    resetIn: windowSeconds
  };
}
__name(checkRateLimit, "checkRateLimit");

// src/app/responses.ts
var SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com data: blob:;"
};
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}
__name(htmlResponse, "htmlResponse");
function redirectResponse(url, status = 302, extraHeaders = {}) {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}
__name(redirectResponse, "redirectResponse");

// src/utils/validation.ts
function isValidUsername(username) {
  if (!username || typeof username !== "string")
    return false;
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}
__name(isValidUsername, "isValidUsername");
function isValidPort(port) {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}
__name(isValidPort, "isValidPort");
function isValidIpv4(ip) {
  if (!ip || typeof ip !== "string")
    return false;
  const parts = ip.split(".");
  if (parts.length !== 4)
    return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part))
      return false;
    const n = Number(part);
    return n >= 0 && n <= 255 && (part === "0" || !part.startsWith("0"));
  });
}
__name(isValidIpv4, "isValidIpv4");
function isValidIpv6(ip) {
  if (!ip || typeof ip !== "string")
    return false;
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip) || ip.includes("::");
}
__name(isValidIpv6, "isValidIpv6");
function isValidDomain(domain2) {
  if (!domain2 || typeof domain2 !== "string")
    return false;
  if (domain2.length > 253)
    return false;
  return /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain2);
}
__name(isValidDomain, "isValidDomain");
function isPrivateIp(ip) {
  if (!isValidIpv4(ip))
    return false;
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10)
    return true;
  if (parts[0] === 127)
    return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    return true;
  if (parts[0] === 192 && parts[1] === 168)
    return true;
  if (parts[0] === 169 && parts[1] === 254)
    return true;
  if (parts[0] === 0)
    return true;
  return false;
}
__name(isPrivateIp, "isPrivateIp");

// src/users/service.ts
var UserService = class {
  constructor(repo) {
    this.repo = repo;
  }
  async listUsers() {
    return this.repo.listUsers();
  }
  async getUser(id) {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new C1Error(ErrorCode.DB_RECORD_NOT_FOUND, `User not found: ${id}`, 404);
    }
    return user;
  }
  async getUserBySubscriptionToken(token) {
    const user = await this.repo.getUserBySubscriptionToken(token);
    if (!user) {
      throw new C1Error(ErrorCode.SUB_TOKEN_INVALID, "Invalid subscription token", 404);
    }
    return user;
  }
  async createUser(input) {
    if (!isValidUsername(input.username)) {
      throw new C1Error(
        ErrorCode.VAL_INVALID_INPUT,
        "Username may contain letters, numbers, _ and - only (3-32 characters)",
        400
      );
    }
    const existing = await this.repo.getUserByUsername(input.username);
    if (existing) {
      throw new C1Error(ErrorCode.DB_RECORD_CONFLICT, `Username already exists: ${input.username}`, 409);
    }
    const subscriptionToken = randomToken(16);
    const vlessUuid = randomUuid();
    const trojanPassword = randomToken(16);
    const shadowsocksPassword = randomToken(16);
    const user = await this.repo.createUser({
      name: input.name || input.username,
      username: input.username,
      enabled: 1,
      subscription_token: subscriptionToken,
      vless_uuid: vlessUuid,
      trojan_password: trojanPassword,
      shadowsocks_password: shadowsocksPassword,
      shadowsocks_method: "aes-128-gcm",
      quota_bytes: input.quota_bytes ?? 0,
      used_bytes: 0,
      daily_quota_bytes: input.daily_quota_bytes ?? 0,
      daily_used_bytes: 0,
      daily_key: "",
      expires_at: input.expires_at ?? null,
      max_ips: input.max_ips ?? 0,
      max_connections: input.max_connections ?? 0,
      clean_ip_mode: input.clean_ip_mode ?? "auto",
      clean_ip: input.clean_ip ?? "",
      notes: input.notes ?? "",
      protocol_vless_enabled: input.protocol_vless_enabled ?? 1,
      protocol_trojan_enabled: input.protocol_trojan_enabled ?? 1,
      protocol_shadowsocks_enabled: input.protocol_shadowsocks_enabled ?? 1,
      last_seen_at: null
    });
    if (input.inbound_ids && input.inbound_ids.length > 0) {
      await this.repo.setUserInbounds(user.id, input.inbound_ids);
    } else {
      const inbounds = await this.repo.listInbounds();
      const enabledIds = inbounds.filter((i) => i.enabled).map((i) => i.id);
      if (enabledIds.length > 0) {
        await this.repo.setUserInbounds(user.id, enabledIds);
      }
    }
    return user;
  }
  async updateUser(id, updates) {
    await this.getUser(id);
    await this.repo.updateUser(id, updates);
  }
  async toggleUser(id, enabled) {
    await this.updateUser(id, { enabled: enabled ? 1 : 0 });
  }
  async resetTraffic(id) {
    await this.getUser(id);
    await this.repo.resetUserTraffic(id);
  }
  async rotateSubscriptionToken(id) {
    await this.getUser(id);
    const newToken = randomToken(16);
    await this.repo.updateUser(id, { subscription_token: newToken });
    return newToken;
  }
  async rotateVlessUuid(id) {
    await this.getUser(id);
    const newUuid = randomUuid();
    await this.repo.updateUser(id, { vless_uuid: newUuid });
    return newUuid;
  }
  async rotateTrojanPassword(id) {
    await this.getUser(id);
    const newPass = randomToken(16);
    await this.repo.updateUser(id, { trojan_password: newPass });
    return newPass;
  }
  async rotateShadowsocksPassword(id) {
    await this.getUser(id);
    const newPass = randomToken(16);
    await this.repo.updateUser(id, { shadowsocks_password: newPass });
    return newPass;
  }
  async deleteUser(id) {
    await this.getUser(id);
    await this.repo.deleteUser(id);
  }
};
__name(UserService, "UserService");

// src/inbounds/model.ts
var DEFAULT_INBOUND_PRESETS = [
  {
    name: "VLESS WS TLS (Edge)",
    protocol: "vless",
    transport: "ws",
    tls_mode: "tls",
    port: 443,
    path_template: "/edge/{token}/vless",
    fingerprint: "chrome",
    allow_udp: 1,
    notes: "Primary VLESS over WebSocket with TLS termination"
  },
  {
    name: "Trojan WS TLS (Edge)",
    protocol: "trojan",
    transport: "ws",
    tls_mode: "tls",
    port: 443,
    path_template: "/edge/{token}/trojan",
    fingerprint: "chrome",
    allow_udp: 1,
    notes: "Trojan protocol over WebSocket with TLS termination"
  },
  {
    name: "Shadowsocks WS TLS (Edge)",
    protocol: "shadowsocks",
    transport: "ws",
    tls_mode: "tls",
    port: 443,
    path_template: "/edge/{token}/ss",
    fingerprint: "chrome",
    allow_udp: 1,
    notes: "Shadowsocks AEAD (AES-128-GCM) over WebSocket with TLS"
  }
];

// src/inbounds/service.ts
var InboundService = class {
  constructor(repo) {
    this.repo = repo;
  }
  async ensureDefaultInbounds(serverHost = "") {
    const existing = await this.repo.listInbounds();
    if (existing.length > 0)
      return;
    for (const preset of DEFAULT_INBOUND_PRESETS) {
      await this.repo.createInbound({
        name: preset.name,
        enabled: 1,
        protocol: preset.protocol,
        transport: preset.transport,
        tls_mode: preset.tls_mode,
        port: preset.port,
        path_template: preset.path_template,
        host: serverHost,
        sni: serverHost,
        fingerprint: preset.fingerprint,
        allow_udp: preset.allow_udp,
        notes: preset.notes
      });
    }
  }
  async listInbounds() {
    return this.repo.listInbounds();
  }
  async getInbound(id) {
    const inbound = await this.repo.getInboundById(id);
    if (!inbound) {
      throw new C1Error(ErrorCode.DB_RECORD_NOT_FOUND, `Inbound profile not found: ${id}`, 404);
    }
    return inbound;
  }
  async createInbound(data) {
    return this.repo.createInbound(data);
  }
  async updateInbound(id, updates) {
    await this.getInbound(id);
    await this.repo.updateInbound(id, updates);
  }
  async deleteInbound(id) {
    await this.repo.deleteInbound(id);
  }
};
__name(InboundService, "InboundService");

// src/transports/websocket/handler.ts
import { connect } from "cloudflare:sockets";

// src/protocols/vless/parser.ts
function parseVlessRequest(data) {
  if (!data || data.length < 26) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet too short", 400);
  }
  const version2 = data[0];
  if (version2 !== 0) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_VERSION, `Unsupported VLESS version: ${version2}`, 400);
  }
  const uuid = bytesToUuid(data, 1);
  const addonLen = data[17];
  let offset = 18 + addonLen;
  if (data.length < offset + 4) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet truncated before command/port", 400);
  }
  const command = data[offset];
  const isTcp = command === 1;
  const isUdp = command === 2;
  if (!isTcp && !isUdp) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_COMMAND, `Unsupported VLESS command: ${command}`, 400);
  }
  const port = readUint16BE(data, offset + 1);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid port: ${port}`, 400);
  }
  const addressType = data[offset + 3];
  offset += 4;
  let host = "";
  let addrTypeStr = "ipv4";
  if (addressType === 1) {
    if (data.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet truncated in IPv4 address", 400);
    }
    host = `${data[offset]}.${data[offset + 1]}.${data[offset + 2]}.${data[offset + 3]}`;
    offset += 4;
    addrTypeStr = "ipv4";
  } else if (addressType === 2) {
    if (data.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet truncated before domain length", 400);
    }
    const domainLen = data[offset];
    offset += 1;
    if (domainLen === 0 || data.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet truncated in domain name", 400);
    }
    host = bytesToString(data.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = "domain";
  } else if (addressType === 3) {
    if (data.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "VLESS packet truncated in IPv6 address", 400);
    }
    const parts = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(data, offset + i).toString(16));
    }
    host = parts.join(":");
    offset += 16;
    addrTypeStr = "ipv6";
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported VLESS address type: ${addressType}`, 400);
  }
  const payload = data.subarray(offset);
  return {
    protocol: "vless",
    credentialId: uuid,
    target: {
      host,
      port,
      addressType: addrTypeStr,
      isUdp
    },
    payload,
    headerLength: offset
  };
}
__name(parseVlessRequest, "parseVlessRequest");
function buildVlessResponseHeader() {
  return new Uint8Array([0, 0]);
}
__name(buildVlessResponseHeader, "buildVlessResponseHeader");

// src/protocols/trojan/parser.ts
function sha224(message) {
  const bytes = typeof message === "string" ? new TextEncoder().encode(message) : message;
  let h0 = 3238371032;
  let h1 = 914150663;
  let h2 = 812702999;
  let h3 = 4144912697;
  let h4 = 4290775857;
  let h5 = 1750603025;
  let h6 = 1694076839;
  let h7 = 3204075428;
  const K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  const len = bytes.length;
  const bitLen = len * 8;
  const k = (56 - (len + 1) % 64 + 64) % 64;
  const totalLen = len + 1 + k + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[len] = 128;
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 4294967296), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);
  const W = new Int32Array(64);
  for (let i = 0; i < totalLen; i += 64) {
    for (let t2 = 0; t2 < 16; t2++) {
      W[t2] = view.getInt32(i + t2 * 4, false);
    }
    for (let t2 = 16; t2 < 64; t2++) {
      const s0 = (W[t2 - 15] >>> 7 | W[t2 - 15] << 25) ^ (W[t2 - 15] >>> 18 | W[t2 - 15] << 14) ^ W[t2 - 15] >>> 3;
      const s1 = (W[t2 - 2] >>> 17 | W[t2 - 2] << 15) ^ (W[t2 - 2] >>> 19 | W[t2 - 2] << 13) ^ W[t2 - 2] >>> 10;
      W[t2] = W[t2 - 16] + s0 + W[t2 - 7] + s1 | 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let t2 = 0; t2 < 64; t2++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f ^ ~e & g;
      const temp1 = h + S1 + ch + K[t2] + W[t2] | 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const temp2 = S0 + maj | 0;
      h = g;
      g = f;
      f = e;
      e = d + temp1 | 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 | 0;
    }
    h0 = h0 + a | 0;
    h1 = h1 + b | 0;
    h2 = h2 + c | 0;
    h3 = h3 + d | 0;
    h4 = h4 + e | 0;
    h5 = h5 + f | 0;
    h6 = h6 + g | 0;
    h7 = h7 + h | 0;
  }
  const result = new Uint8Array(28);
  const outView = new DataView(result.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  return bytesToHex(result);
}
__name(sha224, "sha224");
function parseTrojanRequest(data) {
  if (!data || data.length < 68) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet too short", 400);
  }
  const hexChars = data.subarray(0, 56);
  const passwordHash = bytesToString(hexChars).toLowerCase();
  if (data[56] !== 13 || data[57] !== 10) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Missing CRLF after Trojan password hash", 400);
  }
  const command = data[58];
  const isTcp = command === 1;
  const isUdp = command === 3;
  if (!isTcp && !isUdp) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_COMMAND, `Unsupported Trojan command: ${command}`, 400);
  }
  const addressType = data[59];
  let offset = 60;
  let host = "";
  let addrTypeStr = "ipv4";
  if (addressType === 1) {
    if (data.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet truncated in IPv4 address", 400);
    }
    host = `${data[offset]}.${data[offset + 1]}.${data[offset + 2]}.${data[offset + 3]}`;
    offset += 4;
    addrTypeStr = "ipv4";
  } else if (addressType === 3) {
    if (data.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet truncated before domain length", 400);
    }
    const domainLen = data[offset];
    offset += 1;
    if (domainLen === 0 || data.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet truncated in domain name", 400);
    }
    host = bytesToString(data.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = "domain";
  } else if (addressType === 4) {
    if (data.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet truncated in IPv6 address", 400);
    }
    const parts = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(data, offset + i).toString(16));
    }
    host = parts.join(":");
    offset += 16;
    addrTypeStr = "ipv6";
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported Trojan address type: ${addressType}`, 400);
  }
  if (data.length < offset + 2) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Trojan packet truncated before port", 400);
  }
  const port = readUint16BE(data, offset);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid port: ${port}`, 400);
  }
  offset += 2;
  if (data.length < offset + 2 || data[offset] !== 13 || data[offset + 1] !== 10) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Missing final CRLF in Trojan header", 400);
  }
  offset += 2;
  const payload = data.subarray(offset);
  return {
    protocol: "trojan",
    credentialId: passwordHash,
    target: {
      host,
      port,
      addressType: addrTypeStr,
      isUdp
    },
    payload,
    headerLength: offset
  };
}
__name(parseTrojanRequest, "parseTrojanRequest");

// src/protocols/shadowsocks/crypto.ts
var CIPHER_SPECS = {
  "aes-128-gcm": { keySize: 16, saltSize: 16, tagSize: 16, nonceSize: 12 },
  "aes-256-gcm": { keySize: 32, saltSize: 32, tagSize: 16, nonceSize: 12 }
};
async function deriveMasterKey(password, keySize) {
  const hash = await crypto.subtle.digest("SHA-256", stringToBytes(password));
  return new Uint8Array(hash).subarray(0, keySize);
}
__name(deriveMasterKey, "deriveMasterKey");
async function deriveSubkey(masterKey, salt, keySize) {
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    masterKey,
    "HKDF",
    false,
    ["deriveBits", "deriveKey"]
  );
  const subkeyBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-1",
      salt,
      info: stringToBytes("ss-subkey")
    },
    hkdfKey,
    keySize * 8
  );
  return crypto.subtle.importKey(
    "raw",
    subkeyBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}
__name(deriveSubkey, "deriveSubkey");
function incrementNonce(nonce) {
  for (let i = 0; i < nonce.length; i++) {
    nonce[i] = nonce[i] + 1 & 255;
    if (nonce[i] !== 0) {
      break;
    }
  }
}
__name(incrementNonce, "incrementNonce");

// src/protocols/shadowsocks/parser.ts
async function decryptAndParseShadowsocksRequest(data, password, method = "aes-128-gcm") {
  const spec = CIPHER_SPECS[method];
  if (!spec) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Unsupported Shadowsocks method: ${method}`, 400);
  }
  const minSize = spec.saltSize + 2 + spec.tagSize + 7 + spec.tagSize;
  if (!data || data.length < minSize) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Shadowsocks packet too short", 400);
  }
  const salt = data.subarray(0, spec.saltSize);
  const masterKey = await deriveMasterKey(password, spec.keySize);
  const subkey = await deriveSubkey(masterKey, salt, spec.keySize);
  const nonce = new Uint8Array(spec.nonceSize);
  const lenChunk = data.subarray(spec.saltSize, spec.saltSize + 2 + spec.tagSize);
  let decryptedLenBytes;
  try {
    decryptedLenBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce, tagLength: spec.tagSize * 8 },
      subkey,
      lenChunk
    );
  } catch {
    throw new C1Error(ErrorCode.PROTO_AUTH_FAILED, "Failed to decrypt Shadowsocks length header", 401);
  }
  incrementNonce(nonce);
  const lenView = new DataView(decryptedLenBytes);
  const payloadLen = lenView.getUint16(0, false);
  if (payloadLen > 16383 || payloadLen < 7) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid Shadowsocks payload length: ${payloadLen}`, 400);
  }
  const payloadStart = spec.saltSize + 2 + spec.tagSize;
  const payloadEnd = payloadStart + payloadLen + spec.tagSize;
  if (data.length < payloadEnd) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Shadowsocks packet truncated before payload end", 400);
  }
  const payloadChunk = data.subarray(payloadStart, payloadEnd);
  let decryptedPayload;
  try {
    decryptedPayload = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce, tagLength: spec.tagSize * 8 },
      subkey,
      payloadChunk
    );
  } catch {
    throw new C1Error(ErrorCode.PROTO_AUTH_FAILED, "Failed to decrypt Shadowsocks payload", 401);
  }
  incrementNonce(nonce);
  const decBytes = new Uint8Array(decryptedPayload);
  const addrType = decBytes[0];
  let offset = 1;
  let host = "";
  let addrTypeStr = "ipv4";
  if (addrType === 1) {
    if (decBytes.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Truncated SOCKS5 IPv4 address", 400);
    }
    host = `${decBytes[offset]}.${decBytes[offset + 1]}.${decBytes[offset + 2]}.${decBytes[offset + 3]}`;
    offset += 4;
    addrTypeStr = "ipv4";
  } else if (addrType === 3) {
    if (decBytes.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Truncated SOCKS5 domain length", 400);
    }
    const domainLen = decBytes[offset];
    offset += 1;
    if (domainLen === 0 || decBytes.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Truncated SOCKS5 domain", 400);
    }
    host = bytesToString(decBytes.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = "domain";
  } else if (addrType === 4) {
    if (decBytes.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Truncated SOCKS5 IPv6", 400);
    }
    const parts = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(decBytes, offset + i).toString(16));
    }
    host = parts.join(":");
    offset += 16;
    addrTypeStr = "ipv6";
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported SOCKS5 address type: ${addrType}`, 400);
  }
  if (decBytes.length < offset + 2) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, "Truncated SOCKS5 port", 400);
  }
  const port = readUint16BE(decBytes, offset);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid SOCKS5 port: ${port}`, 400);
  }
  offset += 2;
  const clientPayload = decBytes.subarray(offset);
  return {
    protocol: "shadowsocks",
    credentialId: password,
    target: {
      host,
      port,
      addressType: addrTypeStr,
      isUdp: false
    },
    payload: clientPayload,
    headerLength: payloadEnd
  };
}
__name(decryptAndParseShadowsocksRequest, "decryptAndParseShadowsocksRequest");

// src/routing/target-policy.ts
var BLOCKED_PORTS = /* @__PURE__ */ new Set([25, 465, 587]);
function validateOutboundTarget(host, port) {
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Invalid target port: ${port}`, 400);
  }
  if (BLOCKED_PORTS.has(port)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Port ${port} is blocked by policy`, 403);
  }
  if (isValidIpv4(host)) {
    if (isPrivateIp(host)) {
      throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Connection to private IP ${host} is forbidden`, 403);
    }
  } else if (isValidDomain(host)) {
    const lower = host.toLowerCase();
    if (lower === "localhost" || lower.endsWith(".local") || lower.endsWith(".internal") || lower.endsWith(".onion")) {
      throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Target domain ${host} is disallowed`, 403);
    }
  } else if (!isValidIpv6(host)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Invalid target host: ${host}`, 400);
  }
}
__name(validateOutboundTarget, "validateOutboundTarget");

// src/users/policy.ts
function evaluateUserPolicy(user, protocol) {
  if (!user.enabled) {
    return { allowed: false, reason: "User account is disabled", code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (protocol === "vless" && !user.protocol_vless_enabled) {
    return { allowed: false, reason: "VLESS protocol disabled for this user", code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (protocol === "trojan" && !user.protocol_trojan_enabled) {
    return { allowed: false, reason: "Trojan protocol disabled for this user", code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (protocol === "shadowsocks" && !user.protocol_shadowsocks_enabled) {
    return { allowed: false, reason: "Shadowsocks protocol disabled for this user", code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (user.expires_at) {
    const expiryTime = new Date(user.expires_at).getTime();
    if (expiryTime <= Date.now()) {
      return { allowed: false, reason: "User account has expired", code: ErrorCode.PROTO_EXPIRED };
    }
  }
  if (user.quota_bytes > 0 && user.used_bytes >= user.quota_bytes) {
    return { allowed: false, reason: "User bandwidth quota exceeded", code: ErrorCode.PROTO_QUOTA_EXCEEDED };
  }
  if (user.daily_quota_bytes > 0) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    if (user.daily_key === today && user.daily_used_bytes >= user.daily_quota_bytes) {
      return { allowed: false, reason: "User daily bandwidth quota exceeded", code: ErrorCode.PROTO_QUOTA_EXCEEDED };
    }
  }
  return { allowed: true };
}
__name(evaluateUserPolicy, "evaluateUserPolicy");
async function checkAndRecordClientIp(kv, userId, clientIp, maxIps) {
  if (!kv || maxIps <= 0 || !clientIp) {
    return { allowed: true };
  }
  const now = Math.floor(Date.now() / 1e3);
  const ttlWindow = 120;
  const key = `user_ips:${userId}`;
  try {
    const dataStr = await kv.get(key);
    let ipList = [];
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      ipList = parsed.filter((item) => now - item.lastSeen < ttlWindow);
    }
    const existingIndex = ipList.findIndex((item) => item.ip === clientIp);
    if (existingIndex > -1) {
      ipList[existingIndex].lastSeen = now;
    } else {
      if (ipList.length >= maxIps) {
        return {
          allowed: false,
          reason: `Maximum concurrent IP limit (${maxIps}) reached for this user`,
          code: ErrorCode.PROTO_IP_LIMIT_EXCEEDED
        };
      }
      ipList.push({ ip: clientIp, lastSeen: now });
    }
    await kv.put(key, JSON.stringify(ipList), { expirationTtl: 180 });
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
__name(checkAndRecordClientIp, "checkAndRecordClientIp");

// src/transports/websocket/stream.ts
var StreamAccounting = class {
  constructor(threshold = 1024 * 1024, onFlushCallback) {
    this.threshold = threshold;
    this.onFlushCallback = onFlushCallback;
  }
  pendingUpload = 0;
  pendingDownload = 0;
  totalUpload = 0;
  totalDownload = 0;
  isFlushing = false;
  addUpload(bytes) {
    this.pendingUpload += bytes;
    this.totalUpload += bytes;
    if (this.pendingUpload + this.pendingDownload >= this.threshold) {
      this.triggerFlush();
    }
  }
  addDownload(bytes) {
    this.pendingDownload += bytes;
    this.totalDownload += bytes;
    if (this.pendingUpload + this.pendingDownload >= this.threshold) {
      this.triggerFlush();
    }
  }
  async flush() {
    const up = this.pendingUpload;
    const down = this.pendingDownload;
    if (up === 0 && down === 0)
      return;
    this.pendingUpload = 0;
    this.pendingDownload = 0;
    try {
      await this.onFlushCallback(up, down);
    } catch {
      this.pendingUpload += up;
      this.pendingDownload += down;
    }
  }
  triggerFlush() {
    if (this.isFlushing)
      return;
    this.isFlushing = true;
    Promise.resolve(this.flush()).finally(() => {
      this.isFlushing = false;
    });
  }
  getTotals() {
    return { upload: this.totalUpload, download: this.totalDownload };
  }
};
__name(StreamAccounting, "StreamAccounting");
async function pipeSocketToWebSocket(reader, ws, accounting, initialPrefix) {
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
  } finally {
    try {
      reader.releaseLock();
    } catch {
    }
    try {
      ws.close(1e3, "Stream ended");
    } catch {
    }
  }
}
__name(pipeSocketToWebSocket, "pipeSocketToWebSocket");

// src/transports/websocket/handler.ts
async function handleWebSocketUpgrade(request, protocolName, env2) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }
  const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const webSocketPair = new WebSocketPair();
  const [clientWs, serverWs] = Object.values(webSocketPair);
  serverWs.accept();
  processWebSocketSession(serverWs, protocolName, clientIp, env2).catch((err) => {
    console.error(`[C1-DATA] Session error:`, err);
    try {
      serverWs.close(1011, "Internal error");
    } catch {
    }
  });
  return new Response(null, {
    status: 101,
    webSocket: clientWs,
    headers: {
      "Sec-WebSocket-Protocol": request.headers.get("Sec-WebSocket-Protocol") || ""
    }
  });
}
__name(handleWebSocketUpgrade, "handleWebSocketUpgrade");
async function processWebSocketSession(ws, protocolName, clientIp, env2) {
  const repo = new C1Repository(env2.DB);
  const firstMessage = await new Promise((resolve) => {
    const onMessage = /* @__PURE__ */ __name((event) => {
      ws.removeEventListener("message", onMessage);
      if (event.data instanceof ArrayBuffer) {
        resolve(new Uint8Array(event.data));
      } else if (event.data instanceof Uint8Array) {
        resolve(event.data);
      } else {
        resolve(null);
      }
    }, "onMessage");
    ws.addEventListener("message", onMessage);
    setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      resolve(null);
    }, 1e4);
  });
  if (!firstMessage) {
    ws.close(1002, "Handshake timeout or invalid payload");
    return;
  }
  let parsed;
  if (protocolName === "vless") {
    parsed = parseVlessRequest(firstMessage);
    const user = await repo.getUserByVlessUuid(parsed.credentialId);
    if (!user) {
      ws.close(1008, "Unauthorized: Unknown VLESS UUID");
      return;
    }
    const policy = evaluateUserPolicy(user, "vless");
    if (!policy.allowed) {
      ws.close(1008, policy.reason || "Account policy violation");
      return;
    }
    const ipPolicy = await checkAndRecordClientIp(env2.KV, user.id, clientIp, user.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || "IP limit exceeded");
      return;
    }
    validateOutboundTarget(parsed.target.host, parsed.target.port);
    await forwardConnection(ws, parsed, user.id, repo, buildVlessResponseHeader());
  } else if (protocolName === "trojan") {
    parsed = parseTrojanRequest(firstMessage);
    const users = await repo.listUsers();
    const user = users.find((u) => sha224(u.trojan_password).toLowerCase() === parsed.credentialId.toLowerCase());
    if (!user) {
      ws.close(1008, "Unauthorized: Invalid Trojan password");
      return;
    }
    const policy = evaluateUserPolicy(user, "trojan");
    if (!policy.allowed) {
      ws.close(1008, policy.reason || "Account policy violation");
      return;
    }
    const ipPolicy = await checkAndRecordClientIp(env2.KV, user.id, clientIp, user.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || "IP limit exceeded");
      return;
    }
    validateOutboundTarget(parsed.target.host, parsed.target.port);
    await forwardConnection(ws, parsed, user.id, repo);
  } else if (protocolName === "shadowsocks") {
    const users = await repo.listUsers();
    let authenticatedUser = null;
    let ssParsed = null;
    for (const u of users) {
      if (!u.enabled || !u.protocol_shadowsocks_enabled)
        continue;
      try {
        ssParsed = await decryptAndParseShadowsocksRequest(firstMessage, u.shadowsocks_password, u.shadowsocks_method);
        authenticatedUser = u;
        break;
      } catch {
      }
    }
    if (!authenticatedUser || !ssParsed) {
      ws.close(1008, "Unauthorized: Invalid Shadowsocks credentials");
      return;
    }
    const policy = evaluateUserPolicy(authenticatedUser, "shadowsocks");
    if (!policy.allowed) {
      ws.close(1008, policy.reason || "Account policy violation");
      return;
    }
    const ipPolicy = await checkAndRecordClientIp(env2.KV, authenticatedUser.id, clientIp, authenticatedUser.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || "IP limit exceeded");
      return;
    }
    validateOutboundTarget(ssParsed.target.host, ssParsed.target.port);
    await forwardConnection(ws, ssParsed, authenticatedUser.id, repo);
  }
}
__name(processWebSocketSession, "processWebSocketSession");
async function forwardConnection(ws, req, userId, repo, responsePrefix) {
  const socket = connect({
    hostname: req.target.host,
    port: req.target.port
  });
  const accounting = new StreamAccounting(1024 * 1024, async (up, down) => {
    try {
      await repo.incrementUserUsage(userId, up + down);
    } catch (e) {
      console.error("[C1-ACCOUNTING] Failed to increment usage:", e);
    }
  });
  const writer = socket.writable.getWriter();
  if (req.payload && req.payload.length > 0) {
    await writer.write(req.payload);
    accounting.addUpload(req.payload.byteLength);
  }
  ws.addEventListener("message", async (event) => {
    try {
      let data;
      if (event.data instanceof ArrayBuffer) {
        data = new Uint8Array(event.data);
      } else if (event.data instanceof Uint8Array) {
        data = event.data;
      } else {
        return;
      }
      await writer.write(data);
      accounting.addUpload(data.byteLength);
    } catch {
      try {
        ws.close(1011, "Socket write error");
      } catch {
      }
    }
  });
  ws.addEventListener("close", async () => {
    try {
      await accounting.flush();
      await writer.close();
    } catch {
    }
  });
  const reader = socket.readable.getReader();
  await pipeSocketToWebSocket(reader, ws, accounting, responsePrefix);
  await accounting.flush();
}
__name(forwardConnection, "forwardConnection");

// src/subscriptions/uri.ts
function buildNodeName(user, inbound, suffix = "") {
  const parts = ["C1", user.name || user.username, inbound.name];
  if (suffix) {
    parts.push(suffix);
  }
  return parts.join(" - ");
}
__name(buildNodeName, "buildNodeName");
function resolveInboundPath(template, token) {
  return template.replace("{token}", token);
}
__name(resolveInboundPath, "resolveInboundPath");
function buildVlessUri(options) {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const sni = inbound.sni || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : "");
  const params = new URLSearchParams();
  params.set("type", "ws");
  params.set("security", inbound.tls_mode === "tls" ? "tls" : "none");
  params.set("path", path);
  if (host)
    params.set("host", host);
  if (sni)
    params.set("sni", sni);
  if (inbound.fingerprint)
    params.set("fp", inbound.fingerprint);
  return `vless://${user.vless_uuid}@${address}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`;
}
__name(buildVlessUri, "buildVlessUri");
function buildTrojanUri(options) {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const sni = inbound.sni || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : "");
  const params = new URLSearchParams();
  params.set("type", "ws");
  params.set("security", inbound.tls_mode === "tls" ? "tls" : "none");
  params.set("path", path);
  if (host)
    params.set("host", host);
  if (sni)
    params.set("sni", sni);
  if (inbound.fingerprint)
    params.set("fp", inbound.fingerprint);
  return `trojan://${user.trojan_password}@${address}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`;
}
__name(buildTrojanUri, "buildTrojanUri");
function buildShadowsocksUri(options) {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : "");
  const userInfo = `${user.shadowsocks_method}:${user.shadowsocks_password}`;
  const userB64 = bytesToBase64(stringToBytes(userInfo)).replace(/=/g, "");
  const pluginOpts = `v2ray-plugin;tls;mode=websocket;path=${path};host=${host}`;
  return `ss://${userB64}@${address}:${port}?plugin=${encodeURIComponent(pluginOpts)}#${encodeURIComponent(nodeName)}`;
}
__name(buildShadowsocksUri, "buildShadowsocksUri");

// src/subscriptions/raw.ts
function generateRawSubscription(nodeOptions) {
  const lines = [];
  for (const opt of nodeOptions) {
    const proto = opt.inbound.protocol;
    if (proto === "vless" && opt.user.protocol_vless_enabled) {
      lines.push(buildVlessUri(opt));
    } else if (proto === "trojan" && opt.user.protocol_trojan_enabled) {
      lines.push(buildTrojanUri(opt));
    } else if (proto === "shadowsocks" && opt.user.protocol_shadowsocks_enabled) {
      lines.push(buildShadowsocksUri(opt));
    }
  }
  return lines.join("\n");
}
__name(generateRawSubscription, "generateRawSubscription");

// src/subscriptions/base64.ts
function generateBase64Subscription(nodeOptions) {
  const raw = generateRawSubscription(nodeOptions);
  return bytesToBase64(stringToBytes(raw));
}
__name(generateBase64Subscription, "generateBase64Subscription");

// src/subscriptions/clash.ts
function generateClashSubscription(nodeOptions) {
  const proxies = [];
  const proxyNames = [];
  for (const opt of nodeOptions) {
    const { user, inbound, serverHost, cleanIp, customName } = opt;
    const name = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : "");
    const server = cleanIp || inbound.host || serverHost;
    const port = inbound.port || 443;
    const host = inbound.host || serverHost;
    const path = resolveInboundPath(inbound.path_template, user.subscription_token);
    if (inbound.protocol === "vless" && user.protocol_vless_enabled) {
      proxies.push({
        name,
        type: "vless",
        server,
        port,
        uuid: user.vless_uuid,
        network: "ws",
        tls: inbound.tls_mode === "tls",
        udp: inbound.allow_udp === 1,
        servername: inbound.sni || host,
        "client-fingerprint": inbound.fingerprint || "chrome",
        "ws-opts": {
          path,
          headers: {
            Host: host
          }
        }
      });
      proxyNames.push(name);
    } else if (inbound.protocol === "trojan" && user.protocol_trojan_enabled) {
      proxies.push({
        name,
        type: "trojan",
        server,
        port,
        password: user.trojan_password,
        network: "ws",
        sni: inbound.sni || host,
        udp: inbound.allow_udp === 1,
        "client-fingerprint": inbound.fingerprint || "chrome",
        "ws-opts": {
          path,
          headers: {
            Host: host
          }
        }
      });
      proxyNames.push(name);
    } else if (inbound.protocol === "shadowsocks" && user.protocol_shadowsocks_enabled) {
      proxies.push({
        name,
        type: "ss",
        server,
        port,
        cipher: user.shadowsocks_method,
        password: user.shadowsocks_password,
        plugin: "v2ray-plugin",
        "plugin-opts": {
          mode: "websocket",
          tls: true,
          host,
          path
        }
      });
      proxyNames.push(name);
    }
  }
  if (proxyNames.length === 0) {
    proxyNames.push("DIRECT");
  }
  return formatClashYaml(proxies, proxyNames);
}
__name(generateClashSubscription, "generateClashSubscription");
function formatClashYaml(proxies, proxyNames) {
  const lines = [
    "# C1 Proxy Generated Clash Meta / Mihomo Profile",
    "port: 7890",
    "socks-port: 7891",
    "allow-lan: true",
    "mode: rule",
    "log-level: info",
    "external-controller: 127.0.0.1:9090",
    "",
    "proxies:"
  ];
  for (const p of proxies) {
    lines.push(`  - name: "${escapeYaml(p.name)}"`);
    lines.push(`    type: ${p.type}`);
    lines.push(`    server: ${p.server}`);
    lines.push(`    port: ${p.port}`);
    if (p.uuid)
      lines.push(`    uuid: ${p.uuid}`);
    if (p.password)
      lines.push(`    password: "${escapeYaml(p.password)}"`);
    if (p.cipher)
      lines.push(`    cipher: ${p.cipher}`);
    if (p.network)
      lines.push(`    network: ${p.network}`);
    if (p.tls !== void 0)
      lines.push(`    tls: ${p.tls}`);
    if (p.udp !== void 0)
      lines.push(`    udp: ${p.udp}`);
    if (p.servername)
      lines.push(`    servername: ${p.servername}`);
    if (p.sni)
      lines.push(`    sni: ${p.sni}`);
    if (p["client-fingerprint"])
      lines.push(`    client-fingerprint: ${p["client-fingerprint"]}`);
    if (p["ws-opts"]) {
      const ws = p["ws-opts"];
      lines.push("    ws-opts:");
      lines.push(`      path: "${escapeYaml(ws.path)}"`);
      lines.push("      headers:");
      for (const [k, v] of Object.entries(ws.headers)) {
        lines.push(`        ${k}: "${escapeYaml(v)}"`);
      }
    }
    if (p.plugin) {
      lines.push(`    plugin: ${p.plugin}`);
      if (p["plugin-opts"]) {
        const po = p["plugin-opts"];
        lines.push("    plugin-opts:");
        for (const [k, v] of Object.entries(po)) {
          lines.push(`      ${k}: ${typeof v === "boolean" ? v : `"${escapeYaml(String(v))}"`}`);
        }
      }
    }
  }
  lines.push("");
  lines.push("proxy-groups:");
  lines.push("  - name: C1-SELECT");
  lines.push("    type: select");
  lines.push("    proxies:");
  lines.push("      - C1-AUTO");
  for (const name of proxyNames) {
    lines.push(`      - "${escapeYaml(name)}"`);
  }
  lines.push("  - name: C1-AUTO");
  lines.push("    type: url-test");
  lines.push("    url: http://www.gstatic.com/generate_204");
  lines.push("    interval: 300");
  lines.push("    tolerance: 50");
  lines.push("    proxies:");
  for (const name of proxyNames) {
    lines.push(`      - "${escapeYaml(name)}"`);
  }
  lines.push("");
  lines.push("rules:");
  lines.push("  - GEOIP,LAN,DIRECT");
  lines.push("  - MATCH,C1-SELECT");
  return lines.join("\n");
}
__name(formatClashYaml, "formatClashYaml");
function escapeYaml(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
__name(escapeYaml, "escapeYaml");

// src/subscriptions/singbox.ts
function generateSingboxSubscription(nodeOptions) {
  const outbounds = [];
  const nodeTags = [];
  for (const opt of nodeOptions) {
    const { user, inbound, serverHost, cleanIp, customName } = opt;
    const tag = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : "");
    const server = cleanIp || inbound.host || serverHost;
    const server_port = inbound.port || 443;
    const host = inbound.host || serverHost;
    const path = resolveInboundPath(inbound.path_template, user.subscription_token);
    if (inbound.protocol === "vless" && user.protocol_vless_enabled) {
      outbounds.push({
        type: "vless",
        tag,
        server,
        server_port,
        uuid: user.vless_uuid,
        flow: "",
        packet_encoding: "xudp",
        tls: {
          enabled: inbound.tls_mode === "tls",
          server_name: inbound.sni || host,
          insecure: false,
          utls: {
            enabled: true,
            fingerprint: inbound.fingerprint || "chrome"
          }
        },
        transport: {
          type: "ws",
          path,
          headers: {
            Host: host
          }
        }
      });
      nodeTags.push(tag);
    } else if (inbound.protocol === "trojan" && user.protocol_trojan_enabled) {
      outbounds.push({
        type: "trojan",
        tag,
        server,
        server_port,
        password: user.trojan_password,
        tls: {
          enabled: inbound.tls_mode === "tls",
          server_name: inbound.sni || host,
          insecure: false,
          utls: {
            enabled: true,
            fingerprint: inbound.fingerprint || "chrome"
          }
        },
        transport: {
          type: "ws",
          path,
          headers: {
            Host: host
          }
        }
      });
      nodeTags.push(tag);
    } else if (inbound.protocol === "shadowsocks" && user.protocol_shadowsocks_enabled) {
      outbounds.push({
        type: "shadowsocks",
        tag,
        server,
        server_port,
        method: user.shadowsocks_method,
        password: user.shadowsocks_password,
        plugin: "v2ray-plugin",
        plugin_opts: `tls;mode=websocket;path=${path};host=${host}`
      });
      nodeTags.push(tag);
    }
  }
  const config2 = {
    version: 1,
    outbounds: [
      {
        type: "selector",
        tag: "select",
        outbounds: ["auto", ...nodeTags, "direct"],
        default: "auto"
      },
      {
        type: "urltest",
        tag: "auto",
        outbounds: [...nodeTags],
        url: "http://www.gstatic.com/generate_204",
        interval: "3m",
        tolerance: 50
      },
      ...outbounds,
      {
        type: "direct",
        tag: "direct"
      },
      {
        type: "block",
        tag: "block"
      }
    ]
  };
  return JSON.stringify(config2, null, 2);
}
__name(generateSingboxSubscription, "generateSingboxSubscription");

// src/subscriptions/karing.ts
function generateKaringSubscription(nodeOptions) {
  return generateBase64Subscription(nodeOptions);
}
__name(generateKaringSubscription, "generateKaringSubscription");

// src/subscriptions/auto.ts
function detectSubscriptionFormat(request) {
  const url = new URL(request.url);
  const explicitFormat = url.searchParams.get("format")?.toLowerCase();
  if (explicitFormat && ["base64", "raw", "clash", "mihomo", "singbox", "karing"].includes(explicitFormat)) {
    return explicitFormat;
  }
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  if (ua.includes("clash") || ua.includes("mihomo") || ua.includes("meta")) {
    return "clash";
  }
  if (ua.includes("sing-box") || ua.includes("singbox")) {
    return "singbox";
  }
  if (ua.includes("karing")) {
    return "karing";
  }
  return "base64";
}
__name(detectSubscriptionFormat, "detectSubscriptionFormat");
function buildSubscriptionResponse(user, nodeOptions, format) {
  let content = "";
  let contentType = "text/plain; charset=utf-8";
  let filename = `c1-${user.username}.txt`;
  if (format === "raw") {
    content = generateRawSubscription(nodeOptions);
    contentType = "text/plain; charset=utf-8";
  } else if (format === "clash" || format === "mihomo") {
    content = generateClashSubscription(nodeOptions);
    contentType = "text/yaml; charset=utf-8";
    filename = `c1-${user.username}.yaml`;
  } else if (format === "singbox") {
    content = generateSingboxSubscription(nodeOptions);
    contentType = "application/json; charset=utf-8";
    filename = `c1-${user.username}.json`;
  } else if (format === "karing") {
    content = generateKaringSubscription(nodeOptions);
    contentType = "text/plain; charset=utf-8";
  } else {
    content = generateBase64Subscription(nodeOptions);
    contentType = "text/plain; charset=utf-8";
  }
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Profile-Update-Interval", "24");
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  const expireEpoch = user.expires_at ? Math.floor(new Date(user.expires_at).getTime() / 1e3) : 0;
  headers.set(
    "Subscription-Userinfo",
    `upload=0; download=${user.used_bytes}; total=${user.quota_bytes}; expire=${expireEpoch}`
  );
  return new Response(content, { status: 200, headers });
}
__name(buildSubscriptionResponse, "buildSubscriptionResponse");

// src/routing/clean-ip.ts
var DEFAULT_CLEAN_IPS = [
  "104.16.132.229",
  "104.16.133.229",
  "104.17.157.100",
  "104.18.2.161",
  "172.64.155.209",
  "172.67.74.152"
];
function resolveCleanIpCandidates(user, globalCleanIps = [], radarIps = []) {
  if (user.clean_ip_mode === "manual" && user.clean_ip) {
    return user.clean_ip.split(/[\r\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  }
  if (user.clean_ip_mode === "radar" && radarIps.length > 0) {
    return radarIps.slice(0, 3);
  }
  if (globalCleanIps.length > 0) {
    return globalCleanIps.slice(0, 3);
  }
  return DEFAULT_CLEAN_IPS.slice(0, 2);
}
__name(resolveCleanIpCandidates, "resolveCleanIpCandidates");
function generateAllNodeOptions(user, inbounds, serverHost, cleanIps) {
  const options = [];
  for (const inbound of inbounds) {
    if (!inbound.enabled)
      continue;
    options.push({
      user,
      inbound,
      serverHost
    });
    for (let i = 0; i < cleanIps.length; i++) {
      const ip = cleanIps[i];
      options.push({
        user,
        inbound,
        serverHost,
        cleanIp: ip,
        customName: `C1 - ${user.name || user.username} - ${inbound.name} - Clean ${String(i + 1).padStart(2, "0")}`
      });
    }
  }
  return options;
}
__name(generateAllNodeOptions, "generateAllNodeOptions");

// src/radar/candidates.ts
var RADAR_CANDIDATE_POOLS = [
  "104.16.132.229",
  "104.16.133.229",
  "104.17.157.100",
  "104.17.158.100",
  "104.18.2.161",
  "104.18.3.161",
  "104.19.143.20",
  "104.19.144.20",
  "104.20.73.18",
  "104.20.74.18",
  "104.21.32.1",
  "104.22.6.22",
  "104.24.100.1",
  "104.25.100.1",
  "104.26.10.1",
  "104.27.150.1",
  "104.28.1.1",
  "172.64.155.209",
  "172.64.156.209",
  "172.67.74.152",
  "172.67.75.152",
  "162.159.138.6",
  "162.159.139.6",
  "198.41.214.162",
  "198.41.215.162"
];

// src/telemetry/redaction.ts
var SENSITIVE_KEYS = /* @__PURE__ */ new Set([
  "password",
  "password_hash",
  "salt",
  "trojan_password",
  "shadowsocks_password",
  "session_secret",
  "secret",
  "api_token",
  "cf_token",
  "claim_token",
  "token"
]);
function redactSensitiveObject(obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      result[key] = "[REDACTED]";
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      result[key] = redactSensitiveObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
__name(redactSensitiveObject, "redactSensitiveObject");
function sanitizeUserForResponse(user) {
  const sanitized = { ...user };
  delete sanitized.password_hash;
  delete sanitized.salt;
  return sanitized;
}
__name(sanitizeUserForResponse, "sanitizeUserForResponse");

// src/telemetry/audit.ts
async function recordAudit(repo, action, actor, details, ip = "") {
  const safeDetails = redactSensitiveObject(details);
  try {
    await repo.createAuditLog(action, actor, safeDetails, ip);
  } catch (e) {
    console.error("[C1-AUDIT] Failed to record audit log:", e);
  }
}
__name(recordAudit, "recordAudit");

// src/i18n/en.ts
var en = {
  brand: "C1 Proxy",
  brand_control: "C1 Control",
  edge_online: "EDGE ONLINE",
  edge_offline: "EDGE OFFLINE",
  // Navigation
  nav_overview: "Overview",
  nav_users: "Users",
  nav_inbounds: "Inbounds",
  nav_radar: "C1 Radar",
  nav_routing: "Routing",
  nav_subscriptions: "Subscriptions",
  nav_settings: "Settings",
  nav_logout: "Logout",
  // Metrics & Status
  users_count: "Total Users",
  active_users: "Active Users",
  traffic_used: "Bandwidth Used",
  system_health: "System Health",
  protocols: "Protocols",
  recent_activity: "Recent Activity",
  // System Health
  worker_status: "Cloudflare Worker",
  d1_status: "D1 Database",
  kv_status: "KV Cache",
  migrations_status: "Schema Migrations",
  healthy: "Healthy",
  current: "Current",
  degraded: "Degraded",
  // Users Page
  add_user: "Add User",
  search_users: "Search users...",
  all_status: "All Status",
  status_active: "Active",
  status_disabled: "Disabled",
  status_expired: "Expired",
  user_name: "Name",
  username: "Username",
  traffic: "Traffic",
  expires: "Expires",
  actions: "Actions",
  manage: "Manage",
  quick_copy_sub: "Copy Subscription",
  never_expires: "Never",
  // User Detail
  user_overview: "User Overview",
  credentials: "Credentials",
  direct_connections: "Direct Connections",
  universal_subscription: "Universal Subscription",
  copy_uri: "Copy URI",
  show_qr: "QR Code",
  rotate_token: "Rotate Sub Token",
  rotate_vless: "Rotate VLESS UUID",
  rotate_trojan: "Rotate Trojan Password",
  rotate_ss: "Rotate Shadowsocks Password",
  reset_traffic: "Reset Traffic",
  disable_user: "Disable Account",
  enable_user: "Enable Account",
  delete_user: "Delete User",
  copied: "Copied to clipboard!",
  // Inbounds
  add_inbound: "Add Inbound",
  inbound_name: "Name",
  protocol: "Protocol",
  port: "Port",
  transport: "Transport",
  tls: "TLS",
  // Radar
  radar_title: "C1 Radar",
  radar_desc: "Scan Cloudflare edge IP endpoints directly from your browser to find the lowest latency paths.",
  run_radar: "Start Radar Scan",
  stop_radar: "Stop Scan",
  clear_results: "Clear Results",
  apply_global: "Apply Globally",
  apply_to_user: "Apply to User",
  ip_address: "IP Address",
  latency: "Latency",
  status: "Status",
  candidates_scanned: "Scanning candidates...",
  // Settings
  general_settings: "General",
  security_settings: "Security",
  appearance: "Appearance",
  backup_restore: "Backup & Restore",
  save_changes: "Save Changes",
  download_backup: "Download Backup",
  upload_restore: "Restore from File",
  // Install
  install_title: "First-Time Installation",
  install_subtitle: "Set up the initial administrator account to claim this C1 Proxy instance.",
  admin_username: "Admin Username",
  admin_password: "Admin Password",
  confirm_password: "Confirm Password",
  claim_token_optional: "Claim Token (Optional)",
  create_admin_btn: "Complete Setup & Launch"
};

// src/i18n/fa.ts
var fa = {
  brand: "\u067E\u0631\u0648\u06A9\u0633\u06CC C1",
  brand_control: "\u06A9\u0646\u062A\u0631\u0644 \u067E\u0646\u0644 C1",
  edge_online: "\u0633\u0631\u0648\u0631 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A",
  edge_offline: "\u0633\u0631\u0648\u0631 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  // Navigation
  nav_overview: "\u062F\u0627\u0634\u0628\u0648\u0631\u062F",
  nav_users: "\u06A9\u0627\u0631\u0628\u0631\u0627\u0646",
  nav_inbounds: "\u0627\u06CC\u0646\u0628\u0627\u0646\u062F\u0647\u0627",
  nav_radar: "\u0631\u0627\u062F\u0627\u0631 C1",
  nav_routing: "\u0645\u0633\u06CC\u0631\u06CC\u0627\u0628\u06CC",
  nav_subscriptions: "\u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627",
  nav_settings: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A",
  nav_logout: "\u062E\u0631\u0648\u062C",
  // Metrics & Status
  users_count: "\u06A9\u0644 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646",
  active_users: "\u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644",
  traffic_used: "\u062A\u0631\u0627\u0641\u06CC\u06A9 \u0645\u0635\u0631\u0641\u06CC",
  system_health: "\u0633\u0644\u0627\u0645\u062A \u0633\u0627\u0645\u0627\u0646\u0647",
  protocols: "\u067E\u0631\u0648\u062A\u06A9\u0644\u200C\u0647\u0627",
  recent_activity: "\u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631",
  // System Health
  worker_status: "\u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0648\u0631\u06A9\u0631",
  d1_status: "\u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 D1",
  kv_status: "\u062D\u0627\u0641\u0638\u0647 \u0645\u0648\u0642\u062A KV",
  migrations_status: "\u0645\u0627\u06CC\u06AF\u0631\u06CC\u0634\u0646\u200C\u0647\u0627",
  healthy: "\u0633\u0627\u0644\u0645",
  current: "\u0628\u0647\u200C\u0631\u0648\u0632",
  degraded: "\u062F\u0627\u0631\u0627\u06CC \u0627\u062E\u062A\u0644\u0627\u0644",
  // Users Page
  add_user: "\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631",
  search_users: "\u062C\u0633\u062A\u062C\u0648\u06CC \u06A9\u0627\u0631\u0628\u0631...",
  all_status: "\u0647\u0645\u0647 \u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627",
  status_active: "\u0641\u0639\u0627\u0644",
  status_disabled: "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  status_expired: "\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647",
  user_name: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631",
  username: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC",
  traffic: "\u062A\u0631\u0627\u0641\u06CC\u06A9",
  expires: "\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627",
  actions: "\u0639\u0645\u0644\u06CC\u0627\u062A",
  manage: "\u0645\u062F\u06CC\u0631\u06CC\u062A",
  quick_copy_sub: "\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9",
  never_expires: "\u0646\u0627\u0645\u062D\u062F\u0648\u062F",
  // User Detail
  user_overview: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631",
  credentials: "\u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627 \u0648 \u06A9\u0644\u06CC\u062F\u0647\u0627",
  direct_connections: "\u0627\u062A\u0635\u0627\u0644\u200C\u0647\u0627\u06CC \u0645\u0633\u062A\u0642\u06CC\u0645",
  universal_subscription: "\u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9 \u062C\u0627\u0645\u0639",
  copy_uri: "\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9",
  show_qr: "\u0628\u0627\u0631\u06A9\u062F QR",
  rotate_token: "\u062A\u063A\u06CC\u06CC\u0631 \u062A\u0648\u06A9\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9",
  rotate_vless: "\u062A\u063A\u06CC\u06CC\u0631 \u0634\u0646\u0627\u0633\u0647 VLESS",
  rotate_trojan: "\u062A\u063A\u06CC\u06CC\u0631 \u06AF\u0630\u0631\u0648\u0627\u0698\u0647 \u062A\u0631\u0648\u062C\u0627\u0646",
  rotate_ss: "\u062A\u063A\u06CC\u06CC\u0631 \u06AF\u0630\u0631\u0648\u0627\u0698\u0647 \u0634\u062F\u0648\u0633\u0627\u06A9\u0633",
  reset_traffic: "\u0635\u0641\u0631 \u06A9\u0631\u062F\u0646 \u062A\u0631\u0627\u0641\u06CC\u06A9",
  disable_user: "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u06A9\u0627\u0631\u0628\u0631",
  enable_user: "\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u06A9\u0627\u0631\u0628\u0631",
  delete_user: "\u062D\u0630\u0641 \u06A9\u0627\u0631\u0628\u0631",
  copied: "\u062F\u0631 \u062D\u0627\u0641\u0638\u0647 \u06A9\u067E\u06CC \u0634\u062F!",
  // Inbounds
  add_inbound: "\u0627\u0641\u0632\u0648\u062F\u0646 \u0627\u06CC\u0646\u0628\u0627\u0646\u062F",
  inbound_name: "\u0646\u0627\u0645 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644",
  protocol: "\u067E\u0631\u0648\u062A\u06A9\u0644",
  port: "\u067E\u0648\u0631\u062A",
  transport: "\u0627\u0646\u062A\u0642\u0627\u0644",
  tls: "\u0631\u0645\u0632\u0646\u06AF\u0627\u0631\u06CC TLS",
  // Radar
  radar_title: "\u0631\u0627\u062F\u0627\u0631 C1",
  radar_desc: "\u062A\u0633\u062A \u0633\u0631\u0639\u062A \u0648 \u06A9\u06CC\u0641\u06CC\u062A \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u06CC \u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0645\u0633\u062A\u0642\u06CC\u0645\u0627\u064B \u0627\u0632 \u0634\u0628\u06A9\u0647 \u0648 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0634\u0645\u0627 \u0628\u0631\u0627\u06CC \u06CC\u0627\u0641\u062A\u0646 \u0628\u0647\u062A\u0631\u06CC\u0646 \u0645\u0633\u06CC\u0631.",
  run_radar: "\u0634\u0631\u0648\u0639 \u062A\u0633\u062A \u0631\u0627\u062F\u0627\u0631",
  stop_radar: "\u062A\u0648\u0642\u0641 \u062A\u0633\u062A",
  clear_results: "\u067E\u0627\u06A9\u0633\u0627\u0632\u06CC \u0646\u062A\u0627\u06CC\u062C",
  apply_global: "\u0627\u0639\u0645\u0627\u0644 \u0633\u0631\u0627\u0633\u0631\u06CC",
  apply_to_user: "\u0627\u0639\u0645\u0627\u0644 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631",
  ip_address: "\u0622\u062F\u0631\u0633 \u0622\u06CC\u200C\u067E\u06CC",
  latency: "\u067E\u06CC\u0646\u06AF / \u062A\u0627\u062E\u06CC\u0631",
  status: "\u06A9\u06CC\u0641\u06CC\u062A",
  candidates_scanned: "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC \u0646\u0627\u0645\u0632\u062F\u0647\u0627...",
  // Settings
  general_settings: "\u0639\u0645\u0648\u0645\u06CC",
  security_settings: "\u0627\u0645\u0646\u06CC\u062A",
  appearance: "\u0638\u0627\u0647\u0631 \u0648 \u062A\u0645",
  backup_restore: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u200C\u06AF\u06CC\u0631\u06CC \u0648 \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC",
  save_changes: "\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A",
  download_backup: "\u062F\u0627\u0646\u0644\u0648\u062F \u0641\u0627\u06CC\u0644 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646",
  upload_restore: "\u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u0627\u0632 \u0641\u0627\u06CC\u0644",
  // Install
  install_title: "\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0627\u0648\u0644\u06CC\u0647 C1 Proxy",
  install_subtitle: "\u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u062F\u06CC\u0631 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0634\u0631\u0648\u0639 \u0628\u0647 \u06A9\u0627\u0631 \u06A9\u0646\u062A\u0631\u0644 \u067E\u0646\u0644 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0646\u06CC\u062F.",
  admin_username: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u062F\u06CC\u0631",
  admin_password: "\u06AF\u0630\u0631\u0648\u0627\u0698\u0647 \u0645\u062F\u06CC\u0631",
  confirm_password: "\u062A\u06A9\u0631\u0627\u0631 \u06AF\u0630\u0631\u0648\u0627\u0698\u0647",
  claim_token_optional: "\u062A\u0648\u06A9\u0646 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)",
  create_admin_btn: "\u062A\u06A9\u0645\u06CC\u0644 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0648 \u0648\u0631\u0648\u062F"
};

// src/i18n/index.ts
function getLanguage(request) {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get("lang")?.toLowerCase();
  if (queryLang === "fa" || queryLang === "en") {
    return queryLang;
  }
  const cookies = parseCookies(request.headers.get("Cookie"));
  if (cookies["c1_lang"] === "fa" || cookies["c1_lang"] === "en") {
    return cookies["c1_lang"];
  }
  const acceptLang = (request.headers.get("accept-language") || "").toLowerCase();
  if (acceptLang.includes("fa")) {
    return "fa";
  }
  return "en";
}
__name(getLanguage, "getLanguage");
function t(lang, key) {
  if (lang === "fa") {
    return fa[key] || en[key] || String(key);
  }
  return en[key] || String(key);
}
__name(t, "t");
function getDir(lang) {
  return lang === "fa" ? "rtl" : "ltr";
}
__name(getDir, "getDir");

// src/ui/shell.ts
function renderLogoSvg(size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="c1-logo">
    <defs>
      <linearGradient id="c1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="50%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#3B82F6" />
      </linearGradient>
      <filter id="c1-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#c1-grad)" stroke-width="2.5" fill="#12151C" filter="url(#c1-glow)" />
    <path d="M24 10L36 17V31L24 38L12 31V17L24 10Z" fill="url(#c1-grad)" fill-opacity="0.15" stroke="url(#c1-grad)" stroke-width="1.5" />
    <circle cx="24" cy="24" r="5" fill="#3B82F6" />
    <path d="M24 12V18M24 30V36M14 24H19M29 24H34" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" />
  </svg>`;
}
__name(renderLogoSvg, "renderLogoSvg");
function renderShell(options) {
  const { title: title2, lang, activeNav, csrfToken = "", content } = options;
  const dir3 = getDir(lang);
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir3}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title2} - ${t(lang, "brand_control")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-surface: #11141B;
      --bg-card: #151922;
      --bg-card-hover: #1C2230;
      --border-subtle: #1F2633;
      --border-focus: #4F46E5;

      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;

      --accent-primary: #6366F1;
      --accent-secondary: #8B5CF6;
      --accent-cyan: #06B6D4;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;

      --font-sans: ${lang === "fa" ? "'Vazirmatn', 'Outfit', sans-serif" : "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"};
      --font-mono: 'JetBrains Mono', monospace;
      --sidebar-width: 260px;
      --header-height: 64px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
    }

    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font-family: inherit; }

    /* Layout */
    .app-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
    }

    /* Sidebar */
    .app-sidebar {
      width: var(--sidebar-width);
      background-color: var(--bg-surface);
      border-inline-end: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: fixed;
      top: 0;
      bottom: 0;
      inset-inline-start: 0;
      z-index: 40;
    }

    .sidebar-brand {
      height: var(--header-height);
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #FFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-nav {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: var(--text-secondary);
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-item:hover {
      background-color: var(--bg-card-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05));
      color: #A5B4FC;
      border-inline-start: 3px solid var(--accent-primary);
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .lang-switcher {
      display: flex;
      gap: 6px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }
    .lang-btn {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .lang-btn.active {
      background: var(--accent-primary);
      color: #FFF;
    }

    /* Main Content */
    .app-main {
      flex: 1;
      margin-inline-start: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .app-header {
      height: var(--header-height);
      background-color: rgba(17, 20, 27, 0.8);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--success);
      box-shadow: 0 0 8px var(--success);
    }

    .content-container {
      padding: 32px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    /* Cards & Components */
    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .card:hover {
      border-color: #2D3748;
    }
    .card-title {
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-value {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: #FFF;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .btn-primary:hover {
      opacity: 0.95;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }
    .btn-secondary:hover {
      background: #252D3D;
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 9px 12px;
      color: var(--text-primary);
      font-size: 13px;
      transition: border-color 0.15s;
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      background: var(--bg-card);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: start;
    }
    th {
      background: var(--bg-surface);
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-subtle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 13px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: rgba(255, 255, 255, 0.02);
    }

    /* Toast */
    #toast-container {
      position: fixed;
      bottom: 24px;
      inset-inline-end: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 100;
    }
    .toast {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.2s ease forwards;
    }
    .toast.success { border-inline-start: 4px solid var(--success); }
    .toast.error { border-inline-start: 4px solid var(--danger); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 90;
    }
    .modal-backdrop.open {
      display: flex;
    }
    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      width: 90%;
      max-width: 540px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal-title { font-size: 17px; font-weight: 600; }
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 20px;
    }

    @keyframes slideIn {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .app-sidebar {
        display: none;
      }
      .app-main {
        margin-inline-start: 0;
      }
      .content-container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        ${renderLogoSvg(28)}
        <span class="brand-title">${t(lang, "brand")}</span>
      </div>
      <nav class="sidebar-nav">
        <a href="/admin" class="nav-item ${activeNav === "overview" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>${t(lang, "nav_overview")}</span>
        </a>
        <a href="/admin/users" class="nav-item ${activeNav === "users" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>${t(lang, "nav_users")}</span>
        </a>
        <a href="/admin/inbounds" class="nav-item ${activeNav === "inbounds" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <span>${t(lang, "nav_inbounds")}</span>
        </a>
        <a href="/admin/radar" class="nav-item ${activeNav === "radar" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>${t(lang, "nav_radar")}</span>
        </a>
        <a href="/admin/routing" class="nav-item ${activeNav === "routing" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span>${t(lang, "nav_routing")}</span>
        </a>
        <a href="/admin/settings" class="nav-item ${activeNav === "settings" ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>${t(lang, "nav_settings")}</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="lang-switcher">
          <button class="lang-btn ${lang === "en" ? "active" : ""}" onclick="setLanguage('en')">EN</button>
          <button class="lang-btn ${lang === "fa" ? "active" : ""}" onclick="setLanguage('fa')">\u0641\u0627\u0631\u0633\u06CC</button>
        </div>
        <button class="btn btn-secondary" onclick="logout()" style="width: 100%; font-size: 12px; padding: 6px;">
          ${t(lang, "nav_logout")}
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">
      <header class="app-header">
        <h1 class="page-title">${title2}</h1>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>${t(lang, "edge_online")}</span>
        </div>
      </header>

      <div class="content-container">
        ${content}
      </div>
    </main>
  </div>

  <div id="toast-container"></div>

  <script>
    const C1_CSRF = "${csrfToken}";

    function showToast(msg, type = 'success') {
      const c = document.getElementById('toast-container');
      const t = document.createElement('div');
      t.className = 'toast ' + type;
      t.innerText = msg;
      c.appendChild(t);
      setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 200);
      }, 3500);
    }

    async function copyToClipboard(text, customMsg = '${t(lang, "copied")}') {
      try {
        await navigator.clipboard.writeText(text);
        showToast(customMsg, 'success');
      } catch (err) {
        showToast('Failed to copy', 'error');
      }
    }

    async function apiRequest(url, options = {}) {
      options.headers = options.headers || {};
      options.headers['x-c1-csrf'] = C1_CSRF;
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
      const res = await fetch(url, options);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'Error ' + res.status);
      }
      return res.json().catch(() => ({}));
    }

    function setLanguage(l) {
      document.cookie = 'c1_lang=' + l + '; Path=/; Max-Age=31536000; SameSite=Lax';
      window.location.reload();
    }

    async function logout() {
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
      window.location.href = '/login';
    }

    function openModal(id) {
      document.getElementById(id).classList.add('open');
    }
    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
    }
  <\/script>
</body>
</html>`;
}
__name(renderShell, "renderShell");

// src/ui/dashboard.ts
function formatBytes(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024)
    return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024)
    return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
__name(formatBytes, "formatBytes");
function renderDashboardView(lang, data) {
  const { users, auditLogs, d1Healthy, kvHealthy, migrationsCurrent } = data;
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.enabled === 1).length;
  const totalUsedBytes = users.reduce((acc, u) => acc + (u.used_bytes || 0), 0);
  const vlessCount = users.filter((u) => u.protocol_vless_enabled).length;
  const trojanCount = users.filter((u) => u.protocol_trojan_enabled).length;
  const ssCount = users.filter((u) => u.protocol_shadowsocks_enabled).length;
  return `
  <!-- Top Stat Cards -->
  <div class="grid-cards">
    <div class="card">
      <div class="card-title">
        <span>${t(lang, "users_count")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </div>
      <div class="card-value" style="color: #6366F1;">${totalUsers}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, "active_users")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      </div>
      <div class="card-value" style="color: #10B981;">${activeUsers}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, "traffic_used")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </div>
      <div class="card-value" style="color: #06B6D4;">${formatBytes(totalUsedBytes)}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, "system_health")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <div class="card-value" style="color: #8B5CF6;">${d1Healthy && migrationsCurrent ? t(lang, "healthy") : t(lang, "degraded")}</div>
    </div>
  </div>

  <!-- Middle Section: Traffic Chart & Protocol Breakdown -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
    <!-- Traffic Sparkline Area -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Traffic Activity (Simulated Rollup)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Real-time edge buffer</span>
      </div>
      <div style="width: 100%; height: 160px;">
        <svg viewBox="0 0 500 150" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366F1" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="M0,130 Q70,90 140,110 T280,60 T420,40 L500,70 L500,150 L0,150 Z" fill="url(#chartGrad)" />
          <path d="M0,130 Q70,90 140,110 T280,60 T420,40 L500,70" fill="none" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Infrastructure & Protocols -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, "system_health")}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, "worker_status")}</span>
          <span class="status-badge"><span class="status-dot"></span>${t(lang, "healthy")}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, "d1_status")}</span>
          <span class="status-badge" style="${d1Healthy ? "" : "color: var(--danger); border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);"}">
            <span class="status-dot" style="${d1Healthy ? "" : "background: var(--danger); box-shadow: 0 0 8px var(--danger);"}"></span>
            ${d1Healthy ? t(lang, "healthy") : t(lang, "degraded")}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, "kv_status")}</span>
          <span class="status-badge"><span class="status-dot"></span>${kvHealthy ? t(lang, "healthy") : t(lang, "healthy")}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, "migrations_status")}</span>
          <span class="status-badge"><span class="status-dot"></span>${migrationsCurrent ? t(lang, "current") : t(lang, "degraded")}</span>
        </div>
      </div>

      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
        <div class="card-title"><span>${t(lang, "protocols")}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 8px;">
          <span>VLESS: <strong style="color: #FFF;">${vlessCount}</strong></span>
          <span>Trojan: <strong style="color: #FFF;">${trojanCount}</strong></span>
          <span>Shadowsocks: <strong style="color: #FFF;">${ssCount}</strong></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="card">
    <div class="card-title" style="margin-bottom: 16px;">
      <span>${t(lang, "recent_activity")}</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Actor</th>
            <th>Details</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${auditLogs.length === 0 ? `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No audit events recorded yet.</td></tr>` : auditLogs.slice(0, 8).map(
    (log3) => `
            <tr>
              <td><span style="font-family: var(--font-mono); color: #A5B4FC; font-weight: 500;">${log3.action}</span></td>
              <td>${log3.actor}</td>
              <td style="color: var(--text-muted); font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${log3.details}
              </td>
              <td style="color: var(--text-muted); font-size: 12px;">${new Date(log3.created_at).toLocaleString()}</td>
            </tr>
          `
  ).join("")}
        </tbody>
      </table>
    </div>
  </div>
  `;
}
__name(renderDashboardView, "renderDashboardView");

// src/ui/users.ts
function formatBytes2(bytes) {
  if (!bytes)
    return "0 B";
  if (bytes < 1024)
    return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024)
    return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024)
    return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
__name(formatBytes2, "formatBytes");
function renderUsersView(lang, users, serverOrigin) {
  return `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
    <div style="position: relative; flex: 1; max-width: 380px;">
      <input type="text" id="user-search" class="form-input" placeholder="${t(lang, "search_users")}" oninput="filterUsersTable()" style="padding-inline-start: 36px;" />
      <svg style="position: absolute; inset-inline-start: 12px; top: 11px; color: var(--text-muted);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
    <button class="btn btn-primary" onclick="openModal('create-user-modal')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>${t(lang, "add_user")}</span>
    </button>
  </div>

  <div class="table-container">
    <table id="users-table">
      <thead>
        <tr>
          <th>${t(lang, "user_name")}</th>
          <th>${t(lang, "traffic")}</th>
          <th>${t(lang, "expires")}</th>
          <th>${t(lang, "status")}</th>
          <th>${t(lang, "actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${users.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 48px;">No users created yet. Click "Add User" to get started.</td></tr>` : users.map((u) => {
    const isExpired = u.expires_at && new Date(u.expires_at).getTime() < Date.now();
    const isOverQuota = u.quota_bytes > 0 && u.used_bytes >= u.quota_bytes;
    let statusBadge = `<span class="status-badge"><span class="status-dot"></span>${t(lang, "status_active")}</span>`;
    if (!u.enabled) {
      statusBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>${t(lang, "status_disabled")}</span>`;
    } else if (isExpired) {
      statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${t(lang, "status_expired")}</span>`;
    } else if (isOverQuota) {
      statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>Over Quota</span>`;
    }
    const subUrl = `${serverOrigin}/s/${u.subscription_token}`;
    return `
          <tr class="user-row" data-search="${u.name.toLowerCase()} ${u.username.toLowerCase()}">
            <td>
              <div style="font-weight: 600; color: #FFF;">${u.name || u.username}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">@${u.username}</div>
            </td>
            <td>
              <div>${formatBytes2(u.used_bytes)} / ${u.quota_bytes > 0 ? formatBytes2(u.quota_bytes) : "\u221E"}</div>
              <div style="height: 4px; background: var(--bg-surface); border-radius: 2px; margin-top: 4px; overflow: hidden; width: 120px;">
                <div style="height: 100%; background: var(--accent-primary); width: ${u.quota_bytes > 0 ? Math.min(100, Math.round(u.used_bytes / u.quota_bytes * 100)) : 0}%;"></div>
              </div>
            </td>
            <td style="color: var(--text-secondary); font-size: 12px;">
              ${u.expires_at ? new Date(u.expires_at).toLocaleDateString() : t(lang, "never_expires")}
            </td>
            <td>${statusBadge}</td>
            <td>
              <div style="display: flex; gap: 8px;">
                <a href="/admin/users/${u.id}" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                  ${t(lang, "manage")}
                </a>
                <button class="btn btn-secondary" onclick="copyToClipboard('${subUrl}', '${t(lang, "copied")}')" title="${t(lang, "quick_copy_sub")}" style="padding: 5px 10px; font-size: 12px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </td>
          </tr>
          `;
  }).join("")}
      </tbody>
    </table>
  </div>

  <!-- Create User Modal -->
  <div id="create-user-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${t(lang, "add_user")}</h3>
        <button class="modal-close" onclick="closeModal('create-user-modal')">&times;</button>
      </div>
      <form id="create-user-form" onsubmit="handleCreateUser(event)">
        <div class="form-group">
          <label class="form-label">${t(lang, "user_name")}</label>
          <input type="text" id="new-user-name" class="form-input" placeholder="e.g. Ehsan" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t(lang, "username")} (letters, numbers, _ and - only)</label>
          <input type="text" id="new-user-username" class="form-input" placeholder="e.g. ehsan_node" pattern="[a-zA-Z0-9_-]{3,32}" required />
          <div id="username-error" style="color: var(--danger); font-size: 11px; margin-top: 4px; display: none;"></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Traffic Quota (GB, 0 = Unlimited)</label>
            <input type="number" id="new-user-quota" class="form-input" min="0" value="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Daily Limit (GB, 0 = Off)</label>
            <input type="number" id="new-user-daily" class="form-input" min="0" value="0" />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Expiration Date (Optional)</label>
            <input type="date" id="new-user-expiry" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Concurrent IPs (0 = Off)</label>
            <input type="number" id="new-user-maxips" class="form-input" min="0" value="2" />
          </div>
        </div>

        <div style="display: flex; gap: 16px; margin: 16px 0;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-vless" checked /> VLESS
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-trojan" checked /> Trojan
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-ss" checked /> Shadowsocks
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('create-user-modal')">Cancel</button>
          <button type="submit" id="btn-save-user" class="btn btn-primary">${t(lang, "add_user")}</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function filterUsersTable() {
      const q = document.getElementById('user-search').value.toLowerCase();
      const rows = document.querySelectorAll('.user-row');
      rows.forEach(r => {
        const text = r.getAttribute('data-search') || '';
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }

    async function handleCreateUser(e) {
      e.preventDefault();
      const errBox = document.getElementById('username-error');
      errBox.style.display = 'none';

      const username = document.getElementById('new-user-username').value.trim();
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
        errBox.innerText = 'Username may contain letters, numbers, _ and - only (3-32 chars).';
        errBox.style.display = 'block';
        return;
      }

      const quotaGb = parseFloat(document.getElementById('new-user-quota').value) || 0;
      const dailyGb = parseFloat(document.getElementById('new-user-daily').value) || 0;
      const expiryDate = document.getElementById('new-user-expiry').value;

      const payload = {
        name: document.getElementById('new-user-name').value.trim(),
        username,
        quota_bytes: Math.round(quotaGb * 1024 * 1024 * 1024),
        daily_quota_bytes: Math.round(dailyGb * 1024 * 1024 * 1024),
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        max_ips: parseInt(document.getElementById('new-user-maxips').value, 10) || 0,
        protocol_vless_enabled: document.getElementById('proto-vless').checked ? 1 : 0,
        protocol_trojan_enabled: document.getElementById('proto-trojan').checked ? 1 : 0,
        protocol_shadowsocks_enabled: document.getElementById('proto-ss').checked ? 1 : 0,
      };

      const btn = document.getElementById('btn-save-user');
      btn.disabled = true;

      try {
        await apiRequest('/api/users', { method: 'POST', body: payload });
        showToast('User created successfully');
        closeModal('create-user-modal');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message || 'Failed to create user', 'error');
        btn.disabled = false;
      }
    }
  <\/script>
  `;
}
__name(renderUsersView, "renderUsersView");

// src/qr/generate.ts
var GF256_EXP = new Uint8Array(512);
var GF256_LOG = new Uint8Array(256);
(/* @__PURE__ */ __name(function initGalois() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = val;
    GF256_LOG[val] = i;
    val = val << 1 ^ (val & 128 ? 285 : 0);
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
}, "initGalois"))();
function gfMul(x, y) {
  if (x === 0 || y === 0)
    return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}
__name(gfMul, "gfMul");
function rsGeneratorPoly(degree) {
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
__name(rsGeneratorPoly, "rsGeneratorPoly");
function rsComputeRemainder(data, numEcWords) {
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
__name(rsComputeRemainder, "rsComputeRemainder");
var VERSION_SPECS = [
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
  { version: 14, totalCodewords: 581, ecCodewords: 216, dataCodewords: 365 }
];
function generateQrSvg(text, size = 256) {
  const bytes = new TextEncoder().encode(text);
  let spec = null;
  for (const s of VERSION_SPECS) {
    const charCountBits = s.version < 10 ? 8 : 16;
    const totalDataBits = 4 + charCountBits + bytes.length * 8;
    if (Math.ceil(totalDataBits / 8) <= s.dataCodewords) {
      spec = s;
      break;
    }
  }
  if (!spec) {
    spec = VERSION_SPECS[VERSION_SPECS.length - 1];
  }
  const bitBuf = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuf.push(val >>> i & 1);
    }
  }
  __name(pushBits, "pushBits");
  pushBits(4, 4);
  const countBits = spec.version < 10 ? 8 : 16;
  pushBits(bytes.length, countBits);
  for (const b of bytes) {
    pushBits(b, 8);
  }
  const maxDataBits = spec.dataCodewords * 8;
  const termBits = Math.min(4, maxDataBits - bitBuf.length);
  pushBits(0, termBits);
  while (bitBuf.length % 8 !== 0) {
    bitBuf.push(0);
  }
  const padPatterns = [236, 17];
  let padIdx = 0;
  while (bitBuf.length < maxDataBits) {
    pushBits(padPatterns[padIdx], 8);
    padIdx = (padIdx + 1) % 2;
  }
  const dataWords = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < spec.dataCodewords; i++) {
    let word = 0;
    for (let b = 0; b < 8; b++) {
      word = word << 1 | bitBuf[i * 8 + b];
    }
    dataWords[i] = word;
  }
  const ecWords = rsComputeRemainder(dataWords, spec.ecCodewords);
  const allCodewords = new Uint8Array(spec.totalCodewords);
  allCodewords.set(dataWords, 0);
  allCodewords.set(ecWords, spec.dataCodewords);
  const moduleCount = spec.version * 4 + 17;
  const matrix = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));
  const isFunction = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));
  function setModule(r, c, val, isFunc = true) {
    if (r >= 0 && r < moduleCount && c >= 0 && c < moduleCount) {
      matrix[r][c] = val;
      if (isFunc)
        isFunction[r][c] = true;
    }
  }
  __name(setModule, "setModule");
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const isBlack = r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(row + r, col + c, isBlack);
      }
    }
  }
  __name(drawFinder, "drawFinder");
  drawFinder(0, 0);
  drawFinder(0, moduleCount - 7);
  drawFinder(moduleCount - 7, 0);
  for (let i = 8; i < moduleCount - 8; i++) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }
  setModule(moduleCount - 8, 8, true);
  let bitIdx = 0;
  const allBits = [];
  for (const cw of allCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push(cw >>> b & 1);
    }
  }
  let right = moduleCount - 1;
  let upward = true;
  while (right > 0) {
    if (right === 6)
      right--;
    for (let step = 0; step < moduleCount; step++) {
      const row = upward ? moduleCount - 1 - step : step;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!isFunction[row][col]) {
          let bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
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
  const rects = [];
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
    ${rects.join("")}
  </g>
</svg>`;
}
__name(generateQrSvg, "generateQrSvg");

// src/ui/user-detail.ts
function formatBytes3(bytes) {
  if (!bytes)
    return "0 B";
  if (bytes < 1024)
    return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024)
    return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024)
    return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
__name(formatBytes3, "formatBytes");
function renderUserDetailView(lang, user, inbounds, serverHost, serverOrigin) {
  const isExpired = user.expires_at && new Date(user.expires_at).getTime() < Date.now();
  let statusBadge = `<span class="status-badge"><span class="status-dot"></span>${t(lang, "status_active")}</span>`;
  if (!user.enabled) {
    statusBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>${t(lang, "status_disabled")}</span>`;
  } else if (isExpired) {
    statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${t(lang, "status_expired")}</span>`;
  }
  const universalSubUrl = `${serverOrigin}/s/${user.subscription_token}`;
  const clashSubUrl = `${universalSubUrl}?format=clash`;
  const singboxSubUrl = `${universalSubUrl}?format=singbox`;
  const karingSubUrl = `${universalSubUrl}?format=karing`;
  const base64SubUrl = `${universalSubUrl}?format=base64`;
  const rawSubUrl = `${universalSubUrl}?format=raw`;
  const vlessInbound = inbounds.find((i) => i.protocol === "vless");
  const trojanInbound = inbounds.find((i) => i.protocol === "trojan");
  const ssInbound = inbounds.find((i) => i.protocol === "shadowsocks");
  const vlessUri = vlessInbound ? buildVlessUri({ user, inbound: vlessInbound, serverHost }) : "";
  const trojanUri = trojanInbound ? buildTrojanUri({ user, inbound: trojanInbound, serverHost }) : "";
  const ssUri = ssInbound ? buildShadowsocksUri({ user, inbound: ssInbound, serverHost }) : "";
  const vlessQrSvg = vlessUri ? generateQrSvg(vlessUri, 220) : "";
  const trojanQrSvg = trojanUri ? generateQrSvg(trojanUri, 220) : "";
  const ssQrSvg = ssUri ? generateQrSvg(ssUri, 220) : "";
  const subQrSvg = generateQrSvg(universalSubUrl, 220);
  const trafficPercent = user.quota_bytes > 0 ? Math.min(100, Math.round(user.used_bytes / user.quota_bytes * 100)) : 0;
  return `
  <!-- User Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
    <div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <h2 style="font-size: 24px; font-weight: 700;">${user.name || user.username}</h2>
        ${statusBadge}
      </div>
      <div style="font-family: var(--font-mono); color: var(--text-muted); font-size: 13px; margin-top: 4px;">
        @${user.username} &bull; ID: ${user.id}
      </div>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-secondary" onclick="toggleUserStatus(${user.enabled ? 0 : 1})">
        ${user.enabled ? t(lang, "disable_user") : t(lang, "enable_user")}
      </button>
      <button class="btn btn-secondary" onclick="resetUserTraffic()">
        ${t(lang, "reset_traffic")}
      </button>
      <button class="btn btn-danger" onclick="deleteUser()">
        ${t(lang, "delete_user")}
      </button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid-cards">
    <div class="card">
      <div class="card-title"><span>Bandwidth Quota</span></div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        ${formatBytes3(user.used_bytes)} / <span style="color: var(--text-secondary);">${user.quota_bytes > 0 ? formatBytes3(user.quota_bytes) : "\u221E"}</span>
      </div>
      <div style="height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden;">
        <div style="height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); width: ${trafficPercent}%;"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span>Daily Quota</span></div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        ${formatBytes3(user.daily_used_bytes)} / <span style="color: var(--text-secondary);">${user.daily_quota_bytes > 0 ? formatBytes3(user.daily_quota_bytes) : "\u221E"}</span>
      </div>
      <div style="color: var(--text-muted); font-size: 12px;">Reset key: ${user.daily_key || "Today"}</div>
    </div>

    <div class="card">
      <div class="card-title"><span>Expiration Date</span></div>
      <div style="font-size: 18px; font-weight: 700;">
        ${user.expires_at ? new Date(user.expires_at).toLocaleDateString() : t(lang, "never_expires")}
      </div>
      <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">
        ${user.expires_at ? isExpired ? "Expired" : "Active" : "No expiry set"}
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span>Limits & Routing</span></div>
      <div style="font-size: 14px;">
        <div>Max IPs: <strong>${user.max_ips > 0 ? user.max_ips : "Unlimited"}</strong></div>
        <div style="margin-top: 4px;">Clean IP: <strong>${user.clean_ip_mode}</strong></div>
      </div>
    </div>
  </div>

  <!-- Universal Subscription Section -->
  <div class="card" style="margin-bottom: 24px;">
    <div class="card-title" style="margin-bottom: 16px;">
      <span>${t(lang, "universal_subscription")}</span>
      <span style="font-size: 11px; color: var(--accent-cyan);">Supports auto client-detection</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
      <input type="text" value="${universalSubUrl}" readonly style="flex: 1; background: none; border: none; color: #FFF; font-family: var(--font-mono); font-size: 12px; outline: none;" />
      <button class="btn btn-primary" onclick="copyToClipboard('${universalSubUrl}')" style="padding: 6px 14px; font-size: 12px;">
        ${t(lang, "quick_copy_sub")}
      </button>
      <button class="btn btn-secondary" onclick="openModal('modal-sub-qr')" style="padding: 6px 14px; font-size: 12px;">
        ${t(lang, "show_qr")}
      </button>
    </div>

    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <button class="btn btn-secondary" onclick="copyToClipboard('${clashSubUrl}', 'Clash URL copied!')" style="font-size: 12px;">
        Copy Clash / Mihomo
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${karingSubUrl}', 'Karing URL copied!')" style="font-size: 12px;">
        Copy Karing
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${singboxSubUrl}', 'sing-box URL copied!')" style="font-size: 12px;">
        Copy sing-box
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${base64SubUrl}', 'Base64 URL copied!')" style="font-size: 12px;">
        Copy Base64
      </button>
      <a href="${rawSubUrl}" target="_blank" class="btn btn-secondary" style="font-size: 12px;">
        View Raw URIs
      </a>
      <button class="btn btn-secondary" onclick="rotateCredential('token')" style="font-size: 12px; color: #F59E0B;">
        ${t(lang, "rotate_token")}
      </button>
    </div>
  </div>

  <!-- Direct Protocol Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
    <!-- VLESS Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">VLESS (WebSocket + TLS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_vless_enabled ? "checked" : ""} onchange="toggleProtocol('vless', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        UUID: ${user.vless_uuid}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${vlessUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, "copy_uri")}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-vless-qr')" style="font-size: 12px;">
          ${t(lang, "show_qr")}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('vless')" title="${t(lang, "rotate_vless")}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          \u21BB
        </button>
      </div>
    </div>

    <!-- Trojan Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">Trojan (WebSocket + TLS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_trojan_enabled ? "checked" : ""} onchange="toggleProtocol('trojan', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        Password: ${user.trojan_password}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${trojanUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, "copy_uri")}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-trojan-qr')" style="font-size: 12px;">
          ${t(lang, "show_qr")}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('trojan')" title="${t(lang, "rotate_trojan")}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          \u21BB
        </button>
      </div>
    </div>

    <!-- Shadowsocks Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">Shadowsocks (AEAD WS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_shadowsocks_enabled ? "checked" : ""} onchange="toggleProtocol('shadowsocks', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        Cipher: ${user.shadowsocks_method} | Pass: ${user.shadowsocks_password}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${ssUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, "copy_uri")}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-ss-qr')" style="font-size: 12px;">
          ${t(lang, "show_qr")}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('shadowsocks')" title="${t(lang, "rotate_ss")}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          \u21BB
        </button>
      </div>
    </div>
  </div>

  <!-- QR Modals (Inline pure SVG) -->
  <div id="modal-sub-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Universal Subscription QR</h3>
        <button class="modal-close" onclick="closeModal('modal-sub-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${subQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${universalSubUrl}')" style="width: 100%;">Copy Link</button>
    </div>
  </div>

  <div id="modal-vless-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">VLESS QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-vless-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${vlessQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${vlessUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <div id="modal-trojan-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Trojan QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-trojan-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${trojanQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${trojanUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <div id="modal-ss-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Shadowsocks QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-ss-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${ssQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${ssUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <script>
    const USER_ID = "${user.id}";

    async function toggleUserStatus(newEnabled) {
      try {
        await apiRequest('/api/users/' + USER_ID + '/toggle', {
          method: 'POST',
          body: { enabled: newEnabled }
        });
        showToast('User status updated');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to update user', 'error');
      }
    }

    async function resetUserTraffic() {
      if (!confirm('Are you sure you want to reset bandwidth usage for this user?')) return;
      try {
        await apiRequest('/api/users/' + USER_ID + '/reset-traffic', { method: 'POST' });
        showToast('Traffic counters reset to 0');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to reset traffic', 'error');
      }
    }

    async function rotateCredential(type) {
      if (!confirm('Rotating credentials will immediately disconnect any active sessions using the old credential. Proceed?')) return;
      try {
        await apiRequest('/api/users/' + USER_ID + '/rotate-' + type, { method: 'POST' });
        showToast('Credential rotated successfully');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to rotate credential', 'error');
      }
    }

    async function toggleProtocol(proto, isEnabled) {
      try {
        const payload = {};
        payload['protocol_' + proto + '_enabled'] = isEnabled ? 1 : 0;
        await apiRequest('/api/users/' + USER_ID, { method: 'PATCH', body: payload });
        showToast(proto.toUpperCase() + ' protocol ' + (isEnabled ? 'enabled' : 'disabled'));
      } catch (err) {
        showToast(err.message || 'Failed to update protocol', 'error');
      }
    }

    async function deleteUser() {
      if (!confirm('Delete user ${user.username}? This action is irreversible.')) return;
      try {
        await apiRequest('/api/users/' + USER_ID, { method: 'DELETE' });
        showToast('User deleted');
        window.location.href = '/admin/users';
      } catch (err) {
        showToast(err.message || 'Failed to delete user', 'error');
      }
    }
  <\/script>
  `;
}
__name(renderUserDetailView, "renderUserDetailView");

// src/ui/inbounds.ts
function renderInboundsView(lang, inbounds) {
  return `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div>
      <h2 style="font-size: 20px; font-weight: 700;">${t(lang, "nav_inbounds")}</h2>
      <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
        Reusable ingress templates attached to client subscription configurations.
      </div>
    </div>
    <button class="btn btn-primary" onclick="openModal('create-inbound-modal')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>${t(lang, "add_inbound")}</span>
    </button>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>${t(lang, "inbound_name")}</th>
          <th>${t(lang, "protocol")}</th>
          <th>${t(lang, "transport")}</th>
          <th>${t(lang, "port")}</th>
          <th>Path Template</th>
          <th>${t(lang, "actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${inbounds.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No inbound profiles found.</td></tr>` : inbounds.map(
    (ib) => `
          <tr>
            <td>
              <div style="font-weight: 600; color: #FFF;">${ib.name}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${ib.notes || "Default edge profile"}</div>
            </td>
            <td>
              <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #A5B4FC; border-color: rgba(99, 102, 241, 0.3);">
                ${ib.protocol.toUpperCase()}
              </span>
            </td>
            <td><span style="font-family: var(--font-mono); font-size: 12px;">${ib.transport.toUpperCase()} + ${ib.tls_mode.toUpperCase()}</span></td>
            <td><span style="font-family: var(--font-mono); font-size: 12px;">${ib.port}</span></td>
            <td><span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">${ib.path_template}</span></td>
            <td>
              <button class="btn btn-danger" onclick="deleteInbound('${ib.id}', '${ib.name}')" style="padding: 4px 10px; font-size: 12px;">
                Delete
              </button>
            </td>
          </tr>
        `
  ).join("")}
      </tbody>
    </table>
  </div>

  <!-- Create Inbound Modal -->
  <div id="create-inbound-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${t(lang, "add_inbound")}</h3>
        <button class="modal-close" onclick="closeModal('create-inbound-modal')">&times;</button>
      </div>
      <form id="create-inbound-form" onsubmit="handleCreateInbound(event)">
        <div class="form-group">
          <label class="form-label">${t(lang, "inbound_name")}</label>
          <input type="text" id="ib-name" class="form-input" placeholder="e.g. Custom Edge VLESS" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">${t(lang, "protocol")}</label>
            <select id="ib-protocol" class="form-select">
              <option value="vless">VLESS</option>
              <option value="trojan">Trojan</option>
              <option value="shadowsocks">Shadowsocks</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${t(lang, "port")}</label>
            <input type="number" id="ib-port" class="form-input" value="443" min="1" max="65535" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Path Template (use {token} for user sub token)</label>
          <input type="text" id="ib-path" class="form-input" value="/edge/{token}/vless" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Custom Host (Optional)</label>
            <input type="text" id="ib-host" class="form-input" placeholder="Leave empty for Worker host" />
          </div>
          <div class="form-group">
            <label class="form-label">Custom SNI (Optional)</label>
            <input type="text" id="ib-sni" class="form-input" placeholder="Leave empty for Worker host" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Fingerprint</label>
          <select id="ib-fp" class="form-select">
            <option value="chrome">chrome</option>
            <option value="firefox">firefox</option>
            <option value="safari">safari</option>
            <option value="randomized">randomized</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('create-inbound-modal')">Cancel</button>
          <button type="submit" id="btn-save-ib" class="btn btn-primary">Create Inbound</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    async function handleCreateInbound(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-save-ib');
      btn.disabled = true;

      const payload = {
        name: document.getElementById('ib-name').value.trim(),
        protocol: document.getElementById('ib-protocol').value,
        transport: 'ws',
        tls_mode: 'tls',
        port: parseInt(document.getElementById('ib-port').value, 10),
        path_template: document.getElementById('ib-path').value.trim(),
        host: document.getElementById('ib-host').value.trim(),
        sni: document.getElementById('ib-sni').value.trim(),
        fingerprint: document.getElementById('ib-fp').value,
        allow_udp: 1,
        enabled: 1,
        notes: '',
      };

      try {
        await apiRequest('/api/inbounds', { method: 'POST', body: payload });
        showToast('Inbound created successfully');
        closeModal('create-inbound-modal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to create inbound', 'error');
        btn.disabled = false;
      }
    }

    async function deleteInbound(id, name) {
      if (!confirm('Delete inbound ' + name + '?')) return;
      try {
        await apiRequest('/api/inbounds/' + id, { method: 'DELETE' });
        showToast('Inbound deleted');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to delete inbound', 'error');
      }
    }
  <\/script>
  `;
}
__name(renderInboundsView, "renderInboundsView");

// src/ui/radar.ts
function renderRadarView(lang, users, recentResults) {
  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, "radar_title")}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      ${t(lang, "radar_desc")}
    </div>
  </div>

  <!-- Radar Control Panel -->
  <div class="card" style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button id="btn-start-radar" class="btn btn-primary" onclick="startRadarScan()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          <span>${t(lang, "run_radar")}</span>
        </button>
        <button id="btn-stop-radar" class="btn btn-secondary" onclick="stopRadarScan()" style="display: none;">
          ${t(lang, "stop_radar")}
        </button>
        <button class="btn btn-secondary" onclick="clearRadarResults()">
          ${t(lang, "clear_results")}
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <select id="radar-user-select" class="form-select" style="width: auto; font-size: 12px;">
          <option value="">Select User to Apply</option>
          ${users.map((u) => `<option value="${u.id}">${u.name || u.username}</option>`).join("")}
        </select>
        <button class="btn btn-secondary" onclick="applyToSelectedUser()" style="font-size: 12px;">
          ${t(lang, "apply_to_user")}
        </button>
        <button class="btn btn-secondary" onclick="applyGlobally()" style="font-size: 12px; color: var(--accent-cyan);">
          ${t(lang, "apply_global")}
        </button>
      </div>
    </div>

    <!-- Progress Status Indicator -->
    <div id="radar-status-bar" style="margin-top: 16px; display: none;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
        <span id="radar-progress-text" style="color: var(--text-secondary);">Scanning candidates...</span>
        <span id="radar-counter" style="font-family: var(--font-mono); color: var(--accent-primary);">0 / 0</span>
      </div>
      <div style="height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden;">
        <div id="radar-progress-fill" style="height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan)); width: 0%; transition: width 0.2s;"></div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>${t(lang, "ip_address")}</th>
          <th>${t(lang, "latency")}</th>
          <th>${t(lang, "status")}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="radar-results-body">
        ${recentResults.length === 0 ? `<tr id="radar-empty-row"><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 36px;">No radar scan results yet. Click "${t(lang, "run_radar")}" above to test endpoints.</td></tr>` : recentResults.map((r) => {
    let badge = `<span class="status-badge"><span class="status-dot"></span>${r.status}</span>`;
    if (r.status === "failed") {
      badge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>failed</span>`;
    } else if (r.status === "fair" || r.status === "poor") {
      badge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${r.status}</span>`;
    }
    return `
          <tr data-ip="${r.ip}">
            <td><span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">${r.ip}</span></td>
            <td><span style="font-family: var(--font-mono); color: ${r.latency_ms < 150 ? "#10B981" : "#F59E0B"};">${r.latency_ms > 0 ? r.latency_ms + " ms" : "Timeout"}</span></td>
            <td>${badge}</td>
            <td>
              <button class="btn btn-secondary" onclick="copyToClipboard('${r.ip}')" style="padding: 4px 8px; font-size: 11px;">
                Copy
              </button>
            </td>
          </tr>
        `;
  }).join("")}
      </tbody>
    </table>
  </div>

  <script>
    let scanGenerationId = 0;
    let isScanning = false;
    let scanResults = [];

    async function startRadarScan() {
      scanGenerationId++;
      const currentGen = scanGenerationId;
      isScanning = true;

      document.getElementById('btn-start-radar').style.display = 'none';
      document.getElementById('btn-stop-radar').style.display = 'inline-flex';
      document.getElementById('radar-status-bar').style.display = 'block';

      const tbody = document.getElementById('radar-results-body');
      tbody.innerHTML = '';
      scanResults = [];

      try {
        const { candidates } = await apiRequest('/api/radar/candidates');
        if (!candidates || candidates.length === 0) {
          showToast('No candidates available to scan', 'error');
          stopRadarScan();
          return;
        }

        let completed = 0;
        const total = candidates.length;
        const concurrency = 8; // bounded concurrency
        let queueIndex = 0;

        function updateProgress() {
          if (scanGenerationId !== currentGen) return;
          const percent = Math.round((completed / total) * 100);
          document.getElementById('radar-counter').innerText = completed + ' / ' + total;
          document.getElementById('radar-progress-fill').style.width = percent + '%';
        }

        async function worker() {
          while (queueIndex < candidates.length && isScanning && scanGenerationId === currentGen) {
            const ip = candidates[queueIndex++];
            const result = await testIpLatency(ip, currentGen);
            if (scanGenerationId !== currentGen) return;

            completed++;
            updateProgress();

            if (result && result.status !== 'failed') {
              scanResults.push(result);
              renderRadarRow(result);
            }
          }
        }

        const workers = Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker());
        await Promise.all(workers);

        if (scanGenerationId === currentGen) {
          showToast('Radar scan completed! Found ' + scanResults.length + ' reachable endpoints.');
          // Persist best results to D1
          if (scanResults.length > 0) {
            scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
            await apiRequest('/api/radar/results', {
              method: 'POST',
              body: { results: scanResults.slice(0, 20) }
            }).catch(() => {});
          }
        }
      } catch (err) {
        if (scanGenerationId === currentGen) {
          showToast(err.message || 'Scan error', 'error');
        }
      } finally {
        if (scanGenerationId === currentGen) {
          stopRadarScan();
        }
      }
    }

    function stopRadarScan() {
      isScanning = false;
      document.getElementById('btn-start-radar').style.display = 'inline-flex';
      document.getElementById('btn-stop-radar').style.display = 'none';
    }

    function clearRadarResults() {
      scanGenerationId++;
      isScanning = false;
      scanResults = [];
      document.getElementById('radar-results-body').innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 36px;">Results cleared.</td></tr>';
      document.getElementById('radar-status-bar').style.display = 'none';
      stopRadarScan();
    }

    async function testIpLatency(ip, genId) {
      if (scanGenerationId !== genId) return null;
      const start = performance.now();
      try {
        // Test HTTPS connection via image/trace probe
        await fetch('https://' + ip + '/cdn-cgi/trace', {
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(2500)
        });
        const elapsed = Math.round(performance.now() - start);
        let status = 'excellent';
        if (elapsed > 300) status = 'fair';
        else if (elapsed > 150) status = 'good';
        return { ip, latency_ms: elapsed, status };
      } catch {
        return { ip, latency_ms: 0, status: 'failed' };
      }
    }

    function renderRadarRow(res) {
      const tbody = document.getElementById('radar-results-body');
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">\${res.ip}</span></td>
        <td><span style="font-family: var(--font-mono); color: #10B981;">\${res.latency_ms} ms</span></td>
        <td><span class="status-badge"><span class="status-dot"></span>\${res.status}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="copyToClipboard('\${res.ip}')" style="padding: 4px 8px; font-size: 11px;">
            Copy
          </button>
        </td>
      \`;
      tbody.appendChild(tr);
    }

    async function applyToSelectedUser() {
      const userId = document.getElementById('radar-user-select').value;
      if (!userId) {
        showToast('Please select a user first', 'error');
        return;
      }
      if (scanResults.length === 0) {
        showToast('No scanned clean IPs available. Run radar scan first.', 'error');
        return;
      }
      scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
      const bestIp = scanResults[0].ip;

      try {
        await apiRequest('/api/users/' + userId, {
          method: 'PATCH',
          body: { clean_ip_mode: 'manual', clean_ip: bestIp }
        });
        showToast('Applied clean IP ' + bestIp + ' to user!');
      } catch (err) {
        showToast(err.message || 'Failed to apply IP', 'error');
      }
    }

    async function applyGlobally() {
      if (scanResults.length === 0) {
        showToast('No scanned clean IPs available. Run radar scan first.', 'error');
        return;
      }
      scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
      const topIps = scanResults.slice(0, 3).map(r => r.ip).join(', ');

      try {
        await apiRequest('/api/settings', {
          method: 'POST',
          body: { key: 'global_clean_ips', value: topIps }
        });
        showToast('Updated global clean IPs: ' + topIps);
      } catch (err) {
        showToast(err.message || 'Failed to update global clean IPs', 'error');
      }
    }
  <\/script>
  `;
}
__name(renderRadarView, "renderRadarView");

// src/ui/routing.ts
function renderRoutingView(lang, globalCleanIps, outboundMode) {
  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, "nav_routing")}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      Configure global clean IP frontend pools and outbound routing architecture.
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
    <!-- Clean IP Pool -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Global Clean IP Pool</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
        Comma or newline-separated Cloudflare frontend IPs. These are appended to user subscriptions as alternate clean nodes while keeping proper Host and SNI headers.
      </p>
      <form onsubmit="handleSaveCleanIps(event)">
        <div class="form-group">
          <textarea id="routing-clean-ips" class="form-input" rows="6" style="font-family: var(--font-mono); font-size: 12px;" placeholder="104.16.132.229&#10;104.17.157.100&#10;172.64.155.209">${globalCleanIps}</textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ${t(lang, "save_changes")}
        </button>
      </form>
    </div>

    <!-- Outbound Architecture -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Outbound Architecture</span>
        <span class="status-badge"><span class="status-dot"></span>Active</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px;">
          <div style="font-weight: 600; color: #FFF; margin-bottom: 4px;">Direct Cloudflare Edge Outbound</div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">
            The Cloudflare Worker initiates native TCP socket connections directly to public internet destinations via the <code>cloudflare:sockets</code> API.
          </p>
          <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #A5B4FC; border-color: rgba(99, 102, 241, 0.3);">
            Default &bull; Zero External Infrastructure
          </span>
        </div>

        <div style="padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; opacity: 0.85;">
          <div style="font-weight: 600; color: #FFF; margin-bottom: 4px;">Optional C1 Backend Node (Future/Modular)</div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">
            Enables forwarding to dedicated Xray-core / Reality / WireGuard backend nodes for advanced egress policies.
          </p>
          <span style="font-size: 11px; color: var(--text-muted);">
            Status: Disabled (Modular architecture ready)
          </span>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function handleSaveCleanIps(e) {
      e.preventDefault();
      const val = document.getElementById('routing-clean-ips').value.trim();
      try {
        await apiRequest('/api/settings', {
          method: 'POST',
          body: { key: 'global_clean_ips', value: val }
        });
        showToast('Clean IP pool updated successfully');
      } catch (err) {
        showToast(err.message || 'Failed to save settings', 'error');
      }
    }
  <\/script>
  `;
}
__name(renderRoutingView, "renderRoutingView");

// src/ui/settings.ts
function renderSettingsView(lang, data) {
  const { settings, workerVersion, migrationVersion, d1Healthy, kvHealthy } = data;
  const panelTitle = settings["panel_title"] || "C1 Proxy Control";
  const nodePrefix = settings["node_prefix"] || "C1";
  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, "nav_settings")}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      Manage panel configuration, system security, backups, and runtime diagnostics.
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
    <!-- General Settings -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, "general_settings")}</span>
      </div>
      <form onsubmit="handleSaveGeneral(event)">
        <div class="form-group">
          <label class="form-label">Panel Title</label>
          <input type="text" id="set-panel-title" class="form-input" value="${panelTitle}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Subscription Node Prefix</label>
          <input type="text" id="set-node-prefix" class="form-input" value="${nodePrefix}" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
          ${t(lang, "save_changes")}
        </button>
      </form>
    </div>

    <!-- Backup & Restore -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, "backup_restore")}</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Export canonical D1 database state (users, inbounds, settings) or restore from an existing JSON backup.
      </p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="/api/backup/export" download="c1-proxy-backup.json" class="btn btn-secondary" style="width: 100%;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>${t(lang, "download_backup")}</span>
        </a>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 4px;">
          <label class="form-label">${t(lang, "upload_restore")}</label>
          <input type="file" id="restore-file-input" accept=".json" class="form-input" onchange="previewRestoreFile(event)" />
        </div>
      </div>
    </div>

    <!-- Diagnostics & Health -->
    <div class="card" style="grid-column: 1 / -1;">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>System Diagnostics & Environment</span>
        <button class="btn btn-secondary" onclick="exportRedactedDiagnostics()" style="font-size: 11px; padding: 4px 10px;">
          Export Redacted JSON
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: var(--bg-surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">Worker Engine Version</div>
          <div style="font-family: var(--font-mono); font-weight: 600; color: #FFF; margin-top: 4px;">v${workerVersion}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">D1 Database State</div>
          <div style="font-weight: 600; color: #10B981; margin-top: 4px;">\u25CF ${d1Healthy ? "Connected" : "Unavailable"}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">KV Hot-Path Cache</div>
          <div style="font-weight: 600; color: #10B981; margin-top: 4px;">\u25CF ${kvHealthy ? "Active" : "Fallback"}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">Schema Migration Level</div>
          <div style="font-family: var(--font-mono); font-weight: 600; color: #8B5CF6; margin-top: 4px;">Revision ${migrationVersion}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Restore Preview Modal -->
  <div id="restore-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Confirm Database Restore</h3>
        <button class="modal-close" onclick="closeModal('restore-modal')">&times;</button>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Please review the backup manifest before importing. Existing records with identical usernames or inbounds will be merged.
      </p>
      <div id="restore-summary" style="background: var(--bg-surface); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 12px; margin-bottom: 20px;"></div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="closeModal('restore-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="executeRestore()">Confirm Restore</button>
      </div>
    </div>
  </div>

  <script>
    let pendingRestoreData = null;

    async function handleSaveGeneral(e) {
      e.preventDefault();
      const title = document.getElementById('set-panel-title').value.trim();
      const prefix = document.getElementById('set-node-prefix').value.trim();

      try {
        await apiRequest('/api/settings/bulk', {
          method: 'POST',
          body: {
            panel_title: title,
            node_prefix: prefix,
          }
        });
        showToast('Settings saved successfully');
      } catch (err) {
        showToast(err.message || 'Failed to save settings', 'error');
      }
    }

    function previewRestoreFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target.result);
          if (!json.version || !json.users) {
            throw new Error('Invalid C1 backup schema');
          }
          pendingRestoreData = json;
          const summary = 'Backup Version: ' + json.version + '<br>' +
                          'Exported At: ' + (json.exported_at || 'Unknown') + '<br>' +
                          'Users to Restore: ' + json.users.length + '<br>' +
                          'Inbounds to Restore: ' + (json.inbounds ? json.inbounds.length : 0);
          document.getElementById('restore-summary').innerHTML = summary;
          openModal('restore-modal');
        } catch (err) {
          showToast('Failed to parse backup file: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    }

    async function executeRestore() {
      if (!pendingRestoreData) return;
      try {
        await apiRequest('/api/backup/restore', {
          method: 'POST',
          body: pendingRestoreData
        });
        showToast('Restore completed successfully!');
        closeModal('restore-modal');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message || 'Restore failed', 'error');
      }
    }

    async function exportRedactedDiagnostics() {
      try {
        const diag = await apiRequest('/api/diagnostics');
        const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'c1-diagnostics-redacted.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        showToast('Failed to fetch diagnostics', 'error');
      }
    }
  <\/script>
  `;
}
__name(renderSettingsView, "renderSettingsView");

// src/ui/subscription-page.ts
function formatBytes4(bytes) {
  if (!bytes)
    return "0 B";
  if (bytes < 1024)
    return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024)
    return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024)
    return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
__name(formatBytes4, "formatBytes");
function renderPublicSubscriptionPage(user, inbounds, serverHost, serverOrigin, cleanIps = []) {
  const isExpired = user.expires_at && new Date(user.expires_at).getTime() < Date.now();
  const subUrl = `${serverOrigin}/s/${user.subscription_token}`;
  const clashUrl = `${subUrl}?format=clash`;
  const singboxUrl = `${subUrl}?format=singbox`;
  const karingUrl = `${subUrl}?format=karing`;
  const base64Url = `${subUrl}?format=base64`;
  const rawUrl = `${subUrl}?format=raw`;
  const nodeOptions = generateAllNodeOptions(user, inbounds, serverHost, cleanIps);
  const totalNodes = nodeOptions.length;
  const vlessInbound = inbounds.find((i) => i.protocol === "vless");
  const trojanInbound = inbounds.find((i) => i.protocol === "trojan");
  const ssInbound = inbounds.find((i) => i.protocol === "shadowsocks");
  const vlessUri = vlessInbound && user.protocol_vless_enabled ? buildVlessUri({ user, inbound: vlessInbound, serverHost }) : "";
  const trojanUri = trojanInbound && user.protocol_trojan_enabled ? buildTrojanUri({ user, inbound: trojanInbound, serverHost }) : "";
  const ssUri = ssInbound && user.protocol_shadowsocks_enabled ? buildShadowsocksUri({ user, inbound: ssInbound, serverHost }) : "";
  const vlessQr = vlessUri ? generateQrSvg(vlessUri, 200) : "";
  const trojanQr = trojanUri ? generateQrSvg(trojanUri, 200) : "";
  const ssQr = ssUri ? generateQrSvg(ssUri, 200) : "";
  const subQr = generateQrSvg(subUrl, 200);
  const trafficPercent = user.quota_bytes > 0 ? Math.min(100, Math.round(user.used_bytes / user.quota_bytes * 100)) : 0;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C1 Subscription - ${user.name || user.username}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-surface: #11141B;
      --bg-card: #151922;
      --border-subtle: #1F2633;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      --accent: #6366F1;
      --accent-purple: #8B5CF6;
      --success: #10B981;
      --font-sans: 'Outfit', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 680px;
    }
    .header-branding {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #FFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .user-profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .progress-bar {
      height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden; margin: 12px 0;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-purple)); width: ${trafficPercent}%;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease;
      text-decoration: none; color: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      color: #FFF; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .btn-secondary {
      background: #1C2230; color: #FFF; border-color: var(--border-subtle);
    }
    .btn-secondary:hover { background: #252D3D; }
    .grid-clients {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 14px;
    }
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #1C2230; border: 1px solid var(--accent); color: #FFF;
      padding: 10px 20px; border-radius: 8px; font-size: 13px; display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-branding">
      ${renderLogoSvg(36)}
      <span class="brand-title">C1 Proxy Subscription</span>
    </div>

    <!-- User Status Card -->
    <div class="card">
      <div class="user-profile-header">
        <div>
          <h2 style="font-size: 20px; font-weight: 700;">${user.name || user.username}</h2>
          <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">Universal Subscription Portal</div>
        </div>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>${user.enabled && !isExpired ? "Active" : "Expired/Disabled"}</span>
        </div>
      </div>

      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
        Bandwidth: <strong style="color: #FFF;">${formatBytes4(user.used_bytes)}</strong> / ${user.quota_bytes > 0 ? formatBytes4(user.quota_bytes) : "Unlimited"}
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
        <span>Expires: ${user.expires_at ? new Date(user.expires_at).toLocaleDateString() : "Never"}</span>
        <span>Available Nodes: <strong style="color: #FFF;">${totalNodes}</strong></span>
      </div>
    </div>

    <!-- Universal Link Card -->
    <div class="card">
      <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Universal Subscription URL</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 16px;">
        <input type="text" id="sub-url-input" value="${subUrl}" readonly style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; color: #FFF; font-family: var(--font-mono); font-size: 12px;" />
        <button class="btn btn-primary" onclick="copyText('${subUrl}')">Copy</button>
      </div>

      <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">1-Click Import & Formats:</div>
      <div class="grid-clients">
        <button class="btn btn-secondary" onclick="copyText('${karingUrl}')">Karing</button>
        <button class="btn btn-secondary" onclick="copyText('${clashUrl}')">Clash / Mihomo</button>
        <button class="btn btn-secondary" onclick="copyText('${singboxUrl}')">sing-box</button>
        <button class="btn btn-secondary" onclick="copyText('${base64Url}')">Base64</button>
        <a href="${rawUrl}" target="_blank" class="btn btn-secondary">Raw URIs</a>
      </div>

      <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: center;">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Universal Subscription QR Code:</div>
        <div style="padding: 12px; background: #FFF; border-radius: 12px;">${subQr}</div>
      </div>
    </div>

    <!-- Direct Nodes -->
    ${vlessUri ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">VLESS Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${vlessUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${vlessQr}
      </div>
    </div>
    ` : ""}

    ${trojanUri ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">Trojan Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${trojanUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${trojanQr}
      </div>
    </div>
    ` : ""}

    ${ssUri ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">Shadowsocks Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${ssUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${ssQr}
      </div>
    </div>
    ` : ""}
  </div>

  <div id="toast" class="toast">Link copied to clipboard!</div>

  <script>
    function copyText(t) {
      navigator.clipboard.writeText(t).then(() => {
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
      });
    }
  <\/script>
</body>
</html>`;
}
__name(renderPublicSubscriptionPage, "renderPublicSubscriptionPage");

// src/ui/install.ts
function renderInstallView(lang, claimRequired = false) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, "install_title")} - ${t(lang, "brand")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-card: #151922;
      --border-subtle: #1F2633;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --accent: #6366F1;
      --accent-purple: #8B5CF6;
      --danger: #EF4444;
      --font-sans: 'Outfit', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .install-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
    }
    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      margin-top: 14px;
    }
    .brand-subtitle {
      color: var(--text-secondary);
      font-size: 13px;
      margin-top: 6px;
    }
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px;
    }
    .form-input {
      width: 100%; background: #11141B; border: 1px solid var(--border-subtle);
      border-radius: 8px; padding: 10px 14px; color: #FFF; font-size: 14px;
    }
    .form-input:focus {
      outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .btn-submit {
      width: 100%; padding: 11px; border-radius: 8px; font-weight: 600;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      color: #FFF; border: none; cursor: pointer; font-size: 14px; margin-top: 8px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .error-box {
      background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171; padding: 10px 14px; border-radius: 8px; font-size: 12px;
      margin-bottom: 18px; display: none;
    }
  </style>
</head>
<body>
  <div class="install-card">
    <div class="brand-header">
      ${renderLogoSvg(48)}
      <h1 class="brand-title">${t(lang, "install_title")}</h1>
      <p class="brand-subtitle">${t(lang, "install_subtitle")}</p>
    </div>

    <div id="error-box" class="error-box"></div>

    <form onsubmit="handleInstall(event)">
      <div class="form-group">
        <label class="form-label">${t(lang, "admin_username")}</label>
        <input type="text" id="admin-user" class="form-input" placeholder="admin" value="admin" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, "admin_password")} (min 8 characters)</label>
        <input type="password" id="admin-pass" class="form-input" minlength="8" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, "confirm_password")}</label>
        <input type="password" id="admin-pass-confirm" class="form-input" minlength="8" required />
      </div>
      ${claimRequired ? `
      <div class="form-group">
        <label class="form-label">${t(lang, "claim_token_optional")}</label>
        <input type="password" id="claim-token" class="form-input" placeholder="Enter C1_CLAIM_TOKEN" />
      </div>
      ` : ""}
      <button type="submit" id="btn-submit" class="btn-submit">${t(lang, "create_admin_btn")}</button>
    </form>
  </div>

  <script>
    async function handleInstall(e) {
      e.preventDefault();
      const errBox = document.getElementById('error-box');
      errBox.style.display = 'none';

      const username = document.getElementById('admin-user').value.trim();
      const pass = document.getElementById('admin-pass').value;
      const confirm = document.getElementById('admin-pass-confirm').value;
      const claimInput = document.getElementById('claim-token');
      const claimToken = claimInput ? claimInput.value.trim() : '';

      if (pass !== confirm) {
        errBox.innerText = 'Passwords do not match.';
        errBox.style.display = 'block';
        return;
      }

      if (pass.length < 8) {
        errBox.innerText = 'Password must be at least 8 characters long.';
        errBox.style.display = 'block';
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerText = 'Setting up...';

      try {
        const res = await fetch('/api/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: pass, claim_token: claimToken })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Setup failed');
        }
        window.location.href = '/admin';
      } catch (err) {
        errBox.innerText = err.message || 'Failed to complete setup';
        errBox.style.display = 'block';
        btn.disabled = false;
        btn.innerText = '${t(lang, "create_admin_btn")}';
      }
    }
  <\/script>
</body>
</html>`;
}
__name(renderInstallView, "renderInstallView");

// src/ui/login.ts
function renderLoginView(lang) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - ${t(lang, "brand_control")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-card: #151922;
      --border-subtle: #1F2633;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --accent: #6366F1;
      --accent-purple: #8B5CF6;
      --danger: #EF4444;
      --font-sans: 'Outfit', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
    }
    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      margin-top: 14px;
    }
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px;
    }
    .form-input {
      width: 100%; background: #11141B; border: 1px solid var(--border-subtle);
      border-radius: 8px; padding: 10px 14px; color: #FFF; font-size: 14px;
    }
    .form-input:focus {
      outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .btn-submit {
      width: 100%; padding: 11px; border-radius: 8px; font-weight: 600;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      color: #FFF; border: none; cursor: pointer; font-size: 14px; margin-top: 8px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .error-box {
      background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171; padding: 10px 14px; border-radius: 8px; font-size: 12px;
      margin-bottom: 18px; display: none;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="brand-header">
      ${renderLogoSvg(44)}
      <h1 class="brand-title">${t(lang, "brand_control")}</h1>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">Sign in to access control plane</p>
    </div>

    <div id="error-box" class="error-box"></div>

    <form onsubmit="handleLogin(event)">
      <div class="form-group">
        <label class="form-label">${t(lang, "admin_username")}</label>
        <input type="text" id="login-user" class="form-input" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, "admin_password")}</label>
        <input type="password" id="login-pass" class="form-input" required />
      </div>
      <button type="submit" id="btn-login" class="btn-submit">Sign In</button>
    </form>
  </div>

  <script>
    async function handleLogin(e) {
      e.preventDefault();
      const errBox = document.getElementById('error-box');
      errBox.style.display = 'none';

      const username = document.getElementById('login-user').value.trim();
      const password = document.getElementById('login-pass').value;

      const btn = document.getElementById('btn-login');
      btn.disabled = true;
      btn.innerText = 'Signing in...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Invalid username or password');
        }
        window.location.href = '/admin';
      } catch (err) {
        errBox.innerText = err.message || 'Login failed';
        errBox.style.display = 'block';
        btn.disabled = false;
        btn.innerText = 'Sign In';
      }
    }
  <\/script>
</body>
</html>`;
}
__name(renderLoginView, "renderLoginView");

// src/transports/http/probe.ts
function renderDecoyProbePage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edge Network Status</title>
  <style>
    body {
      background-color: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .status-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(46, 160, 67, 0.15);
      color: #3fb950;
      border: 1px solid rgba(46, 160, 67, 0.4);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .dot {
      width: 6px; height: 6px; background: #3fb950; border-radius: 50%;
    }
    h1 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #f0f6fc; }
    p { font-size: 13px; color: #8b949e; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="status-card">
    <div class="badge"><span class="dot"></span> All Systems Operational</div>
    <h1>Edge Gateway Active</h1>
    <p>Global edge distribution node is functioning normally. HTTPS and HTTP/2 connections terminated securely.</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
__name(renderDecoyProbePage, "renderDecoyProbePage");

// src/index.ts
var router = new Router();
router.get("/healthz", async (_req, _params, ctx) => {
  let dbOk = false;
  try {
    const adminCount = await ctx.repo.getAdminCount();
    dbOk = adminCount >= 0;
  } catch {
  }
  return jsonResponse({
    status: dbOk ? "ok" : "degraded",
    version: ctx.env.C1_VERSION || "1.0.0",
    d1: dbOk ? "healthy" : "error",
    kv: ctx.env.KV ? "bound" : "fallback"
  });
});
router.get("/install", async (_req, _params, ctx) => {
  const count3 = await ctx.repo.getAdminCount();
  if (count3 > 0) {
    return redirectResponse("/login");
  }
  const claimRequired = Boolean(ctx.env.C1_CLAIM_TOKEN);
  return htmlResponse(renderInstallView(ctx.lang, claimRequired));
});
router.post("/api/install", async (req, _params, ctx) => {
  const count3 = await ctx.repo.getAdminCount();
  if (count3 > 0) {
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, "Application is already initialized", 400);
  }
  const body = await req.json();
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (ctx.env.C1_CLAIM_TOKEN && ctx.env.C1_CLAIM_TOKEN !== body.claim_token) {
    throw new C1Error(ErrorCode.AUTH_CLAIM_REQUIRED, "Invalid C1_CLAIM_TOKEN provided", 403);
  }
  const passHash = await hashPassword(password);
  const salt = passHash.split("$")[4];
  const admin = await ctx.repo.createAdmin(username, passHash, salt);
  await recordAudit(ctx.repo, "admin_install", username, { username });
  const { token } = await createSessionToken(admin.id, admin.username, ctx.sessionSecret);
  const cookie = buildSetCookieHeader(SESSION_COOKIE_NAME, token, 7 * 86400);
  return jsonResponse({ success: true }, 200, { "Set-Cookie": cookie });
});
router.get("/login", async (_req, _params, ctx) => {
  const count3 = await ctx.repo.getAdminCount();
  if (count3 === 0) {
    return redirectResponse("/install");
  }
  if (ctx.session) {
    return redirectResponse("/admin");
  }
  return htmlResponse(renderLoginView(ctx.lang));
});
router.post("/api/auth/login", async (req, _params, ctx) => {
  const clientIp = req.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(ctx.env.KV, `login:${clientIp}`, 5, 60);
  if (!rl.allowed) {
    throw new C1Error(ErrorCode.AUTH_RATE_LIMITED, `Too many login attempts. Retry in ${rl.resetIn}s`, 429);
  }
  const body = await req.json();
  const username = (body.username || "").trim();
  const password = body.password || "";
  const admin = await ctx.repo.getAdminByUsername(username);
  if (!admin) {
    await recordAudit(ctx.repo, "login_failed", username, { reason: "User not found" }, clientIp);
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid username or password", 401);
  }
  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    await recordAudit(ctx.repo, "login_failed", username, { reason: "Wrong password" }, clientIp);
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid username or password", 401);
  }
  await recordAudit(ctx.repo, "login_success", username, {}, clientIp);
  const { token } = await createSessionToken(admin.id, admin.username, ctx.sessionSecret);
  const cookie = buildSetCookieHeader(SESSION_COOKIE_NAME, token, 7 * 86400);
  return jsonResponse({ success: true }, 200, { "Set-Cookie": cookie });
});
router.post("/api/auth/logout", async (_req, _params, _ctx) => {
  const clearCookie = buildClearCookieHeader(SESSION_COOKIE_NAME);
  return jsonResponse({ success: true }, 200, { "Set-Cookie": clearCookie });
});
router.get("/s/:token", async (req, params, ctx) => {
  const token = params.token;
  const user = await ctx.repo.getUserBySubscriptionToken(token);
  if (!user || !user.enabled) {
    return new Response("Subscription not found or disabled", { status: 404 });
  }
  const inbounds = await ctx.repo.getUserInbounds(user.id);
  const url = new URL(req.url);
  const serverHost = url.hostname;
  const serverOrigin = url.origin;
  const globalCleanIpsStr = await ctx.repo.getSetting("global_clean_ips") || "";
  const globalCleanIps = globalCleanIpsStr.split(/[\r\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const radarResults = await ctx.repo.getRecentRadarResults(5);
  const radarIps = radarResults.map((r) => r.ip);
  const cleanIps = resolveCleanIpCandidates(user, globalCleanIps, radarIps);
  const acceptHeader = req.headers.get("accept") || "";
  const isExplicitFormat = url.searchParams.has("format");
  if (acceptHeader.includes("text/html") && !isExplicitFormat) {
    return htmlResponse(renderPublicSubscriptionPage(user, inbounds, serverHost, serverOrigin, cleanIps));
  }
  const nodeOptions = generateAllNodeOptions(user, inbounds, serverHost, cleanIps);
  const format = detectSubscriptionFormat(req);
  return buildSubscriptionResponse(user, nodeOptions, format);
});
router.get("/edge/:token/vless", async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, "vless", { DB: ctx.env.DB, KV: ctx.env.KV });
});
router.get("/edge/:token/trojan", async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, "trojan", { DB: ctx.env.DB, KV: ctx.env.KV });
});
router.get("/edge/:token/ss", async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, "shadowsocks", { DB: ctx.env.DB, KV: ctx.env.KV });
});
function requireAuth(ctx) {
  if (!ctx.session) {
    throw new C1Error(ErrorCode.AUTH_UNAUTHORIZED, "Authentication required", 401);
  }
  return ctx.session;
}
__name(requireAuth, "requireAuth");
router.get("/admin", async (req, _params, ctx) => {
  const count3 = await ctx.repo.getAdminCount();
  if (count3 === 0)
    return redirectResponse("/install");
  if (!ctx.session)
    return redirectResponse("/login");
  const users = await ctx.repo.listUsers();
  const auditLogs = await ctx.repo.listAuditLogs(10);
  const content = renderDashboardView(ctx.lang, {
    users,
    auditLogs,
    d1Healthy: true,
    kvHealthy: Boolean(ctx.env.KV),
    migrationsCurrent: true
  });
  return htmlResponse(
    renderShell({
      title: "Dashboard",
      lang: ctx.lang,
      activeNav: "overview",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/users", async (req, _params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const users = await ctx.repo.listUsers();
  const url = new URL(req.url);
  const content = renderUsersView(ctx.lang, users, url.origin);
  return htmlResponse(
    renderShell({
      title: "Users",
      lang: ctx.lang,
      activeNav: "users",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/users/:id", async (req, params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const user = await ctx.repo.getUserById(params.id);
  if (!user)
    return redirectResponse("/admin/users");
  const inbounds = await ctx.repo.getUserInbounds(user.id);
  const url = new URL(req.url);
  const content = renderUserDetailView(ctx.lang, user, inbounds, url.hostname, url.origin);
  return htmlResponse(
    renderShell({
      title: `User: ${user.name || user.username}`,
      lang: ctx.lang,
      activeNav: "users",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/inbounds", async (_req, _params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const inbounds = await ctx.repo.listInbounds();
  const content = renderInboundsView(ctx.lang, inbounds);
  return htmlResponse(
    renderShell({
      title: "Inbounds",
      lang: ctx.lang,
      activeNav: "inbounds",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/radar", async (_req, _params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const users = await ctx.repo.listUsers();
  const recentResults = await ctx.repo.getRecentRadarResults(20);
  const content = renderRadarView(ctx.lang, users, recentResults);
  return htmlResponse(
    renderShell({
      title: "C1 Radar",
      lang: ctx.lang,
      activeNav: "radar",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/routing", async (_req, _params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const cleanIps = await ctx.repo.getSetting("global_clean_ips") || "";
  const content = renderRoutingView(ctx.lang, cleanIps, "direct");
  return htmlResponse(
    renderShell({
      title: "Routing",
      lang: ctx.lang,
      activeNav: "routing",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/admin/settings", async (_req, _params, ctx) => {
  if (!ctx.session)
    return redirectResponse("/login");
  const settings = await ctx.repo.getAllSettings();
  const content = renderSettingsView(ctx.lang, {
    settings,
    workerVersion: ctx.env.C1_VERSION || "1.0.0",
    migrationVersion: 1,
    d1Healthy: true,
    kvHealthy: Boolean(ctx.env.KV)
  });
  return htmlResponse(
    renderShell({
      title: "Settings",
      lang: ctx.lang,
      activeNav: "settings",
      csrfToken: ctx.session.csrfToken,
      content
    })
  );
});
router.get("/api/users", async (_req, _params, ctx) => {
  requireAuth(ctx);
  const users = await ctx.repo.listUsers();
  return jsonResponse(users.map(sanitizeUserForResponse));
});
router.post("/api/users", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const body = await req.json();
  const user = await userService.createUser(body);
  await recordAudit(ctx.repo, "user_create", session.username, { userId: user.id, username: user.username });
  return jsonResponse(sanitizeUserForResponse(user), 201);
});
router.patch("/api/users/:id", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const body = await req.json();
  await userService.updateUser(params.id, body);
  await recordAudit(ctx.repo, "user_update", session.username, { userId: params.id, updates: body });
  return jsonResponse({ success: true });
});
router.delete("/api/users/:id", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  await userService.deleteUser(params.id);
  await recordAudit(ctx.repo, "user_delete", session.username, { userId: params.id });
  return jsonResponse({ success: true });
});
router.post("/api/users/:id/toggle", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  const userService = new UserService(ctx.repo);
  await userService.toggleUser(params.id, Boolean(body.enabled));
  await recordAudit(ctx.repo, "user_toggle", session.username, { userId: params.id, enabled: body.enabled });
  return jsonResponse({ success: true });
});
router.post("/api/users/:id/reset-traffic", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  await userService.resetTraffic(params.id);
  await recordAudit(ctx.repo, "traffic_reset", session.username, { userId: params.id });
  return jsonResponse({ success: true });
});
router.post("/api/users/:id/rotate-token", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const token = await userService.rotateSubscriptionToken(params.id);
  await recordAudit(ctx.repo, "credential_rotate", session.username, { userId: params.id, type: "sub_token" });
  return jsonResponse({ success: true, token });
});
router.post("/api/users/:id/rotate-vless", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const uuid = await userService.rotateVlessUuid(params.id);
  await recordAudit(ctx.repo, "credential_rotate", session.username, { userId: params.id, type: "vless_uuid" });
  return jsonResponse({ success: true, uuid });
});
router.post("/api/users/:id/rotate-trojan", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const pass = await userService.rotateTrojanPassword(params.id);
  await recordAudit(ctx.repo, "credential_rotate", session.username, { userId: params.id, type: "trojan_password" });
  return jsonResponse({ success: true, pass });
});
router.post("/api/users/:id/rotate-shadowsocks", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const userService = new UserService(ctx.repo);
  const pass = await userService.rotateShadowsocksPassword(params.id);
  await recordAudit(ctx.repo, "credential_rotate", session.username, { userId: params.id, type: "ss_password" });
  return jsonResponse({ success: true, pass });
});
router.get("/api/inbounds", async (_req, _params, ctx) => {
  requireAuth(ctx);
  const inbounds = await ctx.repo.listInbounds();
  return jsonResponse(inbounds);
});
router.post("/api/inbounds", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  const inboundService = new InboundService(ctx.repo);
  const created = await inboundService.createInbound(body);
  await recordAudit(ctx.repo, "inbound_create", session.username, { inboundId: created.id, name: created.name });
  return jsonResponse(created, 201);
});
router.delete("/api/inbounds/:id", async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const inboundService = new InboundService(ctx.repo);
  await inboundService.deleteInbound(params.id);
  await recordAudit(ctx.repo, "inbound_delete", session.username, { inboundId: params.id });
  return jsonResponse({ success: true });
});
router.get("/api/radar/candidates", async (_req, _params, ctx) => {
  requireAuth(ctx);
  const globalCleanIpsStr = await ctx.repo.getSetting("global_clean_ips") || "";
  const customPool = globalCleanIpsStr.split(/[\r\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const candidates = Array.from(/* @__PURE__ */ new Set([...customPool, ...RADAR_CANDIDATE_POOLS]));
  return jsonResponse({ candidates });
});
router.post("/api/radar/results", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  if (body.results && Array.isArray(body.results)) {
    await ctx.repo.saveRadarResults(body.results);
  }
  return jsonResponse({ success: true });
});
router.post("/api/settings", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  await ctx.repo.setSetting(body.key, body.value);
  await recordAudit(ctx.repo, "setting_update", session.username, { key: body.key });
  return jsonResponse({ success: true });
});
router.post("/api/settings/bulk", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  for (const [k, v] of Object.entries(body)) {
    await ctx.repo.setSetting(k, v);
  }
  await recordAudit(ctx.repo, "settings_bulk_update", session.username, { keys: Object.keys(body) });
  return jsonResponse({ success: true });
});
router.get("/api/backup/export", async (_req, _params, ctx) => {
  requireAuth(ctx);
  const users = await ctx.repo.listUsers();
  const inbounds = await ctx.repo.listInbounds();
  const settings = await ctx.repo.getAllSettings();
  const backupManifest = {
    version: 1,
    exported_at: (/* @__PURE__ */ new Date()).toISOString(),
    users: users.map(sanitizeUserForResponse),
    inbounds,
    settings
  };
  return jsonResponse(backupManifest, 200, {
    "Content-Disposition": 'attachment; filename="c1-proxy-backup.json"'
  });
});
router.post("/api/backup/restore", async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);
  const body = await req.json();
  if (!body || !body.version || !Array.isArray(body.users)) {
    throw new C1Error(ErrorCode.VAL_INVALID_INPUT, "Invalid backup schema", 400);
  }
  const userService = new UserService(ctx.repo);
  for (const u of body.users) {
    const existing = await ctx.repo.getUserByUsername(u.username);
    if (!existing) {
      await userService.createUser({
        name: u.name,
        username: u.username,
        quota_bytes: u.quota_bytes,
        daily_quota_bytes: u.daily_quota_bytes,
        expires_at: u.expires_at,
        max_ips: u.max_ips,
        clean_ip_mode: u.clean_ip_mode,
        clean_ip: u.clean_ip,
        notes: u.notes,
        protocol_vless_enabled: u.protocol_vless_enabled,
        protocol_trojan_enabled: u.protocol_trojan_enabled,
        protocol_shadowsocks_enabled: u.protocol_shadowsocks_enabled
      });
    }
  }
  if (body.settings && typeof body.settings === "object") {
    for (const [k, v] of Object.entries(body.settings)) {
      if (k !== "session_secret") {
        await ctx.repo.setSetting(k, String(v));
      }
    }
  }
  await recordAudit(ctx.repo, "backup_restore", session.username, { userCount: body.users.length });
  return jsonResponse({ success: true });
});
router.get("/api/diagnostics", async (_req, _params, ctx) => {
  requireAuth(ctx);
  const settings = await ctx.repo.getAllSettings();
  const userCount = (await ctx.repo.listUsers()).length;
  const inboundCount = (await ctx.repo.listInbounds()).length;
  const diag = {
    worker_version: ctx.env.C1_VERSION || "1.0.0",
    environment: ctx.env.ENVIRONMENT || "production",
    d1_database: "connected",
    kv_cache: ctx.env.KV ? "active" : "memory_fallback",
    user_count: userCount,
    inbound_count: inboundCount,
    settings: redactSensitiveObject(settings),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return jsonResponse(diag);
});
router.get("/", async (_req, _params, ctx) => {
  const adminCount = await ctx.repo.getAdminCount();
  if (adminCount === 0) {
    return redirectResponse("/install");
  }
  if (ctx.session) {
    return redirectResponse("/admin");
  }
  return renderDecoyProbePage();
});
var src_default = {
  async fetch(request, env2) {
    try {
      await ensureMigrations(env2.DB);
      const repo = new C1Repository(env2.DB);
      const url = new URL(request.url);
      const inboundService = new InboundService(repo);
      await inboundService.ensureDefaultInbounds(url.hostname);
      let sessionSecret = env2.C1_SESSION_SECRET || "";
      if (!sessionSecret) {
        const storedSecret = await repo.getSetting("session_secret");
        if (storedSecret) {
          sessionSecret = storedSecret;
        } else {
          sessionSecret = randomToken(32);
          await repo.setSetting("session_secret", sessionSecret);
        }
      }
      const cookies = parseCookies(request.headers.get("Cookie"));
      const sessionToken = cookies[SESSION_COOKIE_NAME];
      const session = sessionToken ? await verifySessionToken(sessionToken, sessionSecret) : null;
      const lang = getLanguage(request);
      const ctx = {
        env: env2,
        session,
        repo,
        sessionSecret,
        lang
      };
      const res = await router.handle(request, ctx);
      if (res) {
        return res;
      }
      return new Response("Not Found", { status: 404 });
    } catch (err) {
      if (err instanceof C1Error) {
        return jsonResponse(
          {
            error: true,
            code: err.code,
            message: err.safeMessage
          },
          err.status
        );
      }
      console.error("[C1-FATAL]", err);
      return jsonResponse(
        {
          error: true,
          code: "C1-SYS-500",
          message: "An unexpected internal error occurred"
        },
        500
      );
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
