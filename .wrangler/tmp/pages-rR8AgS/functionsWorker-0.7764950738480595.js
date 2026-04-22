var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../node_modules/@anthropic-ai/sdk/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
__name(__classPrivateFieldSet, "__classPrivateFieldSet");
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
__name(__classPrivateFieldGet, "__classPrivateFieldGet");

// ../node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs
var uuid4 = /* @__PURE__ */ __name(function() {
  const { crypto } = globalThis;
  if (crypto?.randomUUID) {
    uuid4 = crypto.randomUUID.bind(crypto);
    return crypto.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
}, "uuid4");

// ../node_modules/@anthropic-ai/sdk/internal/errors.mjs
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
__name(isAbortError, "isAbortError");
var castToError = /* @__PURE__ */ __name((err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
        if (err.stack)
          error.stack = err.stack;
        if (err.cause && !error.cause)
          error.cause = err.cause;
        if (err.name)
          error.name = err.name;
        return error;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
}, "castToError");

// ../node_modules/@anthropic-ai/sdk/core/error.mjs
var AnthropicError = class extends Error {
  static {
    __name(this, "AnthropicError");
  }
};
var APIError = class _APIError extends AnthropicError {
  static {
    __name(this, "APIError");
  }
  constructor(status, error, message, headers, type) {
    super(`${_APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.requestID = headers?.get("request-id");
    this.error = error;
    this.type = type ?? null;
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse;
    const type = error?.["error"]?.["type"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers, type);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers, type);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers, type);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers, type);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers, type);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers, type);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers, type);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers, type);
    }
    return new _APIError(status, error, message, headers, type);
  }
};
var APIUserAbortError = class extends APIError {
  static {
    __name(this, "APIUserAbortError");
  }
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  static {
    __name(this, "APIConnectionError");
  }
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  static {
    __name(this, "APIConnectionTimeoutError");
  }
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
  static {
    __name(this, "BadRequestError");
  }
};
var AuthenticationError = class extends APIError {
  static {
    __name(this, "AuthenticationError");
  }
};
var PermissionDeniedError = class extends APIError {
  static {
    __name(this, "PermissionDeniedError");
  }
};
var NotFoundError = class extends APIError {
  static {
    __name(this, "NotFoundError");
  }
};
var ConflictError = class extends APIError {
  static {
    __name(this, "ConflictError");
  }
};
var UnprocessableEntityError = class extends APIError {
  static {
    __name(this, "UnprocessableEntityError");
  }
};
var RateLimitError = class extends APIError {
  static {
    __name(this, "RateLimitError");
  }
};
var InternalServerError = class extends APIError {
  static {
    __name(this, "InternalServerError");
  }
};

// ../node_modules/@anthropic-ai/sdk/internal/utils/values.mjs
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = /* @__PURE__ */ __name((url) => {
  return startsWithSchemeRegexp.test(url);
}, "isAbsoluteURL");
var isArray = /* @__PURE__ */ __name((val) => (isArray = Array.isArray, isArray(val)), "isArray");
var isReadonlyArray = isArray;
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
__name(maybeObj, "maybeObj");
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
__name(isEmptyObj, "isEmptyObj");
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
__name(hasOwn, "hasOwn");
var validatePositiveInteger = /* @__PURE__ */ __name((name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new AnthropicError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new AnthropicError(`${name} must be a positive integer`);
  }
  return n;
}, "validatePositiveInteger");
var safeJSON = /* @__PURE__ */ __name((text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
}, "safeJSON");

// ../node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs
var sleep = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");

// ../node_modules/@anthropic-ai/sdk/version.mjs
var VERSION = "0.90.0";

// ../node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs
var isRunningInBrowser = /* @__PURE__ */ __name(() => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
}, "isRunningInBrowser");
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
__name(getDetectedPlatform, "getDetectedPlatform");
var getPlatformProperties = /* @__PURE__ */ __name(() => {
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, "getPlatformProperties");
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match2 = pattern.exec("Cloudflare-Workers");
    if (match2) {
      const major = match2[1] || 0;
      const minor = match2[2] || 0;
      const patch = match2[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
__name(getBrowserInfo, "getBrowserInfo");
var normalizeArch = /* @__PURE__ */ __name((arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
}, "normalizeArch");
var normalizePlatform = /* @__PURE__ */ __name((platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
}, "normalizePlatform");
var _platformHeaders;
var getPlatformHeaders = /* @__PURE__ */ __name(() => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
}, "getPlatformHeaders");

// ../node_modules/@anthropic-ai/sdk/internal/shims.mjs
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
__name(getDefaultFetch, "getDefaultFetch");
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
__name(makeReadableStream, "makeReadableStream");
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      await iter.return?.();
    }
  });
}
__name(ReadableStreamFrom, "ReadableStreamFrom");
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
__name(ReadableStreamToAsyncIterable, "ReadableStreamToAsyncIterable");
async function CancelReadableStream(stream) {
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await stream[Symbol.asyncIterator]().return?.();
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
__name(CancelReadableStream, "CancelReadableStream");

// ../node_modules/@anthropic-ai/sdk/internal/request-options.mjs
var FallbackEncoder = /* @__PURE__ */ __name(({ headers, body }) => {
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}, "FallbackEncoder");

// ../node_modules/@anthropic-ai/sdk/internal/utils/query.mjs
function stringifyQuery(query) {
  return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
    if (value === null) {
      return `${encodeURIComponent(key)}=`;
    }
    throw new AnthropicError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
__name(stringifyQuery, "stringifyQuery");

// ../node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
__name(concatBytes, "concatBytes");
var encodeUTF8_;
function encodeUTF8(str) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
__name(encodeUTF8, "encodeUTF8");
var decodeUTF8_;
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
__name(decodeUTF8, "decodeUTF8");

// ../node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs
var _LineDecoder_buffer;
var _LineDecoder_carriageReturnIndex;
var LineDecoder = class {
  static {
    __name(this, "LineDecoder");
  }
  constructor() {
    _LineDecoder_buffer.set(this, void 0);
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
      lines.push(line);
      __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  flush() {
    if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
      return [];
    }
    return this.decode("\n");
  }
};
_LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
__name(findNewlineIndex, "findNewlineIndex");
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
__name(findDoubleNewlineIndex, "findDoubleNewlineIndex");

// ../node_modules/@anthropic-ai/sdk/internal/utils/log.mjs
var levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
var parseLogLevel = /* @__PURE__ */ __name((maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
}, "parseLogLevel");
function noop() {
}
__name(noop, "noop");
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
__name(makeLogFn, "makeLogFn");
var noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
var cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
__name(loggerFor, "loggerFor");
var formatRequestDetails = /* @__PURE__ */ __name((details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "x-api-key" || name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
}, "formatRequestDetails");

// ../node_modules/@anthropic-ai/sdk/core/streaming.mjs
var _Stream_client;
var Stream = class _Stream {
  static {
    __name(this, "Stream");
  }
  constructor(iterator, controller, client) {
    this.iterator = iterator;
    _Stream_client.set(this, void 0);
    this.controller = controller;
    __classPrivateFieldSet(this, _Stream_client, client, "f");
  }
  static fromSSEResponse(response, controller, client) {
    let consumed = false;
    const logger = client ? loggerFor(client) : console;
    async function* iterator() {
      if (consumed) {
        throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (sse.event === "completion") {
            try {
              yield JSON.parse(sse.data);
            } catch (e) {
              logger.error(`Could not parse message into JSON:`, sse.data);
              logger.error(`From chunk:`, sse.raw);
              throw e;
            }
          }
          if (sse.event === "message_start" || sse.event === "message_delta" || sse.event === "message_stop" || sse.event === "content_block_start" || sse.event === "content_block_delta" || sse.event === "content_block_stop" || sse.event === "message" || sse.event === "user.message" || sse.event === "user.interrupt" || sse.event === "user.tool_confirmation" || sse.event === "user.custom_tool_result" || sse.event === "agent.message" || sse.event === "agent.thinking" || sse.event === "agent.tool_use" || sse.event === "agent.tool_result" || sse.event === "agent.mcp_tool_use" || sse.event === "agent.mcp_tool_result" || sse.event === "agent.custom_tool_use" || sse.event === "agent.thread_context_compacted" || sse.event === "session.status_running" || sse.event === "session.status_idle" || sse.event === "session.status_rescheduled" || sse.event === "session.status_terminated" || sse.event === "session.error" || sse.event === "session.deleted" || sse.event === "span.model_request_start" || sse.event === "span.model_request_end") {
            try {
              yield JSON.parse(sse.data);
            } catch (e) {
              logger.error(`Could not parse message into JSON:`, sse.data);
              logger.error(`From chunk:`, sse.raw);
              throw e;
            }
          }
          if (sse.event === "ping") {
            continue;
          }
          if (sse.event === "error") {
            const body = safeJSON(sse.data) ?? sse.data;
            const type = body?.error?.type;
            throw new APIError(void 0, body, void 0, response.headers, type);
          }
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller, client);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller, client) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    __name(iterLines, "iterLines");
    async function* iterator() {
      if (consumed) {
        throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller, client);
  }
  [(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = /* @__PURE__ */ __name((queue) => {
      return {
        next: /* @__PURE__ */ __name(() => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }, "next")
      };
    }, "teeIterator");
    return [
      new _Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
      new _Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self = this;
    let iter;
    return makeReadableStream({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encodeUTF8(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
};
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
      throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new AnthropicError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
__name(_iterSSEMessages, "_iterSSEMessages");
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
__name(iterSSEChunks, "iterSSEChunks");
var SSEDecoder = class {
  static {
    __name(this, "SSEDecoder");
  }
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
}
__name(partition, "partition");

// ../node_modules/@anthropic-ai/sdk/internal/parse.mjs
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller);
      }
      return Stream.fromSSEResponse(response, props.controller);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = contentType?.split(";")[0]?.trim();
    const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const json = await response.json();
      return addRequestID(json, response);
    }
    const text = await response.text();
    return text;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
__name(defaultParseResponse, "defaultParseResponse");
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("request-id"),
    enumerable: false
  });
}
__name(addRequestID, "addRequestID");

// ../node_modules/@anthropic-ai/sdk/core/api-promise.mjs
var _APIPromise_client;
var APIPromise = class _APIPromise extends Promise {
  static {
    __name(this, "APIPromise");
  }
  constructor(client, responsePromise, parseResponse = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse;
    _APIPromise_client.set(this, void 0);
    __classPrivateFieldSet(this, _APIPromise_client, client, "f");
  }
  _thenUnwrap(transform) {
    return new _APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the `request-id` header which is useful for debugging requests and resporting
   * issues to Anthropic.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
_APIPromise_client = /* @__PURE__ */ new WeakMap();

// ../node_modules/@anthropic-ai/sdk/core/pagination.mjs
var _AbstractPage_client;
var AbstractPage = class {
  static {
    __name(this, "AbstractPage");
  }
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageRequestOptions() != null;
  }
  async getNextPage() {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new AnthropicError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
};
var PagePromise = class extends APIPromise {
  static {
    __name(this, "PagePromise");
  }
  constructor(client, request, Page2) {
    super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
};
var Page = class extends AbstractPage {
  static {
    __name(this, "Page");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
    this.first_id = body.first_id || null;
    this.last_id = body.last_id || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    if (this.options.query?.["before_id"]) {
      const first_id = this.first_id;
      if (!first_id) {
        return null;
      }
      return {
        ...this.options,
        query: {
          ...maybeObj(this.options.query),
          before_id: first_id
        }
      };
    }
    const cursor = this.last_id;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after_id: cursor
      }
    };
  }
};
var PageCursor = class extends AbstractPage {
  static {
    __name(this, "PageCursor");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.next_page = body.next_page || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    const cursor = this.next_page;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        page: cursor
      }
    };
  }
};

// ../node_modules/@anthropic-ai/sdk/internal/uploads.mjs
var checkFileSupport = /* @__PURE__ */ __name(() => {
  if (typeof File === "undefined") {
    const { process } = globalThis;
    const isOldNode = typeof process?.versions?.node === "string" && parseInt(process.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
}, "checkFileSupport");
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
__name(makeFile, "makeFile");
function getName(value, stripPath) {
  const val = typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "";
  return stripPath ? val.split(/[\\/]/).pop() || void 0 : val;
}
__name(getName, "getName");
var isAsyncIterable = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", "isAsyncIterable");
var multipartFormRequestOptions = /* @__PURE__ */ __name(async (opts, fetch2, stripFilenames = true) => {
  return { ...opts, body: await createForm(opts.body, fetch2, stripFilenames) };
}, "multipartFormRequestOptions");
var supportsFormDataMap = /* @__PURE__ */ new WeakMap();
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached)
    return cached;
  const promise = (async () => {
    try {
      const FetchResponse = "Response" in fetch2 ? fetch2.Response : (await fetch2("data:,")).constructor;
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
__name(supportsFormData, "supportsFormData");
var createForm = /* @__PURE__ */ __name(async (body, fetch2, stripFilenames = true) => {
  if (!await supportsFormData(fetch2)) {
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, stripFilenames)));
  return form;
}, "createForm");
var isNamedBlob = /* @__PURE__ */ __name((value) => value instanceof Blob && "name" in value, "isNamedBlob");
var addFormValue = /* @__PURE__ */ __name(async (form, key, value, stripFilenames) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    let options = {};
    const contentType = value.headers.get("Content-Type");
    if (contentType) {
      options = { type: contentType };
    }
    form.append(key, makeFile([await value.blob()], getName(value, stripFilenames), options));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, stripFilenames)));
  } else if (isNamedBlob(value)) {
    form.append(key, makeFile([value], getName(value, stripFilenames), { type: value.type }));
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry, stripFilenames)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
}, "addFormValue");

// ../node_modules/@anthropic-ai/sdk/internal/to-file.mjs
var isBlobLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", "isBlobLike");
var isFileLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value), "isFileLike");
var isResponseLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", "isResponseLike");
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  name || (name = getName(value, true));
  if (isFileLike(value)) {
    if (value instanceof File && name == null && options == null) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], name ?? value.name, {
      type: value.type,
      lastModified: value.lastModified,
      ...options
    });
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  if (!options?.type) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
__name(toFile, "toFile");
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = value?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
__name(getBytes, "getBytes");
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
__name(propsForError, "propsForError");

// ../node_modules/@anthropic-ai/sdk/core/resource.mjs
var APIResource = class {
  static {
    __name(this, "APIResource");
  }
  constructor(client) {
    this._client = client;
  }
};

// ../node_modules/@anthropic-ai/sdk/internal/headers.mjs
var brand_privateNullableHeaders = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
__name(iterateHeaders, "iterateHeaders");
var buildHeaders = /* @__PURE__ */ __name((newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(name);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(name);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(name, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
}, "buildHeaders");

// ../node_modules/@anthropic-ai/sdk/internal/utils/path.mjs
function encodeURIPath(str) {
  return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
__name(encodeURIPath, "encodeURIPath");
var EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
var createPathTagFunction = /* @__PURE__ */ __name((pathEncoder = encodeURIPath) => /* @__PURE__ */ __name(function path2(statics, ...params) {
  if (statics.length === 1)
    return statics[0];
  let postPath = false;
  const invalidSegments = [];
  const path3 = statics.reduce((previousValue, currentValue, index) => {
    if (/[?#]/.test(currentValue)) {
      postPath = true;
    }
    const value = params[index];
    let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
    if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
    value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
      encoded = value + "";
      invalidSegments.push({
        start: previousValue.length + currentValue.length,
        length: encoded.length,
        error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
      });
    }
    return previousValue + currentValue + (index === params.length ? "" : encoded);
  }, "");
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let match2;
  while ((match2 = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match2.index,
      length: match2[0].length,
      error: `Value "${match2[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    const underline = invalidSegments.reduce((acc, segment) => {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      return acc + spaces + arrows;
    }, "");
    throw new AnthropicError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
}, "path"), "createPathTagFunction");
var path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);

// ../node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs
var Environments = class extends APIResource {
  static {
    __name(this, "Environments");
  }
  /**
   * Create a new environment with the specified configuration.
   *
   * @example
   * ```ts
   * const betaEnvironment =
   *   await client.beta.environments.create({
   *     name: 'python-data-analysis',
   *   });
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/environments?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Retrieve a specific environment by ID.
   *
   * @example
   * ```ts
   * const betaEnvironment =
   *   await client.beta.environments.retrieve(
   *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
   *   );
   * ```
   */
  retrieve(environmentID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/environments/${environmentID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update an existing environment's configuration.
   *
   * @example
   * ```ts
   * const betaEnvironment =
   *   await client.beta.environments.update(
   *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
   *   );
   * ```
   */
  update(environmentID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/environments/${environmentID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List environments with pagination support.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaEnvironment of client.beta.environments.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete an environment by ID. Returns a confirmation of the deletion.
   *
   * @example
   * ```ts
   * const betaEnvironmentDeleteResponse =
   *   await client.beta.environments.delete(
   *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
   *   );
   * ```
   */
  delete(environmentID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/environments/${environmentID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Archive an environment by ID. Archived environments cannot be used to create new
   * sessions.
   *
   * @example
   * ```ts
   * const betaEnvironment =
   *   await client.beta.environments.archive(
   *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
   *   );
   * ```
   */
  archive(environmentID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/environments/${environmentID}/archive?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs
var SDK_HELPER_SYMBOL = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function wasCreatedByStainlessHelper(value) {
  return typeof value === "object" && value !== null && SDK_HELPER_SYMBOL in value;
}
__name(wasCreatedByStainlessHelper, "wasCreatedByStainlessHelper");
function collectStainlessHelpers(tools, messages) {
  const helpers = /* @__PURE__ */ new Set();
  if (tools) {
    for (const tool of tools) {
      if (wasCreatedByStainlessHelper(tool)) {
        helpers.add(tool[SDK_HELPER_SYMBOL]);
      }
    }
  }
  if (messages) {
    for (const message of messages) {
      if (wasCreatedByStainlessHelper(message)) {
        helpers.add(message[SDK_HELPER_SYMBOL]);
      }
      if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (wasCreatedByStainlessHelper(block)) {
            helpers.add(block[SDK_HELPER_SYMBOL]);
          }
        }
      }
    }
  }
  return Array.from(helpers);
}
__name(collectStainlessHelpers, "collectStainlessHelpers");
function stainlessHelperHeader(tools, messages) {
  const helpers = collectStainlessHelpers(tools, messages);
  if (helpers.length === 0)
    return {};
  return { "x-stainless-helper": helpers.join(", ") };
}
__name(stainlessHelperHeader, "stainlessHelperHeader");
function stainlessHelperHeaderFromFile(file) {
  if (wasCreatedByStainlessHelper(file)) {
    return { "x-stainless-helper": file[SDK_HELPER_SYMBOL] };
  }
  return {};
}
__name(stainlessHelperHeaderFromFile, "stainlessHelperHeaderFromFile");

// ../node_modules/@anthropic-ai/sdk/resources/beta/files.mjs
var Files = class extends APIResource {
  static {
    __name(this, "Files");
  }
  /**
   * List Files
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fileMetadata of client.beta.files.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/files", Page, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete File
   *
   * @example
   * ```ts
   * const deletedFile = await client.beta.files.delete(
   *   'file_id',
   * );
   * ```
   */
  delete(fileID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/files/${fileID}`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Download File
   *
   * @example
   * ```ts
   * const response = await client.beta.files.download(
   *   'file_id',
   * );
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  download(fileID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/files/${fileID}/content`, {
      ...options,
      headers: buildHeaders([
        {
          "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString(),
          Accept: "application/binary"
        },
        options?.headers
      ]),
      __binaryResponse: true
    });
  }
  /**
   * Get File Metadata
   *
   * @example
   * ```ts
   * const fileMetadata =
   *   await client.beta.files.retrieveMetadata('file_id');
   * ```
   */
  retrieveMetadata(fileID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/files/${fileID}`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Upload File
   *
   * @example
   * ```ts
   * const fileMetadata = await client.beta.files.upload({
   *   file: fs.createReadStream('path/to/file'),
   * });
   * ```
   */
  upload(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/files", multipartFormRequestOptions({
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
        stainlessHelperHeaderFromFile(body.file),
        options?.headers
      ])
    }, this._client));
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/models.mjs
var Models = class extends APIResource {
  static {
    __name(this, "Models");
  }
  /**
   * Get a specific model.
   *
   * The Models API response can be used to determine information about a specific
   * model or resolve a model alias to a model ID.
   *
   * @example
   * ```ts
   * const betaModelInfo = await client.beta.models.retrieve(
   *   'model_id',
   * );
   * ```
   */
  retrieve(modelID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/models/${modelID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        options?.headers
      ])
    });
  }
  /**
   * List available models.
   *
   * The Models API response can be used to determine which models are available for
   * use in the API. More recently released models are listed first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaModelInfo of client.beta.models.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Page, {
      query,
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/user-profiles.mjs
var UserProfiles = class extends APIResource {
  static {
    __name(this, "UserProfiles");
  }
  /**
   * Create User Profile
   *
   * @example
   * ```ts
   * const betaUserProfile =
   *   await client.beta.userProfiles.create();
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/user_profiles?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "user-profiles-2026-03-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Get User Profile
   *
   * @example
   * ```ts
   * const betaUserProfile =
   *   await client.beta.userProfiles.retrieve(
   *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
   *   );
   * ```
   */
  retrieve(userProfileID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/user_profiles/${userProfileID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "user-profiles-2026-03-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update User Profile
   *
   * @example
   * ```ts
   * const betaUserProfile =
   *   await client.beta.userProfiles.update(
   *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
   *   );
   * ```
   */
  update(userProfileID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/user_profiles/${userProfileID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "user-profiles-2026-03-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List User Profiles
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaUserProfile of client.beta.userProfiles.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "user-profiles-2026-03-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Create Enrollment URL
   *
   * @example
   * ```ts
   * const betaUserProfileEnrollmentURL =
   *   await client.beta.userProfiles.createEnrollmentURL(
   *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
   *   );
   * ```
   */
  createEnrollmentURL(userProfileID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/user_profiles/${userProfileID}/enrollment_url?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "user-profiles-2026-03-24"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs
var Versions = class extends APIResource {
  static {
    __name(this, "Versions");
  }
  /**
   * List Agent Versions
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsAgent of client.beta.agents.versions.list(
   *   'agent_011CZkYpogX7uDKUyvBTophP',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(agentID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/v1/agents/${agentID}/versions?beta=true`, PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs
var Agents = class extends APIResource {
  static {
    __name(this, "Agents");
  }
  constructor() {
    super(...arguments);
    this.versions = new Versions(this._client);
  }
  /**
   * Create Agent
   *
   * @example
   * ```ts
   * const betaManagedAgentsAgent =
   *   await client.beta.agents.create({
   *     model: 'claude-sonnet-4-6',
   *     name: 'My First Agent',
   *   });
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/agents?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Get Agent
   *
   * @example
   * ```ts
   * const betaManagedAgentsAgent =
   *   await client.beta.agents.retrieve(
   *     'agent_011CZkYpogX7uDKUyvBTophP',
   *   );
   * ```
   */
  retrieve(agentID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.get(path`/v1/agents/${agentID}?beta=true`, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update Agent
   *
   * @example
   * ```ts
   * const betaManagedAgentsAgent =
   *   await client.beta.agents.update(
   *     'agent_011CZkYpogX7uDKUyvBTophP',
   *     { version: 1 },
   *   );
   * ```
   */
  update(agentID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/agents/${agentID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Agents
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsAgent of client.beta.agents.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Archive Agent
   *
   * @example
   * ```ts
   * const betaManagedAgentsAgent =
   *   await client.beta.agents.archive(
   *     'agent_011CZkYpogX7uDKUyvBTophP',
   *   );
   * ```
   */
  archive(agentID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/agents/${agentID}/archive?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};
Agents.Versions = Versions;

// ../node_modules/@anthropic-ai/sdk/internal/constants.mjs
var MODEL_NONSTREAMING_TOKENS = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};

// ../node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs
function getOutputFormat(params) {
  return params?.output_format ?? params?.output_config?.format;
}
__name(getOutputFormat, "getOutputFormat");
function maybeParseBetaMessage(message, params, opts) {
  const outputFormat = getOutputFormat(params);
  if (!params || !("parse" in (outputFormat ?? {}))) {
    return {
      ...message,
      content: message.content.map((block) => {
        if (block.type === "text") {
          const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
            value: null,
            enumerable: false
          });
          return Object.defineProperty(parsedBlock, "parsed", {
            get() {
              opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
              return null;
            },
            enumerable: false
          });
        }
        return block;
      }),
      parsed_output: null
    };
  }
  return parseBetaMessage(message, params, opts);
}
__name(maybeParseBetaMessage, "maybeParseBetaMessage");
function parseBetaMessage(message, params, opts) {
  let firstParsedOutput = null;
  const content = message.content.map((block) => {
    if (block.type === "text") {
      const parsedOutput = parseBetaOutputFormat(params, block.text);
      if (firstParsedOutput === null) {
        firstParsedOutput = parsedOutput;
      }
      const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
        value: parsedOutput,
        enumerable: false
      });
      return Object.defineProperty(parsedBlock, "parsed", {
        get() {
          opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
          return parsedOutput;
        },
        enumerable: false
      });
    }
    return block;
  });
  return {
    ...message,
    content,
    parsed_output: firstParsedOutput
  };
}
__name(parseBetaMessage, "parseBetaMessage");
function parseBetaOutputFormat(params, content) {
  const outputFormat = getOutputFormat(params);
  if (outputFormat?.type !== "json_schema") {
    return null;
  }
  try {
    if ("parse" in outputFormat) {
      return outputFormat.parse(content);
    }
    return JSON.parse(content);
  } catch (error) {
    throw new AnthropicError(`Failed to parse structured output: ${error}`);
  }
}
__name(parseBetaOutputFormat, "parseBetaOutputFormat");

// ../node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs
var tokenize = /* @__PURE__ */ __name((input) => {
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === "\\") {
      current++;
      continue;
    }
    if (char === "{") {
      tokens.push({
        type: "brace",
        value: "{"
      });
      current++;
      continue;
    }
    if (char === "}") {
      tokens.push({
        type: "brace",
        value: "}"
      });
      current++;
      continue;
    }
    if (char === "[") {
      tokens.push({
        type: "paren",
        value: "["
      });
      current++;
      continue;
    }
    if (char === "]") {
      tokens.push({
        type: "paren",
        value: "]"
      });
      current++;
      continue;
    }
    if (char === ":") {
      tokens.push({
        type: "separator",
        value: ":"
      });
      current++;
      continue;
    }
    if (char === ",") {
      tokens.push({
        type: "delimiter",
        value: ","
      });
      current++;
      continue;
    }
    if (char === '"') {
      let value = "";
      let danglingQuote = false;
      char = input[++current];
      while (char !== '"') {
        if (current === input.length) {
          danglingQuote = true;
          break;
        }
        if (char === "\\") {
          current++;
          if (current === input.length) {
            danglingQuote = true;
            break;
          }
          value += char + input[current];
          char = input[++current];
        } else {
          value += char;
          char = input[++current];
        }
      }
      char = input[++current];
      if (!danglingQuote) {
        tokens.push({
          type: "string",
          value
        });
      }
      continue;
    }
    let WHITESPACE = /\s/;
    if (char && WHITESPACE.test(char)) {
      current++;
      continue;
    }
    let NUMBERS = /[0-9]/;
    if (char && NUMBERS.test(char) || char === "-" || char === ".") {
      let value = "";
      if (char === "-") {
        value += char;
        char = input[++current];
      }
      while (char && NUMBERS.test(char) || char === ".") {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value
      });
      continue;
    }
    let LETTERS = /[a-z]/i;
    if (char && LETTERS.test(char)) {
      let value = "";
      while (char && LETTERS.test(char)) {
        if (current === input.length) {
          break;
        }
        value += char;
        char = input[++current];
      }
      if (value == "true" || value == "false" || value === "null") {
        tokens.push({
          type: "name",
          value
        });
      } else {
        current++;
        continue;
      }
      continue;
    }
    current++;
  }
  return tokens;
}, "tokenize");
var strip = /* @__PURE__ */ __name((tokens) => {
  if (tokens.length === 0) {
    return tokens;
  }
  let lastToken = tokens[tokens.length - 1];
  switch (lastToken.type) {
    case "separator":
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
    case "number":
      let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
      if (lastCharacterOfLastToken === "." || lastCharacterOfLastToken === "-") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
    case "string":
      let tokenBeforeTheLastToken = tokens[tokens.length - 2];
      if (tokenBeforeTheLastToken?.type === "delimiter") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      } else if (tokenBeforeTheLastToken?.type === "brace" && tokenBeforeTheLastToken.value === "{") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
      break;
    case "delimiter":
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
  }
  return tokens;
}, "strip");
var unstrip = /* @__PURE__ */ __name((tokens) => {
  let tail = [];
  tokens.map((token) => {
    if (token.type === "brace") {
      if (token.value === "{") {
        tail.push("}");
      } else {
        tail.splice(tail.lastIndexOf("}"), 1);
      }
    }
    if (token.type === "paren") {
      if (token.value === "[") {
        tail.push("]");
      } else {
        tail.splice(tail.lastIndexOf("]"), 1);
      }
    }
  });
  if (tail.length > 0) {
    tail.reverse().map((item) => {
      if (item === "}") {
        tokens.push({
          type: "brace",
          value: "}"
        });
      } else if (item === "]") {
        tokens.push({
          type: "paren",
          value: "]"
        });
      }
    });
  }
  return tokens;
}, "unstrip");
var generate = /* @__PURE__ */ __name((tokens) => {
  let output = "";
  tokens.map((token) => {
    switch (token.type) {
      case "string":
        output += '"' + token.value + '"';
        break;
      default:
        output += token.value;
        break;
    }
  });
  return output;
}, "generate");
var partialParse = /* @__PURE__ */ __name((input) => JSON.parse(generate(unstrip(strip(tokenize(input))))), "partialParse");

// ../node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs
var _BetaMessageStream_instances;
var _BetaMessageStream_currentMessageSnapshot;
var _BetaMessageStream_params;
var _BetaMessageStream_connectedPromise;
var _BetaMessageStream_resolveConnectedPromise;
var _BetaMessageStream_rejectConnectedPromise;
var _BetaMessageStream_endPromise;
var _BetaMessageStream_resolveEndPromise;
var _BetaMessageStream_rejectEndPromise;
var _BetaMessageStream_listeners;
var _BetaMessageStream_ended;
var _BetaMessageStream_errored;
var _BetaMessageStream_aborted;
var _BetaMessageStream_catchingPromiseCreated;
var _BetaMessageStream_response;
var _BetaMessageStream_request_id;
var _BetaMessageStream_logger;
var _BetaMessageStream_getFinalMessage;
var _BetaMessageStream_getFinalText;
var _BetaMessageStream_handleError;
var _BetaMessageStream_beginRequest;
var _BetaMessageStream_addStreamEvent;
var _BetaMessageStream_endRequest;
var _BetaMessageStream_accumulateMessage;
var JSON_BUF_PROPERTY = "__json_buf";
function tracksToolInput(content) {
  return content.type === "tool_use" || content.type === "server_tool_use" || content.type === "mcp_tool_use";
}
__name(tracksToolInput, "tracksToolInput");
var BetaMessageStream = class _BetaMessageStream {
  static {
    __name(this, "BetaMessageStream");
  }
  constructor(params, opts) {
    _BetaMessageStream_instances.add(this);
    this.messages = [];
    this.receivedMessages = [];
    _BetaMessageStream_currentMessageSnapshot.set(this, void 0);
    _BetaMessageStream_params.set(this, null);
    this.controller = new AbortController();
    _BetaMessageStream_connectedPromise.set(this, void 0);
    _BetaMessageStream_resolveConnectedPromise.set(this, () => {
    });
    _BetaMessageStream_rejectConnectedPromise.set(this, () => {
    });
    _BetaMessageStream_endPromise.set(this, void 0);
    _BetaMessageStream_resolveEndPromise.set(this, () => {
    });
    _BetaMessageStream_rejectEndPromise.set(this, () => {
    });
    _BetaMessageStream_listeners.set(this, {});
    _BetaMessageStream_ended.set(this, false);
    _BetaMessageStream_errored.set(this, false);
    _BetaMessageStream_aborted.set(this, false);
    _BetaMessageStream_catchingPromiseCreated.set(this, false);
    _BetaMessageStream_response.set(this, void 0);
    _BetaMessageStream_request_id.set(this, void 0);
    _BetaMessageStream_logger.set(this, void 0);
    _BetaMessageStream_handleError.set(this, (error) => {
      __classPrivateFieldSet(this, _BetaMessageStream_errored, true, "f");
      if (isAbortError(error)) {
        error = new APIUserAbortError();
      }
      if (error instanceof APIUserAbortError) {
        __classPrivateFieldSet(this, _BetaMessageStream_aborted, true, "f");
        return this._emit("abort", error);
      }
      if (error instanceof AnthropicError) {
        return this._emit("error", error);
      }
      if (error instanceof Error) {
        const anthropicError = new AnthropicError(error.message);
        anthropicError.cause = error;
        return this._emit("error", anthropicError);
      }
      return this._emit("error", new AnthropicError(String(error)));
    });
    __classPrivateFieldSet(this, _BetaMessageStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _BetaMessageStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet(this, _BetaMessageStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _BetaMessageStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet(this, _BetaMessageStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f").catch(() => {
    });
    __classPrivateFieldSet(this, _BetaMessageStream_params, params, "f");
    __classPrivateFieldSet(this, _BetaMessageStream_logger, opts?.logger ?? console, "f");
  }
  get response() {
    return __classPrivateFieldGet(this, _BetaMessageStream_response, "f");
  }
  get request_id() {
    return __classPrivateFieldGet(this, _BetaMessageStream_request_id, "f");
  }
  /**
   * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
   * returned vie the `request-id` header which is useful for debugging requests and resporting
   * issues to Anthropic.
   *
   * This is the same as the `APIPromise.withResponse()` method.
   *
   * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
   * as no `Response` is available.
   */
  async withResponse() {
    __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
    const response = await __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f");
    if (!response) {
      throw new Error("Could not resolve a `Response` object");
    }
    return {
      data: this,
      response,
      request_id: response.headers.get("request-id")
    };
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _BetaMessageStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createMessage(messages, params, options, { logger } = {}) {
    const runner = new _BetaMessageStream(params, { logger });
    for (const message of params.messages) {
      runner._addMessageParam(message);
    }
    __classPrivateFieldSet(runner, _BetaMessageStream_params, { ...params, stream: true }, "f");
    runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  _run(executor) {
    executor().then(() => {
      this._emitFinal();
      this._emit("end");
    }, __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f"));
  }
  _addMessageParam(message) {
    this.messages.push(message);
  }
  _addMessage(message, emit = true) {
    this.receivedMessages.push(message);
    if (emit) {
      this._emit("message", message);
    }
  }
  async _createMessage(messages, params, options) {
    const signal = options?.signal;
    let abortHandler;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      abortHandler = this.controller.abort.bind(this.controller);
      signal.addEventListener("abort", abortHandler);
    }
    try {
      __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
      const { response, data: stream } = await messages.create({ ...params, stream: true }, { ...options, signal: this.controller.signal }).withResponse();
      this._connected(response);
      for await (const event of stream) {
        __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError();
      }
      __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener("abort", abortHandler);
      }
    }
  }
  _connected(response) {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _BetaMessageStream_response, response, "f");
    __classPrivateFieldSet(this, _BetaMessageStream_request_id, response?.headers.get("request-id"), "f");
    __classPrivateFieldGet(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet(this, _BetaMessageStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet(this, _BetaMessageStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet(this, _BetaMessageStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this MessageStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this MessageStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this MessageStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f");
  }
  get currentMessage() {
    return __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
  }
  /**
   * @returns a promise that resolves with the the final assistant Message response,
   * or rejects if an error occurred or the stream ended prematurely without producing a Message.
   * If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant Message's text response, concatenated
   * together if there are more than one text blocks.
   * Rejects if an error occurred or the stream ended prematurely without producing a Message.
   */
  async finalText() {
    await this.done();
    return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet(this, _BetaMessageStream_ended, "f"))
      return;
    if (event === "end") {
      __classPrivateFieldSet(this, _BetaMessageStream_ended, true, "f");
      __classPrivateFieldGet(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
    const finalMessage = this.receivedMessages.at(-1);
    if (finalMessage) {
      this._emit("finalMessage", __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
    }
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    let abortHandler;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      abortHandler = this.controller.abort.bind(this.controller);
      signal.addEventListener("abort", abortHandler);
    }
    try {
      __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
      this._connected(null);
      const stream = Stream.fromReadableStream(readableStream, this.controller);
      for await (const event of stream) {
        __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError();
      }
      __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener("abort", abortHandler);
      }
    }
  }
  [(_BetaMessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_params = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_listeners = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_ended = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_errored = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_aborted = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_response = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_request_id = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_logger = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_handleError = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_instances = /* @__PURE__ */ new WeakSet(), _BetaMessageStream_getFinalMessage = /* @__PURE__ */ __name(function _BetaMessageStream_getFinalMessage2() {
    if (this.receivedMessages.length === 0) {
      throw new AnthropicError("stream ended without producing a Message with role=assistant");
    }
    return this.receivedMessages.at(-1);
  }, "_BetaMessageStream_getFinalMessage"), _BetaMessageStream_getFinalText = /* @__PURE__ */ __name(function _BetaMessageStream_getFinalText2() {
    if (this.receivedMessages.length === 0) {
      throw new AnthropicError("stream ended without producing a Message with role=assistant");
    }
    const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
    if (textBlocks.length === 0) {
      throw new AnthropicError("stream ended without producing a content block with type=text");
    }
    return textBlocks.join(" ");
  }, "_BetaMessageStream_getFinalText"), _BetaMessageStream_beginRequest = /* @__PURE__ */ __name(function _BetaMessageStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
  }, "_BetaMessageStream_beginRequest"), _BetaMessageStream_addStreamEvent = /* @__PURE__ */ __name(function _BetaMessageStream_addStreamEvent2(event) {
    if (this.ended)
      return;
    const messageSnapshot = __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
    this._emit("streamEvent", event, messageSnapshot);
    switch (event.type) {
      case "content_block_delta": {
        const content = messageSnapshot.content.at(-1);
        switch (event.delta.type) {
          case "text_delta": {
            if (content.type === "text") {
              this._emit("text", event.delta.text, content.text || "");
            }
            break;
          }
          case "citations_delta": {
            if (content.type === "text") {
              this._emit("citation", event.delta.citation, content.citations ?? []);
            }
            break;
          }
          case "input_json_delta": {
            if (tracksToolInput(content) && content.input) {
              this._emit("inputJson", event.delta.partial_json, content.input);
            }
            break;
          }
          case "thinking_delta": {
            if (content.type === "thinking") {
              this._emit("thinking", event.delta.thinking, content.thinking);
            }
            break;
          }
          case "signature_delta": {
            if (content.type === "thinking") {
              this._emit("signature", content.signature);
            }
            break;
          }
          case "compaction_delta": {
            if (content.type === "compaction" && content.content) {
              this._emit("compaction", content.content);
            }
            break;
          }
          default:
            checkNever(event.delta);
        }
        break;
      }
      case "message_stop": {
        this._addMessageParam(messageSnapshot);
        this._addMessage(maybeParseBetaMessage(messageSnapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") }), true);
        break;
      }
      case "content_block_stop": {
        this._emit("contentBlock", messageSnapshot.content.at(-1));
        break;
      }
      case "message_start": {
        __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
        break;
      }
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, "_BetaMessageStream_addStreamEvent"), _BetaMessageStream_endRequest = /* @__PURE__ */ __name(function _BetaMessageStream_endRequest2() {
    if (this.ended) {
      throw new AnthropicError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
    if (!snapshot) {
      throw new AnthropicError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
    return maybeParseBetaMessage(snapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") });
  }, "_BetaMessageStream_endRequest"), _BetaMessageStream_accumulateMessage = /* @__PURE__ */ __name(function _BetaMessageStream_accumulateMessage2(event) {
    let snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
    if (event.type === "message_start") {
      if (snapshot) {
        throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
      }
      return event.message;
    }
    if (!snapshot) {
      throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
    }
    switch (event.type) {
      case "message_stop":
        return snapshot;
      case "message_delta":
        snapshot.container = event.delta.container;
        snapshot.stop_reason = event.delta.stop_reason;
        snapshot.stop_sequence = event.delta.stop_sequence;
        snapshot.usage.output_tokens = event.usage.output_tokens;
        snapshot.context_management = event.context_management;
        if (event.usage.input_tokens != null) {
          snapshot.usage.input_tokens = event.usage.input_tokens;
        }
        if (event.usage.cache_creation_input_tokens != null) {
          snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
        }
        if (event.usage.cache_read_input_tokens != null) {
          snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
        }
        if (event.usage.server_tool_use != null) {
          snapshot.usage.server_tool_use = event.usage.server_tool_use;
        }
        if (event.usage.iterations != null) {
          snapshot.usage.iterations = event.usage.iterations;
        }
        return snapshot;
      case "content_block_start":
        snapshot.content.push(event.content_block);
        return snapshot;
      case "content_block_delta": {
        const snapshotContent = snapshot.content.at(event.index);
        switch (event.delta.type) {
          case "text_delta": {
            if (snapshotContent?.type === "text") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                text: (snapshotContent.text || "") + event.delta.text
              };
            }
            break;
          }
          case "citations_delta": {
            if (snapshotContent?.type === "text") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                citations: [...snapshotContent.citations ?? [], event.delta.citation]
              };
            }
            break;
          }
          case "input_json_delta": {
            if (snapshotContent && tracksToolInput(snapshotContent)) {
              let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || "";
              jsonBuf += event.delta.partial_json;
              const newContent = { ...snapshotContent };
              Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
                value: jsonBuf,
                enumerable: false,
                writable: true
              });
              if (jsonBuf) {
                try {
                  newContent.input = partialParse(jsonBuf);
                } catch (err) {
                  const error = new AnthropicError(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
                  __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, error);
                }
              }
              snapshot.content[event.index] = newContent;
            }
            break;
          }
          case "thinking_delta": {
            if (snapshotContent?.type === "thinking") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                thinking: snapshotContent.thinking + event.delta.thinking
              };
            }
            break;
          }
          case "signature_delta": {
            if (snapshotContent?.type === "thinking") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                signature: event.delta.signature
              };
            }
            break;
          }
          case "compaction_delta": {
            if (snapshotContent?.type === "compaction") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                content: (snapshotContent.content || "") + event.delta.content
              };
            }
            break;
          }
          default:
            checkNever(event.delta);
        }
        return snapshot;
      }
      case "content_block_stop":
        return snapshot;
    }
  }, "_BetaMessageStream_accumulateMessage"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("streamEvent", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function checkNever(x) {
}
__name(checkNever, "checkNever");

// ../node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs
var ToolError = class extends Error {
  static {
    __name(this, "ToolError");
  }
  constructor(content) {
    const message = typeof content === "string" ? content : content.map((block) => {
      if (block.type === "text")
        return block.text;
      return `[${block.type}]`;
    }).join(" ");
    super(message);
    this.name = "ToolError";
    this.content = content;
  }
};

// ../node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs
var DEFAULT_TOKEN_THRESHOLD = 1e5;
var DEFAULT_SUMMARY_PROMPT = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete\u2014err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;

// ../node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs
var _BetaToolRunner_instances;
var _BetaToolRunner_consumed;
var _BetaToolRunner_mutated;
var _BetaToolRunner_state;
var _BetaToolRunner_options;
var _BetaToolRunner_message;
var _BetaToolRunner_toolResponse;
var _BetaToolRunner_completion;
var _BetaToolRunner_iterationCount;
var _BetaToolRunner_checkAndCompact;
var _BetaToolRunner_generateToolResponse;
function promiseWithResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
__name(promiseWithResolvers, "promiseWithResolvers");
var BetaToolRunner = class {
  static {
    __name(this, "BetaToolRunner");
  }
  constructor(client, params, options) {
    _BetaToolRunner_instances.add(this);
    this.client = client;
    _BetaToolRunner_consumed.set(this, false);
    _BetaToolRunner_mutated.set(this, false);
    _BetaToolRunner_state.set(this, void 0);
    _BetaToolRunner_options.set(this, void 0);
    _BetaToolRunner_message.set(this, void 0);
    _BetaToolRunner_toolResponse.set(this, void 0);
    _BetaToolRunner_completion.set(this, void 0);
    _BetaToolRunner_iterationCount.set(this, 0);
    __classPrivateFieldSet(this, _BetaToolRunner_state, {
      params: {
        // You can't clone the entire params since there are functions as handlers.
        // You also don't really need to clone params.messages, but it probably will prevent a foot gun
        // somewhere.
        ...params,
        messages: structuredClone(params.messages)
      }
    }, "f");
    const helpers = collectStainlessHelpers(params.tools, params.messages);
    const helperValue = ["BetaToolRunner", ...helpers].join(", ");
    __classPrivateFieldSet(this, _BetaToolRunner_options, {
      ...options,
      headers: buildHeaders([{ "x-stainless-helper": helperValue }, options?.headers])
    }, "f");
    __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
    if (params.compactionControl?.enabled) {
      console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
    }
  }
  async *[(_BetaToolRunner_consumed = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_mutated = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_state = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_options = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_message = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_toolResponse = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_completion = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_iterationCount = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_instances = /* @__PURE__ */ new WeakSet(), _BetaToolRunner_checkAndCompact = /* @__PURE__ */ __name(async function _BetaToolRunner_checkAndCompact2() {
    const compactionControl = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.compactionControl;
    if (!compactionControl || !compactionControl.enabled) {
      return false;
    }
    let tokensUsed = 0;
    if (__classPrivateFieldGet(this, _BetaToolRunner_message, "f") !== void 0) {
      try {
        const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
        const totalInputTokens = message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0);
        tokensUsed = totalInputTokens + message.usage.output_tokens;
      } catch {
        return false;
      }
    }
    const threshold = compactionControl.contextTokenThreshold ?? DEFAULT_TOKEN_THRESHOLD;
    if (tokensUsed < threshold) {
      return false;
    }
    const model = compactionControl.model ?? __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.model;
    const summaryPrompt = compactionControl.summaryPrompt ?? DEFAULT_SUMMARY_PROMPT;
    const messages = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages;
    if (messages[messages.length - 1].role === "assistant") {
      const lastMessage = messages[messages.length - 1];
      if (Array.isArray(lastMessage.content)) {
        const nonToolBlocks = lastMessage.content.filter((block) => block.type !== "tool_use");
        if (nonToolBlocks.length === 0) {
          messages.pop();
        } else {
          lastMessage.content = nonToolBlocks;
        }
      }
    }
    const response = await this.client.beta.messages.create({
      model,
      messages: [
        ...messages,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: summaryPrompt
            }
          ]
        }
      ],
      max_tokens: __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_tokens
    }, {
      signal: __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal,
      headers: buildHeaders([__classPrivateFieldGet(this, _BetaToolRunner_options, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (response.content[0]?.type !== "text") {
      throw new AnthropicError("Expected text response for compaction");
    }
    __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages = [
      {
        role: "user",
        content: response.content
      }
    ];
    return true;
  }, "_BetaToolRunner_checkAndCompact"), Symbol.asyncIterator)]() {
    var _a2;
    if (__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
      throw new AnthropicError("Cannot iterate over a consumed stream");
    }
    __classPrivateFieldSet(this, _BetaToolRunner_consumed, true, "f");
    __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
    __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
    try {
      while (true) {
        let stream;
        try {
          if (__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations && __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f") >= __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations) {
            break;
          }
          __classPrivateFieldSet(this, _BetaToolRunner_mutated, false, "f");
          __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
          __classPrivateFieldSet(this, _BetaToolRunner_iterationCount, (_a2 = __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f"), _a2++, _a2), "f");
          __classPrivateFieldSet(this, _BetaToolRunner_message, void 0, "f");
          const { max_iterations, compactionControl, ...params } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
          if (params.stream) {
            stream = this.client.beta.messages.stream({ ...params }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
            __classPrivateFieldSet(this, _BetaToolRunner_message, stream.finalMessage(), "f");
            __classPrivateFieldGet(this, _BetaToolRunner_message, "f").catch(() => {
            });
            yield stream;
          } else {
            __classPrivateFieldSet(this, _BetaToolRunner_message, this.client.beta.messages.create({ ...params, stream: false }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
            yield __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
          }
          const isCompacted = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_checkAndCompact).call(this);
          if (!isCompacted) {
            if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
              const { role, content } = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
              __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push({ role, content });
            }
            const toolMessage = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1));
            if (toolMessage) {
              __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
            } else if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
              break;
            }
          }
        } finally {
          if (stream) {
            stream.abort();
          }
        }
      }
      if (!__classPrivateFieldGet(this, _BetaToolRunner_message, "f")) {
        throw new AnthropicError("ToolRunner concluded without a message from the server");
      }
      __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").resolve(await __classPrivateFieldGet(this, _BetaToolRunner_message, "f"));
    } catch (error) {
      __classPrivateFieldSet(this, _BetaToolRunner_consumed, false, "f");
      __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise.catch(() => {
      });
      __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").reject(error);
      __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
      throw error;
    }
  }
  setMessagesParams(paramsOrMutator) {
    if (typeof paramsOrMutator === "function") {
      __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
    } else {
      __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator;
    }
    __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
    __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
  }
  setRequestOptions(optionsOrMutator) {
    if (typeof optionsOrMutator === "function") {
      __classPrivateFieldSet(this, _BetaToolRunner_options, optionsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
    } else {
      __classPrivateFieldSet(this, _BetaToolRunner_options, { ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"), ...optionsOrMutator }, "f");
    }
  }
  /**
   * Get the tool response for the last message from the assistant.
   * Avoids redundant tool executions by caching results.
   *
   * @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
   *
   * @example
   * const toolResponse = await runner.generateToolResponse();
   * if (toolResponse) {
   *   console.log('Tool results:', toolResponse.content);
   * }
   */
  async generateToolResponse(signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
    const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f") ?? this.params.messages.at(-1);
    if (!message) {
      return null;
    }
    return __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message, signal);
  }
  /**
   * Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
   * will wait for an instance to start and go to completion.
   *
   * @returns A promise that resolves to the final BetaMessage when the iterator completes
   *
   * @example
   * // Start consuming the iterator
   * for await (const message of runner) {
   *   console.log('Message:', message.content);
   * }
   *
   * // Meanwhile, wait for completion from another part of the code
   * const finalMessage = await runner.done();
   * console.log('Final response:', finalMessage.content);
   */
  done() {
    return __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise;
  }
  /**
   * Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
   * * If the iterator has not been consumed, consume the entire iterator and return the final message from the
   * assistant.
   * * If the iterator has been consumed, waits for it to complete and returns the final message.
   *
   * @returns A promise that resolves to the final BetaMessage from the conversation
   * @throws {AnthropicError} If no messages were processed during the conversation
   *
   * @example
   * const finalMessage = await runner.runUntilDone();
   * console.log('Final response:', finalMessage.content);
   */
  async runUntilDone() {
    if (!__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
      for await (const _ of this) {
      }
    }
    return this.done();
  }
  /**
   * Get the current parameters being used by the ToolRunner.
   *
   * @returns A readonly view of the current ToolRunnerParams
   *
   * @example
   * const currentParams = runner.params;
   * console.log('Current model:', currentParams.model);
   * console.log('Message count:', currentParams.messages.length);
   */
  get params() {
    return __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
  }
  /**
   * Add one or more messages to the conversation history.
   *
   * @param messages - One or more BetaMessageParam objects to add to the conversation
   *
   * @example
   * runner.pushMessages(
   *   { role: 'user', content: 'Also, what about the weather in NYC?' }
   * );
   *
   * @example
   * // Adding multiple messages
   * runner.pushMessages(
   *   { role: 'user', content: 'What about NYC?' },
   *   { role: 'user', content: 'And Boston?' }
   * );
   */
  pushMessages(...messages) {
    this.setMessagesParams((params) => ({
      ...params,
      messages: [...params.messages, ...messages]
    }));
  }
  /**
   * Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
   * This allows using `await runner` instead of `await runner.runUntilDone()`
   */
  then(onfulfilled, onrejected) {
    return this.runUntilDone().then(onfulfilled, onrejected);
  }
};
_BetaToolRunner_generateToolResponse = /* @__PURE__ */ __name(async function _BetaToolRunner_generateToolResponse2(lastMessage, signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
  if (__classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f") !== void 0) {
    return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
  }
  __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, generateToolResponse(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, lastMessage, {
    ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"),
    signal
  }), "f");
  return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
}, "_BetaToolRunner_generateToolResponse");
async function generateToolResponse(params, lastMessage = params.messages.at(-1), requestOptions) {
  if (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.content || typeof lastMessage.content === "string") {
    return null;
  }
  const toolUseBlocks = lastMessage.content.filter((content) => content.type === "tool_use");
  if (toolUseBlocks.length === 0) {
    return null;
  }
  const toolResults = await Promise.all(toolUseBlocks.map(async (toolUse) => {
    const tool = params.tools.find((t) => ("name" in t ? t.name : t.mcp_server_name) === toolUse.name);
    if (!tool || !("run" in tool)) {
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: `Error: Tool '${toolUse.name}' not found`,
        is_error: true
      };
    }
    try {
      let input = toolUse.input;
      if ("parse" in tool && tool.parse) {
        input = tool.parse(input);
      }
      const result = await tool.run(input, {
        toolUseBlock: toolUse,
        signal: requestOptions?.signal
      });
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result
      };
    } catch (error) {
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: error instanceof ToolError ? error.content : `Error: ${error instanceof Error ? error.message : String(error)}`,
        is_error: true
      };
    }
  }));
  return {
    role: "user",
    content: toolResults
  };
}
__name(generateToolResponse, "generateToolResponse");

// ../node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs
var JSONLDecoder = class _JSONLDecoder {
  static {
    __name(this, "JSONLDecoder");
  }
  constructor(iterator, controller) {
    this.iterator = iterator;
    this.controller = controller;
  }
  async *decoder() {
    const lineDecoder = new LineDecoder();
    for await (const chunk of this.iterator) {
      for (const line of lineDecoder.decode(chunk)) {
        yield JSON.parse(line);
      }
    }
    for (const line of lineDecoder.flush()) {
      yield JSON.parse(line);
    }
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(response, controller) {
    if (!response.body) {
      controller.abort();
      if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
        throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
      }
      throw new AnthropicError(`Attempted to iterate over a response with no body`);
    }
    return new _JSONLDecoder(ReadableStreamToAsyncIterable(response.body), controller);
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs
var Batches = class extends APIResource {
  static {
    __name(this, "Batches");
  }
  /**
   * Send a batch of Message creation requests.
   *
   * The Message Batches API can be used to process multiple Messages API requests at
   * once. Once a Message Batch is created, it begins processing immediately. Batches
   * can take up to 24 hours to complete.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const betaMessageBatch =
   *   await client.beta.messages.batches.create({
   *     requests: [
   *       {
   *         custom_id: 'my-custom-id-1',
   *         params: {
   *           max_tokens: 1024,
   *           messages: [
   *             { content: 'Hello, world', role: 'user' },
   *           ],
   *           model: 'claude-opus-4-6',
   *         },
   *       },
   *     ],
   *   });
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/messages/batches?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * This endpoint is idempotent and can be used to poll for Message Batch
   * completion. To access the results of a Message Batch, make a request to the
   * `results_url` field in the response.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const betaMessageBatch =
   *   await client.beta.messages.batches.retrieve(
   *     'message_batch_id',
   *   );
   * ```
   */
  retrieve(messageBatchID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/messages/batches/${messageBatchID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List all Message Batches within a Workspace. Most recently created batches are
   * returned first.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaMessageBatch of client.beta.messages.batches.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", Page, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete a Message Batch.
   *
   * Message Batches can only be deleted once they've finished processing. If you'd
   * like to delete an in-progress batch, you must first cancel it.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const betaDeletedMessageBatch =
   *   await client.beta.messages.batches.delete(
   *     'message_batch_id',
   *   );
   * ```
   */
  delete(messageBatchID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/messages/batches/${messageBatchID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Batches may be canceled any time before processing ends. Once cancellation is
   * initiated, the batch enters a `canceling` state, at which time the system may
   * complete any in-progress, non-interruptible requests before finalizing
   * cancellation.
   *
   * The number of canceled requests is specified in `request_counts`. To determine
   * which requests were canceled, check the individual results within the batch.
   * Note that cancellation may not result in any canceled requests if they were
   * non-interruptible.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const betaMessageBatch =
   *   await client.beta.messages.batches.cancel(
   *     'message_batch_id',
   *   );
   * ```
   */
  cancel(messageBatchID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Streams the results of a Message Batch as a `.jsonl` file.
   *
   * Each line in the file is a JSON object containing the result of a single request
   * in the Message Batch. Results are not guaranteed to be in the same order as
   * requests. Use the `custom_id` field to match results to requests.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const betaMessageBatchIndividualResponse =
   *   await client.beta.messages.batches.results(
   *     'message_batch_id',
   *   );
   * ```
   */
  async results(messageBatchID, params = {}, options) {
    const batch = await this.retrieve(messageBatchID);
    if (!batch.results_url) {
      throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
    }
    const { betas } = params ?? {};
    return this._client.get(batch.results_url, {
      ...options,
      headers: buildHeaders([
        {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          Accept: "application/binary"
        },
        options?.headers
      ]),
      stream: true,
      __binaryResponse: true
    })._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs
var DEPRECATED_MODELS = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026"
};
var MODELS_TO_WARN_WITH_THINKING_ENABLED = ["claude-mythos-preview", "claude-opus-4-6"];
var Messages = class extends APIResource {
  static {
    __name(this, "Messages");
  }
  constructor() {
    super(...arguments);
    this.batches = new Batches(this._client);
  }
  create(params, options) {
    const modifiedParams = transformOutputFormat(params);
    const { betas, ...body } = modifiedParams;
    if (body.model in DEPRECATED_MODELS) {
      console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
    }
    if (MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) && body.thinking && body.thinking.type === "enabled") {
      console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    }
    let timeout = this._client._options.timeout;
    if (!body.stream && timeout == null) {
      const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
      timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
    }
    const helperHeader = stainlessHelperHeader(body.tools, body.messages);
    return this._client.post("/v1/messages?beta=true", {
      body,
      timeout: timeout ?? 6e5,
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        helperHeader,
        options?.headers
      ]),
      stream: modifiedParams.stream ?? false
    });
  }
  /**
   * Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
   * the response will be automatically parsed and available in the `parsed_output` property of the message.
   *
   * @example
   * ```ts
   * const message = await client.beta.messages.parse({
   *   model: 'claude-3-5-sonnet-20241022',
   *   max_tokens: 1024,
   *   messages: [{ role: 'user', content: 'What is 2+2?' }],
   *   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
   * });
   *
   * console.log(message.parsed_output?.answer); // 4
   * ```
   */
  parse(params, options) {
    options = {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...params.betas ?? [], "structured-outputs-2025-12-15"].toString() },
        options?.headers
      ])
    };
    return this.create(params, options).then((message) => parseBetaMessage(message, params, { logger: this._client.logger ?? console }));
  }
  /**
   * Create a Message stream
   */
  stream(body, options) {
    return BetaMessageStream.createMessage(this, body, options);
  }
  /**
   * Count the number of tokens in a Message.
   *
   * The Token Count API can be used to count the number of tokens in a Message,
   * including tools, images, and documents, without creating it.
   *
   * Learn more about token counting in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
   *
   * @example
   * ```ts
   * const betaMessageTokensCount =
   *   await client.beta.messages.countTokens({
   *     messages: [{ content: 'Hello, world', role: 'user' }],
   *     model: 'claude-opus-4-6',
   *   });
   * ```
   */
  countTokens(params, options) {
    const modifiedParams = transformOutputFormat(params);
    const { betas, ...body } = modifiedParams;
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "token-counting-2024-11-01"].toString() },
        options?.headers
      ])
    });
  }
  toolRunner(body, options) {
    return new BetaToolRunner(this._client, body, options);
  }
};
function transformOutputFormat(params) {
  if (!params.output_format) {
    return params;
  }
  if (params.output_config?.format) {
    throw new AnthropicError("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  }
  const { output_format, ...rest } = params;
  return {
    ...rest,
    output_config: {
      ...params.output_config,
      format: output_format
    }
  };
}
__name(transformOutputFormat, "transformOutputFormat");
Messages.Batches = Batches;
Messages.BetaToolRunner = BetaToolRunner;
Messages.ToolError = ToolError;

// ../node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs
var Events = class extends APIResource {
  static {
    __name(this, "Events");
  }
  /**
   * List Events
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.events.list(
   *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/v1/sessions/${sessionID}/events?beta=true`, PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Send Events
   *
   * @example
   * ```ts
   * const betaManagedAgentsSendSessionEvents =
   *   await client.beta.sessions.events.send(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *     {
   *       events: [
   *         {
   *           content: [
   *             {
   *               text: 'Where is my order #1234?',
   *               type: 'text',
   *             },
   *           ],
   *           type: 'user.message',
   *         },
   *       ],
   *     },
   *   );
   * ```
   */
  send(sessionID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/sessions/${sessionID}/events?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Stream Events
   *
   * @example
   * ```ts
   * const betaManagedAgentsStreamSessionEvents =
   *   await client.beta.sessions.events.stream(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *   );
   * ```
   */
  stream(sessionID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/sessions/${sessionID}/events/stream?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ]),
      stream: true
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs
var Resources = class extends APIResource {
  static {
    __name(this, "Resources");
  }
  /**
   * Get Session Resource
   *
   * @example
   * ```ts
   * const resource =
   *   await client.beta.sessions.resources.retrieve(
   *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
   *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
   *   );
   * ```
   */
  retrieve(resourceID, params, options) {
    const { session_id, betas } = params;
    return this._client.get(path`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update Session Resource
   *
   * @example
   * ```ts
   * const resource =
   *   await client.beta.sessions.resources.update(
   *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
   *     {
   *       session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *       authorization_token: 'ghp_exampletoken',
   *     },
   *   );
   * ```
   */
  update(resourceID, params, options) {
    const { session_id, betas, ...body } = params;
    return this._client.post(path`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Session Resources
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsSessionResource of client.beta.sessions.resources.list(
   *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(sessionID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/v1/sessions/${sessionID}/resources?beta=true`, PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Session Resource
   *
   * @example
   * ```ts
   * const betaManagedAgentsDeleteSessionResource =
   *   await client.beta.sessions.resources.delete(
   *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
   *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
   *   );
   * ```
   */
  delete(resourceID, params, options) {
    const { session_id, betas } = params;
    return this._client.delete(path`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Add Session Resource
   *
   * @example
   * ```ts
   * const betaManagedAgentsFileResource =
   *   await client.beta.sessions.resources.add(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *     {
   *       file_id: 'file_011CNha8iCJcU1wXNR6q4V8w',
   *       type: 'file',
   *     },
   *   );
   * ```
   */
  add(sessionID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/sessions/${sessionID}/resources?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs
var Sessions = class extends APIResource {
  static {
    __name(this, "Sessions");
  }
  constructor() {
    super(...arguments);
    this.events = new Events(this._client);
    this.resources = new Resources(this._client);
  }
  /**
   * Create Session
   *
   * @example
   * ```ts
   * const betaManagedAgentsSession =
   *   await client.beta.sessions.create({
   *     agent: 'agent_011CZkYpogX7uDKUyvBTophP',
   *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
   *   });
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/sessions?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Get Session
   *
   * @example
   * ```ts
   * const betaManagedAgentsSession =
   *   await client.beta.sessions.retrieve(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *   );
   * ```
   */
  retrieve(sessionID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/sessions/${sessionID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update Session
   *
   * @example
   * ```ts
   * const betaManagedAgentsSession =
   *   await client.beta.sessions.update(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *   );
   * ```
   */
  update(sessionID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/sessions/${sessionID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Sessions
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsSession of client.beta.sessions.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Session
   *
   * @example
   * ```ts
   * const betaManagedAgentsDeletedSession =
   *   await client.beta.sessions.delete(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *   );
   * ```
   */
  delete(sessionID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/sessions/${sessionID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Archive Session
   *
   * @example
   * ```ts
   * const betaManagedAgentsSession =
   *   await client.beta.sessions.archive(
   *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
   *   );
   * ```
   */
  archive(sessionID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/sessions/${sessionID}/archive?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};
Sessions.Events = Events;
Sessions.Resources = Resources;

// ../node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs
var Versions2 = class extends APIResource {
  static {
    __name(this, "Versions");
  }
  /**
   * Create Skill Version
   *
   * @example
   * ```ts
   * const version = await client.beta.skills.versions.create(
   *   'skill_id',
   * );
   * ```
   */
  create(skillID, params = {}, options) {
    const { betas, ...body } = params ?? {};
    return this._client.post(path`/v1/skills/${skillID}/versions?beta=true`, multipartFormRequestOptions({
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    }, this._client));
  }
  /**
   * Get Skill Version
   *
   * @example
   * ```ts
   * const version = await client.beta.skills.versions.retrieve(
   *   'version',
   *   { skill_id: 'skill_id' },
   * );
   * ```
   */
  retrieve(version, params, options) {
    const { skill_id, betas } = params;
    return this._client.get(path`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Skill Versions
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const versionListResponse of client.beta.skills.versions.list(
   *   'skill_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(skillID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/v1/skills/${skillID}/versions?beta=true`, PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Skill Version
   *
   * @example
   * ```ts
   * const version = await client.beta.skills.versions.delete(
   *   'version',
   *   { skill_id: 'skill_id' },
   * );
   * ```
   */
  delete(version, params, options) {
    const { skill_id, betas } = params;
    return this._client.delete(path`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs
var Skills = class extends APIResource {
  static {
    __name(this, "Skills");
  }
  constructor() {
    super(...arguments);
    this.versions = new Versions2(this._client);
  }
  /**
   * Create Skill
   *
   * @example
   * ```ts
   * const skill = await client.beta.skills.create();
   * ```
   */
  create(params = {}, options) {
    const { betas, ...body } = params ?? {};
    return this._client.post("/v1/skills?beta=true", multipartFormRequestOptions({
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    }, this._client, false));
  }
  /**
   * Get Skill
   *
   * @example
   * ```ts
   * const skill = await client.beta.skills.retrieve('skill_id');
   * ```
   */
  retrieve(skillID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/skills/${skillID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Skills
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const skillListResponse of client.beta.skills.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Skill
   *
   * @example
   * ```ts
   * const skill = await client.beta.skills.delete('skill_id');
   * ```
   */
  delete(skillID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/skills/${skillID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
        options?.headers
      ])
    });
  }
};
Skills.Versions = Versions2;

// ../node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs
var Credentials = class extends APIResource {
  static {
    __name(this, "Credentials");
  }
  /**
   * Create Credential
   *
   * @example
   * ```ts
   * const betaManagedAgentsCredential =
   *   await client.beta.vaults.credentials.create(
   *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   *     {
   *       auth: {
   *         token: 'bearer_exampletoken',
   *         mcp_server_url:
   *           'https://example-server.modelcontextprotocol.io/sse',
   *         type: 'static_bearer',
   *       },
   *     },
   *   );
   * ```
   */
  create(vaultID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/vaults/${vaultID}/credentials?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Get Credential
   *
   * @example
   * ```ts
   * const betaManagedAgentsCredential =
   *   await client.beta.vaults.credentials.retrieve(
   *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
   *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
   *   );
   * ```
   */
  retrieve(credentialID, params, options) {
    const { vault_id, betas } = params;
    return this._client.get(path`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update Credential
   *
   * @example
   * ```ts
   * const betaManagedAgentsCredential =
   *   await client.beta.vaults.credentials.update(
   *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
   *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
   *   );
   * ```
   */
  update(credentialID, params, options) {
    const { vault_id, betas, ...body } = params;
    return this._client.post(path`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Credentials
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsCredential of client.beta.vaults.credentials.list(
   *   'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(vaultID, params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList(path`/v1/vaults/${vaultID}/credentials?beta=true`, PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Credential
   *
   * @example
   * ```ts
   * const betaManagedAgentsDeletedCredential =
   *   await client.beta.vaults.credentials.delete(
   *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
   *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
   *   );
   * ```
   */
  delete(credentialID, params, options) {
    const { vault_id, betas } = params;
    return this._client.delete(path`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Archive Credential
   *
   * @example
   * ```ts
   * const betaManagedAgentsCredential =
   *   await client.beta.vaults.credentials.archive(
   *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
   *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
   *   );
   * ```
   */
  archive(credentialID, params, options) {
    const { vault_id, betas } = params;
    return this._client.post(path`/v1/vaults/${vault_id}/credentials/${credentialID}/archive?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs
var Vaults = class extends APIResource {
  static {
    __name(this, "Vaults");
  }
  constructor() {
    super(...arguments);
    this.credentials = new Credentials(this._client);
  }
  /**
   * Create Vault
   *
   * @example
   * ```ts
   * const betaManagedAgentsVault =
   *   await client.beta.vaults.create({
   *     display_name: 'Example vault',
   *   });
   * ```
   */
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/vaults?beta=true", {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Get Vault
   *
   * @example
   * ```ts
   * const betaManagedAgentsVault =
   *   await client.beta.vaults.retrieve(
   *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   *   );
   * ```
   */
  retrieve(vaultID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/vaults/${vaultID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Update Vault
   *
   * @example
   * ```ts
   * const betaManagedAgentsVault =
   *   await client.beta.vaults.update(
   *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   *   );
   * ```
   */
  update(vaultID, params, options) {
    const { betas, ...body } = params;
    return this._client.post(path`/v1/vaults/${vaultID}?beta=true`, {
      body,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * List Vaults
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const betaManagedAgentsVault of client.beta.vaults.list()) {
   *   // ...
   * }
   * ```
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", PageCursor, {
      query,
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Delete Vault
   *
   * @example
   * ```ts
   * const betaManagedAgentsDeletedVault =
   *   await client.beta.vaults.delete(
   *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   *   );
   * ```
   */
  delete(vaultID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.delete(path`/v1/vaults/${vaultID}?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
  /**
   * Archive Vault
   *
   * @example
   * ```ts
   * const betaManagedAgentsVault =
   *   await client.beta.vaults.archive(
   *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
   *   );
   * ```
   */
  archive(vaultID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.post(path`/v1/vaults/${vaultID}/archive?beta=true`, {
      ...options,
      headers: buildHeaders([
        { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
        options?.headers
      ])
    });
  }
};
Vaults.Credentials = Credentials;

// ../node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs
var Beta = class extends APIResource {
  static {
    __name(this, "Beta");
  }
  constructor() {
    super(...arguments);
    this.models = new Models(this._client);
    this.messages = new Messages(this._client);
    this.agents = new Agents(this._client);
    this.environments = new Environments(this._client);
    this.sessions = new Sessions(this._client);
    this.vaults = new Vaults(this._client);
    this.files = new Files(this._client);
    this.skills = new Skills(this._client);
    this.userProfiles = new UserProfiles(this._client);
  }
};
Beta.Models = Models;
Beta.Messages = Messages;
Beta.Agents = Agents;
Beta.Environments = Environments;
Beta.Sessions = Sessions;
Beta.Vaults = Vaults;
Beta.Files = Files;
Beta.Skills = Skills;
Beta.UserProfiles = UserProfiles;

// ../node_modules/@anthropic-ai/sdk/resources/completions.mjs
var Completions = class extends APIResource {
  static {
    __name(this, "Completions");
  }
  create(params, options) {
    const { betas, ...body } = params;
    return this._client.post("/v1/complete", {
      body,
      timeout: this._client._options.timeout ?? 6e5,
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        options?.headers
      ]),
      stream: params.stream ?? false
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/lib/parser.mjs
function getOutputFormat2(params) {
  return params?.output_config?.format;
}
__name(getOutputFormat2, "getOutputFormat");
function maybeParseMessage(message, params, opts) {
  const outputFormat = getOutputFormat2(params);
  if (!params || !("parse" in (outputFormat ?? {}))) {
    return {
      ...message,
      content: message.content.map((block) => {
        if (block.type === "text") {
          const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
            value: null,
            enumerable: false
          });
          return parsedBlock;
        }
        return block;
      }),
      parsed_output: null
    };
  }
  return parseMessage(message, params, opts);
}
__name(maybeParseMessage, "maybeParseMessage");
function parseMessage(message, params, opts) {
  let firstParsedOutput = null;
  const content = message.content.map((block) => {
    if (block.type === "text") {
      const parsedOutput = parseOutputFormat(params, block.text);
      if (firstParsedOutput === null) {
        firstParsedOutput = parsedOutput;
      }
      const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
        value: parsedOutput,
        enumerable: false
      });
      return parsedBlock;
    }
    return block;
  });
  return {
    ...message,
    content,
    parsed_output: firstParsedOutput
  };
}
__name(parseMessage, "parseMessage");
function parseOutputFormat(params, content) {
  const outputFormat = getOutputFormat2(params);
  if (outputFormat?.type !== "json_schema") {
    return null;
  }
  try {
    if ("parse" in outputFormat) {
      return outputFormat.parse(content);
    }
    return JSON.parse(content);
  } catch (error) {
    throw new AnthropicError(`Failed to parse structured output: ${error}`);
  }
}
__name(parseOutputFormat, "parseOutputFormat");

// ../node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs
var _MessageStream_instances;
var _MessageStream_currentMessageSnapshot;
var _MessageStream_params;
var _MessageStream_connectedPromise;
var _MessageStream_resolveConnectedPromise;
var _MessageStream_rejectConnectedPromise;
var _MessageStream_endPromise;
var _MessageStream_resolveEndPromise;
var _MessageStream_rejectEndPromise;
var _MessageStream_listeners;
var _MessageStream_ended;
var _MessageStream_errored;
var _MessageStream_aborted;
var _MessageStream_catchingPromiseCreated;
var _MessageStream_response;
var _MessageStream_request_id;
var _MessageStream_logger;
var _MessageStream_getFinalMessage;
var _MessageStream_getFinalText;
var _MessageStream_handleError;
var _MessageStream_beginRequest;
var _MessageStream_addStreamEvent;
var _MessageStream_endRequest;
var _MessageStream_accumulateMessage;
var JSON_BUF_PROPERTY2 = "__json_buf";
function tracksToolInput2(content) {
  return content.type === "tool_use" || content.type === "server_tool_use";
}
__name(tracksToolInput2, "tracksToolInput");
var MessageStream = class _MessageStream {
  static {
    __name(this, "MessageStream");
  }
  constructor(params, opts) {
    _MessageStream_instances.add(this);
    this.messages = [];
    this.receivedMessages = [];
    _MessageStream_currentMessageSnapshot.set(this, void 0);
    _MessageStream_params.set(this, null);
    this.controller = new AbortController();
    _MessageStream_connectedPromise.set(this, void 0);
    _MessageStream_resolveConnectedPromise.set(this, () => {
    });
    _MessageStream_rejectConnectedPromise.set(this, () => {
    });
    _MessageStream_endPromise.set(this, void 0);
    _MessageStream_resolveEndPromise.set(this, () => {
    });
    _MessageStream_rejectEndPromise.set(this, () => {
    });
    _MessageStream_listeners.set(this, {});
    _MessageStream_ended.set(this, false);
    _MessageStream_errored.set(this, false);
    _MessageStream_aborted.set(this, false);
    _MessageStream_catchingPromiseCreated.set(this, false);
    _MessageStream_response.set(this, void 0);
    _MessageStream_request_id.set(this, void 0);
    _MessageStream_logger.set(this, void 0);
    _MessageStream_handleError.set(this, (error) => {
      __classPrivateFieldSet(this, _MessageStream_errored, true, "f");
      if (isAbortError(error)) {
        error = new APIUserAbortError();
      }
      if (error instanceof APIUserAbortError) {
        __classPrivateFieldSet(this, _MessageStream_aborted, true, "f");
        return this._emit("abort", error);
      }
      if (error instanceof AnthropicError) {
        return this._emit("error", error);
      }
      if (error instanceof Error) {
        const anthropicError = new AnthropicError(error.message);
        anthropicError.cause = error;
        return this._emit("error", anthropicError);
      }
      return this._emit("error", new AnthropicError(String(error)));
    });
    __classPrivateFieldSet(this, _MessageStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _MessageStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet(this, _MessageStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet(this, _MessageStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _MessageStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet(this, _MessageStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet(this, _MessageStream_endPromise, "f").catch(() => {
    });
    __classPrivateFieldSet(this, _MessageStream_params, params, "f");
    __classPrivateFieldSet(this, _MessageStream_logger, opts?.logger ?? console, "f");
  }
  get response() {
    return __classPrivateFieldGet(this, _MessageStream_response, "f");
  }
  get request_id() {
    return __classPrivateFieldGet(this, _MessageStream_request_id, "f");
  }
  /**
   * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
   * returned vie the `request-id` header which is useful for debugging requests and resporting
   * issues to Anthropic.
   *
   * This is the same as the `APIPromise.withResponse()` method.
   *
   * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
   * as no `Response` is available.
   */
  async withResponse() {
    __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
    const response = await __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f");
    if (!response) {
      throw new Error("Could not resolve a `Response` object");
    }
    return {
      data: this,
      response,
      request_id: response.headers.get("request-id")
    };
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _MessageStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createMessage(messages, params, options, { logger } = {}) {
    const runner = new _MessageStream(params, { logger });
    for (const message of params.messages) {
      runner._addMessageParam(message);
    }
    __classPrivateFieldSet(runner, _MessageStream_params, { ...params, stream: true }, "f");
    runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  _run(executor) {
    executor().then(() => {
      this._emitFinal();
      this._emit("end");
    }, __classPrivateFieldGet(this, _MessageStream_handleError, "f"));
  }
  _addMessageParam(message) {
    this.messages.push(message);
  }
  _addMessage(message, emit = true) {
    this.receivedMessages.push(message);
    if (emit) {
      this._emit("message", message);
    }
  }
  async _createMessage(messages, params, options) {
    const signal = options?.signal;
    let abortHandler;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      abortHandler = this.controller.abort.bind(this.controller);
      signal.addEventListener("abort", abortHandler);
    }
    try {
      __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
      const { response, data: stream } = await messages.create({ ...params, stream: true }, { ...options, signal: this.controller.signal }).withResponse();
      this._connected(response);
      for await (const event of stream) {
        __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError();
      }
      __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener("abort", abortHandler);
      }
    }
  }
  _connected(response) {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _MessageStream_response, response, "f");
    __classPrivateFieldSet(this, _MessageStream_request_id, response?.headers.get("request-id"), "f");
    __classPrivateFieldGet(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet(this, _MessageStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet(this, _MessageStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet(this, _MessageStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this MessageStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this MessageStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this MessageStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet(this, _MessageStream_endPromise, "f");
  }
  get currentMessage() {
    return __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
  }
  /**
   * @returns a promise that resolves with the the final assistant Message response,
   * or rejects if an error occurred or the stream ended prematurely without producing a Message.
   * If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant Message's text response, concatenated
   * together if there are more than one text blocks.
   * Rejects if an error occurred or the stream ended prematurely without producing a Message.
   */
  async finalText() {
    await this.done();
    return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet(this, _MessageStream_ended, "f"))
      return;
    if (event === "end") {
      __classPrivateFieldSet(this, _MessageStream_ended, true, "f");
      __classPrivateFieldGet(this, _MessageStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
    const finalMessage = this.receivedMessages.at(-1);
    if (finalMessage) {
      this._emit("finalMessage", __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
    }
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    let abortHandler;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      abortHandler = this.controller.abort.bind(this.controller);
      signal.addEventListener("abort", abortHandler);
    }
    try {
      __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
      this._connected(null);
      const stream = Stream.fromReadableStream(readableStream, this.controller);
      for await (const event of stream) {
        __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError();
      }
      __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener("abort", abortHandler);
      }
    }
  }
  [(_MessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _MessageStream_params = /* @__PURE__ */ new WeakMap(), _MessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_listeners = /* @__PURE__ */ new WeakMap(), _MessageStream_ended = /* @__PURE__ */ new WeakMap(), _MessageStream_errored = /* @__PURE__ */ new WeakMap(), _MessageStream_aborted = /* @__PURE__ */ new WeakMap(), _MessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _MessageStream_response = /* @__PURE__ */ new WeakMap(), _MessageStream_request_id = /* @__PURE__ */ new WeakMap(), _MessageStream_logger = /* @__PURE__ */ new WeakMap(), _MessageStream_handleError = /* @__PURE__ */ new WeakMap(), _MessageStream_instances = /* @__PURE__ */ new WeakSet(), _MessageStream_getFinalMessage = /* @__PURE__ */ __name(function _MessageStream_getFinalMessage2() {
    if (this.receivedMessages.length === 0) {
      throw new AnthropicError("stream ended without producing a Message with role=assistant");
    }
    return this.receivedMessages.at(-1);
  }, "_MessageStream_getFinalMessage"), _MessageStream_getFinalText = /* @__PURE__ */ __name(function _MessageStream_getFinalText2() {
    if (this.receivedMessages.length === 0) {
      throw new AnthropicError("stream ended without producing a Message with role=assistant");
    }
    const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
    if (textBlocks.length === 0) {
      throw new AnthropicError("stream ended without producing a content block with type=text");
    }
    return textBlocks.join(" ");
  }, "_MessageStream_getFinalText"), _MessageStream_beginRequest = /* @__PURE__ */ __name(function _MessageStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
  }, "_MessageStream_beginRequest"), _MessageStream_addStreamEvent = /* @__PURE__ */ __name(function _MessageStream_addStreamEvent2(event) {
    if (this.ended)
      return;
    const messageSnapshot = __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
    this._emit("streamEvent", event, messageSnapshot);
    switch (event.type) {
      case "content_block_delta": {
        const content = messageSnapshot.content.at(-1);
        switch (event.delta.type) {
          case "text_delta": {
            if (content.type === "text") {
              this._emit("text", event.delta.text, content.text || "");
            }
            break;
          }
          case "citations_delta": {
            if (content.type === "text") {
              this._emit("citation", event.delta.citation, content.citations ?? []);
            }
            break;
          }
          case "input_json_delta": {
            if (tracksToolInput2(content) && content.input) {
              this._emit("inputJson", event.delta.partial_json, content.input);
            }
            break;
          }
          case "thinking_delta": {
            if (content.type === "thinking") {
              this._emit("thinking", event.delta.thinking, content.thinking);
            }
            break;
          }
          case "signature_delta": {
            if (content.type === "thinking") {
              this._emit("signature", content.signature);
            }
            break;
          }
          default:
            checkNever2(event.delta);
        }
        break;
      }
      case "message_stop": {
        this._addMessageParam(messageSnapshot);
        this._addMessage(maybeParseMessage(messageSnapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") }), true);
        break;
      }
      case "content_block_stop": {
        this._emit("contentBlock", messageSnapshot.content.at(-1));
        break;
      }
      case "message_start": {
        __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
        break;
      }
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, "_MessageStream_addStreamEvent"), _MessageStream_endRequest = /* @__PURE__ */ __name(function _MessageStream_endRequest2() {
    if (this.ended) {
      throw new AnthropicError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
    if (!snapshot) {
      throw new AnthropicError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
    return maybeParseMessage(snapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") });
  }, "_MessageStream_endRequest"), _MessageStream_accumulateMessage = /* @__PURE__ */ __name(function _MessageStream_accumulateMessage2(event) {
    let snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
    if (event.type === "message_start") {
      if (snapshot) {
        throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
      }
      return event.message;
    }
    if (!snapshot) {
      throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
    }
    switch (event.type) {
      case "message_stop":
        return snapshot;
      case "message_delta":
        snapshot.stop_reason = event.delta.stop_reason;
        snapshot.stop_sequence = event.delta.stop_sequence;
        snapshot.usage.output_tokens = event.usage.output_tokens;
        if (event.usage.input_tokens != null) {
          snapshot.usage.input_tokens = event.usage.input_tokens;
        }
        if (event.usage.cache_creation_input_tokens != null) {
          snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
        }
        if (event.usage.cache_read_input_tokens != null) {
          snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
        }
        if (event.usage.server_tool_use != null) {
          snapshot.usage.server_tool_use = event.usage.server_tool_use;
        }
        return snapshot;
      case "content_block_start":
        snapshot.content.push({ ...event.content_block });
        return snapshot;
      case "content_block_delta": {
        const snapshotContent = snapshot.content.at(event.index);
        switch (event.delta.type) {
          case "text_delta": {
            if (snapshotContent?.type === "text") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                text: (snapshotContent.text || "") + event.delta.text
              };
            }
            break;
          }
          case "citations_delta": {
            if (snapshotContent?.type === "text") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                citations: [...snapshotContent.citations ?? [], event.delta.citation]
              };
            }
            break;
          }
          case "input_json_delta": {
            if (snapshotContent && tracksToolInput2(snapshotContent)) {
              let jsonBuf = snapshotContent[JSON_BUF_PROPERTY2] || "";
              jsonBuf += event.delta.partial_json;
              const newContent = { ...snapshotContent };
              Object.defineProperty(newContent, JSON_BUF_PROPERTY2, {
                value: jsonBuf,
                enumerable: false,
                writable: true
              });
              if (jsonBuf) {
                newContent.input = partialParse(jsonBuf);
              }
              snapshot.content[event.index] = newContent;
            }
            break;
          }
          case "thinking_delta": {
            if (snapshotContent?.type === "thinking") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                thinking: snapshotContent.thinking + event.delta.thinking
              };
            }
            break;
          }
          case "signature_delta": {
            if (snapshotContent?.type === "thinking") {
              snapshot.content[event.index] = {
                ...snapshotContent,
                signature: event.delta.signature
              };
            }
            break;
          }
          default:
            checkNever2(event.delta);
        }
        return snapshot;
      }
      case "content_block_stop":
        return snapshot;
    }
  }, "_MessageStream_accumulateMessage"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("streamEvent", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function checkNever2(x) {
}
__name(checkNever2, "checkNever");

// ../node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs
var Batches2 = class extends APIResource {
  static {
    __name(this, "Batches");
  }
  /**
   * Send a batch of Message creation requests.
   *
   * The Message Batches API can be used to process multiple Messages API requests at
   * once. Once a Message Batch is created, it begins processing immediately. Batches
   * can take up to 24 hours to complete.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const messageBatch = await client.messages.batches.create({
   *   requests: [
   *     {
   *       custom_id: 'my-custom-id-1',
   *       params: {
   *         max_tokens: 1024,
   *         messages: [
   *           { content: 'Hello, world', role: 'user' },
   *         ],
   *         model: 'claude-opus-4-6',
   *       },
   *     },
   *   ],
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/v1/messages/batches", { body, ...options });
  }
  /**
   * This endpoint is idempotent and can be used to poll for Message Batch
   * completion. To access the results of a Message Batch, make a request to the
   * `results_url` field in the response.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const messageBatch = await client.messages.batches.retrieve(
   *   'message_batch_id',
   * );
   * ```
   */
  retrieve(messageBatchID, options) {
    return this._client.get(path`/v1/messages/batches/${messageBatchID}`, options);
  }
  /**
   * List all Message Batches within a Workspace. Most recently created batches are
   * returned first.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const messageBatch of client.messages.batches.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options) {
    return this._client.getAPIList("/v1/messages/batches", Page, { query, ...options });
  }
  /**
   * Delete a Message Batch.
   *
   * Message Batches can only be deleted once they've finished processing. If you'd
   * like to delete an in-progress batch, you must first cancel it.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const deletedMessageBatch =
   *   await client.messages.batches.delete('message_batch_id');
   * ```
   */
  delete(messageBatchID, options) {
    return this._client.delete(path`/v1/messages/batches/${messageBatchID}`, options);
  }
  /**
   * Batches may be canceled any time before processing ends. Once cancellation is
   * initiated, the batch enters a `canceling` state, at which time the system may
   * complete any in-progress, non-interruptible requests before finalizing
   * cancellation.
   *
   * The number of canceled requests is specified in `request_counts`. To determine
   * which requests were canceled, check the individual results within the batch.
   * Note that cancellation may not result in any canceled requests if they were
   * non-interruptible.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const messageBatch = await client.messages.batches.cancel(
   *   'message_batch_id',
   * );
   * ```
   */
  cancel(messageBatchID, options) {
    return this._client.post(path`/v1/messages/batches/${messageBatchID}/cancel`, options);
  }
  /**
   * Streams the results of a Message Batch as a `.jsonl` file.
   *
   * Each line in the file is a JSON object containing the result of a single request
   * in the Message Batch. Results are not guaranteed to be in the same order as
   * requests. Use the `custom_id` field to match results to requests.
   *
   * Learn more about the Message Batches API in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
   *
   * @example
   * ```ts
   * const messageBatchIndividualResponse =
   *   await client.messages.batches.results('message_batch_id');
   * ```
   */
  async results(messageBatchID, options) {
    const batch = await this.retrieve(messageBatchID);
    if (!batch.results_url) {
      throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
    }
    return this._client.get(batch.results_url, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      stream: true,
      __binaryResponse: true
    })._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
  }
};

// ../node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs
var Messages2 = class extends APIResource {
  static {
    __name(this, "Messages");
  }
  constructor() {
    super(...arguments);
    this.batches = new Batches2(this._client);
  }
  create(body, options) {
    if (body.model in DEPRECATED_MODELS2) {
      console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS2[body.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
    }
    if (MODELS_TO_WARN_WITH_THINKING_ENABLED2.includes(body.model) && body.thinking && body.thinking.type === "enabled") {
      console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    }
    let timeout = this._client._options.timeout;
    if (!body.stream && timeout == null) {
      const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
      timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
    }
    const helperHeader = stainlessHelperHeader(body.tools, body.messages);
    return this._client.post("/v1/messages", {
      body,
      timeout: timeout ?? 6e5,
      ...options,
      headers: buildHeaders([helperHeader, options?.headers]),
      stream: body.stream ?? false
    });
  }
  /**
   * Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
   * the response will be automatically parsed and available in the `parsed_output` property of the message.
   *
   * @example
   * ```ts
   * const message = await client.messages.parse({
   *   model: 'claude-sonnet-4-5-20250929',
   *   max_tokens: 1024,
   *   messages: [{ role: 'user', content: 'What is 2+2?' }],
   *   output_config: {
   *     format: zodOutputFormat(z.object({ answer: z.number() })),
   *   },
   * });
   *
   * console.log(message.parsed_output?.answer); // 4
   * ```
   */
  parse(params, options) {
    return this.create(params, options).then((message) => parseMessage(message, params, { logger: this._client.logger ?? console }));
  }
  /**
   * Create a Message stream.
   *
   * If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
   * the final message will include a `parsed_output` property with the parsed content.
   *
   * @example
   * ```ts
   * const stream = client.messages.stream({
   *   model: 'claude-sonnet-4-5-20250929',
   *   max_tokens: 1024,
   *   messages: [{ role: 'user', content: 'What is 2+2?' }],
   *   output_config: {
   *     format: zodOutputFormat(z.object({ answer: z.number() })),
   *   },
   * });
   *
   * const message = await stream.finalMessage();
   * console.log(message.parsed_output?.answer); // 4
   * ```
   */
  stream(body, options) {
    return MessageStream.createMessage(this, body, options, { logger: this._client.logger ?? console });
  }
  /**
   * Count the number of tokens in a Message.
   *
   * The Token Count API can be used to count the number of tokens in a Message,
   * including tools, images, and documents, without creating it.
   *
   * Learn more about token counting in our
   * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
   *
   * @example
   * ```ts
   * const messageTokensCount =
   *   await client.messages.countTokens({
   *     messages: [{ content: 'Hello, world', role: 'user' }],
   *     model: 'claude-opus-4-6',
   *   });
   * ```
   */
  countTokens(body, options) {
    return this._client.post("/v1/messages/count_tokens", { body, ...options });
  }
};
var DEPRECATED_MODELS2 = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026",
  "claude-3-5-haiku-latest": "February 19th, 2026",
  "claude-3-5-haiku-20241022": "February 19th, 2026",
  "claude-opus-4-0": "June 15th, 2026",
  "claude-opus-4-20250514": "June 15th, 2026",
  "claude-sonnet-4-0": "June 15th, 2026",
  "claude-sonnet-4-20250514": "June 15th, 2026"
};
var MODELS_TO_WARN_WITH_THINKING_ENABLED2 = ["claude-mythos-preview", "claude-opus-4-6"];
Messages2.Batches = Batches2;

// ../node_modules/@anthropic-ai/sdk/resources/models.mjs
var Models2 = class extends APIResource {
  static {
    __name(this, "Models");
  }
  /**
   * Get a specific model.
   *
   * The Models API response can be used to determine information about a specific
   * model or resolve a model alias to a model ID.
   */
  retrieve(modelID, params = {}, options) {
    const { betas } = params ?? {};
    return this._client.get(path`/v1/models/${modelID}`, {
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        options?.headers
      ])
    });
  }
  /**
   * List available models.
   *
   * The Models API response can be used to determine which models are available for
   * use in the API. More recently released models are listed first.
   */
  list(params = {}, options) {
    const { betas, ...query } = params ?? {};
    return this._client.getAPIList("/v1/models", Page, {
      query,
      ...options,
      headers: buildHeaders([
        { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
        options?.headers
      ])
    });
  }
};

// ../node_modules/@anthropic-ai/sdk/internal/utils/env.mjs
var readEnv = /* @__PURE__ */ __name((env) => {
  if (typeof globalThis.process !== "undefined") {
    return globalThis.process.env?.[env]?.trim() || void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return globalThis.Deno.env?.get?.(env)?.trim() || void 0;
  }
  return void 0;
}, "readEnv");

// ../node_modules/@anthropic-ai/sdk/client.mjs
var _BaseAnthropic_instances;
var _a;
var _BaseAnthropic_encoder;
var _BaseAnthropic_baseURLOverridden;
var HUMAN_PROMPT = "\\n\\nHuman:";
var AI_PROMPT = "\\n\\nAssistant:";
var BaseAnthropic = class {
  static {
    __name(this, "BaseAnthropic");
  }
  /**
   * API Client for interfacing with the Anthropic API.
   *
   * @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
   * @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
   * @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL = readEnv("ANTHROPIC_BASE_URL"), apiKey = readEnv("ANTHROPIC_API_KEY") ?? null, authToken = readEnv("ANTHROPIC_AUTH_TOKEN") ?? null, ...opts } = {}) {
    _BaseAnthropic_instances.add(this);
    _BaseAnthropic_encoder.set(this, void 0);
    const options = {
      apiKey,
      authToken,
      ...opts,
      baseURL: baseURL || `https://api.anthropic.com`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new AnthropicError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
    }
    this.baseURL = options.baseURL;
    this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
    this.logger = options.logger ?? console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? getDefaultFetch();
    __classPrivateFieldSet(this, _BaseAnthropic_encoder, FallbackEncoder, "f");
    this._options = options;
    this.apiKey = typeof apiKey === "string" ? apiKey : null;
    this.authToken = authToken;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options) {
    const client = new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      authToken: this.authToken,
      ...options
    });
    return client;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values, nulls }) {
    if (values.get("x-api-key") || values.get("authorization")) {
      return;
    }
    if (this.apiKey && values.get("x-api-key")) {
      return;
    }
    if (nulls.has("x-api-key")) {
      return;
    }
    if (this.authToken && values.get("authorization")) {
      return;
    }
    if (nulls.has("authorization")) {
      return;
    }
    throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
  }
  async authHeaders(opts) {
    return buildHeaders([await this.apiKeyAuth(opts), await this.bearerAuth(opts)]);
  }
  async apiKeyAuth(opts) {
    if (this.apiKey == null) {
      return void 0;
    }
    return buildHeaders([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(opts) {
    if (this.authToken == null) {
      return void 0;
    }
    return buildHeaders([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  /**
   * Basic re-implementation of `qs.stringify` for primitive types.
   */
  stringifyQuery(query) {
    return stringifyQuery(query);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !__classPrivateFieldGet(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    const pathQuery = Object.fromEntries(url.searchParams);
    if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
      query = { ...pathQuery, ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  _calculateNonstreamingTimeout(maxTokens) {
    const defaultTimeout = 10 * 60;
    const expectedTimeout = 60 * 60 * maxTokens / 128e3;
    if (expectedTimeout > defaultTimeout) {
      throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
    }
    return defaultTimeout * 1e3;
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return { method, path: path2, ...opts2 };
    }));
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining
    });
    await this.prepareRequest(req, { url, options });
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();
    loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
      retryOfRequestLogID,
      method: options.method,
      url,
      options,
      headers: req.headers
    }));
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: response.message
      }));
      if (isTimeout) {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
    const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        await CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
      }
      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }
  getAPIList(path2, Page2, opts) {
    return this.requestAPIList(Page2, opts && "then" in opts ? opts.then((opts2) => ({ method: "get", path: path2, ...opts2 })) : { method: "get", path: path2, ...opts });
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null, void 0);
    return new PagePromise(this, request, Page2);
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, method, ...options } = init || {};
    const abort = this._makeAbort(controller);
    if (signal)
      signal.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, ms);
    const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
    const fetchOptions = {
      signal: controller.signal,
      ...isReadableBody ? { duplex: "half" } : {},
      method: "GET",
      ...options
    };
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      return await this.fetch.call(void 0, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (timeoutMillis === void 0) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
    const maxTime = 60 * 60 * 1e3;
    const defaultTime = 60 * 10 * 1e3;
    const expectedTime = maxTime * maxTokens / 128e3;
    if (expectedTime > defaultTime || maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens) {
      throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    }
    return defaultTime;
  }
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path: path2, query, defaultBaseURL } = options;
    const url = this.buildURL(path2, query, defaultBaseURL);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
    const req = {
      method,
      headers: reqHeaders,
      ...options.signal && { signal: options.signal },
      ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
      ...body && { body },
      ...this.fetchOptions ?? {},
      ...options.fetchOptions ?? {}
    };
    return { req, url, timeout: options.timeout };
  }
  async buildHeaders({ options, method, bodyHeaders, retryCount }) {
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }
    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(retryCount),
        ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
        ...getPlatformHeaders(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers
    ]);
    this.validateHeaders(headers);
    return headers.values;
  }
  _makeAbort(controller) {
    return () => controller.abort();
  }
  buildBody({ options: { body, headers: rawHeaders } }) {
    if (!body) {
      return { bodyHeaders: void 0, body: void 0 };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && body instanceof globalThis.ReadableStream
    ) {
      return { bodyHeaders: void 0, body };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
    } else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") {
      return {
        bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
        body: this.stringifyQuery(body)
      };
    } else {
      return __classPrivateFieldGet(this, _BaseAnthropic_encoder, "f").call(this, { body, headers });
    }
  }
};
_a = BaseAnthropic, _BaseAnthropic_encoder = /* @__PURE__ */ new WeakMap(), _BaseAnthropic_instances = /* @__PURE__ */ new WeakSet(), _BaseAnthropic_baseURLOverridden = /* @__PURE__ */ __name(function _BaseAnthropic_baseURLOverridden2() {
  return this.baseURL !== "https://api.anthropic.com";
}, "_BaseAnthropic_baseURLOverridden");
BaseAnthropic.Anthropic = _a;
BaseAnthropic.HUMAN_PROMPT = HUMAN_PROMPT;
BaseAnthropic.AI_PROMPT = AI_PROMPT;
BaseAnthropic.DEFAULT_TIMEOUT = 6e5;
BaseAnthropic.AnthropicError = AnthropicError;
BaseAnthropic.APIError = APIError;
BaseAnthropic.APIConnectionError = APIConnectionError;
BaseAnthropic.APIConnectionTimeoutError = APIConnectionTimeoutError;
BaseAnthropic.APIUserAbortError = APIUserAbortError;
BaseAnthropic.NotFoundError = NotFoundError;
BaseAnthropic.ConflictError = ConflictError;
BaseAnthropic.RateLimitError = RateLimitError;
BaseAnthropic.BadRequestError = BadRequestError;
BaseAnthropic.AuthenticationError = AuthenticationError;
BaseAnthropic.InternalServerError = InternalServerError;
BaseAnthropic.PermissionDeniedError = PermissionDeniedError;
BaseAnthropic.UnprocessableEntityError = UnprocessableEntityError;
BaseAnthropic.toFile = toFile;
var Anthropic = class extends BaseAnthropic {
  static {
    __name(this, "Anthropic");
  }
  constructor() {
    super(...arguments);
    this.completions = new Completions(this);
    this.messages = new Messages2(this);
    this.models = new Models2(this);
    this.beta = new Beta(this);
  }
};
Anthropic.Completions = Completions;
Anthropic.Messages = Messages2;
Anthropic.Models = Models2;
Anthropic.Beta = Beta;

// ../app/src/data/knowledgeBase.ts
var KNOWLEDGE_BASE = `

--- CNS-FATIGUE-KNOWLEDGE-BASE.md ---

---
title: "Fatigue du SNC et Autor\xE9gulation en Powerlifting"
domain: "recovery"
tags: ["cns","fatigue","vbt","hrv","autoregulation"]
source_type: "markdown"
---

# Base de Connaissances - Fatigue Nerveuse et Monitorage

## Analyse syst\xE9mique de la r\xE9cup\xE9ration neuromusculaire en powerlifting : Physiologie de la fatigue, monitorage de la charge et optimisation des processus de restauration

La pratique du powerlifting, centr\xE9e sur la performance maximale lors du squat, du d\xE9velopp\xE9 couch\xE9 et du soulev\xE9 de terre, impose des contraintes physiologiques d'une intensit\xE9 rare. La capacit\xE9 d'un athl\xE8te \xE0 progresser de mani\xE8re lin\xE9aire ou cyclique d\xE9pend moins de l'intensit\xE9 brute des s\xE9ances que de la finesse avec laquelle la r\xE9cup\xE9ration est orchestr\xE9e. La fatigue, dans ce contexte, ne doit pas \xEAtre per\xE7ue comme un simple \xE9tat de lassitude, mais comme un ph\xE9nom\xE8ne multidimensionnel impliquant des perturbations m\xE9taboliques locales, des dommages structurels cellulaires et une modulation complexe de l'influx nerveux central.[1, 2, 3] La distinction entre la r\xE9cup\xE9ration musculaire (p\xE9riph\xE9rique) et la r\xE9cup\xE9ration nerveuse (centrale) est fondamentale pour le praticien de la force, car leurs cin\xE9tiques et leurs m\xE9canismes de r\xE9solution diff\xE8rent substantiellement.

## \xC9tiologie et m\xE9canismes de la fatigue p\xE9riph\xE9rique musculaire

La fatigue p\xE9riph\xE9rique se d\xE9finit comme une r\xE9duction de la capacit\xE9 de g\xE9n\xE9ration de force trouvant son origine en aval de la jonction neuromusculaire, affectant directement l'unit\xE9 contractile du muscle squelettique.[2, 4, 5] En powerlifting, cette fatigue est principalement d\xE9clench\xE9e par des charges d\xE9passant 80% du maximum (1RM), sollicitant pr\xE9f\xE9rentiellement les unit\xE9s motrices \xE0 haut seuil et les fibres de type IIx.[6, 7]

### Perturbations biochimiques et m\xE9taboliques intramusculaires
Lors d'un effort de haute intensit\xE9, le muscle subit une d\xE9pl\xE9tion rapide des substrats \xE9nerg\xE9tiques imm\xE9diats. La phosphocr\xE9atine (PCr) et l'ad\xE9nosine triphosphate (ATP) intramusculaires chutent, tandis que la concentration en phosphate inorganique (Pi) et en ions hydrog\xE8ne (H+) augmente consid\xE9rablement.[7, 8, 9] Cette accumulation de m\xE9tabolites induit une acidose m\xE9tabolique qui interf\xE8re avec la lib\xE9ration du calcium par le r\xE9ticulum sarcoplasmique et r\xE9duit la sensibilit\xE9 des myofilaments au calcium, freinant ainsi la formation des ponts crois\xE9s d'actine-myosine.[7, 10]

Bien que le powerlifting soit souvent per\xE7u comme une activit\xE9 purement alactique, des protocoles de haute intensit\xE9 (80% 1RM) \xE0 vitesse maximale provoquent des augmentations significatives du lactate sanguin, signe d'un stress m\xE9tabolique profond.[6] Le lactate n'est plus consid\xE9r\xE9 comme un d\xE9chet toxique, mais son accumulation est corr\xE9l\xE9e \xE0 une baisse de la fr\xE9quence m\xE9diane (MDF) du signal \xE9lectromyographique, indiquant un glissement spectral vers la fatigue neuromusculaire.[6, 11]

| Param\xE8tre M\xE9tabolique | R\xE9ponse \xE0 l'effort intense | Impact sur la r\xE9cup\xE9ration |
| :--- | :--- | :--- |
| **Phosphocr\xE9atine (PCr)** | D\xE9pl\xE9tion rapide (en quelques secondes) | N\xE9cessite 3 \xE0 5 minutes pour une resynth\xE8se \xE0 95% [12] |
| **Glycog\xE8ne intramusculaire** | R\xE9duction de 20 \xE0 40% par s\xE9ance | Restauration prioritaire via l'apport glucidique post-effort [8] |
| **Ions Hydrog\xE8ne (H+)** | Augmentation marqu\xE9e (baisse du pH) | Cause de l'inhibition enzymatique et de la douleur aigu\xEB [7] |
| **Phosphate Inorganique (Pi)** | Accumulation rapide | Alt\xE8re la force de tension des ponts crois\xE9s [7] |

### Dommages structurels et synth\xE8se prot\xE9ique
Au-del\xE0 de la fatigue m\xE9tabolique, l'entra\xEEnement lourd induit des micro-l\xE9sions au niveau des sarcom\xE8res, particuli\xE8rement lors de la phase excentrique du mouvement.[13, 14, 15] Ces micro-d\xE9chirures myofibrillaires d\xE9clenchent une r\xE9ponse inflammatoire n\xE9cessaire \xE0 la r\xE9paration et \xE0 l'hypertrophie. La cr\xE9atine kinase (CK) s\xE9rique est souvent utilis\xE9e comme biomarqueur indirect de ces dommages, sa concentration restant \xE9lev\xE9e pendant plusieurs jours apr\xE8s une s\xE9ance traumatique.[7]

Le processus de r\xE9cup\xE9ration musculaire suit un mod\xE8le d'adaptation o\xF9 les muscles \xAB gu\xE9rissent \xBB en devenant plus volumineux et r\xE9sistants.[14, 15] La synth\xE8se prot\xE9ique musculaire (MPS) augmente de plus de 50% dans les heures suivant la musculation, un ph\xE9nom\xE8ne qui n\xE9cessite une disponibilit\xE9 accrue en acides amin\xE9s essentiels.[14] Si la r\xE9cup\xE9ration est ad\xE9quate, la surcompensation permet \xE0 l'athl\xE8te de d\xE9passer son niveau de force initial, un principe cl\xE9 de la progression en powerlifting.[16, 17, 18]

## Physiologie et complexit\xE9 de la fatigue nerveuse centrale

La fatigue du syst\xE8me nerveux central (SNC) est une r\xE9duction de la commande neurale volontaire dirig\xE9e vers le muscle, se manifestant par une incapacit\xE9 du cerveau \xE0 recruter pleinement les unit\xE9s motrices disponibles.[3, 5, 19] Contrairement \xE0 une id\xE9e re\xE7ue dans le milieu du powerlifting, les efforts maximaux de tr\xE8s courte dur\xE9e induisent proportionnellement moins de fatigue centrale que les efforts de longue dur\xE9e ou de volume \xE9lev\xE9.[19] N\xE9anmoins, la fatigue nerveuse en powerlifting est r\xE9elle et peut alt\xE9rer la performance pendant plusieurs jours si elle n'est pas g\xE9r\xE9e.[19, 20]

### La th\xE9orie s\xE9rotoninergique et le ratio s\xE9rotonine/dopamine
L'hypoth\xE8se centrale de la fatigue repose sur la modulation des neurotransmetteurs c\xE9r\xE9braux. La s\xE9rotonine (5-HT) est associ\xE9e \xE0 la l\xE9thargie, \xE0 la somnolence et \xE0 une augmentation de la perception de l'effort.[3, 9, 21] Durant un exercice prolong\xE9 ou intense, la concentration de tryptophane libre (pr\xE9curseur de la 5-HT) augmente dans le plasma, facilitant son passage \xE0 travers la barri\xE8re h\xE9mato-enc\xE9phalique via les transporteurs partag\xE9s avec les acides amin\xE9s \xE0 cha\xEEne ramifi\xE9e (BCAA).[4, 9]

La dopamine (DA), \xE0 l'inverse, soutient la motivation, l'\xE9veil et la coordination motrice.[9, 21] Le ratio s\xE9rotonine/dopamine est d\xE9sormais privil\xE9gi\xE9 comme marqueur de la fatigue centrale plut\xF4t que l'analyse d'un seul neurotransmetteur. Un ratio \xE9lev\xE9 favorise l'arr\xEAt pr\xE9coce de l'effort, tandis qu'un ratio bas, soutenu par des niveaux \xE9lev\xE9s de dopamine et de noradr\xE9naline, favorise le maintien de la performance.[21, 22]

| Neurotransmetteur | R\xF4le dans la performance | Effet de l'augmentation |
| :--- | :--- | :--- |
| **S\xE9rotonine (5-HT)** | R\xE9gulateur de la fatigue/sommeil | Augmente la perception de l'effort, r\xE9duit la commande motrice [9, 23] |
| **Dopamine (DA)** | Motivation, coordination, r\xE9compense | Effet ergog\xE8ne, am\xE9liore la tol\xE9rance \xE0 l'effort intense [4, 9] |
| **Noradr\xE9naline** | \xC9veil, r\xE9ponse au stress | Soutient la performance, notamment dans la chaleur [21] |
| **Ac\xE9tylcholine** | Transmission neuromusculaire | R\xF4le mineur dans la fatigue centrale par rapport aux monoamines [7] |

### M\xE9canisme cellulaire de l'inhibition des motoneurones
Une avanc\xE9e majeure dans la compr\xE9hension de la fatigue centrale r\xE9side dans l'identification d'un m\xE9canisme d'inhibition directe au niveau de la moelle \xE9pini\xE8re. Les r\xE9cepteurs s\xE9rotoninergiques de type 5-HT1A sont localis\xE9s sur le segment initial de l'axone (AIS) des motoneurones.[23] Lors d'une activit\xE9 motrice intense, la lib\xE9ration accrue de s\xE9rotonine par les voies raph\xE9-spinales finit par d\xE9border (spillover) sur l'AIS. L'activation des r\xE9cepteurs 5-HT1A inhibe les canaux sodiques responsables de la gen\xE8se du potentiel d'action, augmentant ainsi le seuil d'excitation du motoneurone.[23] Ce processus r\xE9duit l'excitabilit\xE9 neuronale, agissant comme un "limiteur de vitesse" biologique pour prot\xE9ger l'int\xE9grit\xE9 du syst\xE8me.[23]

## Monitorage de la charge et d\xE9tection de la fatigue

Pour le powerlifter, le d\xE9fi r\xE9side dans l'identification pr\xE9coce de la fatigue nerveuse avant qu'elle ne compromette la technique ou ne m\xE8ne \xE0 une blessure. L'utilisation combin\xE9e de marqueurs subjectifs et technologiques permet une gestion pr\xE9cise de la charge de travail.

### L'entra\xEEnement bas\xE9 sur la vitesse (Velocity Based Training - VBT)
Le VBT est devenu un standard pour mesurer l'\xE9tat de pr\xE9paration neuromusculaire (readiness). La vitesse de la barre est inversement proportionnelle \xE0 la charge et \xE0 la fatigue accumul\xE9e.[24, 25] Un d\xE9clin de la vitesse maximale pour une charge donn\xE9e au d\xE9but d'une s\xE9ance est un indicateur fiable d'une fatigue r\xE9siduelle du SNC.[24, 26]

La perte de vitesse intra-s\xE9rie permet d'objectiver la proximit\xE9 de l'\xE9chec et de r\xE9guler le volume. Une perte de vitesse de 20% est jug\xE9e optimale pour les gains de force, car elle permet un stimulus suffisant tout en limitant l'\xE9puisement m\xE9tabolique et le temps de r\xE9cup\xE9ration n\xE9cessaire, contrairement \xE0 une perte de 40% qui correspond souvent \xE0 l'\xE9chec technique.[11]

| Seuil de perte de vitesse | Intensit\xE9 per\xE7ue (RPE) | Objectif d'entra\xEEnement |
| :--- | :--- | :--- |
| **5 - 15%** | 6 - 7 RPE | Tapering, puissance, explosivit\xE9 maximale [11] |
| **20%** | 7 - 8 RPE | Force maximale (Sweet Spot), fatigue mod\xE9r\xE9e [11] |
| **30%** | 8.5 - 9 RPE | Volume d'hypertrophie, fatigue marqu\xE9e [11] |
| **40 - 50%** | 9.5 - 10 RPE | \xC9chec technique/musculaire, r\xE9cup\xE9ration longue [11] |

### Variabilit\xE9 de la fr\xE9quence cardiaque (HRV) et force de pr\xE9hension
L'HRV, mesur\xE9e g\xE9n\xE9ralement au r\xE9veil, refl\xE8te l'\xE9quilibre du syst\xE8me nerveux autonome (ANS). Un score \xE9lev\xE9 indique une pr\xE9dominance du syst\xE8me parasympathique (repos et digestion), favorable \xE0 l'entra\xEEnement lourd, tandis qu'une baisse persistante ou une instabilit\xE9 marqu\xE9e sugg\xE8re une surcharge du syst\xE8me sympathique (lutte ou fuite) li\xE9e au stress de l'entra\xEEnement ou du mode de vie.[5, 27, 28]

Parall\xE8lement, la force de pr\xE9hension (gripstrength) est un test simple et non fatiguant pour \xE9valuer l'excitabilit\xE9 neuromusculaire. Un d\xE9clin de la force de pr\xE9hension par rapport \xE0 la moyenne de l'athl\xE8te est souvent corr\xE9l\xE9 \xE0 une fatigue centrale syst\xE9mique, signalant qu'une s\xE9ance de squat ou de soulev\xE9 de terre lourd devrait \xEAtre report\xE9e ou all\xE9g\xE9e.[5, 29]

## Strat\xE9gies de programmation pour la gestion de la fatigue

La structure de l'entra\xEEnement doit int\xE9grer des m\xE9canismes de d\xE9charge pour permettre la dissipation de la fatigue accumul\xE9e.

### Deload, Pivot Blocks et Emerging Strategies
Le "deload" traditionnel consiste en une semaine de r\xE9duction du volume et de l'intensit\xE9, g\xE9n\xE9ralement toutes les 4 \xE0 6 semaines, pour dissiper la fatigue physiologique et psychologique.[30, 31] Mike Tuchscherer (RTS) propose une alternative plus dynamique appel\xE9e "Pivot Block". Un pivot n'est pas un simple repos, mais une phase de transition (souvent 1/3 de la dur\xE9e du bloc pr\xE9c\xE9dent) o\xF9 l'on change la structure des exercices, r\xE9duit la sp\xE9cificit\xE9 et abaisse la fatigue tout en maintenant une certaine stimulation pour pr\xE9server les acquis.[32]

Le mod\xE8le des "Emerging Strategies" utilise une approche ascendante (bottom-up) : un microcycle hebdomadaire est r\xE9p\xE9t\xE9 tant que la performance progresse. La stagnation ou le d\xE9clin pendant deux semaines cons\xE9cutives indique que l'athl\xE8te a atteint son "Time to Peak" (TTP) et n\xE9cessite une phase de d\xE9charge ou de pivot.[32] Cette m\xE9thode permet une individualisation extr\xEAme de la fr\xE9quence des p\xE9riodes de r\xE9cup\xE9ration.

### Autor\xE9gulation par le RPE et les pourcentages de fatigue
L'utilisation de l'\xE9chelle d'effort per\xE7u (RPE) bas\xE9e sur les r\xE9p\xE9titions en r\xE9serve (RIR) permet d'ajuster la charge en temps r\xE9el selon la forme du jour.[33, 34] Si un athl\xE8te a mal dormi ou subit un stress professionnel intense, un poids qui repr\xE9sente habituellement 80% de son maximum pourrait \xEAtre ressenti comme un RPE 10. L'autor\xE9gulation permet de r\xE9duire ce poids pour rester dans la zone de travail cible (ex: RPE 8), pr\xE9servant ainsi le syst\xE8me nerveux.[33, 35]

Certains logiciels de monitorage comme TRAC (RTS) analysent l'influence du stress corporel global sur l'\xE9quilibre du syst\xE8me nerveux autonome. Un surmenage sympathique sugg\xE8re une n\xE9cessit\xE9 de r\xE9duire l'intensit\xE9, tandis qu'un surmenage parasympathique peut parfois indiquer une fatigue li\xE9e \xE0 un volume excessif.[28]

## Les piliers de la r\xE9cup\xE9ration : Nutrition, Sommeil et Lifestyle

Aucune programmation, aussi parfaite soit-elle, ne peut compenser des carences dans les besoins biologiques fondamentaux.

### Nutrition optimale pour la restauration neuromusculaire
La r\xE9cup\xE9ration musculaire n\xE9cessite une synth\xE8se prot\xE9ique optimale, favoris\xE9e par un apport quotidien de 1,6 \xE0 2,2 g de prot\xE9ines par kg de poids corporel.[13, 36] Les prot\xE9ines de lactos\xE9rum (whey) isolat sont privil\xE9gi\xE9es pour leur vitesse d'absorption et leur richesse en leucine, d\xE9clencheur cl\xE9 de la MPS.[13, 30]

Les glucides jouent un r\xF4le tout aussi crucial, non seulement pour la resynth\xE8se du glycog\xE8ne, mais aussi pour soutenir le fonctionnement du SNC.[8, 37] Un apport glucidique ad\xE9quat r\xE9duit les niveaux de cortisol post-entra\xEEnement et facilite le transport du tryptophane de mani\xE8re \xE0 minimiser la fatigue centrale.[3, 8]

| Strat\xE9gie Nutritionnelle | Recommandation Powerlifting | Justification Physiologique |
| :--- | :--- | :--- |
| **Prot\xE9ines** | 1.6 - 2.2 g/kg/jour | R\xE9paration tissulaire et balance azot\xE9e positive [13, 36] |
| **Glucides** | 3 - 5 g/kg/jour | Resynth\xE8se du glycog\xE8ne et soutien \xE9nerg\xE9tique nerveux [8] |
| **Hydratation** | Variable (maintien du poids) | Transport des nutriments et \xE9limination des m\xE9tabolites [13, 37] |
| **Timing Post-Effort** | Fen\xEAtre de 30-60 min | Maximisation de la sensibilit\xE9 \xE0 l'insuline et de la resynth\xE8se [17, 38] |

La suppl\xE9mentation peut inclure la cr\xE9atine (pour les r\xE9serves de PCr), le magn\xE9sium et les vitamines B (pour la sant\xE9 nerveuse), ainsi que les om\xE9ga-3 (pour moduler l'inflammation).[8, 37]

### L'architecture du sommeil comme agent de r\xE9g\xE9n\xE9ration
Le sommeil est la phase privil\xE9gi\xE9e de la r\xE9cup\xE9ration. Le sommeil profond (stade 3) est marqu\xE9 par une s\xE9cr\xE9tion maximale d'hormone de croissance et une r\xE9g\xE9n\xE9ration tissulaire intense.[36, 38] Le sommeil paradoxal (REM) est essentiel pour la d\xE9sintoxication du cerveau via le syst\xE8me glymphatique et la consolidation de l'apprentissage moteur des gestes techniques.[38]

Une dette de sommeil augmente la sensibilit\xE9 \xE0 la douleur, r\xE9duit la vitesse d'ex\xE9cution et alt\xE8re la capacit\xE9 du SNC \xE0 recruter les unit\xE9s motrices de mani\xE8re synchrone.[5, 36] La sieste de 20 \xE0 30 minutes peut \xEAtre une aide temporaire, mais ne remplace pas une routine de 7 \xE0 9 heures de sommeil nocturne constant.[13, 36]

### Gestion du stress extrins\xE8que
Le syst\xE8me nerveux ne fait pas de distinction parfaite entre le stress d'une s\xE9ance de soulev\xE9 de terre \xE0 90% et le stress d'une \xE9ch\xE9ance professionnelle majeure. Le cortisol, hormone du stress, peut rester chroniquement \xE9lev\xE9, inhibant la r\xE9cup\xE9ration et favorisant la r\xE9tention d'eau et la fatigue mentale.[5, 39] Des techniques de relaxation, comme la m\xE9ditation ou la respiration profonde (10 minutes par jour), peuvent abaisser le tonus sympathique et favoriser la transition vers un \xE9tat de r\xE9cup\xE9ration parasympathique.[37, 39]

## R\xE9cup\xE9ration active et thermoth\xE9rapie

Le choix entre repos complet (r\xE9cup\xE9ration passive) et mouvement l\xE9ger (r\xE9cup\xE9ration active) est crucial.

### Les avantages de la r\xE9cup\xE9ration active
La r\xE9cup\xE9ration active, par exemple 20 \xE0 45 minutes de marche ou de v\xE9lo \xE0 30-60% de la fr\xE9quence cardiaque maximale, surpasse souvent le repos complet pour l'\xE9limination des m\xE9tabolites et la r\xE9duction des courbatures (DOMS).[40, 41, 42] Le maintien d'un flux sanguin l\xE9ger sans stress m\xE9canique suppl\xE9mentaire livre des nutriments aux tissus endommag\xE9s et maintient la mobilit\xE9 articulaire, \xE9vitant la raideur caract\xE9ristique des jours post-entra\xEEnement lourd.[40, 43]

### Thermoth\xE9rapie et cryoth\xE9rapie
L'alternance entre le chaud et le froid (douches \xE9cossaises, bains contrast\xE9s) peut am\xE9liorer la circulation sanguine et r\xE9duire l'inflammation.[15] Cependant, l'immersion en eau froide imm\xE9diatement apr\xE8s une s\xE9ance de force est sujette \xE0 d\xE9bat, car elle pourrait att\xE9nuer la r\xE9ponse inflammatoire n\xE9cessaire aux adaptations hypertrophiques \xE0 long terme.[15] Elle reste n\xE9anmoins utile lors d'une comp\xE9tition pour acc\xE9l\xE9rer la r\xE9cup\xE9ration entre deux jours de passage.

## Synth\xE8se et int\xE9gration pratique

La gestion de la r\xE9cup\xE9ration en powerlifting exige un \xE9quilibre subtil entre la science et l'intuition. Alors que la fatigue musculaire p\xE9riph\xE9rique est largement g\xE9r\xE9e par une nutrition ad\xE9quate (prot\xE9ines/glucides) et une p\xE9riodisation intelligente du volume, la fatigue nerveuse centrale requiert une attention particuli\xE8re port\xE9e au sommeil, au stress global et \xE0 l'autor\xE9gulation de l'intensit\xE9.

L'utilisation d'outils comme le VBT et l'HRV offre des donn\xE9es objectives pour valider les sensations subjectives de l'athl\xE8te. Un powerlifter performant n'est pas celui qui s'entra\xEEne le plus dur \xE0 chaque s\xE9ance, mais celui qui sait identifier le moment o\xF9 son syst\xE8me nerveux est pr\xEAt pour une intensit\xE9 maximale et celui o\xF9 il doit reculer pour permettre la surcompensation. La r\xE9cup\xE9ration est, au m\xEAme titre que le squat ou le bench, une comp\xE9tence qui se d\xE9veloppe par l'\xE9coute du corps et l'ajustement constant des variables environnementales et structurelles. L'objectif final est de transformer le stress de l'entra\xEEnement en gain de force durable, en \xE9vitant les pi\xE8ges du surentra\xEEnement sympathique et de l'\xE9puisement central.

*(Sources : Bibliographie compl\xE8te extraite de NotebookLM pour alimenter l'agent IA).*

## Sources
- Biomarkers of peripheral muscle fatigue during exercise - PMC - NIH, https://pmc.ncbi.nlm.nih.gov/articles/PMC3534479/
- Exercise-Induced Central Fatigue: Biomarkers and Non- Medicinal Interventions - Semantic Scholar, https://pdfs.semanticscholar.org/9fc8/960fc858159aaedfc0abe23d504c39471733.pdf
- Exercise-Induced Central Fatigue: Biomarkers and Non-Medicinal Interventions - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12096901/
- Physical exercise-induced fatigue: the role of serotonergic and dopaminergic systems - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC5649871/
- Beyond Tired: Understanding Fatigue, Overreaching, and ... - CrossFit, https://www.crossfit.com/pro-coach/crossfit-overtraining-fatigue-performance
- Study on the differences in peripheral fatigue responses ... - Frontiers, https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1661217/full
- (PDF) Central and Peripheral Fatigue During Resistance Exercise ..., https://www.researchgate.net/publication/290479889_Central_and_Peripheral_Fatigue_During_Resistance_Exercise_-_A_Critical_Review
- Nutritional Strategies for Enhancing Performance and Training ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC11720227/
- Central nervous system fatigue - Wikipedia, https://en.wikipedia.org/wiki/Central_nervous_system_fatigue
- Monitoring Resistance Training in Real Time with Wearable Technology: Current Applications and Future Directions - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC10525173/
- Velocity loss thresholds: VBT fatigue tracking - VBTcoach, https://www.vbtcoach.com/blog/velocity-loss-guidelines-for-fatigue-with-velocity-based-training
- Velocity-Based Training Chart & Zones - SimpliFaster, https://simplifaster.com/articles/velocity-based-training-chart-zones/
- R\xE9cup\xE9ration musculaire : guide complet (25 conseils) - Prot\xE9alpes, https://protealpes.com/recuperation-musculaire-guide-complet-25-conseils/
- Les super-pouvoirs de la r\xE9cup\xE9ration musculaire - Toutelanutrition.com, https://www.toutelanutrition.com/blogs/wikifit/les-super-pouvoirs-de-la-recuperation-musculaire
- Comment assurer une r\xE9cup\xE9ration musculaire optimale ? - Conseil Sport Decathlon, https://conseilsport.decathlon.fr/comment-assurer-une-recuperation-musculaire-optimale
- Combien de jours de surcompensation ? - O.K.R, https://www.okr.fr/blogs/prise-de-muscle/combien-de-jours-de-surcompensation
- Principe de surcompensation : comprendre le m\xE9canisme cl\xE9 de la progression sportive, https://www.nutrimuscle.com/blogs/actualites/principe-surcompensation-entrainement
- La surcompensation - Endur'activ, https://www.endur-activ.com/la-surcompensation-3/
- 3 CNS Fatigue Myths - Menno Henselmans, https://mennohenselmans.com/cns-fatigue/
- Neuromuscular Fatigue and Recovery after Heavy Resistance, Jump, and Sprint Training, https://pubmed.ncbi.nlm.nih.gov/30067591/
- Central fatigue: the serotonin hypothesis and beyond - PubMed, https://pubmed.ncbi.nlm.nih.gov/17004850/
- Central and Peripheral Fatigue in Physical Exercise Explained: A Narrative Review, https://www.semanticscholar.org/paper/Central-and-Peripheral-Fatigue-in-Physical-Exercise-Tornero-Aguilera-Jim%C3%A9nez-Morcillo/3f64362d95bb93555755d6944270a3061873c72e
- Serotonin induces central fatigue by inhibiting action ... - Frontiers, https://internal-www.frontiersin.org/10.3389/conf.fnins.2015.90.00004/event_abstract
- A Guide to Velocity Based Training for Clinicians and Coaches - Meloq Devices, https://meloqdevices.com/fr-FR/blogs/meloq-updates/velocity-based-training
- Max Strength and VBT - Catapult Sports, https://www.catapult.com/blog/max-strength-vbt
- Using Velocity-Based Training to Manage Fatigue and Optimize Resistance Training, https://resources.keiser.com/velocity-based-training
- HRV monitoring for strength and power athletes  - HRV4Training, https://www.hrv4training.com/blog2/hrv-monitoring-for-strength-and-power-athletes
- Understanding Your TRAC Score - Reactive Training Systems, https://store.reactivetrainingsystems.com/blogs/application-articles/understanding-your-trac-score
- Changes in Heart Rate Variability and Fatigue Measures Following Moderate Load Resistance Exercise - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC9273014/
- Le Deload Pour La R\xE9cup\xE9ration Active - Blog Eric Favre | Sport Nutrition Expert, https://www.ericfavre.com/lifestyle/le-deload/
- Integrating Deloading into Strength and Physique Sports Training ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC10511399/
- Emerging Strategies with Mike Tuchscherer - RTS : r/weightroom, https://www.reddit.com/r/weightroom/comments/n67ymb/emerging_strategies_with_mike_tuchscherer_rts/
- All About Intensity - Reactive Training Systems, https://store.reactivetrainingsystems.com/blogs/advanced-concepts/all-about-intensity
- Simply The Best: Tuchscherer's Reactive Training Systems - PowerliftingToWin, https://www.powerliftingtowin.com/a-review-of-mike-tuchscherers-reactive-training-systems-rts/
- Auto-Regulation in Strength Training by Mike Tuchscherer-JTSstrength.com - YouTube, https://www.youtube.com/watch?v=MS1YyV3Kdw8
- Sommeil et musculation : pourquoi tes gains se font la nuit - Ironside Fitness Canada, https://www.ironsidefitness.ca/fr/blogs/nutrition-recuperation/sommeil-et-musculation-gains-nuit
- Fatigue nerveuse et la musculation intensive : comment la r\xE9duire - AqeeLab Nutrition, https://www.aqeelab-nutrition.fr/blogs/nos-conseils/fatigue-nerveuse-et-la-musculation-intensive-comment-la-reduire
- Timing nutritionnel et r\xE9cup\xE9ration : maximiser ses gains - QNT, https://www.qntsport.com/blogs/news/timing-nutritionnel-et-recuperation
- 7 Strategies To Fight CNS Fatigue (Laying on the Couch Is One of Them) - 4legsfitness.com, https://4legsfitness.com/blogs/articles/cns-fatigue
- Active Recovery for Athletes | Zone 2 Training and Rest Day Optimization, https://www.truesportsphysicaltherapy.com/blogs/guide-to-active-recovery-for-athletes-during-physical-therapy
- Active Recovery for Athletes: Unlock 2025 Potential - Fitness CF, https://fitnesscfgyms.com/active-recovery-for-athletes/
- How to Implement Active Recovery in Strength Training - Speediance Europe, https://speediance.eu/en-mt/blogs/news/how-to-implement-active-recovery-in-strength-training
- Active Recovery Strategies for Strength Athletes - TrainHeroic, https://www.trainheroic.com/blog/active-recovery-strategies-for-strength-athletes/


--- HYDROTHERAPY-KNOWLEDGE-BASE.md ---

---
title: "Hydroth\xE9rapie Thermique dans la Performance Sportive"
domain: "recovery"
tags: ["hydrotherapy","recovery","cwi","hwi","cwt"]
source_type: "markdown"
---

# Base de Connaissances R\xE9cup\xE9ration - Hydroth\xE9rapie Thermique

## Analyse Physiologique et Clinique de l'Hydroth\xE9rapie Thermique dans la Performance Sportive : \xC9tude de l'Impact des Protocoles de Temp\xE9rature sur la R\xE9cup\xE9ration, l'Adaptation et la Sant\xE9 de l'Athl\xE8te

L'application syst\xE9mique de l'eau \xE0 diff\xE9rentes temp\xE9ratures, commun\xE9ment d\xE9sign\xE9e sous le terme d'hydroth\xE9rapie, constitue l'un des piliers fondamentaux de la m\xE9decine du sport contemporaine et de la pr\xE9paration physique de haut niveau. Dans un environnement comp\xE9titif o\xF9 les gains marginaux dictent souvent l'issue des performances, la compr\xE9hension des m\xE9canismes par lesquels l'immersion en eau froide (CWI), l'immersion en eau chaude (HWI) et la th\xE9rapie par l'eau contrast\xE9e (CWT) influencent l'hom\xE9ostasie corporelle est devenue primordiale.[1, 2, 3] Cette analyse approfondie explore les fondements physiologiques de ces pratiques, examine les r\xE9sultats d'exp\xE9riences cliniques men\xE9es sur des athl\xE8tes et des individus sains, et p\xE8se les b\xE9n\xE9fices imm\xE9diats face aux cons\xE9quences potentielles sur l'adaptation musculaire \xE0 long terme.

## Fondements de la Thermor\xE9gulation et R\xE9ponse Cardiovasculaire Syst\xE9mique

L'organisme humain, en tant que syst\xE8me hom\xE9otherme, d\xE9ploie des strat\xE9gies complexes pour maintenir sa temp\xE9rature centrale \xE0 environ 37\xB0C. Lorsque le corps est expos\xE9 \xE0 des stimuli thermiques extr\xEAmes via l'hydroth\xE9rapie, il active des cascades de r\xE9ponses autonomes destin\xE9es \xE0 prot\xE9ger les organes vitaux et \xE0 stabiliser les fonctions m\xE9taboliques.[1, 4, 5]

### Dynamique de la Vasomotricit\xE9 et Redistribution Sanguine

L'immersion en eau froide d\xE9clenche une vasoconstriction p\xE9riph\xE9rique imm\xE9diate. Ce ph\xE9nom\xE8ne r\xE9sulte de l'activation des thermor\xE9cepteurs cutan\xE9s qui stimulent les fibres nerveuses sympathiques, entra\xEEnant une contraction des muscles lisses des parois art\xE9riolaires.[1, 5, 6] Cette r\xE9action redirige le flux sanguin de la p\xE9riph\xE9rie vers la cavit\xE9 centrale, un processus souvent qualifi\xE9 de "centralisation de la masse sanguine", augmentant ainsi le volume d'\xE9jection systolique et le d\xE9bit cardiaque sans n\xE9cessairement accro\xEEtre la d\xE9pense \xE9nerg\xE9tique.[1, 7, 8] \xC0 l'inverse, l'exposition \xE0 la chaleur via l'eau chaude provoque une vasodilatation p\xE9riph\xE9rique marqu\xE9e, favorisant une augmentation du d\xE9bit sanguin vers les tissus cutan\xE9s et musculaires.[4, 9, 10]

### Le R\xF4le de la Pression Hydrostatique

Ind\xE9pendamment de la temp\xE9rature, l'immersion elle-m\xEAme exerce une pression hydrostatique sur le corps. Cette pression cro\xEEt avec la profondeur d'immersion et g\xE9n\xE8re une compression des tissus mous, facilitant le retour veineux et lymphatique.[7, 11, 12] Ce m\xE9canisme est crucial pour la r\xE9duction des \u0153d\xE8mes post-exercice et la facilitation de la clairance des m\xE9tabolites accumul\xE9s dans les espaces interstitiels.[1, 7, 13] La synergie entre la pression hydrostatique et les variations thermiques d\xE9finit l'efficacit\xE9 globale de l'hydroth\xE9rapie en tant qu'outil de r\xE9cup\xE9ration.

| Param\xE8tre Physiologique | Immersion en Eau Froide (CWI) | Immersion en Eau Chaude (HWI) |
| :--- | :--- | :--- |
| **R\xE9ponse Vasculaire** | Vasoconstriction p\xE9riph\xE9rique [1, 6] | Vasodilatation p\xE9riph\xE9rique [4, 9] |
| **D\xE9bit Sanguin Musculaire** | Diminution (jusqu'\xE0 55\u221275%) [1] | Augmentation du flux nutritif [4, 14] |
| **Pression Art\xE9rielle** | Augmentation aigu\xEB (choc froid) [1, 15] | Diminution potentielle (long terme) [8] |
| **Rythme Cardiaque** | Bradycardie ou Tachycardie r\xE9flexe [1, 16] | Tachycardie mod\xE9r\xE9e [8] |
| **Pression Hydrostatique** | \xC9lev\xE9e (immersion totale) [7, 12] | \xC9lev\xE9e (immersion totale) [17] |

## L'Immersion en Eau Froide (CWI) : Analyse des B\xE9n\xE9fices et des Risques

L'immersion en eau froide, souvent sous forme de bains de glace, est la modalit\xE9 la plus \xE9tudi\xE9e et la plus pratiqu\xE9e dans le sport d'\xE9lite. Elle est largement utilis\xE9e pour att\xE9nuer les dommages musculaires induits par l'exercice (EIMD) et les courbatures (DOMS).[3, 18, 19]

### Att\xE9nuation de l'Inflammation et des DOMS
L'EIMD se manifeste par des micro-l\xE9sions des fibres musculaires et une inflammation secondaire qui culmine g\xE9n\xE9ralement 24 \xE0 48 heures apr\xE8s l'effort.[5, 20, 21] Le froid agit comme un agent anti-inflammatoire en limitant la lib\xE9ration de m\xE9diateurs pro-inflammatoires et en r\xE9duisant la perm\xE9abilit\xE9 capillaire, ce qui diminue le gonflement et la pression exerc\xE9e sur les nocicepteurs.[19, 22, 23] De plus, la CWI diminue la vitesse de conduction nerveuse, procurant un effet analg\xE9sique imm\xE9diat qui am\xE9liore la perception de la r\xE9cup\xE9ration chez l'athl\xE8te.[6, 23, 24]

Une m\xE9ta-analyse exhaustive de 55 essais contr\xF4l\xE9s randomis\xE9s a mis en \xE9vidence que des protocoles sp\xE9cifiques optimisent ces effets.[18, 25] Les immersions de dur\xE9e moyenne (10-15 minutes) \xE0 des temp\xE9ratures mod\xE9r\xE9es (11\u221215\xB0C) se sont r\xE9v\xE9l\xE9es les plus efficaces pour r\xE9duire les DOMS, tandis que des temp\xE9ratures plus basses (5\u221210\xB0C) favorisent davantage la r\xE9duction des marqueurs biochimiques comme la cr\xE9atine kinase (CK).[18, 25]

### Le Paradoxe de l'Adaptation Musculaire
Malgr\xE9 ses avantages pour la r\xE9cup\xE9ration imm\xE9diate, la CWI fait l'objet de vives critiques concernant son impact sur les adaptations \xE0 long terme, particuli\xE8rement l'hypertrophie musculaire. Des exp\xE9riences fondamentales, notamment celles men\xE9es par Roberts et al. (2015, 2016), ont d\xE9montr\xE9 que l'application r\xE9guli\xE8re de froid apr\xE8s un entra\xEEnement de r\xE9sistance r\xE9duit les gains de masse et de force musculaires.[3, 26, 27]

Le m\xE9canisme sous-jacent semble li\xE9 \xE0 l'\xE9moussement de la r\xE9ponse inflammatoire n\xE9cessaire au signalement anabolique. Le froid r\xE9duit l'activit\xE9 des cellules satellites et interf\xE8re avec la voie mTOR (mammalian target of rapamycin), essentielle \xE0 la synth\xE8se prot\xE9ique.[1, 16, 27] Une \xE9tude a rapport\xE9 une diminution de l'hypertrophie d'environ 20% chez les sujets utilisant syst\xE9matiquement les bains froids apr\xE8s leurs s\xE9ances de musculation.[27] En revanche, pour les sports d'endurance, l'impact n\xE9gatif semble moins prononc\xE9, voire inexistant, sugg\xE9rant que la CWI peut \xEAtre maintenue dans ces disciplines sans compromettre les adaptations a\xE9robies.[14, 28, 29]

### Risques Cardiovasculaires et Choc Thermique
L'immersion brutale en eau froide n'est pas sans danger. Elle provoque ce que les physiologistes appellent le "choc du froid", caract\xE9ris\xE9 par une hyperventilation et une augmentation rapide de la fr\xE9quence cardiaque et de la pression art\xE9rielle.[1, 16] Chez les individus pr\xE9sentant des pathologies coronariennes sous-jacentes, ce stress peut d\xE9clencher une isch\xE9mie myocardique.[1] Plus complexe encore est le "conflit autonome" qui survient lorsque le r\xE9flexe de plong\xE9e (induisant une bradycardie par immersion du visage) s'oppose au choc du froid (induisant une tachycardie par contact cutan\xE9). Ce conflit peut provoquer des arythmies potentiellement fatales, particuli\xE8rement chez les sujets ayant un intervalle QT long.[1]

## L'Immersion en Eau Chaude (HWI) : Un Outil sous-estim\xE9 de Performance

L'eau chaude (38\u221242\xB0C), bien que moins pl\xE9biscit\xE9e que le froid pour la r\xE9cup\xE9ration "guerri\xE8re", offre des avantages physiologiques distincts, notamment en termes de souplesse tissulaire et de maintien de la puissance.[4, 14, 23]

### Thermoth\xE9rapie et Prot\xE9ines de Choc Thermique (HSP)
L'exposition \xE0 la chaleur augmente la temp\xE9rature intramusculaire, ce qui favorise l'extensibilit\xE9 du tissu conjonctif et r\xE9duit la raideur articulaire.[4, 9, 23] Sur le plan mol\xE9culaire, la HWI stimule l'expression des prot\xE9ines de choc thermique (HSPs). Ces prot\xE9ines agissent comme des chaperonnes, prot\xE9geant les structures cellulaires contre les dommages prot\xE9iques et facilitant la r\xE9paration des myofibrilles endommag\xE9es.[30] Des \xE9tudes sugg\xE8rent que la chaleur pourrait ainsi ralentir la d\xE9gradation musculaire pendant les p\xE9riodes d'inactivit\xE9 ou de repos forc\xE9.[4]

### Maintien de la Performance de Puissance
Une \xE9tude r\xE9cente de l'American Physiological Society (2024) a compar\xE9 les effets de la CWI et de la HWI sur la r\xE9cup\xE9ration de la performance physique.[14] Les r\xE9sultats ont montr\xE9 que les athl\xE8tes ayant utilis\xE9 l'immersion chaude conservaient une meilleure hauteur de saut (puissance explosive) le lendemain de l'effort par rapport \xE0 ceux ayant utilis\xE9 l'eau froide.[14] Cela s'expliquerait par le fait que la chaleur maintient une activit\xE9 enzymatique optimale et favorise une resynth\xE8se plus rapide du glycog\xE8ne musculaire, contrairement au froid qui peut ralentir ces processus m\xE9taboliques.[17, 28]

### Hydroth\xE9rapie Chaude et Sommeil
Le sommeil est le facteur le plus critique de la r\xE9cup\xE9ration globale. La HWI prise le soir favorise une meilleure qualit\xE9 de sommeil via un m\xE9canisme de thermor\xE9gulation circadienne.[10, 31, 32] En augmentant la temp\xE9rature cutan\xE9e, le bain chaud facilite la dissipation de la chaleur interne une fois que l'individu quitte l'eau, provoquant une chute rapide de la temp\xE9rature centrale (Tcore). Cette chute thermique est un signal biologique majeur pour l'initiation du sommeil et l'entr\xE9e dans les phases de sommeil profond.[6, 11, 32]

## Th\xE9rapie par l'Eau Contrast\xE9e (CWT) : La M\xE9canique du Pompage Vasculaire

La th\xE9rapie contrast\xE9e consiste \xE0 alterner des cycles d'eau chaude et d'eau froide. Ce protocole vise \xE0 cr\xE9er un effet de "pompage vasculaire" profond par des cycles r\xE9p\xE9t\xE9s de vasoconstriction et de vasodilatation.[33, 34, 35]

### Efficacit\xE9 Clinique et Comparaisons
Les recherches indiquent que la CWT est sup\xE9rieure \xE0 la r\xE9cup\xE9ration passive pour restaurer la force musculaire et r\xE9duire la perception de la fatigue.[2, 24] Une m\xE9ta-analyse a montr\xE9 que la CWT r\xE9duisait les courbatures \xE0 tous les points de suivi (6, 24, 48, 72 et 96 heures) par rapport au repos simple.[24] Cependant, lorsqu'elle est compar\xE9e \xE0 d'autres m\xE9thodes actives comme la CWI seule ou la r\xE9cup\xE9ration active, la sup\xE9riorit\xE9 de la CWT est moins flagrante, sugg\xE9rant que son efficacit\xE9 r\xE9side autant dans l'aspect sensoriel que physiologique.[24, 36]

| Marqueur de R\xE9cup\xE9ration | CWT vs Passive | CWT vs CWI | CWT vs HWI |
| :--- | :--- | :--- | :--- |
| **Courbatures (DOMS)** | Sup\xE9rieure [24] | Similaire [24] | Sup\xE9rieure [24] |
| **Force Musculaire** | R\xE9cup\xE9ration plus rapide [24] | Similaire [36] | N/A |
| **Cr\xE9atine Kinase (CK)** | Pas de diff\xE9rence significative [24] | Pas de diff\xE9rence [24] | Pas de diff\xE9rence [24] |
| **Perception de la Fatigue** | Am\xE9lioration marqu\xE9e [2, 33] | Similaire [2] | N/A |

### Param\xE8tres de Mise en \u0152uvre
Le protocole standard de CWT implique g\xE9n\xE9ralement un ratio de temps de 3:1 ou 2:1 entre le chaud et le froid (par exemple, 3 minutes \xE0 38\u221240\xB0C suivies d'une minute \xE0 10\u221215\xB0C), r\xE9p\xE9t\xE9 3 \xE0 5 fois.[33, 34, 35] Il est recommand\xE9 de terminer par le cycle froid pour maintenir une l\xE9g\xE8re vasoconstriction tonique ou par le cycle chaud si l'objectif est la relaxation pr\xE9-sommeil.[9, 33]

## Impact Psychologique et Neurologique de l'Hydroth\xE9rapie

L'hydroth\xE9rapie n'affecte pas seulement le muscle p\xE9riph\xE9rique ; elle exerce une influence majeure sur le syst\xE8me nerveux central et l'\xE9tat neurochimique de l'athl\xE8te.[3, 31, 37]

### Neurotransmetteurs et R\xE9silience Mentale
L'immersion froide est un puissant stimulus de stress qui d\xE9clenche une lib\xE9ration massive de noradr\xE9naline et de dopamine dans le cerveau et le sang.[19, 22, 31] Cette pouss\xE9e neurochimique am\xE9liore l'humeur, augmente la vigilance et peut m\xEAme avoir des effets antid\xE9presseurs \xE0 long terme, comme sugg\xE9r\xE9 par des \xE9tudes de l'universit\xE9 Virginia Commonwealth.[31, 38] Pour l'athl\xE8te, l'exposition r\xE9guli\xE8re au froid d\xE9veloppe une forme de r\xE9silience psychologique, ou "force mentale", en apprenant \xE0 contr\xF4ler la r\xE9ponse au stress et la respiration face \xE0 un inconfort extr\xEAme.[12, 13, 37]

### Syst\xE8me Nerveux Autonome et HRV
L'hydroth\xE9rapie influence la variabilit\xE9 de la fr\xE9quence cardiaque (HRV), un indicateur cl\xE9 de la balance entre les syst\xE8mes sympathique ("combat ou fuite") et parasympathique ("repos et digestion"). Tandis que le froid stimule initialement le syst\xE8me sympathique, la phase de r\xE9cup\xE9ration post-immersion est marqu\xE9e par une r\xE9activation parasympathique robuste, facilitant un \xE9tat de calme et de r\xE9cup\xE9ration syst\xE9mique.[1, 15, 33] La HWI, quant \xE0 elle, favorise une dominance parasympathique imm\xE9diate, r\xE9duisant le stress per\xE7u apr\xE8s une comp\xE9tition intense.[4, 9]

### Immunologie et Sant\xE9 Globale de l'Athl\xE8te
L'une des exp\xE9riences les plus significatives concernant l'hydroth\xE9rapie et la sant\xE9 est l'\xE9tude n\xE9erlandaise de 2016 portant sur plus de 3000 participants.[12, 31, 39] Cette \xE9tude a montr\xE9 que les individus qui terminaient leur douche quotidienne par un jet d'eau froide (30, 60 ou 90 secondes) pr\xE9sentaient une r\xE9duction de 29% de l'absent\xE9isme pour maladie par rapport au groupe t\xE9moin.[12, 31]

#### M\xE9canismes de Soutien Immunitaire
Bien que les niveaux de leucocytes ne soient pas imm\xE9diatement modifi\xE9s de mani\xE8re drastique par une seule douche froide, l'exposition r\xE9p\xE9t\xE9e semble renforcer le syst\xE8me immunitaire par un processus d'horm\xE8se : un stress mod\xE9r\xE9 qui induit des adaptations protectrices.[3, 12, 22] Le froid stimule la production de globules blancs et am\xE9liore la capacit\xE9 antioxydante de l'organisme, ce qui est particuli\xE8rement b\xE9n\xE9fique pour les athl\xE8tes de haut niveau dont le syst\xE8me immunitaire est souvent temporairement affaibli par des charges d'entra\xEEnement excessives.[22, 38, 40]

## Analyse d'Exp\xE9riences Sp\xE9cifiques sur l'Homme

Pour comprendre la port\xE9e de ces th\xE9rapies, il est crucial d'examiner les donn\xE9es issues de protocoles exp\xE9rimentaux rigoureux.

### \xC9tude sur les Footballeurs Nationaux (Su\xE8de/Lituanie)
Une \xE9tude de 15 semaines men\xE9e sur 40 joueurs de football de niveau national a compar\xE9 la CWI (10\xB0C pendant 10 min), la HWI (42\xB0C pendant 20 min) et un placebo (laser inerte).[28, 41] Les r\xE9sultats ont montr\xE9 qu'aucune des modalit\xE9s n'\xE9tait significativement plus efficace que le placebo pour la r\xE9cup\xE9ration de la performance physique \xE0 court terme ou pour les adaptations \xE0 long terme.[28, 41] Cela souligne l'importance de l'effet placebo et des croyances de l'athl\xE8te dans l'efficacit\xE9 des m\xE9thodes de r\xE9cup\xE9ration. Si un athl\xE8te croit fermement qu'un bain de glace l'aide, cette conviction peut influencer sa performance per\xE7ue et sa motivation.[1, 28]

### \xC9tude sur la R\xE9cup\xE9ration des Femmes Athl\xE8tes
Une recherche men\xE9e sur 30 femmes en bonne sant\xE9 a examin\xE9 l'impact de la CWI et de la HWI apr\xE8s un protocole de dommages musculaires.[7] Contrairement aux r\xE9sultats souvent observ\xE9s chez les hommes, cette \xE9tude n'a trouv\xE9 aucune acc\xE9l\xE9ration de la r\xE9cup\xE9ration fonctionnelle ou subjective chez les femmes apr\xE8s l'immersion thermique.[7] Cette divergence sugg\xE8re que la composition corporelle (notamment la masse grasse, plus \xE9lev\xE9e chez les femmes, qui agit comme un isolant thermique) et les cycles hormonaux pourraient moduler la r\xE9ponse \xE0 l'hydroth\xE9rapie, n\xE9cessitant des protocoles diff\xE9renci\xE9s selon le sexe.[7]

### \xC9tude sur l'Architecture du Sommeil et l'Immersion Totale
Une exp\xE9rience a compar\xE9 l'immersion partielle (corps) et totale (incluant la t\xEAte) en eau froide sur le sommeil.[11] Les r\xE9sultats ont montr\xE9 que l'immersion totale avec immersion de la t\xEAte entra\xEEnait une baisse plus rapide de la temp\xE9rature centrale et une augmentation significative de la proportion de sommeil \xE0 ondes lentes (SWS) au cours de la premi\xE8re moiti\xE9 de la nuit.[11] L'immersion de la t\xEAte semble cruciale car le cuir chevelu est une zone de forte dissipation thermique, influen\xE7ant directement les centres de r\xE9gulation du sommeil dans l'hypothalamus.[11]

## Protocoles Pratiques et Recommandations pour le Sportif

Le passage de la th\xE9orie \xE0 la pratique n\xE9cessite une approche structur\xE9e, tenant compte de la nature de l'effort et de la p\xE9riode de l'entra\xEEnement.

### Douche Froide vs Bain Glac\xE9
Il est essentiel de ne pas confondre la douche froide et l'immersion. La douche froide est souvent asym\xE9trique (l'eau ne touche pas tout le corps simultan\xE9ment) et ne b\xE9n\xE9ficie pas de la pression hydrostatique.[12, 13, 16] Elle est cependant excellente pour la vigilance matinale et le renforcement immunitaire quotidien.[6, 21, 22] Pour une r\xE9cup\xE9ration musculaire profonde, l'immersion totale (plunge) est largement sup\xE9rieure car elle assure une conduction thermique plus uniforme et une compression tissulaire efficace.[12, 13, 19]

### Timing et Dur\xE9e
- **R\xE9cup\xE9ration Imm\xE9diate** : Il est recommand\xE9 d'attendre environ 20 minutes apr\xE8s l'effort pour laisser la temp\xE9rature corporelle et le rythme cardiaque amorcer leur retour \xE0 la normale avant de s'immerger dans l'eau froide.[5, 16] Une immersion trop pr\xE9coce peut provoquer un choc thermique excessif.
- **Dur\xE9e Optimale** : Pour la CWI, le "sweet spot" se situe entre 10 et 15 minutes.[18, 25] Au-del\xE0 de 20 minutes, les risques d'hypothermie augmentent sans b\xE9n\xE9fices suppl\xE9mentaires.[42, 43] Pour la douche froide, 2 \xE0 5 minutes trois fois par semaine suffisent pour obtenir des b\xE9n\xE9fices m\xE9taboliques et immunitaires.[31]

### Strat\xE9gie par Type de Sport

| Type d'Activit\xE9 | Modalit\xE9 Recommand\xE9e | Justification |
| :--- | :--- | :--- |
| **Musculation / Hypertrophie** | R\xE9cup\xE9ration active ou HWI [27, 42] | \xC9viter le froid qui blunte les signaux anaboliques.[3, 27] |
| **Sports de Combat / Rugby** | Immersion Froide (CWI) [23, 27] | G\xE9rer l'inflammation aigu\xEB et les traumatismes.[19, 23] |
| **Yoga / Pilates / Souplesse** | Immersion Chaude (HWI) [9, 23] | Favoriser la relaxation tissulaire et la mobilit\xE9.[6, 23] |
| **Tournois (Matchs quotidiens)** | CWI ou CWT [24, 27] | Prioriser la performance imm\xE9diate sur l'adaptation.[2, 27] |

### Synth\xE8se des Risques et Contre-indications
L'hydroth\xE9rapie thermique est une intervention physiologique puissante qui comporte des risques r\xE9els.
- **Contre-indications Cardiovasculaires** : L'hypertension art\xE9rielle, les maladies coronariennes et les arythmies constituent des risques majeurs lors de l'exposition au froid intense.[1, 19, 22]
- **Conditions Respiratoires** : L'insuffisance pulmonaire peut \xEAtre exacerb\xE9e par la compression hydrostatique et le choc du froid.[22]
- **\xC9tats infectieux** : En cas de fi\xE8vre, l'hydroth\xE9rapie est d\xE9conseill\xE9e car elle perturbe les m\xE9canismes naturels de r\xE9gulation thermique du corps.[22]
- **Grossesse** : Un avis m\xE9dical est imp\xE9ratif, car les variations extr\xEAmes de temp\xE9rature centrale peuvent affecter le f\u0153tus.[1, 22]

### Pr\xE9cautions d'Usage
Pour les d\xE9butants, il est conseill\xE9 de commencer par des douches ti\xE8des et de r\xE9duire progressivement la temp\xE9rature sur plusieurs semaines.[16, 43, 44] L'observation de la peau est \xE9galement un indicateur : une rougeur marqu\xE9e signale une vasodilatation r\xE9active saine, mais des tremblements incontr\xF4lables ou une confusion mentale sont des signes d'alerte imm\xE9diats imposant la sortie de l'eau.[22, 38, 43]

## Conclusions sur l'Optimisation Thermique dans le Sport

L'hydroth\xE9rapie thermique ne doit pas \xEAtre per\xE7ue comme une solution monolithique, mais comme un outil modulable au service de la p\xE9riodisation de l'entra\xEEnement. L'immersion en eau froide reste la r\xE9f\xE9rence pour la gestion de la douleur et de l'inflammation en p\xE9riode de comp\xE9tition intense, bien que son utilisation syst\xE9matique en phase de d\xE9veloppement musculaire soit contre-productive en raison de son effet inhibiteur sur les voies anaboliques. L'immersion en eau chaude, souvent rel\xE9gu\xE9e au second plan, joue un r\xF4le essentiel dans le maintien de la puissance, l'am\xE9lioration du sommeil et la sant\xE9 tissulaire globale via l'activation des prot\xE9ines de choc thermique.

La science moderne souligne l'importance d'individualiser ces protocoles en fonction du sexe, du niveau d'entra\xEEnement et des croyances de l'athl\xE8te. Alors que l'effet placebo semble expliquer une partie des b\xE9n\xE9fices observ\xE9s, les r\xE9ponses cardiovasculaires, neurochimiques et immunologiques document\xE9es confirment que l'usage strat\xE9gique des temp\xE9ratures reste l'un des moyens les plus efficaces et les plus accessibles pour optimiser la r\xE9cup\xE9ration et la performance sportive. L'avenir de cette discipline r\xE9side probablement dans une meilleure compr\xE9hension des seuils thermiques individuels et dans l'int\xE9gration de technologies permettant un contr\xF4le pr\xE9cis de la temp\xE9rature et de la dur\xE9e d'exposition pour maximiser l'horm\xE8se sans risquer le surentra\xEEnement ou l'accident cardiovasculaire.

*(Sources : Bibliographie compl\xE8te extraite de NotebookLM pour alimenter l'agent IA).*

## Sources
- Bains glac\xE9s, b\xE9n\xE9fices sant\xE9 ? | Observatoire de la pr\xE9vention de l ..., https://observatoireprevention.org/2025/08/28/bains-glaces-benefices-sante/
- EFFECTS OF COLD WATER IMMERSION AND CONTRAST WATER THERAPY FOR RECOVERY FROM TEAM SPORT: A SYSTEMATIC REVIEW AND META-ANALYSIS - ResearchGate, https://www.researchgate.net/profile/Trevor-Higgins-2/publication/305110535_The_Effects_of_Cold_Water_Immersion_and_Contrast_Water_Therapy_for_Recovery_from_Team_Sport_A_Systematic_Review_and_Meta-Analysis/links/5a8f656c45851535bcd384f0/The-Effects-of-Cold-Water-Immersion-and-Contrast-Water-Therapy-for-Recovery-from-Team-Sport-A-Systematic-Review-and-Meta-Analysis.pdf
- Effects of cold-water immersion on health and wellbeing: A systematic review and meta-analysis - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC11778651/
- Bain chauds, froid ou contrast\xE9 : lequel choisir pour mieux r\xE9cup\xE9rer? - Bioptimisation, https://bioptimisation.fr/blogs/recovery/hydrotherapie
- Quels sont les bienfaits de la douche froide apr\xE8s le sport ? - Eko\xEF - EKOI, https://www.ekoi.fr/fr/blog/quels-sont-les-bienfaits-de-la-douche-froide-apres-le-sport
- Should You Take Hot Or Cold Showers? - NIB, https://www.nib.com.au/the-checkup/everyday-health/general-health-guides-and-faqs/hot-or-cold-showers
- No acceleration of recovery from exercise-induced muscle damage after cold or hot water immersion in women: A randomised controlled trial - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12057877/
- Effect of home\u2010based hot bathing on exercise\u2010induced adaptations associated with short\u2010term resistance exercise training in young men - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC11780495/
- Which Is Better After a Workout: Hot or Cold Shower? | BodySpec, https://www.bodyspec.com/blog/post/which_is_better_after_a_workout_hot_or_cold_shower
- Benefits of Warm Showers for Athletes - Rheem Philippines, https://www.rheemphilippines.com/blog/benefits-of-warm-showers-for-athletes/
- Effect of the Depth of Cold Water Immersion on Sleep Architecture and Recovery Among Well-Trained Male Endurance Runners - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC8044518/
- Cold Plunge vs. Cold Showers: Which is Better for Recovery in Malaysia?, https://www.warriorplunge.com/blogs/beyond-the-chill/cold-plunge-vs-cold-showers-which-is-better-for-recovery-in-malaysia
- Cold Shower vs Cold Plunge: Key Differences for Recovery and Energy, https://plungecrafters.com/blogs/diy-cold-plunge-chronicles/cold-shower-vs-cold-plunge
- Hot Water Immersion Better than Cold to Maintain Exercise Performance | American Physiological Society, https://www.physiology.org/detail/news/2024/11/21/hot-water-immersion-better-than-cold-to-maintain-exercise-performance
- Does cold therapy improve sleep and mood? - Study Summary - Examine.com, https://examine.com/research-feed/study/0Axn51/
- Prendre une douche froide apr\xE8s un entra\xEEnement pr\xE9sente-t-il des ..., https://www.nike.com/ca/fr/a/bienfaits-douche-froide
- Effect of hot water immersion on acute physiological responses ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC10354234/
- Impact of different doses of cold water immersion (duration and temperature variations) on recovery from acute exercise-induced muscle damage: a network meta-analysis - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC11897523/
- Cold Showers vs. Ice Baths: Which Is Better for Exercise Recovery? - Peloton, https://www.onepeloton.com/blog/cold-shower-vs-ice-bath
- The Impact of Hot v. Cold Water Immersion on Post-Exercise Recovery - IdeaExchange@UAkron, https://ideaexchange.uakron.edu/cgi/viewcontent.cgi?article=3606&context=honors_research_projects
- Should You Take a Hot or Cold Shower After a Workout to Boost Recovery? - GoodRx, https://www.goodrx.com/well-being/movement-exercise/hot-or-cold-shower-after-workout
- L'utilisation quotidienne des douches froides : bienfaits et dangers - M comme Mutuelle, https://www.mcommemutuelle.com/magazine/douches-froides-prendre-la-temperature-de-leurs-effets-sur-votre-corps-et-votre-bien-etre/
- Apr\xE8s l'effort sportif : un bain froid ou chaud ? \u2013 ICE BOOST\xAE, https://ice-boost.com/blogs/ice-blog/apres-l-effort-sportif-un-bain-froid-ou-chaud
- Contrast Water Therapy and Exercise Induced Muscle Damage: A ..., https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0062356
- Impact of different doses of cold water immersion (duration and temperature variations) on recovery from acute exercise-induced muscle damage: a network meta-analysis - Frontiers, https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1525726/full
- The effects of cold water immersion and active recovery on ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC5285720/
- COLD BATH: What SCIENCE REALLY Says (ft Nicolas Ott) - YouTube, https://www.youtube.com/watch?v=9IFAS3LmqWw
- Cold- and hot-water immersion are not more effective than placebo ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC12528220/
- Precooling and Sport Performance - Human Kinetics, https://us.humankinetics.com/blogs/excerpt/precooling-and-sport-performance
- Full article: Pre-exercise hot water immersion increased circulatory heat shock proteins but did not alter muscle damage markers or endurance capacity after eccentric exercise - Taylor & Francis, https://www.tandfonline.com/doi/full/10.1080/23328940.2024.2313954
- Y a-t-il des avantages \xE0 prendre une douche froide apr\xE8s une s\xE9ance d'entra\xEEnement, https://www.polar.com/blog/fr/avantages-douche-froide/
- Bain chaud ou bain froid apr\xE8s l'effort : lequel favorise le plus la r\xE9cup\xE9ration? - HiPRO, https://hipro.danone.fr/bain-chaud-ou-froid/
- The Hot & Cold Truth: How Contrast Therapy Boosts Your Recovery - Awaken For Wellness, https://awakenforwellness.com/the-hot-cold-truth/
- What Is Contrast Therapy, and Should You Try It After Your Next Workout? - Peloton, https://www.onepeloton.com/blog/contrast-therapy
- Hot or Cold Shower After a Workout? Best Recovery Method - Fitness Premier Clubs, https://fitnesspremierclubs.com/hot-or-cold-shower-after-a-workout-which-is-more-effective/
- The Use of Contrast Therapy in Soft Tissue Injury Management and Post-Exercise Recovery: A Scoping Review, https://knowledge.lancashire.ac.uk/id/eprint/35883/1/35883%20Richards%20J%202020%20The%20Use%20of%20Contrast%20Therapy%20in%20Soft%20Tissue%20Injury%20Management%20and%20Post-Exercise%20Recovery.pdf
- The Impact of Cold-Water Immersion on Mental Health: A Qualitative Study - Scholars Crossing, https://digitalcommons.liberty.edu/cgi/viewcontent.cgi?article=8439&context=doctoral
- Les bienfaits de la douche froide - Sant\xE9 sur le Net, https://www.sante-sur-le-net.com/bienfaits-douche-froide/
- Effects of cold-water immersion on health and wellbeing: A systematic review and meta-analysis | PLOS One - Research journals, https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0317615
- Water immersion methods do not alter muscle damage and inflammation biomarkers after high-intensity sprinting and jumping exercise - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC7674333/
- Cold- and hot-water immersion are not more effective than placebo for the recovery of physical performance and training adaptations in national level soccer players - PubMed, https://pubmed.ncbi.nlm.nih.gov/40498100/
- Bain glac\xE9 et douche froide sont-ils la panac\xE9e apr\xE8s l'effort - Universit\xE9 de Montpellier, https://www.umontpellier.fr/articles/bain-glace-et-douche-froide-sont-ils-la-panacee-apres-leffort
- Cold Water Immersion Safety and Timing Tips Explained - IMPACT Physical Therapy, https://impactphysicaltherapy.com/blog/cold-water-immersion-faq-safety-timing-tips/
- D\xE9couvrez les Effets Physiologiques des Douches Froides sur la R\xE9cup\xE9ration Musculaire et la R\xE9duction de l'Inflammation - Buzzfit, https://buzzfit.ca/fr/decouvrez-les-effets-physiologiques-des-douches-froides-sur-la-recuperation-musculaire-et-la-reduction-de-linflammation/


--- INJURY-REHAB-KNOWLEDGE-BASE.md ---

---
title: "\xC9pid\xE9miologie et Protocoles de R\xE9habilitation en Force Athl\xE9tique"
domain: "medical"
tags: ["injury","rehabilitation","hsr","peace-and-love","bfr"]
source_type: "markdown"
---

# Base de Connaissances - \xC9pid\xE9miologie et R\xE9habilitation des Blessures (SBD)

## Rapport d'analyse clinique : \xC9pid\xE9miologie, biom\xE9canique des l\xE9sions et protocoles de r\xE9habilitation en force athl\xE9tique (SBD)

L'essor de la force athl\xE9tique, discipline structur\xE9e autour des trois mouvements fondamentaux que sont la flexion de jambes (squat), le d\xE9velopp\xE9 couch\xE9 (bench press) et le soulev\xE9 de terre (deadlift), a conduit \xE0 une sp\xE9cialisation croissante des contraintes biom\xE9caniques impos\xE9es \xE0 l'appareil musculosquelettique. Cette analyse approfondie examine les sch\xE9mas de blessures, les m\xE9canismes physiopathologiques sous-jacents et les cadres de r\xE9habilitation contemporains n\xE9cessaires pour assurer une long\xE9vit\xE9 athl\xE9tique dans ce sport de haute intensit\xE9.

## \xC9pid\xE9miologie et pr\xE9valence des blessures en force athl\xE9tique

La litt\xE9rature scientifique r\xE9cente souligne une distinction cruciale entre l'incidence des blessures et leur pr\xE9valence au sein de la population des powerlifters. Alors que l'incidence est souvent rapport\xE9e comme relativement faible, oscillant entre 1,0 et 4,4 blessures pour 1000 heures d'entra\xEEnement [1, 2, 3], la pr\xE9valence ponctuelle r\xE9v\xE8le une r\xE9alit\xE9 diff\xE9rente. Dans une \xE9tude transversale portant sur des athl\xE8tes su\xE9dois, il a \xE9t\xE9 \xE9tabli que 70% des participants \xE9taient bless\xE9s au moment de l'enqu\xEAte, et 87% avaient subi une blessure au cours des douze mois pr\xE9c\xE9dents.[1]

Ces statistiques sugg\xE8rent que si les \xE9v\xE9nements traumatiques aigus sont moins fr\xE9quents que dans les sports de contact, le powerlifter moyen s'entra\xEEne souvent avec un certain degr\xE9 de douleur ou d'alt\xE9ration fonctionnelle. La d\xE9finition m\xEAme de la "blessure" varie selon les \xE9tudes : certaines la consid\xE8rent comme un \xE9v\xE9nement entra\xEEnant l'arr\xEAt de la comp\xE9tition ou de l'entra\xEEnement, tandis que d'autres, plus repr\xE9sentatives de la pratique r\xE9elle, incluent toute douleur affectant la qualit\xE9 de l'entra\xEEnement.[1, 4]

### R\xE9partition anatomique et disparit\xE9s de genre
L'analyse des zones l\xE9s\xE9es montre une pr\xE9dominance des atteintes au niveau du rachis lombo-pelvien, de l'\xE9paule et de la hanche pour les deux sexes.[1, 4] Cependant, des nuances apparaissent dans la r\xE9partition segmentaire. Les femmes pr\xE9sentent une fr\xE9quence significativement plus \xE9lev\xE9e de douleurs au niveau de la r\xE9gion cervicale et thoracique par rapport aux hommes.[1, 5] En revanche, le powerlifting pr\xE9sente une proportion plus \xE9lev\xE9e de blessures au coude et \xE0 la partie sup\xE9rieure du bras par rapport \xE0 l'halt\xE9rophilie olympique, qui se concentre davantage sur les genoux et les mains.[2, 4]

| R\xE9gion Anatomique | Pr\xE9valence / Localisation | Facteurs de Risque Associ\xE9s |
| :--- | :--- | :--- |
| **Rachis lombaire** | Site le plus fr\xE9quent (tous sexes) | Volume au soulev\xE9 de terre, technique de "butt wink" au squat |
| **\xC9paule** | Tr\xE8s fr\xE9quente (Bench Press) | Instabilit\xE9 de la coiffe, largeur de prise excessive |
| **Hanche / Bassin** | Fr\xE9quente | Conflit f\xE9moro-ac\xE9tabulaire, profondeur du squat |
| **Coude** | Sp\xE9cifique au Powerlifting | Position de la barre au squat "Low Bar", volume de Bench |
| **Genou** | Mod\xE9r\xE9e | Tendinopathie patellaire, dynamique de valgus |

Un aspect \xE9mergent de la recherche concerne les dysfonctions du plancher pelvien (DPP), notamment l'incontinence urinaire d'effort, qui semble tr\xE8s pr\xE9valente chez les athl\xE8tes f\xE9minines (50%) contre 9,3% chez les hommes.[2, 4] Ce ph\xE9nom\xE8ne souligne l'impact des pressions intra-abdominales massives g\xE9n\xE9r\xE9es lors des charges maximales.

## Analyse biom\xE9canique des blessures li\xE9es au Squat

Le squat est souvent consid\xE9r\xE9 comme la pierre angulaire de l'entra\xEEnement de force, mais sa r\xE9p\xE9tition sous des charges extr\xEAmes sollicite intens\xE9ment les articulations f\xE9morotibiales et coxof\xE9morales.

### Tendinopathie patellaire : M\xE9canismes de surcharge et adaptation
La tendinopathie patellaire en force athl\xE9tique r\xE9sulte d'un d\xE9s\xE9quilibre entre la synth\xE8se et la d\xE9gradation du collag\xE8ne au sein du tendon. Suite \xE0 une s\xE9ance de squat intense, le tendon subit une phase catabolique initiale. La synth\xE8se du collag\xE8ne culmine environ 24 heures apr\xE8s l'exercice et peut rester \xE9lev\xE9e jusqu'\xE0 72 heures.[6] Un risque majeur survient lorsque la fr\xE9quence d'entra\xEEnement est trop \xE9lev\xE9e : si le repos est inf\xE9rieur \xE0 36 heures entre deux s\xE9ances sollicitant fortement le tendon, ce dernier reste dans un \xE9tat de d\xE9gradation nette, favorisant l'apparition de micro-l\xE9sions structurelles.[6]

Le concept de "buffer" muscle-tendon est ici essentiel. Des quadriceps affaiblis ou fatigu\xE9s transf\xE8rent une plus grande partie de la charge de freinage excentrique directement au tendon patellaire. \xC0 l'inverse, une musculature puissante agit comme un amortisseur, prot\xE9geant l'int\xE9grit\xE9 tendineuse.[6] Les facteurs de risque incluent \xE9galement des pointes rapides de la charge d'entra\xEEnement, d\xE9finies par le ratio entre la charge aigu\xEB (7 derniers jours) et la charge chronique (4 derni\xE8res semaines). Un ratio sup\xE9rieur \xE0 1,5 place l'athl\xE8te dans une "zone de danger" \xE9pid\xE9miologique.[6]

### Conflit f\xE9moro-ac\xE9tabulaire (FAI) et douleur de hanche
Le conflit f\xE9moro-ac\xE9tabulaire se manifeste par une douleur inguinale ou un pincement lors de la flexion profonde de la hanche. Il peut s'agir d'une morphologie de type "Cam" (proub\xE9rance sur le col f\xE9moral) ou "Pincer" (ac\xE9tabulum trop couvrant).[7] Au squat, cela se traduit par une compression pr\xE9matur\xE9e des structures articulaires.

Pour g\xE9rer ce conflit sans cesser l'activit\xE9, des modifications techniques sont imp\xE9ratives :
- **Ajustement de l'\xE9cartement (Stance)** : Un \xE9cartement plus large des pieds combin\xE9 \xE0 une rotation externe accentu\xE9e (>30\xB0) permet souvent de d\xE9gager le col f\xE9moral du rebord ac\xE9tabulaire.[7]
- **Gestion de la profondeur** : L'utilisation de box squats ou de pin squats permet de limiter l'amplitude de mouvement \xE0 une zone non douloureuse tout en maintenant une intensit\xE9 de charge \xE9lev\xE9e.[6, 8]
- **Utilisation de chaussures d'halt\xE9rophilie** : Le talon sur\xE9lev\xE9 permet une plus grande flexion de cheville, ce qui autorise un buste plus vertical et r\xE9duit la flexion de hanche relative n\xE9cessaire pour atteindre la profondeur.[8]

### Douleur au coude induite par le squat
Un ph\xE9nom\xE8ne paradoxal en powerlifting est l'apparition de douleurs au coude (souvent une \xE9picondylite m\xE9diale) caus\xE9es par le squat, particuli\xE8rement en position "Low Bar".[9, 10] Si la barre est plac\xE9e trop bas ou si la mobilit\xE9 thoracique est insuffisante, l'athl\xE8te finit par "porter" une partie de la charge avec ses bras plut\xF4t que de la laisser reposer sur le "meat shelf" (\xE9tag\xE8re musculaire) des delto\xEFdes post\xE9rieurs.[10, 11] Ce transfert de charge cr\xE9e une tension excentrique massive sur les fl\xE9chisseurs du poignet et les tendons du coude.

| Cause de la douleur au coude au squat | Solution technique |
| :--- | :--- |
| **Barre trop basse (sous l'\xE9pine de la scapula)** | Repositionner la barre sur le delto\xEFde post\xE9rieur |
| **Coudes trop relev\xE9s vers l'arri\xE8re** | Maintenir les avant-bras plus verticaux |
| **Prise trop serr\xE9e par rapport \xE0 la mobilit\xE9** | \xC9largir la prise ou utiliser une prise sans pouce |
| **Poignets excessivement cass\xE9s (extension)** | Utiliser des bandes de poignet ou redresser la prise |

## Le Bench Press et la pathologie du complexe de l'\xE9paule

Le d\xE9velopp\xE9 couch\xE9 est statistiquement le mouvement le plus associ\xE9 aux blessures du membre sup\xE9rieur, ciblant principalement le grand pectoral, la coiffe des rotateurs et le bourrelet gl\xE9no\xEFdien (labrum).[12]

### Ruptures du grand pectoral : Diagnostic et gestion
La rupture du grand pectoral est une blessure grave, survenant classiquement lors de la phase de transition excentrique-concentrique (au moment o\xF9 la barre touche la poitrine).[13] Le m\xE9canisme implique une abduction forc\xE9e sous charge maximale. Les patients rapportent souvent un "pop" audible suivi d'une douleur imm\xE9diate, d'une ecchymose axillaire et d'une perte de la sym\xE9trie du pli de l'aisselle.[12, 13]

La d\xE9cision chirurgicale d\xE9pend de la localisation de la d\xE9chirure :
- **Ruptures \xE0 la jonction musculotendineuse** : Souvent g\xE9r\xE9es de mani\xE8re conservatrice, bien qu'une faiblesse r\xE9siduelle puisse persister.[13]
- **Avulsions tendineuses sur l'hum\xE9rus** : Le traitement chirurgical est la norme pour les athl\xE8tes de force. Une r\xE9paration rapide (moins de 3 mois apr\xE8s l'injury) offre des r\xE9sultats fonctionnels nettement sup\xE9rieurs, avec une perte de force limit\xE9e \xE0 environ 13,7% contre plus de 53% pour un traitement non chirurgical.[13, 14]

### Pathologies de la coiffe des rotateurs et impingement
La douleur ant\xE9rieure de l'\xE9paule au bench press est souvent li\xE9e \xE0 un manque de stabilit\xE9 scapulaire. Si les omoplates ne sont pas maintenues en r\xE9traction et d\xE9pression, la t\xEAte hum\xE9rale glisse vers l'avant, cr\xE9ant un conflit avec les structures sous-acromiales ou le long chef du biceps.[12, 15]

La r\xE9habilitation doit int\xE9grer :
- **Renforcement des rotateurs externes** : Exercices \xE0 l'\xE9lastique ou aux halt\xE8res pour stabiliser la t\xEAte hum\xE9rale dans la gl\xE8ne.[15]
- **Modification de l'amplitude** : Le passage au "Floor Press" (d\xE9velopp\xE9 au sol) limite l'extension de l'\xE9paule et prot\xE8ge la capsule ant\xE9rieure durant la phase de gu\xE9rison.[16]
- **Ajustement de la largeur de prise** : Une prise ne d\xE9passant pas 1,5 fois la largeur bi-acromiale r\xE9duit le stress sur la coiffe des rotateurs et le tendon du pectoral.[13]

## Le Deadlift : Int\xE9grit\xE9 discale et risques tendineux

Le soulev\xE9 de terre est le mouvement g\xE9n\xE9rant les forces de compression les plus \xE9lev\xE9es sur le rachis. Pourtant, lorsqu'il est ex\xE9cut\xE9 avec une technique de charni\xE8re de hanche (hip hinge) correcte, il constitue un outil de renforcement puissant pour la cha\xEEne post\xE9rieure.[17, 18]

### Hernie discale et r\xE9\xE9ducation par le mouvement
L'id\xE9e qu'un athl\xE8te souffrant d'une hernie discale doive cesser de soulever lourd est aujourd'hui remise en question par les donn\xE9es cliniques. La colonne vert\xE9brale est une structure robuste capable de s'adapter si la progression est respect\xE9e.[19, 20] Le probl\xE8me r\xE9side souvent dans la flexion r\xE9p\xE9t\xE9e sous charge (arrondissement du bas du dos), qui augmente la pression sur l'annulus fibrosus et peut aggraver une protrusion.[18]

Le protocole de r\xE9habilitation privil\xE9gie une approche progressive :
- **Phase initiale** : Ma\xEEtrise du mouvement de charni\xE8re de hanche sans charge ou avec une charge symbolique (token load).[20]
- **Modification du levier** : Utilisation de la barre hexagonale (Trap Bar) qui permet un buste plus vertical, r\xE9duisant le moment de force sur les segments L4-L5 et L5-S1.[17, 19]
- **Progression d'amplitude** : Passer du "Rack Pull" (barre sur\xE9lev\xE9e) au deadlift complet au fur et \xE0 mesure que la mobilit\xE9 des ischio-jambiers et le contr\xF4le du tronc s'am\xE9liorent.[20]
- **D\xE9compression active** : Utilisation de techniques de traction douce (bed decompression) plut\xF4t que des suspensions passives ("dead hangs") qui peuvent provoquer des spasmes protecteurs chez certains patients.[20]

### Rupture du tendon distal du biceps
C'est une blessure sp\xE9cifique au deadlift pratiqu\xE9 avec une prise mixte (une main en supination). Si le bras en supination n'est pas maintenu parfaitement tendu ou s'il subit une tentative de flexion ("curling the bar") lors de l'effort, le tendon distal du biceps peut c\xE9der sous la charge.[21, 22, 23]

La pr\xE9vention repose sur :
- **L'utilisation de la prise "Hook Grip"** (double pronation avec pouce verrouill\xE9), qui \xE9limine le risque li\xE9 \xE0 la supination.[23, 24]
- **La prise de conscience technique** : "bras longs comme des cordes" et verrouillage des triceps pour assurer l'extension compl\xE8te du coude.[23, 25]

## Le protocole PEACE & LOVE : Un nouveau standard de r\xE9cup\xE9ration

Le traditionnel protocole RICE (Repos, Glace, Compression, \xC9l\xE9vation) est de plus en plus d\xE9laiss\xE9 au profit d'une approche plus holistique et active : le protocole PEACE & LOVE.[26, 27, 28]

### PEACE (Soin imm\xE9diat - J1 \xE0 J3)
L'objectif initial est de prot\xE9ger les tissus sans compromettre la gu\xE9rison \xE0 long terme.
- **P (Protect)** : \xC9viter les activit\xE9s aggravantes pendant 1 \xE0 3 jours pour limiter le risque de nouvelles l\xE9sions, tout en encourageant des mouvements doux sans douleur.[26, 29]
- **E (Elevate)** : Maintenir le membre bless\xE9 au-dessus du niveau du c\u0153ur pour favoriser le drainage des fluides.[26, 28]
- **A (Avoid anti-inflammatories)** : \xC9viter les anti-inflammatoires (AINS) et la glace excessive. L'inflammation est une \xE9tape biologique n\xE9cessaire \xE0 la signalisation de la r\xE9paration tissulaire. Les AINS peuvent freiner ce processus naturel.[26, 27, 29]
- **C (Compress)** : Utiliser des bandages \xE9lastiques pour limiter l'oed\xE8me.[26]
- **E (Educate)** : Enseigner \xE0 l'athl\xE8te que le repos total est souvent contre-productif et qu'une approche active est pr\xE9f\xE9rable.[26, 29]

### LOVE (R\xE9habilitation subs\xE9quente - Au-del\xE0 de J3)
Une fois la phase aigu\xEB pass\xE9e, le focus bascule sur la reconstruction de la capacit\xE9 de charge.
- **L (Load)** : Introduire progressivement une charge m\xE9canique. La m\xE9canotransduction stimule la r\xE9paration des tendons et des ligaments.[27, 29]
- **O (Optimism)** : Le cerveau joue un r\xF4le cl\xE9 dans la perception de la douleur. Maintenir un \xE9tat d'esprit positif et confiant am\xE9liore les r\xE9sultats th\xE9rapeutiques.[26, 29]
- **V (Vascularisation)** : Pratiquer une activit\xE9 cardiovasculaire sans douleur (marche, v\xE9lo, natation) pour augmenter le flux sanguin vers les zones l\xE9s\xE9es.[27, 28]
- **E (Exercise)** : Restaurer la force, la mobilit\xE9 et la proprioception par des exercices sp\xE9cifiques.[27, 29]

## Strat\xE9gies de r\xE9adaptation sp\xE9cifiques par pathologie

La r\xE9\xE9ducation en powerlifting doit \xEAtre crit\xE9ris\xE9e (bas\xE9e sur des \xE9tapes valid\xE9es) et non simplement temporelle.

### R\xE9habilitation des Tendinopathies (Protocole HSR)
Le protocole de r\xE9sistance lourde et lente (Heavy Slow Resistance - HSR) est le "gold standard" pour les tendons patellaires ou d'Achille.[6]
- **Phase Isom\xE9trique** : Maintien de 45 secondes \xE0 70% de la contraction maximale volontaire. Tr\xE8s efficace pour l'analg\xE9sie imm\xE9diate.[6]
- **Phase Isotonique lente** : Exercices (leg extension, squat) effectu\xE9s avec un tempo de 3 secondes en descente et 3 secondes en mont\xE9e.
- **Progression** : Commencer par 3 s\xE9ries de 15 r\xE9p\xE9titions et \xE9voluer vers des charges lourdes de 6 r\xE9p\xE9titions au fur et \xE0 mesure de l'am\xE9lioration de la tol\xE9rance.[6]

### Phases de r\xE9\xE9ducation apr\xE8s r\xE9paration du Grand Pectoral
Une chronologie stricte est n\xE9cessaire pour prot\xE9ger la suture chirurgicale tout en regagnant la mobilit\xE9.[30]

| Phase | D\xE9lai Post-Op | Objectifs Principaux | Exercices Types |
| :--- | :--- | :--- | :--- |
| **Phase II** | 0 - 2 semaines | Protection maximale | Mobilisation du coude/poignet, immobilisation en \xE9charpe |
| **Phase III** | 3 - 6 semaines | Mobilit\xE9 assist\xE9e | Glissements sur table, rotation externe limit\xE9e \xE0 30\xB0 |
| **Phase IV** | 6 - 9 semaines | Activation musculaire | Rotateurs de la coiffe avec \xE9lastique, Landmine press |
| **Phase V** | 9 - 12 semaines | Renforcement avanc\xE9 | Pompes au mur, d\xE9velopp\xE9 aux halt\xE8res l\xE9ger |
| **Phase VI** | 3 - 6 mois | Retour au sport | Reprise progressive du Bench Press, plyom\xE9trie |

### R\xE9habilitation du Conflit F\xE9moro-Ac\xE9tabulaire (FAI)
Le programme de r\xE9\xE9ducation pour le FAI se concentre sur la stabilit\xE9 de la hanche et l'\xE9vitement des positions compressives.[31]
- **Renforcement des adducteurs** : Crucial car ils stabilisent la hanche lors de la descente du squat.[8, 32]
- **Travail des fessiers** : Les isom\xE9triques de pont (bridges) et le travail des abducteurs (clamshells) aident \xE0 recentrer la t\xEAte f\xE9morale dans l'ac\xE9tabulum.[8, 31]
- **Mobilit\xE9 capsulaire** : \xC9tirements de type "Pigeon" ou mobilisations avec bande \xE9lastique pour lib\xE9rer la capsule post\xE9rieure de la hanche.[7]

## Optimisation de la r\xE9cup\xE9ration syst\xE9mique

Au-del\xE0 des exercices locaux, la capacit\xE9 du corps \xE0 r\xE9parer les tissus d\xE9pend de facteurs m\xE9taboliques et hormonaux.

### Nutrition et synth\xE8se prot\xE9ique
La r\xE9paration des micro-d\xE9chirures musculaires et des dommages tendineux n\xE9cessite un bilan azot\xE9 positif. Pour un athl\xE8te de force en phase de r\xE9cup\xE9ration, les besoins prot\xE9iques augmentent significativement.[33, 34]
- **Apport journalier** : Viser 1,6 \xE0 2,2 g de prot\xE9ines par kilo de poids de corps.[33, 34]
- **Qualit\xE9** : Privil\xE9gier les prot\xE9ines riches en leucine (\u22652,5 g par repas) pour d\xE9clencher la voie mTOR de la synth\xE8se prot\xE9ique.[33]
- **Distribution** : Fractionner l'apport en 4 \xE0 5 repas espac\xE9s de 3-4 heures pour maintenir une stimulation constante de la synth\xE8se prot\xE9ique musculaire (MPS).[35]

### Sommeil et r\xE9gulation hormonale
Le sommeil est la phase de r\xE9cup\xE9ration la plus critique. C'est durant le sommeil profond que l'hormone de croissance (GH) et l'IGF-1 sont s\xE9cr\xE9t\xE9es en quantit\xE9 maximale pour favoriser la r\xE9paration tissulaire.[36, 37] Une carence chronique en sommeil (moins de 7 heures) est associ\xE9e \xE0 une augmentation des marqueurs inflammatoires et \xE0 une baisse de la vigilance, augmentant le risque de blessure technique lors de la s\xE9ance suivante.[37]

### Apport de la Restriction du Flux Sanguin (BFR)
La th\xE9rapie par restriction du flux sanguin (BFR) est une innovation majeure dans la r\xE9\xE9ducation des powerlifters bless\xE9s. En utilisant un manchon pneumatique qui limite partiellement le flux sanguin, on peut induire une r\xE9ponse de croissance musculaire avec des charges extr\xEAmement l\xE9g\xE8res (20-30% de la RM1).[38] Cela permet de maintenir la masse musculaire et la force sans stresser une articulation ou un tendon encore fragile.[38]

## Le retour \xE0 la performance : Crit\xE8res et \xE9tapes

Le passage de la "r\xE9\xE9ducation" \xE0 l'entra\xEEnement de force maximal doit \xEAtre progressif et valid\xE9 par des tests objectifs.[39, 40]

### Les indicateurs de progression (Milestones)
L'athl\xE8te ne doit pas progresser en fonction du temps \xE9coul\xE9, mais en fonction de ses capacit\xE9s r\xE9elles :
- **Sym\xE9trie de force** : Un index de sym\xE9trie des membres (LSI) d'au moins 80-90% est requis pour les mouvements unilat\xE9raux avant de reprendre des charges bilat\xE9rales maximales.[40]
- **Absence de douleur r\xE9siduelle** : Une douleur not\xE9e \xE0 moins de 3/10 pendant l'exercice est acceptable, \xE0 condition qu'elle disparaisse dans les 24 heures suivantes.[6, 8]
- **Stabilit\xE9 articulaire** : R\xE9ussir des tests de contr\xF4le moteur (comme le Step-down de 8 pouces pour la hanche/genou) sans d\xE9viation majeure.[31]

### R\xE9int\xE9gration des mouvements SBD
La reprise doit suivre une hi\xE9rarchie de complexit\xE9 :
Isom\xE9trie \u2192 Concentrique seul \u2192 Excentrique contr\xF4l\xE9 \u2192 Vitesse de comp\xE9tition.
- **Pour le bench press** : D\xE9velopp\xE9 aux halt\xE8res \u2192 Floor Press \u2192 Board Press \u2192 Bench complet.[16]
- **Pour le deadlift** : Kettlebell swing \u2192 Rack Pull \u2192 Deadlift avec barre hexagonale \u2192 Deadlift conventionnel.[19, 20]

## Conclusion et recommandations de terrain

La force athl\xE9tique, bien que pr\xE9sentant un risque de blessure aigu\xEB mod\xE9r\xE9, impose des d\xE9fis chroniques uniques li\xE9s \xE0 la r\xE9p\xE9tition de charges supramaximales. La cl\xE9 d'une r\xE9cup\xE9ration r\xE9ussie ne r\xE9side pas dans l'arr\xEAt total de l'activit\xE9, mais dans une gestion fine de la charge (load management) et une adaptation technique intelligente.

Le passage du mod\xE8le RICE au mod\xE8le PEACE & LOVE marque une transition vers une r\xE9habilitation plus proactive, o\xF9 l'athl\xE8te devient acteur de sa gu\xE9rison. En int\xE9grant des protocoles de renforcement sp\xE9cifiques (HSR, isom\xE9trie), une nutrition optimis\xE9e et une surveillance rigoureuse des param\xE8tres biom\xE9caniques, le powerlifter peut non seulement revenir \xE0 son niveau ant\xE9rieur, mais souvent construire une structure plus r\xE9siliente. La pr\xE9vention, passant par une mobilit\xE9 ad\xE9quate et une technique irr\xE9prochable, demeure n\xE9anmoins la meilleure strat\xE9gie pour une carri\xE8re longue et fructueuse sur les plateaux de comp\xE9tition.

*(Sources : Bibliographie compl\xE8te extraite de NotebookLM pour alimenter l'agent IA).*

## Sources
- Prevalence and Consequences of Injuries in Powerlifting: A Cross ..., https://pubmed.ncbi.nlm.nih.gov/29785405/
- Injuries in weightlifting and powerlifting: an updated systematic ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC11624822/
- Injuries among weightlifters and powerlifters: a systematic review - PubMed, https://pubmed.ncbi.nlm.nih.gov/27707741/
- Injuries in weightlifting and powerlifting: an updated systematic review - PubMed, https://pubmed.ncbi.nlm.nih.gov/39650568/
- Prevalence and Consequences of Injuries in Powerlifting: A Cross-sectional Study - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC5954586/
- Managing patella tendinopathy in powerlifting Pt.2 \u2013 Building ..., https://modernphysio.com.au/managing-patella-tendinopathy-in-powerlifting-pt-2-building-tolerance/
- Fixing Hip Impingement - Squat University, https://squatuniversity.com/2017/10/21/fixing-hip-impingement/
- Femoroacetabular Impingement - E3 Rehab, https://e3rehab.com/fai/
- Bicep, Elbow and Shoulder Pain from Low Bar Squats - PowerliftingToWin, https://www.powerliftingtowin.com/bicep-elbow-and-shoulder-pain-from-low-bar-squats/
- Elbow Pain While Lifting Weights: Tendinitis and the Squat - Barbell Logic, https://barbell-logic.com/elbow-pain-while-lifting-weights/
- Why you're getting elbow pain during squats and how to fix it, https://www.momentptp.com/blogs/elbow-pain-with-squats
- How to avoid common bench press injuries - St John & St Elizabeth Hospital, https://hje.org.uk/blog/the-bench-press-how-to-avoid-injury-and-stay-fit/
- Upper extremity weightlifting injuries: Diagnosis and management ..., https://pmc.ncbi.nlm.nih.gov/articles/PMC5895929/
- Pectoralis Major Repair (Acute & Chronic) Seattle, WA | Pectoral Tear Bellevue, https://www.grantgarciamd.com/pectoralis-major-repair-shoulder-knee-sports-surgeon-seattle-bellevue-everett-kirkland-wa.html
- How to Fix Shoulder Pain During Bench Press - Anytime Physio, https://anytimephysio.com.au/shoulder-pain-bench-press/
- How to Return to Pressing Exercises with Shoulder Pain - Physio Network, https://www.physio-network.com/blog/pressing-exercises-shoulder-pain/
- Is Deadlift Good for Herniated Discs? - Total Ortho Sports Medicine, https://www.totalorthosportsmed.com/deadlift-for-herniated-discs/
- Deadlift With Herniated Disc: How To Lift Without Injury - Deuk Spine Institute, https://deukspine.com/blog/deadlift-with-herniated-discs/
- Strength Training with Disc Injuries: An Athlete's Recovery Guide, https://spectrumtherapynj.com/blogs/news/strength-training-with-disc-injuries-an-athletes-recovery-guide
- Deadlifting with a Herniated Disc: Why Avoidance Is Keeping You ..., https://backinshapeprogram.com/2026/01/deadlifting-with-a-herniated-disc-why-avoidance-is-keeping-you-weak-and-what-to-do-instead/
- Stop Deadlifting With A Mixed Grip | DrJohnRusin.com, https://drjohnrusin.com/stop-deadlifting-with-a-mixed-grip/
- Straps vs Mixed Grip When Deadlifting (Pros & Cons of Each) - Strength Resurgence, https://www.strengthresurgence.com/straps-vs-mixed-grip-when-deadlifting/
- Why A Hook Grip is Superior for Deadlifts - SoCal Powerlifting, https://www.socalpowerlifting.net/post/why-a-hook-grip-is-superior-for-deadlifts
- Grip Variation in Deadlift Training - TRAINFITNESS, https://train.fitness/personal-trainer-blogs/grip-variation-in-deadlift-training
- Should I switch to either straps/hook grip from mixed grip on deadlifts? : r/workout - Reddit, https://www.reddit.com/r/workout/comments/1qoarvk/should_i_switch_to_either_strapshook_grip_from/
- Forget RICE: Why PEACE & LOVE is the Modern Approach to Injury Recovery, https://ptsmc.com/rice-vs-peace-and-love/
- R.I.C.E vs P.E.A.C.E and L.O.V.E: The New Protocol for Injury Recovery - Active Balance - Physio and Wellness, https://www.activebalancephysio.com.au/r-i-c-e-vs-p-e-a-c-e-and-l-o-v-e-the-new-protocol-for-injury-recovery
- Understanding the PEACE & LOVE Protocol for Soft Tissue Injuries, https://www.movewellinjuryclinic.com/post/understanding-the-peace-love-protocol-for-soft-tissue-injuries
- Managing Acute Soft Tissue Injuries With PEACE & LOVE - Spectrum Health, https://www.spectrumhealth.ie/blog/managing-acute-soft-tissue-injuries-with-peace-amp-love
- Pectoralis Major Repair Rehabilitation Guideline - Sanford Health, https://www.sanfordhealth.org/-/media/org/files/medical-professionals/resources-and-education/pectoralis-major-guideline.pdf
- Non-Operative Labral/FAI Hip Rehabilitation ... - Sanford Health, https://www.sanfordhealth.org/-/media/org/files/medical-professionals/resources-and-education/hip-labrum-and--fai-non-operative-rehabilitation-guideline.pdf
- The Best Exercises for Femoroacetabular Impingement (FAI) - YouTube, https://www.youtube.com/watch?v=u2QF2j7TWKQ
- Optimizing Performance and Health: Nutrition Considerations for Female Athletes in Strength and Conditioning - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12803723/
- Nutritional Strategies for Enhancing Performance and Training Adaptation in Weightlifters, https://pmc.ncbi.nlm.nih.gov/articles/PMC11720227/
- Current Perspectives on Protein Supplementation in Athletes: General Guidance and Special Considerations for Diabetes\u2014A Narrative Review - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12655512/
- Understanding the Role of Rest and Recovery in Weightlifting, https://www.usaweightlifting.org/news/2024/march/10/understanding-the-role-of-rest-and-recovery-in-weightlifting
- Rest and recovery are critical for athletes of all ages from students to pros to older adults, https://www.uchealth.org/today/rest-and-recovery-for-athletes-physiological-psychological-well-being/
- Blood flow restriction in elite sport: From rehab to hypertrophy and beyond - Sportsmith, https://www.sportsmith.co/articles/blood-flow-restriction-in-elite-sport-from-rehab-to-hypertrophy-and-beyond/
- Evidence-Based Return-to-Play Protocols for Athletes | Physio Cure Dubai, https://physiocuredubai.com/blog/return-to-play-protocols-after-injury
- Sport-specific training and return to sport after ACL reconstruction in elite athletes: a narrative review - Annals of Joint, https://aoj.amegroups.org/article/view/9466/html


--- MEDICAL-FAI-KNOWLEDGE-BASE.md ---

---
title: "Conflit F\xE9moro-Ac\xE9tabulaire (CFA) chez l'Athl\xE8te de Force"
domain: "medical"
tags: ["fai","cfa","hip","cam","pincer","arthroscopy"]
source_type: "markdown"
---

# Base de Connaissances M\xE9dicales - Conflit F\xE9moro-Ac\xE9tabulaire (CFA) en Powerlifting

## Analyse M\xE9dicale Compl\xE8te du Conflit F\xE9moro-Ac\xE9tabulaire chez l'Athl\xE8te de Force

Le conflit f\xE9moro-ac\xE9tabulaire (CFA) est devenu une pathologie de r\xE9f\xE9rence dans le domaine de la m\xE9decine du sport, particuli\xE8rement pour les athl\xE8tes engag\xE9s dans des disciplines de haute intensit\xE9 comme le powerlifting. Cette condition, autrefois m\xE9connue ou diagnostiqu\xE9e tardivement comme une simple "douleur \xE0 l'aine", est aujourd'hui identifi\xE9e comme un m\xE9canisme dynamique complexe o\xF9 la morphologie osseuse interf\xE8re avec les exigences biom\xE9caniques du mouvement.[1, 2, 3] Pour le pratiquant de powerlifting, le CFA ne repr\xE9sente pas seulement un obstacle \xE0 la performance, mais constitue un risque s\xE9rieux de d\xE9g\xE9n\xE9rescence articulaire pr\xE9coce s'il n'est pas g\xE9r\xE9 avec une rigueur clinique absolue.[4, 5, 6]

## Fondements Physiopathologiques et Origines du Conflit

La hanche est une articulation de type \xE9narthrose, o\xF9 la t\xEAte du f\xE9mur s'articule dans une cavit\xE9 profonde du bassin nomm\xE9e l'ac\xE9tabulum. Dans une articulation saine, la t\xEAte f\xE9morale est parfaitement sph\xE9rique et b\xE9n\xE9ficie d'une libert\xE9 de mouvement totale dans la cupule ac\xE9tabulaire, prot\xE9g\xE9e par le cartilage hyalin et entour\xE9e par le labrum, un anneau fibrocartilagineux essentiel \xE0 la stabilit\xE9 et \xE0 l'\xE9tanch\xE9it\xE9 articulaire.[7, 8, 9] Le CFA survient lorsqu'un contact anormal se produit entre le col du f\xE9mur et le rebord de l'ac\xE9tabulum, provoquant un pincement des structures molles, principalement le labrum et le cartilage adjacent.[3, 10, 11]

### Classification des Anomalies Morphologiques

Les anomalies structurelles \xE0 l'origine du conflit se divisent en trois cat\xE9gories distinctes, bien que la litt\xE9rature souligne une pr\xE9valence \xE9lev\xE9e de formes mixtes.

- **Le conflit de type Cam (ou came)** est caract\xE9ris\xE9 par une asph\xE9ricit\xE9 de la t\xEAte f\xE9morale ou une protub\xE9rance osseuse situ\xE9e \xE0 la jonction entre la t\xEAte et le col f\xE9moral.[4, 10, 12] Cette d\xE9formation, souvent d\xE9crite comme une "poign\xE9e de pistolet" (pistol grip deformity) sur les radiographies, r\xE9duit l'espace disponible lors de la flexion de la hanche.[8] Lorsque l'athl\xE8te descend en squat, cette partie non sph\xE9rique est forc\xE9e m\xE9caniquement dans le cotyle, cr\xE9ant des forces de cisaillement massives qui peuvent peler le cartilage de l'os sous-chondral.[2, 8]
- **Le conflit de type Pincer (ou tenaille)** r\xE9sulte d'une anomalie de l'ac\xE9tabulum. Il s'agit d'une couverture excessive de la t\xEAte f\xE9morale par le rebord ac\xE9tabulaire, soit de mani\xE8re globale (coxa profunda), soit de mani\xE8re focale (r\xE9troversion ac\xE9tabulaire).[1, 7, 13] Dans ce cas, le col f\xE9moral vient buter pr\xE9matur\xE9ment contre le rebord ac\xE9tabulaire, \xE9crasant le labrum comme dans une tenaille.[8, 13]
- **Le conflit mixte** combine les deux m\xE9canismes. Les \xE9tudes sugg\xE8rent que 72% \xE0 88% des patients symptomatiques pr\xE9sentent cette morphologie combin\xE9e, ce qui complexifie la prise en charge car les l\xE9sions touchent \xE0 la fois le labrum et le cartilage profond.[1, 4, 14]

### L'Origine D\xE9veloppementale et l'Impact du Powerlifting

L'\xE9tiologie du CFA chez le powerlifter est multifactorielle. Bien que certaines pr\xE9dispositions soient cong\xE9nitales, une th\xE9orie biom\xE9canique majeure sugg\xE8re que les d\xE9formations de type Cam se d\xE9veloppent durant la p\xE9riode de croissance squelettique.[6, 11, 15] L'application de charges lourdes et r\xE9p\xE9titives sur une plaque de croissance (\xE9piphyse) encore ouverte, entre 7 et 16 ans, pourrait induire un remodelage osseux adaptatif.[6, 16, 17] Cette adaptation, visant initialement \xE0 stabiliser l'articulation face aux contraintes du sport, finit par cr\xE9er une protub\xE9rance pathologique.[15, 18]

Dans la pratique du powerlifting, le stress articulaire est d\xE9multipli\xE9. Lors d'un squat \xE0 haute intensit\xE9 (90% 1-RM), les forces de contact articulaire (JCF) au niveau de la hanche peuvent atteindre des magnitudes extr\xEAmes.

| Intensit\xE9 du Squat (% 1-RM) | Force de Contact Hanche (Multiples du Poids du Corps - BW) |
| :--- | :--- |
| 70% 1-RM | 12.8 \xB1 2.5 BW |
| 80% 1-RM | 14.1 \xB1 2.8 BW |
| 90% 1-RM | 15.5 \xB1 3.0 BW |

Ces donn\xE9es indiquent que pour un athl\xE8te de 100 kg, la hanche supporte plus de 1,5 tonne de pression en bas du mouvement.[19] Si la morphologie est pathologique, ces forces ne sont plus distribu\xE9es uniform\xE9ment mais se concentrent sur le rebord ant\xE9ro-sup\xE9rieur de l'ac\xE9tabulum, acc\xE9l\xE9rant la d\xE9chirure du labrum et l'\xE9rosion du cartilage.[1, 19]

## D\xE9tection et Processus Diagnostique

Le diagnostic du CFA n\xE9cessite une approche m\xE9ticuleuse combinant l'anamn\xE8se, l'examen physique et l'imagerie avanc\xE9e. Pour le powerlifter, la douleur est souvent le premier signal, mais elle peut \xEAtre masqu\xE9e par d'autres pathologies courantes comme les tendinites des fl\xE9chisseurs de la hanche ou des hernies inguinales.[3, 4]

### Pr\xE9sentation Clinique et Symptomatologie

La douleur est typiquement localis\xE9e dans le pli de l'aine. Les patients d\xE9crivent souvent un d\xE9but insidieux, sans traumatisme aigu, bien que certains \xE9pisodes puissent \xEAtre d\xE9clench\xE9s par une s\xE9ance particuli\xE8rement lourde de squat ou de deadlift sumo.[10, 20]

Un \xE9l\xE9ment diagnostique cl\xE9 est le signe du "C" (C-sign) : l'athl\xE8te indique la localisation de sa douleur en pla\xE7ant sa main en forme de C au-dessus du grand trochanter, le pouce pointant vers la fesse et l'index vers l'aine.[3, 8, 11] La douleur peut irradier le long de la cuisse jusqu'au genou ou se manifester lat\xE9ralement.[6, 10, 13] Les sensations de craquement, de blocage ou de "clic" sont fr\xE9quentes et orientent fortement vers une l\xE9sion du labrum.[4, 7, 10]

### Examen Physique et Tests de Provocation

Le clinicien utilise des man\u0153uvres sp\xE9cifiques pour reproduire le conflit m\xE9canique en cabinet.

- **Test FADIR (Flexion, Adduction, Internal Rotation)** : Ce test est consid\xE9r\xE9 comme le gold standard clinique pour le CFA ant\xE9rieur. Le m\xE9decin fl\xE9chit la hanche \xE0 90\xB0, puis l'am\xE8ne en adduction et en rotation interne.[14, 21, 22] Une douleur aigu\xEB reproduisant les sympt\xF4mes habituels indique un test positif. Sa sensibilit\xE9 est proche de 99%, ce qui en fait un excellent outil d'exclusion.[11, 14]
- **Test FABER (Flexion, Abduction, External Rotation)** : La cheville est pos\xE9e sur le genou oppos\xE9. Une douleur profonde dans l'aine lors de cette man\u0153uvre est souvent associ\xE9e \xE0 une l\xE9sion de type Cam ou \xE0 une atteinte du labrum.[21, 23, 24]
- **Analyse de la Mobilit\xE9** : Une perte marqu\xE9e de la rotation interne, particuli\xE8rement en flexion, est un signe quasi constant chez les athl\xE8tes atteints de CFA.[1, 9, 10]
- **Observation de la Marche** : Une d\xE9marche antalgique ou un signe de Trendelenburg (chute du bassin du c\xF4t\xE9 oppos\xE9 \xE0 la jambe d'appui) peut r\xE9v\xE9ler une faiblesse des abducteurs secondaire \xE0 la douleur articulaire.[3, 11]

### Imagerie Radiologique et Mesures de Pr\xE9cision

L'imagerie permet de quantifier l'anomalie osseuse et d'\xE9valuer l'\xE9tat des tissus mous.

- **Radiographie** : La radiographie du bassin de face et les profils sp\xE9cifiques sont indispensables. Le profil de Dunn, r\xE9alis\xE9 avec une flexion de hanche \xE0 45\xB0 ou 90\xB0, est la vue la plus performante pour mettre en \xE9vidence la bosse osseuse du type Cam.[25, 26, 27]
- **Angle Alpha (\u03B1)** : Il est la mesure quantitative de r\xE9f\xE9rence, trac\xE9 sur une vue de profil de la hanche. Angle \u03B1 > 55\xB0 = Morphologie de type Cam confirm\xE9e. Un angle \xE9lev\xE9 est pr\xE9dictif de douleurs li\xE9es \xE0 l'activit\xE9 sportive et de dommages cartilagineux.[23, 28, 29]
- **Signe du croisement** : Le m\xE9decin recherche ce signe sur la vue de face, indiquant une r\xE9troversion de l'ac\xE9tabulum caract\xE9ristique du type Pincer.[11, 13]
- **Arthro-IRM (IRM avec injection de contraste)** : Reste l'examen de choix pour visualiser les d\xE9chirures du labrum et les d\xE9collements cartilagineux pr\xE9coces que la radiographie ne peut d\xE9tecter.[1, 7, 13] Elle permet \xE9galement d'\xE9valuer l'\xE9tat de la capsule articulaire et du ligament rond.[26]

## Strat\xE9gies de Gu\xE9rison : Du Traitement Conservateur \xE0 la Chirurgie

La prise en charge du CFA chez le powerlifter doit \xEAtre progressive. L'objectif est de restaurer une fonction sans douleur tout en prot\xE9geant l'articulation de l'arthrose pr\xE9coce.[1, 2, 7]

### Phase de Gestion Conservatrice et Kin\xE9sith\xE9rapie

Pour beaucoup d'athl\xE8tes, la chirurgie n'est pas une fatalit\xE9. Une modification de l'activit\xE9 et un renforcement cibl\xE9 peuvent stabiliser les sympt\xF4mes.

#### Modifications de la Technique de Squat
L'ajustement de la biom\xE9canique est crucial pour r\xE9duire le conflit lors de l'entra\xEEnement de force.

- **Largeur de Stance** : Passer d'un squat \xE9troit \xE0 un squat large (type sumo) permet de r\xE9duire la flexion maximale n\xE9cessaire pour atteindre la profondeur, tout en engageant davantage d'abduction, ce qui lib\xE8re de l'espace pour le col f\xE9moral.[20, 30]
- **Rotation Externe des Pieds** : Ouvrir les orteils vers l'ext\xE9rieur permet d'aligner le f\xE9mur dans une position moins provocatrice pour le rebord ac\xE9tabulaire.[30, 31]
- **Limitation de l'Amplitude** : L'utilisation de box squats ou de squats partiels permet de maintenir la charge de travail sans entrer dans la zone de conflit ("pinch point").[32, 33, 34]
- **Chaussures d'Halt\xE9rophilie** : Le talon sur\xE9lev\xE9 permet de maintenir un tronc plus vertical, r\xE9duisant ainsi la flexion de la hanche requise par rapport \xE0 un squat \xE0 plat.[30, 33, 35]

#### Programme de R\xE9\xE9ducation Sp\xE9cifique
Le renforcement musculaire vise \xE0 am\xE9liorer la stabilit\xE9 dynamique de la hanche.

- **Activation des Fessiers** : Le moyen fessier est souvent inhib\xE9 par la douleur. Des exercices comme les clamshells, les ponts (glute bridges) et les marches lat\xE9rales avec \xE9lastique (monster walks) sont fondamentaux.[36, 37, 38]
- **Stabilit\xE9 Lombo-Pelvienne** : Un contr\xF4le rigoureux du bassin emp\xEAche la bascule post\xE9rieure pr\xE9matur\xE9e (butt wink), minimisant ainsi le stress sur le labrum.[39, 40, 41]
- **\xC9tirements Pr\xE9cis** : Il faut \xE9tirer les fl\xE9chisseurs de hanche (psoas) sans aggraver le conflit. L'utilisation d'\xE9lastiques pour cr\xE9er une traction articulaire pendant l'\xE9tirement peut aider \xE0 d\xE9comprimer l'articulation.[20, 31]

### Intervention Chirurgicale : L'Arthroscopie de Hanche

Lorsque le traitement conservateur ne permet plus la pratique sportive ou que les douleurs quotidiennes persistent, l'option chirurgicale est envisag\xE9e.[7, 12] L'arthroscopie est une technique mini-invasive qui permet de traiter les causes m\xE9caniques du conflit.[10, 25, 42]

#### Proc\xE9dures de Remodelage et R\xE9paration
Le chirurgien effectue plusieurs gestes techniques sous contr\xF4le vid\xE9o :

| Technique Chirurgicale | Avantage pour le Powerlifter | Risque de Non-Ex\xE9cution |
| :--- | :--- | :--- |
| **Labral Repair** (R\xE9paration du Labrum) | Maintient la pression hydrostatique | Instabilit\xE9, arthrose acc\xE9l\xE9r\xE9e |
| **Capsular Closure** (Fermeture de la Capsule) | Restaure la tension capsulaire | Micro-instabilit\xE9, douleur persistante |
| **Cam Resection** (Ch\xE9ilectomie) | Lib\xE8re la flexion profonde | Conflit r\xE9current, nouvelle d\xE9chirure |
| **Ac\xE9tabuloplastie** | \xC9limine l'effet tenaille | Usure cartilagineuse prolong\xE9e |

### Protocole de R\xE9\xE9ducation Post-Op\xE9ratoire

La r\xE9ussite de la chirurgie d\xE9pend \xE0 50% de la qualit\xE9 de la r\xE9\xE9ducation.[46] Pour un powerlifter, le retour \xE0 la barre est un marathon, pas un sprint. Le protocole s'\xE9tend g\xE9n\xE9ralement sur 6 \xE0 12 mois.

- **Phase I : Protection (Semaines 0-4)** : L'objectif est de prot\xE9ger la r\xE9paration tissulaire. Le patient utilise des b\xE9quilles avec une mise en charge limit\xE9e (environ 20 lbs ou "foot flat").[46, 47, 48] L'utilisation d'une machine de mouvement passif continu (CPM) est souvent prescrite pour mobiliser l'articulation sans tension musculaire.[47, 49] Le patient doit passer du temps sur le ventre ("belly time") pour pr\xE9venir les contractures des fl\xE9chisseurs de la hanche.[46, 50]
- **Phase II : Renforcement Initial (Semaines 4-10)** : On commence \xE0 sevrer les b\xE9quilles d\xE8s que la marche est normale et sans douleur.[42, 47, 48] Les exercices se concentrent sur le contr\xF4le moteur : squats au poids du corps (limit\xE9s en amplitude), step-ups et \xE9quilibre unipodal.[47, 48, 50] L'activation du transverse de l'abdomen et des fessiers est intensifi\xE9e.[47, 51]
- **Phase III : Force et Puissance (Semaines 10-18)** : Introduction graduelle de la charge. L'athl\xE8te peut commencer des squats plus profonds et des exercices de presse.[47, 48] Le crit\xE8re de progression est la capacit\xE9 \xE0 effectuer un squat \xE0 une jambe sans compensation du bassin.[48]
- **Phase IV : Retour au Powerlifting (Semaines 18-32+)** : C'est la phase de r\xE9int\xE9gration sp\xE9cifique. On commence par des squats barre \xE0 vide, en augmentant la charge de 5 \xE0 10% par semaine selon la tol\xE9rance.[42, 47] Le retour \xE0 une intensit\xE9 de comp\xE9tition est rarement autoris\xE9 avant le 8\xE8me ou 9\xE8me mois.[9, 42]

## Perspectives \xE0 Long Terme et Pr\xE9vention

Le CFA n'est pas simplement une blessure passag\xE8re, c'est une modification de l'architecture articulaire qui n\xE9cessite une gestion \xE0 vie.

### Risques de Complications et d'Arthrose
Le risque majeur du CFA non trait\xE9 est la coxarthrose pr\xE9coce. Les l\xE9sions r\xE9p\xE9t\xE9es du cartilage entra\xEEnent une usure irr\xE9versible.[2, 4, 5] M\xEAme apr\xE8s une chirurgie r\xE9ussie, une l\xE9g\xE8re diminution de l'espace articulaire peut \xEAtre observ\xE9e sur 5 ans, soulignant l'importance d'une technique de levage parfaite pour minimiser l'usure r\xE9siduelle.[52] Les patients op\xE9r\xE9s apr\xE8s l'\xE2ge de 40 ans ou pr\xE9sentant d\xE9j\xE0 des signes d'arthrose (stade T\xF6nnis 2 ou 3) ont des r\xE9sultats moins favorables et un risque plus \xE9lev\xE9 de conversion en proth\xE8se totale de hanche.[12, 44, 52]

### Optimisation Durable pour l'Athl\xE8te de Force
Pour continuer \xE0 pratiquer le powerlifting malgr\xE9 un historique de CFA, plusieurs principes doivent \xEAtre adopt\xE9s :

- **Auto-R\xE9gulation** : Apprendre \xE0 distinguer la "bonne fatigue musculaire" de la "douleur de pincement" articulaire.[20, 53]
- **Gestion du Volume** : \xC9viter les fr\xE9quences de squat trop \xE9lev\xE9es (plus de 2 fois par semaine) si la hanche est irritable.[54, 55]
- **Vari\xE9t\xE9 de Mouvements** : Utiliser des exercices comme le Trap Bar Deadlift ou le Belt Squat qui imposent moins de contraintes de cisaillement sur la hanche tout en b\xE2tissant une force massive.[33, 54]
- **\xC9ducation Continue** : Comprendre que la morphologie de la hanche dicte la profondeur du squat. Tenter d'atteindre une profondeur "cul au sol" (ass-to-grass) avec une hanche de type Cam est une erreur biom\xE9canique majeure.[31, 41, 56]

En conclusion, le conflit f\xE9moro-ac\xE9tabulaire est une pathologie s\xE9rieuse mais g\xE9rable. Gr\xE2ce \xE0 une d\xE9tection pr\xE9cise, des ajustements techniques intelligents et, si n\xE9cessaire, une chirurgie arthroscopique moderne, l'athl\xE8te de powerlifting peut non seulement gu\xE9rir de ses douleurs, mais aussi prolonger sa carri\xE8re sportive tout en pr\xE9servant la sant\xE9 de son capital articulaire.[7, 9, 57, 58] Une collaboration \xE9troite entre le chirurgien, le kin\xE9sith\xE9rapeute et l'entra\xEEneur est le gage d'un retour r\xE9ussi au plus haut niveau de force.[37, 42, 46]

## Sources
- Le conflit f\xE9moro-ac\xE9tabulaire - Revue M\xE9dicale Suisse, https://www.revmed.ch/revue-medicale-suisse/2007/revue-medicale-suisse-105/le-conflit-femoro-acetabulaire
- Aspects cliniques et radiologiques du conflit f\xE9moro-ac\xE9tabulaire - Revue M\xE9dicale Suisse, https://www.revmed.ch/revue-medicale-suisse/2006/revue-medicale-suisse-73/aspects-cliniques-et-radiologiques-du-conflit-femoro-acetabulaire
- Femoroacetabular impingement syndrome: Nonarthritic hip pain in young adults - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC2293316/
- Quels sont les facteurs de risques d'un conflit f\xE9moro-ac\xE9tabulaire de la hanche ? | Dr Paillard | Paris, https://www.chirurgie-orthopedique-paris.com/quels-sont-facteurs-de-risque-conflit-femoro-acetabulaire-hanche/
- Hip Arthritis | Johns Hopkins Medicine, https://www.hopkinsmedicine.org/health/conditions-and-diseases/hip-arthritis
- Signs That Your Hip Pain Could Be Hip Impingement | Joshua D. Harris, https://joshuaharrismd.com/signs-that-your-hip-pain-could-be-hip-impingement/
- Traitement d'un Conflit F\xE9moro-Ac\xE9tabulaire \xE0 Lausanne | Dr Ja\xEBn, https://www.chirurgie-orthopedique-lausanne.com/pathologies-hanche/conflit-femoro-acetabulaire/
- Physical Therapy Guide to Hip Impingement (Femoroacetabular Impingement) - Choose PT, https://www.choosept.com/guide/physical-therapy-guide-hip-impingement-femoroacetabular
- Understanding Hip Impingement | Children's Hospital Colorado, https://www.childrenscolorado.org/advances-answers/recent-articles/femoroacetabular-impingement/
- Conflit f\xE9moro-ac\xE9tabulaire - H\xF4pital de La Tour, https://www.la-tour.ch/fr/conflit-femoro-acetabulaire
- Femoroacetabular Impingement - StatPearls - NCBI Bookshelf - NIH, https://www.ncbi.nlm.nih.gov/books/NBK547699/
- Conflit f\xE9moro-ac\xE9tabulaire : causes, sympt\xF4mes et traitement. Cl\xEDnica Universidad de Navarra, https://www.cun.es/fr/maladies-traitements/maladies/conflit-femoro-acetabulaire
- Le conflit f\xE9moro-ac\xE9tabulaire - AWS, https://fmoq-mdq.s3.us-east-1.amazonaws.com/legacy/Media/120550/075-080DrTremblay1013.pdf
- FADDIR Test | Femoroacetabular Impingement (FAI) Assessment - Physiotutors, https://www.physiotutors.com/wiki/faddir-test/
- Etiology of Femoroacetabular Impingement in Athletes: A Review of Recent Findings - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC4513226/
- Comment ne pas passer \xE0 c\xF4t\xE9 d'un diagnostic d'\xE9piphysiolyse f\xE9morale sup\xE9rieure, https://www.paediatrieschweiz.ch/fr/diagnostic-depiphysiolyse-femorale-superieure/
- Hip Impingement | Johns Hopkins Medicine, https://www.hopkinsmedicine.org/health/conditions-and-diseases/hip-impingement
- Exercises For FAI Syndrome - [P]rehab - The Prehab Guys, https://theprehabguys.com/fai-syndrome-exercises/
- Biomechanical analysis of hip, knee, and ankle joint contact forces ..., https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327973
- The Hip Impingement Solution | Juggernaut Training Systems, https://www.jtsstrength.com/the-hip-impingement-solution/
- Sensitivity and Specificity for Physical Examination Tests in Diagnosing Prearthritic Intra-Articular Hip Pathology Are Highly Variable: A Systematic Review - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12276548/
- FAI Diagnostic Tests and Injections - Upright Health, https://www.uprighthealth.com/fai-tests
- Reliability of FABER test in correlation with alpha angle in diagnosis of cam type femoroacetabular impingement - Journal of Orthopaedics Trauma Surgery and Related Research, https://www.jotsrr.org/articles/reliability-of-faber-test-in-correlation-with-alpha-angle-in-diagnosis-of-cam-type-femoroacetabular-impingement-11813.html
- Special tests for FAI - the truth about FADIR and FABER and other hip impingement tests, https://www.uprighthealth.com/blog/FAI-special-tests
- Conflit f\xE9moro-ac\xE9tabulaire - Clinique du sport Bordeaux - M\xE9rignac, https://www.cliniquedusport-bx.fr/Conflit-femoro-acetabulaire
- L'imagerie des membres inf\xE9rieurs, https://www.lesommetavotreportee.qc.ca/files/PDF/Imagerie%20membres%20inferieurs%20-%20Presentation%20Dre%20Fortin.pdf
- The Dunn View - Roentgen Ray Reader, http://roentgenrayreader.blogspot.com/2012/02/dunn-view_08.html
- Comprehensive Clinical Evaluation of Femoroacetabular Impingement - Jorge Chahla, MD, https://www.jorgechahlamd.com/wp-content/uploads/2019/12/142-Hip-XR.pdf
- Comparison of MRI, CT, Dunn 45\xB0 and Dunn 90\xB0 alpha angle measurements in femoroacetabular impingement - PubMed, https://pubmed.ncbi.nlm.nih.gov/29218683/
- A Biomechanical Review of the Squat Exercise: Implications for Clinical Practice, https://ijspt.scholasticahq.com/article/94600-a-biomechanical-review-of-the-squat-exercise-implications-for-clinical-practice
- Fixing Hip Impingement - Squat University, https://squatuniversity.com/2017/10/21/fixing-hip-impingement/
- Squat form with CAM type FAI, and exercise replacements in the beginner template, https://forum.barbellmedicine.com/t/squat-form-with-cam-type-fai-and-exercise-replacements-in-the-beginner-template/10964
- Femoroacetabular Impingement - E3 Rehab, https://e3rehab.com/fai/
- Hip Pinching During Squats? Try These 4 Squat Variations Instead (FAI Rehab Guide), https://www.youtube.com/watch?v=m5a4w0roz4g
- Leaning Forward, Over-Tucking, and Butt Winking in a Squat - Katie St.Clair Fitness, https://www.katiestclairfitness.com/blog/butt-winking-leaning-forward-and-over-tucking-in-a-squat
- 7 Best Hip Impingement Exercises for Recovery - MGS Physiotherapy, https://www.mgs.physio/top-7-hip-impingement-exercises-to-support-hip-health/
- Exercising with Hip Impingement (FAI) - Beacon Orthopaedics & Sports Medicine, https://www.beaconortho.com/blog/exercising-fai/
- FAI and the Rehab Process: Re-Activation and Re-Alignment - EliteFTS, https://elitefts.com/blogs/motivation/fai-and-the-rehab-process-re-activation-and-re-alignment
- What Is 'Butt Wink' and How Do You Prevent It? - Back In Motion, https://backinmotion.com.au/blog-article/what-is-butt-wink-and-how-do-you-prevent-it
- Understanding The Butt Wink: How To Fix Your Squat - Movement Enhanced, https://movementenhanced.com.au/understanding-the-butt-wink-how-to-fix-your-squat/
- Explaining Anterior and Posterior Pelvic Tilt in the Squat and How it Influences Hip Pain (FAI) - YouTube, https://www.youtube.com/watch?v=8Byr4_N-2_8
- Advancements in Arthroscopic Hip Surgery - OrthoVirginia, https://www.orthovirginia.com/blog/advancements-in-arthroscopic-hip-surgery/
- Two-Year Outcomes of Primary Arthroscopic Surgery in Patients with Femoroacetabular Impingement - Dr. Marc Philippon, https://www.drmarcphilipponmd.com/pdf/two-year-outcomes-of-primary-arthroscopic-surgery-3.pdf
- Long term impacts of arthroscopic labral and capsular management, https://dralisongrimaldi.com/blog/long-term-impacts-of-arthroscopic-labral-and-capsular-management/
- Arthroscopic Acetabular Labral Repair Versus Labral Debridement: Long-term Survivorship and Functional Outcomes - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC9274418/
- Post Operative Hip Arthroscopy Rehabilitation Protocol for Dr.Hergandoc - David Hergan MD, https://www.davidherganmd.com/pdf/post-operative-hip-arthroscopy-rehabilitation-protocol-for-dr-hergan.pdf
- Post-Operative Hip Arthroscopy Rehabilitation Protocol | Physical Therapy (PT), https://manhattansportsdoc.com/post-operative-hip-arthroscopy-rehab-protocol/
- Rehabilitation s/p Hip Arthroscopy, Femoro/Acetabuloplasty with or ..., https://www.slu.edu/medicine/orthopaedic-surgery/sports-medicine/-pdf/hip-arthroscopy-with-withoutlabral.pdf
- HIP ARTHROSCOPY POST-\u2010OPERATIVE REHABILITATION PROTOCOL | OrthoVirginia, https://www.orthovirginia.com/wp-content/uploads/2022/04/mook-hip-arthroscopy-rehabilitation-protocol.pdf
- HIP ARTHROSCOPY CLINICAL PRACTICE GUIDELINE - The Ohio State University Wexner Medical Center, https://wexnermedical.osu.edu/~/media/files/wexnermedical/patient-care/healthcare-services/sports-medicine/education/medical-professionals/tenex/hiplabral.pdf?la=en
- CONSERVATIVE MANAGEMENT FOR FEMOROACETABULAR IMPINGEMENT (FAI) - Fowler Kennedy Sport Medicine Clinic, https://www.fowlerkennedy.com/wp-content/uploads/2023/03/CONSERVATIVE-MANAGEMENT-FOR-FEMOROACETABULAR-IMPINGEMENT-FAI-November-2015.pdf
- Five-Year Follow-up After Hip Arthroscopic Surgery in the Horsens-Aarhus Femoroacetabular Impingement (HAFAI) Cohort - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC8908400/
- Hip Pain While Squatting? Here's How To Fix It (FAI Impingement) - YouTube, https://www.youtube.com/watch?v=xVUzxzVDPyI
- Long Term Management of FAI - Nathan Carlson - Running Mate, https://runningmatekc.com/long-term-management-of-fai/
- Non-operative Management and Outcomes of Femoroacetabular Impingement Syndrome, https://pmc.ncbi.nlm.nih.gov/articles/PMC10587039/
- Posterior Pelvic Tilt During the Squat: A Biomechanical Perspective and Possible Exercise Solution - Preprints.org, https://www.preprints.org/frontend/manuscript/584f217e3130c8e0fd312a016e8e068c/download_pub
- Optimizing Conservative Treatment for Femoroacetabular Impingement Syndrome: A Scoping Review of Rehabilitation Strategies - MDPI, https://www.mdpi.com/2076-3417/15/5/2821
- Five-Year Outcomes After Arthroscopic Surgery for Femoroacetabular Impingement Syndrome in Elite Athletes - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC7227125/


--- NEUROMUSCULAR-RECOVERY-KNOWLEDGE-BASE.md ---

---
title: "Optimisation Neuromusculaire et R\xE9g\xE9n\xE9ration Syst\xE9mique"
domain: "recovery"
tags: ["warmup","neuromuscular","parasympathetic","recovery"]
source_type: "markdown"
---

# Base de Connaissances - Optimisation Neuromusculaire & R\xE9g\xE9n\xE9ration

## Analyse exhaustive des protocoles d'optimisation neuromusculaire et de r\xE9g\xE9n\xE9ration syst\xE9mique en force athl\xE9tique

La force athl\xE9tique, ou powerlifting, se d\xE9finit par la recherche de la performance maximale sur trois mouvements fondamentaux : le squat, le d\xE9velopp\xE9 couch\xE9 et le soulev\xE9 de terre. Cette discipline impose des contraintes m\xE9caniques et neurologiques d'une intensit\xE9 rare, n\xE9cessitant une approche scientifique de la pr\xE9paration et de la r\xE9cup\xE9ration. L'efficacit\xE9 d'un athl\xE8te ne se mesure pas uniquement \xE0 sa capacit\xE9 \xE0 mobiliser des unit\xE9s motrices sous une barre, mais \xE9galement \xE0 sa rigueur dans la gestion des phases pr\xE9 et post-entra\xEEnement. L'\xE9chauffement ne doit plus \xEAtre per\xE7u comme une simple transition thermique, mais comme un processus de potentiation neuromusculaire visant \xE0 optimiser la transmission de force et \xE0 s\xE9curiser les structures articulaires.[1, 2] \xC0 l'autre extr\xE9mit\xE9 de la s\xE9ance, la r\xE9cup\xE9ration constitue le pivot de l'adaptation : c'est durant cette phase que l'organisme restaure son hom\xE9ostasie, r\xE9pare les micro-l\xE9sions tissulaires et consolide les gains de force.[3, 4] Ce rapport technique explore les protocoles de pointe, en s'appuyant sur les donn\xE9es de la science du sport et les m\xE9thodes des entra\xEEneurs de renomm\xE9e mondiale.

## Architecture physiologique de l'\xE9chauffement moderne

L'objectif primaire de l'\xE9chauffement est d'\xE9lever la temp\xE9rature centrale et intramusculaire, ce qui induit une cascade de b\xE9n\xE9fices physiologiques. Une augmentation de la temp\xE9rature corporelle r\xE9duit la viscosit\xE9 des tissus conjonctifs et du liquide synovial, am\xE9liorant ainsi la fluidit\xE9 articulaire et l'\xE9lasticit\xE9 musculo-tendineuse.[1, 5] Sur le plan neurologique, la chaleur acc\xE9l\xE8re la vitesse de conduction nerveuse et am\xE9liore la sensibilit\xE9 des r\xE9cepteurs, permettant un recrutement plus efficace des fibres de type II (rapides), essentielles pour soulever des charges maximales.[2, 5] Un \xE9chauffement structur\xE9 peut am\xE9liorer la production de force de 5 \xE0 15 % par rapport \xE0 un d\xE9part \xE0 froid.[6]

### La phase pr\xE9paratoire cardiovasculaire et thermique
La premi\xE8re \xE9tape consiste en une activit\xE9 a\xE9robie de faible intensit\xE9, d'une dur\xE9e de 5 \xE0 10 minutes. Le choix de l'outil est crucial : il doit minimiser l'impact articulaire tout en sollicitant les grands groupes musculaires.[1, 6] Le rameur est souvent privil\xE9gi\xE9 car il engage simultan\xE9ment les membres inf\xE9rieurs, le tronc et les membres sup\xE9rieurs, pr\xE9parant ainsi l'ensemble de la cha\xEEne cin\xE9tique.[2, 6]

| Modalit\xE9 d'\xE9chauffement g\xE9n\xE9ral | Dur\xE9e recommand\xE9e | Objectif principal |
| :--- | :--- | :--- |
| **Rameur (Concept 2)** | 5 - 8 minutes | Activation syst\xE9mique et thermique [1] |
| **V\xE9lo stationnaire / AirDyne** | 5 - 10 minutes | Circulation sanguine des membres inf\xE9rieurs [6] |
| **Prowler (marche l\xE9g\xE8re)** | 3 - 5 minutes | Mont\xE9e en temp\xE9rature sp\xE9cifique au bas du corps [1] |
| **Marche sur tapis inclin\xE9** | 5 - 10 minutes | Augmentation du d\xE9bit cardiaque de base [5] |

L'omission de cette phase est souvent corr\xE9l\xE9e \xE0 une raideur initiale lors des premi\xE8res s\xE9ries \xE0 la barre, ce qui peut alt\xE9rer la trajectoire technique et augmenter le risque de micro-traumatismes.[1]

### Lib\xE9ration myofasciale et modulation de la raideur
Le recours aux techniques d'auto-lib\xE9ration myofasciale (SMR), comme le rouleau de massage (foam rolling), a fait l'objet de nombreux d\xE9bats. En powerlifting, l'objectif n'est pas d'allonger le muscle de mani\xE8re passive \u2014 ce qui pourrait r\xE9duire la production de force \u2014 mais de traiter les zones de tension excessive qui limitent l'amplitude de mouvement n\xE9cessaire \xE0 une technique correcte.[5, 7] Le foam rolling stimule les organes tendineux de Golgi, ce qui informe le syst\xE8me nerveux qu'il peut rel\xE2cher la tension musculaire, augmentant ainsi la mobilit\xE9 sans compromettre la stabilit\xE9 structurelle.[8]

Les zones cl\xE9s pour un powerlifter incluent les grands dorsaux (lats), les pectoraux, les adducteurs et les fessiers. Par exemple, des pectoraux trop tendus peuvent limiter la r\xE9traction scapulaire au d\xE9velopp\xE9 couch\xE9, tandis que des adducteurs raides peuvent provoquer un effondrement des genoux (valgus) au squat.[5, 7] Il est recommand\xE9 de passer 30 \xE0 60 secondes par zone, en se concentrant sur les "points g\xE2chettes" (trigger points) sans provoquer de douleur inhibitrice.[7, 9]

### Mobilit\xE9 dynamique vs \xC9tirements statiques
La science actuelle rejette l'utilisation d'\xE9tirements statiques prolong\xE9s (sup\xE9rieurs \xE0 60 secondes) avant une s\xE9ance de force, car ils peuvent induire une baisse de la force maximale de 8 \xE0 10 %.[2] \xC0 l'inverse, la mobilit\xE9 dynamique, compos\xE9e de mouvements contr\xF4l\xE9s comme les balancements de jambes, les cercles de bras ou les fentes march\xE9es, pr\xE9pare les articulations \xE0 travers une amplitude de mouvement active.[2, 10]

Pour le squat, des exercices comme le "Cossack Squat" ou le "Spiderman Stretch" avec rotation thoracique sont recommand\xE9s pour ouvrir les hanches et mobiliser la colonne vert\xE9brale.[1, 10] L'int\xE9gration du "Cat-Camel" (dos de chat/dos de vache) permet de lib\xE9rer les restrictions segmentaires de la colonne sans forcer sur les tissus en fin d'amplitude.[1, 10]

## Protocoles d'activation sp\xE9cifique et de potentiation

Une fois la temp\xE9rature augment\xE9e et la mobilit\xE9 restaur\xE9e, l'athl\xE8te doit "r\xE9veiller" les unit\xE9s motrices sp\xE9cifiques aux mouvements du jour. C'est ici qu'intervient la phase d'activation, parfois appel\xE9e potentiation post-activation (PAP).

### La m\xE9thode Wenning : L'\xE9chauffement comme outil de renforcement
Matt Wenning, expert en force athl\xE9tique, pr\xE9conise un protocole sp\xE9cifique pour augmenter la capacit\xE9 de travail g\xE9n\xE9rale (GPP) et corriger les d\xE9s\xE9quilibres musculaires d\xE8s l'\xE9chauffement.[11, 12] Sa m\xE9thode consiste \xE0 r\xE9aliser 4 s\xE9ries de 25 r\xE9p\xE9titions sur trois exercices accessoires, en circuit et avec un repos minimal.[13, 14]

| S\xE9ance cible | Exercice 1 (4x25) | Exercice 2 (4x25) | Exercice 3 (4x25) |
| :--- | :--- | :--- | :--- |
| **Squat / Deadlift** | Leg Curls (ischios) | Reverse Hyperextensions | Abdos (Poulie ou machine) [13, 14] |
| **Bench Press** | Triceps Pushdowns | Lat Pulldowns | Facepulls / Rear Delts [12, 15] |

L'utilisation de charges tr\xE8s l\xE9g\xE8res (RPE 3-4) permet de gorger les tendons et les muscles de sang, favorisant la lubrification articulaire sans induire de fatigue nerveuse avant les s\xE9ries lourdes.[12, 15] Ce volume accumul\xE9 sur le long terme contribue de mani\xE8re significative \xE0 l'hypertrophie des muscles stabilisateurs et \xE0 la pr\xE9vention des blessures.[12, 16]

### Les principes Kabuki Strength : Rooting, Bracing et stabilit\xE9
L'approche de Chris Duffin et de l'\xE9quipe Kabuki Strength met l'accent sur la hi\xE9rarchie du mouvement. Avant m\xEAme de toucher la barre, l'athl\xE8te doit ma\xEEtriser deux concepts fondamentaux : le "Rooting" et le "Bracing".[17, 18]
- **Le Bracing (gainage intra-abdominal)** : Contrairement \xE0 l'id\xE9e re\xE7ue de "rentrer le ventre", le bracing efficace implique une pression 360\xB0 dans la cavit\xE9 abdominale. L'athl\xE8te doit imaginer qu'il gonfle un cylindre qui stabilise la colonne lombaire sous tous les angles.[17, 19]
- **Le Rooting (ancrage au sol)** : Pour le squat et le soulev\xE9 de terre, le pied doit agir comme un tr\xE9pied actif. L'athl\xE8te doit \xE9carter les orteils et agripper le sol, cr\xE9ant une arche solide qui g\xE9n\xE8re une rotation externe au niveau des hanches, ancrant ainsi l'ensemble du corps.[17, 18]

Des exercices comme le "Dead Bug" (insecte mort) ou le "Bird-Dog", lorsqu'ils sont effectu\xE9s avec une intention maximale de gainage, permettent de pr\xE9parer le syst\xE8me nerveux \xE0 maintenir cette rigidit\xE9 sous des charges supramaximales.[17, 20]

## Strat\xE9gies de mont\xE9e en charge et standardisation technique

L'\xE9chauffement sp\xE9cifique \xE0 la barre est l'ultime \xE9tape de la pr\xE9paration. Elle ne sert pas seulement \xE0 ajuster la charge, mais \xE0 programmer le syst\xE8me nerveux pour le mouvement pr\xE9cis \xE0 venir.

### La gamme montante structur\xE9e
L'athl\xE8te doit toujours commencer par la barre \xE0 vide (20 kg), quel que soit son niveau de force.[1, 21] Cette \xE9tape permet de v\xE9rifier la trajectoire et le ressenti articulaire sans contrainte. La progression vers le poids de travail doit suivre des paliers logiques, souvent bas\xE9s sur des pourcentages de la charge finale pr\xE9vue pour la s\xE9ance.[2, 21]

| Palier de la gamme montante | R\xE9p\xE9titions | Intensit\xE9 relative | Objectif |
| :--- | :--- | :--- | :--- |
| **Barre \xE0 vide** | 2 x 10 | N/A | Calibrage technique et fluidit\xE9 [1, 21] |
| **30 - 40 % du Max** | 1 x 5 | Faible | Acc\xE9l\xE9ration et vitesse de barre [21] |
| **60 - 70 % du Max** | 1 x 3 | Mod\xE9r\xE9e | Pr\xE9paration nerveuse et placement [2] |
| **85 - 90 % du Max** | 1 x 1 | \xC9lev\xE9e | "Feeler set" pour valider l'\xE9tat du jour [21] |

Une r\xE8gle d'or en powerlifting est la standardisation des r\xE9p\xE9titions. Chaque r\xE9p\xE9tition \xE0 60 kg doit avoir exactement la m\xEAme intention de vitesse et la m\xEAme pr\xE9cision technique qu'une r\xE9p\xE9tition \xE0 200 kg.[21] Cette rigueur cr\xE9e une automatisation motrice qui r\xE9duit le risque d'erreur technique lors des tentatives de record.[21]

### Utilisation de la potentiation post-activation (PAP)
Pour les athl\xE8tes avanc\xE9s, l'int\xE9gration de mouvements explosifs juste avant les s\xE9ries de travail peut augmenter le recrutement des unit\xE9s motrices de haut seuil. Des sauts verticaux (Box Jumps) ou des lancers de medicine-ball (en arri\xE8re pour le deadlift, ou contre le sol pour le bench) peuvent stimuler le syst\xE8me neuromusculaire sans fatigue m\xE9tabolique.[1, 5]

## R\xE9cup\xE9ration post-s\xE9ance : La transition vers l'\xE9tat parasympathique

D\xE8s que la derni\xE8re s\xE9rie de travail est termin\xE9e, l'enjeu majeur est de faire basculer l'organisme du mode "sympathique" (stress, combat ou fuite) vers le mode "parasympathique" (repos, digestion, r\xE9paration).[22, 23] Une s\xE9ance de force athl\xE9tique laisse le syst\xE8me nerveux dans un \xE9tat de haute excitation qui, s'il n'est pas r\xE9gul\xE9, peut perturber le sommeil et la synth\xE8se prot\xE9ique.[3, 24]

### Respiration contr\xF4l\xE9e et modulation nerveuse
La respiration est l'unique fonction autonome que l'on peut contr\xF4ler consciemment pour influencer le syst\xE8me nerveux central.[23] Des exercices de respiration diaphragmatique lente sont essentiels imm\xE9diatement apr\xE8s l'effort.[22, 25]
- **Respiration diaphragmatique (ventrale)** : Allong\xE9 sur le dos, jambes sur\xE9lev\xE9es (position de d\xE9charge), inspirer par le nez en gonflant le ventre et expirer lentement par la bouche. Cela stimule le nerf vague, principal m\xE9diateur du syst\xE8me parasympathique.[22, 26]
- **Box Breathing (Respiration au carr\xE9)** : Inspirer sur 4 secondes, retenir son souffle 4 secondes, expirer sur 4 secondes, et rester poumons vides 4 secondes. Cette technique est utilis\xE9e pour r\xE9duire les niveaux de cortisol post-entra\xEEnement.[22, 25]
- **La m\xE9thode 4-7-8** : Inspirer sur 4 secondes, retenir 7 secondes, expirer sur 8 secondes. L'expiration prolong\xE9e est le signal le plus puissant pour ralentir le rythme cardiaque et induire la relaxation.[22, 26, 27]

### Nutrition post-entra\xEEnement : Fen\xEAtre d'opportunit\xE9 et macronutriments
Le concept de la "fen\xEAtre anabolique" de 30 minutes a \xE9t\xE9 nuanc\xE9 par la recherche moderne, mais le timing reste un levier de performance, surtout pour les athl\xE8tes avanc\xE9s.[28] L'objectif est double : stopper le catabolisme induit par l'exercice et amorcer la resynth\xE8se du glycog\xE8ne.[29, 30]

- **Prot\xE9ines** : Un apport de 20 \xE0 60 g de prot\xE9ines de haute qualit\xE9 (Whey, viande maigre, \u0153ufs) est recommand\xE9 dans les 2 \xE0 3 heures suivant la s\xE9ance pour maximiser la synth\xE8se prot\xE9ique musculaire.[28]
- **Glucides** : Ils sont cruciaux non seulement pour le glycog\xE8ne, mais aussi pour leur effet anti-catabolique via la s\xE9cr\xE9tion d'insuline. Un ratio de 1:1 ou 2:1 (glucides par rapport aux prot\xE9ines) est souvent optimal selon le volume de la s\xE9ance.[29, 30]
- **Hydratation et \xC9lectrolytes** : La perte de fluides et de min\xE9raux (sodium, magn\xE9sium) doit \xEAtre compens\xE9e pour maintenir les fonctions cellulaires et nerveuses. Une eau riche en bicarbonates ou l'ajout de sels marins au repas post-effort facilite la r\xE9hydratation.[30, 31]

| Composante nutritionnelle | Dosage sugg\xE9r\xE9 | Importance pour le powerlifter |
| :--- | :--- | :--- |
| **Prot\xE9ines** | 0.4 - 0.5 g/kg de poids de corps | R\xE9paration des micro-l\xE9sions et hypertrophie [28, 32] |
| **Glucides** | 0.8 - 1.2 g/kg de poids de corps | Restauration \xE9nerg\xE9tique et soutien du SNC [24, 29] |
| **Magn\xE9sium / ZMB** | 400 - 500 mg | Relaxation nerveuse et qualit\xE9 du sommeil [31, 32] |
| **Cr\xE9atine Monohydrate** | 3 - 5 g | Resynth\xE8se de l'ATP et hydratation cellulaire [4, 32] |

## Modalit\xE9s de r\xE9cup\xE9ration physique : Actives et Passives

Le powerlifter dispose d'une panoplie d'outils pour acc\xE9l\xE9rer l'\xE9vacuation des d\xE9chets m\xE9taboliques et r\xE9duire la douleur per\xE7ue.

### R\xE9cup\xE9ration active et flux sanguin
Le mouvement l\xE9ger favorise le drainage lymphatique sans ajouter de stress m\xE9canique suppl\xE9mentaire. La marche l\xE9g\xE8re ou le v\xE9lo stationnaire \xE0 basse intensit\xE9 (3-4 sur une \xE9chelle de 10) pendant 15 \xE0 20 minutes peut r\xE9duire les courbatures (DOMS).[3, 33] Le "Sled Dragging" (traction de tra\xEEneau) l\xE9ger est particuli\xE8rement appr\xE9ci\xE9 des powerlifters car il permet d'augmenter le flux sanguin dans les membres inf\xE9rieurs sans composante excentrique, \xE9vitant ainsi de nouveaux dommages musculaires.[11, 33]

### Hydroth\xE9rapie et Contrastes thermiques
Le recours aux variations de temp\xE9rature vise \xE0 moduler le tonus vasculaire.
- **Le Sauna** : Utilis\xE9 depuis longtemps dans les pays de l'Est, le sauna \xE0 80-90\xB0C favorise la circulation p\xE9riph\xE9rique et la relaxation mentale. Un protocole sovi\xE9tique sugg\xE8re des cycles de 10 minutes suivis de douches fra\xEEches pour stimuler le syst\xE8me nerveux autonome.[33]
- **Les douches contrast\xE9es** : Alterner 3 minutes d'eau chaude et 1 minute d'eau froide (pendant 3 \xE0 5 cycles) cr\xE9e un effet de pompage vasculaire efficace pour \xE9liminer les m\xE9tabolites.[8, 33]
- **L'immersion en eau froide (CWI)** : Si les bains de glace sont efficaces pour r\xE9duire l'inflammation et la douleur \xE0 court terme, ils peuvent \xEAtre contre-productifs s'ils sont utilis\xE9s syst\xE9matiquement apr\xE8s chaque s\xE9ance d'hypertrophie. La r\xE9duction excessive de l'inflammation peut en effet bloquer les signaux hormonaux et cellulaires (comme la voie mTOR) n\xE9cessaires \xE0 la croissance musculaire.[34, 35, 36] Son usage doit \xEAtre strat\xE9gique : en p\xE9riode de comp\xE9tition ou lors de microcycles de force pure o\xF9 la r\xE9cup\xE9ration imm\xE9diate est prioritaire sur l'adaptation structurelle.[35, 37]

### Th\xE9rapies par compression et EMS
L'utilisation de v\xEAtements de compression ou de bottes de compression pneumatique aide \xE0 r\xE9duire l'\u0153d\xE8me intramusculaire et facilite le retour veineux.[38, 39] Les recherches indiquent que la compression est particuli\xE8rement efficace pour restaurer la force et la puissance dans la fen\xEAtre des 24 \xE0 72 heures suivant un entra\xEEnement intense.[39, 40]
L'\xE9lectrostimulation (EMS), via des appareils comme le Compex, peut \xEAtre utilis\xE9e en mode "r\xE9cup\xE9ration active". Des impulsions de basse fr\xE9quence provoquent des contractions involontaires qui augmentent localement le flux sanguin et acc\xE9l\xE8rent l'\xE9limination du lactate, sans effort conscient de l'athl\xE8te.[33]

### Le sommeil : Le socle de la performance en force
Aucun suppl\xE9ment ni modalit\xE9 de massage ne peut remplacer les b\xE9n\xE9fices du sommeil. C'est durant le sommeil profond que l'organisme lib\xE8re l'essentiel de son hormone de croissance (GH) et de sa testost\xE9rone, et que le syst\xE8me nerveux central consolide les patterns moteurs.[3, 41]
Une dette de sommeil se traduit imm\xE9diatement par une baisse de la vigilance, une r\xE9duction de la force maximale volontaire et une augmentation du risque de blessure.[3] Pour le powerlifter, viser 7 \xE0 9 heures de sommeil de qualit\xE9 est un imp\xE9ratif non n\xE9gociable.[31, 41] Une routine pr\xE9-sommeil rigoureuse (obscurit\xE9 totale, temp\xE9rature fra\xEEche, absence de stimulants apr\xE8s 14h) est aussi cruciale que le programme d'entra\xEEnement lui-m\xEAme.[31, 41]

## Monitoring et gestion de la fatigue nerveuse (SNC)

L'un des d\xE9fis majeurs en powerlifting est que le muscle r\xE9cup\xE8re souvent plus vite que le syst\xE8me nerveux. Un athl\xE8te peut se sentir "frais" musculairement mais \xEAtre incapable d'approcher ses charges de travail habituelles car son cerveau n'arrive plus \xE0 recruter les fibres de mani\xE8re synchrone.[24, 42]

### Indicateurs de fatigue neurale
- **Variabilit\xE9 de la fr\xE9quence cardiaque (HRV)** : Un score HRV en baisse prolong\xE9e indique un syst\xE8me nerveux en \xE9tat de surmenage, n\xE9cessitant une r\xE9duction de l'intensit\xE9 ou du volume.[33]
- **Test de saut vertical / Long jump** : Une perte de performance significative au saut horizontal ou vertical avant la s\xE9ance est un signe fiable de fatigue du SNC.[33]
- **Le journal d'entra\xEEnement (RPE)** : Noter la difficult\xE9 per\xE7ue de chaque s\xE9rie permet de rep\xE9rer des tendances. Si des charges \xE0 RPE 7 d'habitude commencent \xE0 \xEAtre ressenties comme des RPE 9, le corps signale un besoin de d\xE9charge.[24, 31]

### La semaine de d\xE9chargement (Deload)
L'int\xE9gration cyclique d'une semaine de deload (toutes les 4 \xE0 8 semaines) est essentielle. Durant cette phase, on conserve g\xE9n\xE9ralement l'intensit\xE9 relative (le poids sur la barre) mais on r\xE9duit drastiquement le volume (nombre de s\xE9ries) de 30 \xE0 50 %.[24, 31] Cela permet \xE0 la fatigue syst\xE9mique de se dissiper tout en maintenant les acquis neuraux et la technique.[24]

## Conclusion et recommandations op\xE9rationnelles
L'excellence en powerlifting ne se joue pas uniquement sous la barre, mais dans la m\xE9ticulosit\xE9 des phases de transition. L'\xE9chauffement doit \xEAtre con\xE7u comme un syst\xE8me de potentiation progressif, allant du cardio g\xE9n\xE9ral \xE0 l'activation sp\xE9cifique des points faibles, en passant par une ma\xEEtrise rigoureuse de la pression intra-abdominale. Chaque r\xE9p\xE9tition effectu\xE9e doit l'\xEAtre avec une intention de perfection technique, transformant l'\xE9chauffement en une r\xE9p\xE9tition mentale du combat \xE0 venir.

En aval de la s\xE9ance, l'athl\xE8te doit devenir un expert en r\xE9gulation nerveuse. La bascule vers l'\xE9tat parasympathique par la respiration, le soutien nutritionnel imm\xE9diat et la priorit\xE9 absolue donn\xE9e au sommeil constituent les piliers de la long\xE9vit\xE9 dans ce sport. Si les technologies modernes (compression, EMS, sauna) offrent des avantages marginaux appr\xE9ciables, elles ne sont que des compl\xE9ments \xE0 une gestion intelligente de la fatigue et du stress global. Le powerlifter moderne est un athl\xE8te qui comprend que la force est autant une qualit\xE9 neurologique qu'une capacit\xE9 musculaire, et que sa pr\xE9servation passe par un respect scrupuleux des cycles biologiques de l'organisme.

*(Sources : Bibliographie compl\xE8te extraite de NotebookLM pour alimenter l'agent IA).*

## Sources
- The Ultimate Warm Up Guide to Improve Lifting Performance - Hunt ..., https://kylehuntfitness.com/the-ultimate-warm-up-guide-to-improve-lifting-performance/
- Best Warm-Up for Strength Training, Backed by Science - JEFIT, https://www.jefit.com/wp/general-fitness/best-warm-up-for-strength-training-backed-by-science/
- 6 Recovery Methods for Stress Management - EliteFTS, https://elitefts.com/blogs/rehab-recovery/effective-recovery
- The Impact of Nutrition on Your Weightlifting Performance, https://www.usaweightlifting.org/news/2024/february/08/the-impact-of-nutrition-on-your-weightlifting-performance
- How to Warm-Up for Powerlifting - Boostcamp, https://www.boostcamp.app/blogs/best-guide-to-warm-ups-for-powerlifting
- 12 essential warm-ups before weight lifting | FOI - Florida Orthopaedic Institute, https://www.floridaortho.com/news/12-essential-warm-ups-before-weight-lifting/
- Warm-Up - Squat University, https://squatuniversity.com/category/warm-up/
- Top Six Recovery Methods for Athletes - EliteFTS, https://elitefts.com/blogs/nutrition/top-six-recovery-methods-for-athletes
- Olympic Weightlifting Warm-Up Routine - Mathias Method Strength, https://mathiasmethod.com/warm-up-exercises/weightlifting-warm-up-routine/
- Her Squat Mobility Warm-Up Is GOLD! - YouTube, https://www.youtube.com/shorts/xu0ngRdXbzk
- How To WARM UP Like An Elite Powerlifter - YouTube, https://www.youtube.com/shorts/uWBs0GdGcic
- Matt Wenning's Conugate Training Secrets - Exodus Strength, https://www.exodus-strength.com/forum/viewtopic.php?t=1362
- Wenning Warm-up - Max Effort Squat or Deadlift | Boostcamp App, https://www.boostcamp.app/users/a0mahX-wenning-warm-up-max-effort-squat-or-deadlift
- conjugate - Wenning Strength, https://wenningstrength.com/wp-content/uploads/Conjugate-Strength-Training-for-Beginners_SAMPLEWEEK.pdf
- the manual - Wenning Strength, https://wenningstrength.com/wp-content/uploads/The_Comeback-Manual_SAMPLE.pdf
- Strength-Training-for-Beginners-SAMPLE.pdf - 1 www.wenningstrength.com, https://wenningstrength.com/wp-content/uploads/Strength-Training-for-Beginners-SAMPLE.pdf
- 3 Things I Learned At Kabuki Strength Movement Fundamentals Seminar - Ellis Elite Fitness, https://www.elliselitefit.com/blog/3-things-i-learned-at-kabuki-strength-movement-fundamentals-seminar
- Optimize Your Nervous System: Offset Load Warm-Up with Chris Duffin #functionaltraining, https://www.youtube.com/watch?v=j9ngPAB3JzM
- #Kabuki Movement #Philosophy | Principles of Loaded Movement Seminar - YouTube, https://www.youtube.com/watch?v=dpCCUd96c04
- World Champion Powerlifter's Deadlift Warm Up - YouTube, https://www.youtube.com/shorts/C7mH5DRE5Cw
- Le meilleur \xC9CHAUFFEMENT en POWERLIFTING - YouTube, https://www.youtube.com/watch?v=Rj5Yi-XWigA
- FAQs: Breathing for Post-Workout Recovery - Dupont Fitness, https://dupontfitness.ca/post/faqs-breathing-post-workout-recovery
- The Power of Breathwork for Recovery and Stress Management - Everyone Active, https://www.everyoneactive.com/content-hub/health/breathwork/
- Force musculaire : entre neurones et fibres, qui commande ? - LAROQ, https://www.laroq.com/2025/08/26/force-musculaire/
- The Role of Breathing Techniques in Strength Training Recovery - Speediance Europe, https://speediance.eu/en-fi/blogs/news/the-role-of-breathing-techniques-in-strength-training-recovery
- Deep Breathing & the Parasympathetic Nervous System: The Connection | Othership, https://www.othership.us/resources/deep-breathing-the-parasympathetic-nervous-system-the-connection
- The Effects of Slow Breathing during Inter-Set Recovery on Power Performance in the Barbell Back Squat - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC11307190/
- Does Eating Right After Lifting Make a Difference? \u2013 RP Strength, https://rpstrength.com/blogs/videos/does-eating-right-after-lifting-make-a-difference
- How to Build the Perfect Post-Workout Meal for Recovery - BarBend, https://barbend.com/news/perfect-post-workout-meal-for-recovery/
- Nutritional Strategies to Improve Post-exercise Recovery and Subsequent Exercise Performance: A Narrative Review - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12297025/
- Fatigue nerveuse et la musculation intensive : comment la r\xE9duire ..., https://www.aqeelab-nutrition.fr/blogs/nos-conseils/fatigue-nerveuse-et-la-musculation-intensive-comment-la-reduire
- Pratiquants de force, bienvenue - Nutrimuscle, https://www.nutrimuscle.com/pages/powerlift
- Monitoring and Maximizing Recovery | Juggernaut Training Systems, https://www.jtsstrength.com/monitoring-and-maximizing-recovery/
- Post-exercise cold water immersion attenuates acute anabolic signalling and long-term adaptations in muscle to strength training - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC4594298/
- Throwing cold water on muscle growth: A systematic review with meta\u2010analysis of the effects of postexercise cold water immersion on resistance training\u2010induced hypertrophy - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC11235606/
- The Impact of Post-Exercise Cold Water Immersion (CWI) on Resistance Training-Induced Muscle Hypertrophy: A Comprehensive Summary of the Meta-Analysis - Medium, https://medium.com/@RepsWithRoscoe/the-impact-of-post-exercise-cold-water-immersion-cwi-on-resistance-training-induced-muscle-453be57851e2
- Could Post-Workout Ice Baths Hinder Your Hypertrophy? - Men's Health, https://www.menshealth.com/uk/building-muscle/train-smarter/a46764921/cold-water-immersion-post-workout/
- Effects of combining cold exposure and compression on muscle recovery: a randomized crossover study - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12197928/
- The Complete Guide to Compression Therapy for Athletes - Pliability, https://pliability.com/stories/compression-therapy-for-athletes
- Effects of Compression Garments on Muscle Strength and Power Recovery Post-Exercise: A Systematic Review and Meta-Analysis - MDPI, https://www.mdpi.com/2075-1729/15/3/438
- The Holy Trinity of Recovery - EliteFTS, https://elitefts.com/blogs/rehab-recovery/holy-trinity-of-recovery
- La cl\xE9 du rendement en force athl\xE9tique et musculation : le syst\xE8me ..., https://www.powerliftingmag.fr/la-cle-du-rendement-en-force-athletique-et-musculation-le-systeme-nerveux/


--- POWERLIFTING-KNOWLEDGE-BASE.md ---

---
title: "Optimisation du Volume et Programmation des Exercices Accessoires (SBD)"
domain: "performance"
tags: ["powerlifting","sbd","volume","programming","periodization"]
source_type: "markdown"
---

# Base de Connaissances - Optimisation SBD & Volume (Powerlifting)

## Analyse Avanc\xE9e de l\u2019Optimisation du Volume et de la Programmation des Exercices Accessoires pour l\u2019Augmentation du Total SBD en Force Athl\xE9tique

La force athl\xE9tique, ou powerlifting, repose sur l'optimisation syst\xE9matique de trois mouvements fondamentaux : le Squat, le Bench Press et le Deadlift (SBD). L'augmentation du "Total", soit la somme des charges maximales soulev\xE9es sur une r\xE9p\xE9tition (1RM), ne r\xE9sulte pas uniquement d'un entra\xEEnement \xE0 haute intensit\xE9, mais d'une gestion rigoureuse du volume de travail sur le long terme.[1] Le volume, d\xE9fini comme la quantit\xE9 totale d'effort accompli, agit comme le stimulus principal pour l'hypertrophie fonctionnelle et l'adaptation neurologique.[2, 3] Cette approche scientifique vise \xE0 b\xE2tir une puissance fonctionnelle et un corps r\xE9silient capable de supporter des charges supra-maximales lors des comp\xE9titions.[1]

## Principes Physiologiques et M\xE9caniques du Volume d'Entra\xEEnement

Le volume d'entra\xEEnement est la variable la plus critique pour la progression en force athl\xE9tique, car il d\xE9termine l'ampleur de la r\xE9ponse anabolique et l'efficacit\xE9 du recrutement des unit\xE9s motrices.[3] Contrairement au bodybuilding classique qui privil\xE9gie souvent l'esth\xE9tique, le volume en powerlifting est orient\xE9 vers la performance brute et la densit\xE9 musculaire.[1] L'application du principe de surcharge progressive est essentielle : pour continuer \xE0 progresser, l'athl\xE8te doit augmenter r\xE9guli\xE8rement le tonnage total (s\xE9ries x r\xE9p\xE9titions x poids) ou le nombre de s\xE9ries effectives r\xE9alis\xE9es \xE0 une intensit\xE9 donn\xE9e.[4, 5]

## La Hi\xE9rarchie des Rep\xE8res de Volume (Landmarks)

La gestion du volume repose sur des concepts th\xE9oriques permettant de calibrer l'effort selon les capacit\xE9s de r\xE9cup\xE9ration de l'athl\xE8te. Ces rep\xE8res, identifi\xE9s comme les "Volume Landmarks", servent de cadre pour la planification des cycles d'entra\xEEnement.[6, 7, 8]

| Rep\xE8re de Volume | D\xE9finition et Fonction | Application Strat\xE9gique |
| :--- | :--- | :--- |
| **Maintenance Volume (MV)** | Quantit\xE9 n\xE9cessaire pour maintenir la masse musculaire et la force actuelles. | Utilis\xE9 lors des phases de sp\xE9cialisation ou de d\xE9charge (deload).[7] |
| **Minimum Effective Volume (MEV)** | Quantit\xE9 minimale d'entra\xEEnement requise pour observer un gain de force ou de masse. | Point de d\xE9part habituel d'un bloc d'accumulation.[7, 8] |
| **Maximum Adaptive Volume (MAV)** | Plage de volume o\xF9 l'athl\xE8te r\xE9alise ses progr\xE8s les plus rapides. | Zone cible durant la majeure partie du cycle de pr\xE9paration.[7] |
| **Maximum Recoverable Volume (MRV)** | Limite sup\xE9rieure d'entra\xEEnement dont un athl\xE8te peut r\xE9cup\xE9rer physiquement. | Atteint g\xE9n\xE9ralement \xE0 la fin d'un bloc de volume intense avant une d\xE9charge.[4, 7] |

Le passage du MEV au MRV au cours d'un cycle de formation (m\xE9socycle) permet de surcharger progressivement le syst\xE8me musculo-squelettique tout en g\xE9rant la fatigue cumulative.[4] Pour un athl\xE8te interm\xE9diaire, cela signifie souvent commencer un bloc avec environ 10 s\xE9ries par groupe musculaire par semaine et augmenter jusqu'\xE0 20 s\xE9ries ou plus si la r\xE9cup\xE9ration le permet.[4, 5]

## M\xE9canismes de l'Hypertrophie Fonctionnelle

L'augmentation du volume vise \xE0 d\xE9clencher l'hypertrophie des fibres de type II, qui poss\xE8dent le plus grand potentiel de production de force explosive.[2, 9] Le temps sous tension (TUT) est un param\xE8tre souvent n\xE9glig\xE9 mais crucial : pour l'hypertrophie, un TUT compris entre 30 et 60 secondes par s\xE9rie est conseill\xE9.[2] En powerlifting, cela se traduit g\xE9n\xE9ralement par des s\xE9ries de 6 \xE0 12 r\xE9p\xE9titions lors des phases d'accumulation, effectu\xE9es \xE0 une intensit\xE9 de 65% \xE0 80% du 1RM.[2, 10, 11] Cette base musculaire plus large permet ult\xE9rieurement d'optimiser les facteurs neurologiques pour exprimer la force maximale lors du bloc de r\xE9alisation.[10]

## Optimisation du Volume pour le Squat (S)

Le squat est un mouvement polyarticulaire complexe impliquant une triple flexion synchronis\xE9e des chevilles, des genoux et des hanches.[12] Pour augmenter le total SBD via le squat, le volume doit \xEAtre r\xE9parti entre le mouvement de comp\xE9tition et des variantes sp\xE9cifiques ciblant les maillons faibles de la cha\xEEne cin\xE9tique.[13, 14]

### Les Meilleures Variantes de Volume pour le Squat
Les exercices accessoires de volume sont choisis pour leur corr\xE9lation avec le mouvement principal et leur capacit\xE9 \xE0 renforcer les groupes musculaires de soutien sans g\xE9n\xE9rer une fatigue axiale excessive.[13]

- **Front Squat (Squat Avant)** : Cet exercice est consid\xE9r\xE9 comme le compl\xE9ment num\xE9ro un du back squat. Le placement de la barre sur les delto\xEFdes ant\xE9rieurs force une verticalit\xE9 du buste, sollicitant intens\xE9ment les quadriceps et la musculature du haut du dos (\xE9recteurs du rachis thoraciques).[13, 15, 16] Il am\xE9liore la stabilit\xE9 et la capacit\xE9 \xE0 rester droit sous des charges lourdes.[15] Un volume de 4 \xE0 5 s\xE9ries de 8 \xE0 10 r\xE9p\xE9titions est id\xE9al pour b\xE2tir cette r\xE9silience posturale.[13]
- **Pause Squat (Squat avec Pause)** : En marquant un arr\xEAt de 2 \xE0 3 secondes en bas du mouvement ("dans le trou"), l'athl\xE8te supprime l'\xE9nergie \xE9lastique et le r\xE9flexe d'\xE9tirement. Cela d\xE9veloppe la force r\xE9active et la capacit\xE9 \xE0 s'extraire de la position basse de mani\xE8re explosive.[13, 17] C'est un outil de volume technique puissant pour corriger les trajectoires instables.[13, 14]
- **Belt Squat (Squat \xE0 la Ceinture)** : Cette machine permet d'entra\xEEner les membres inf\xE9rieurs sans charger la colonne vert\xE9brale. C'est l'exercice de volume par excellence pour les athl\xE8tes souffrant de douleurs lombaires ou souhaitant accumuler du tonnage sur les quadriceps sans stresser davantage leur syst\xE8me nerveux central.[13] Des s\xE9ries de 12 \xE0 15, voire 20 r\xE9p\xE9titions, sont couramment programm\xE9es pour maximiser l'hypertrophie m\xE9tabolique.[13]
- **Bulgarian Split Squats (Squats Bulgares)** : Travail unilat\xE9ral essentiel pour r\xE9duire les d\xE9s\xE9quilibres entre les jambes. En renfor\xE7ant les muscles stabilisateurs de la hanche et du genou, cet exercice pr\xE9vient les blessures et assure une pouss\xE9e sym\xE9trique lors du squat bilat\xE9ral.[18, 19]

### Programmation du Volume selon les Points de Blocage au Squat
L'analyse de l'\xE9chec lors d'une charge maximale permet d'ajuster le volume vers les accessoires les plus rentables.[14, 19]

| Sympt\xF4me de Faiblesse | Cause Probable | Solution de Volume Accessoire |
| :--- | :--- | :--- |
| \xC9chec en bas du mouvement | Manque de force explosive ou quadriceps faibles. | Pause Squats, Pin Squats, High Bar Squats.[13, 14] |
| Le buste s'effondre vers l'avant | Haut du dos ou sangle abdominale instables. | Front Squats, Safety Bar Squat, Good Mornings.[13, 15] |
| Les genoux rentrent (valgus) | Faiblesse des fessiers ou d\xE9s\xE9quilibre unilat\xE9ral. | Bulgarian Split Squats, Wide Stance Leg Press, Banded Goblet Squats.[14, 18, 19] |

Pour soutenir ce volume, le travail du tronc (bracing) est indispensable. Des exercices comme le "Hanging Knee Raise" ou le "Ab Wheel Rollout" permettent de transf\xE9rer la force des membres inf\xE9rieurs vers la barre de mani\xE8re efficace en cr\xE9ant un bloc rigide.[18, 19, 20]

## Strat\xE9gies de Volume pour le Bench Press (B)

Le d\xE9velopp\xE9 couch\xE9 est souvent limit\xE9 par la masse musculaire des triceps, des pectoraux et des delto\xEFdes ant\xE9rieurs. En raison d'un recrutement musculaire moins massif que le squat ou le deadlift, le bench press peut g\xE9n\xE9ralement tol\xE9rer une fr\xE9quence d'entra\xEEnement plus \xE9lev\xE9e, souvent 3 \xE0 4 s\xE9ances par semaine.[21, 22]

### D\xE9veloppement des Groupes Musculaires Cl\xE9s
L'augmentation du volume au bench press repose sur l'alternance entre variations de la barre et travail d'isolation lourd.[22]

- **Close-Grip Bench Press (Prise Serr\xE9e)** : Cet exercice d\xE9place l'accent sur les triceps, cruciaux pour la phase de verrouillage (lockout) du mouvement.[22] C'est l'un des meilleurs exercices de volume pour augmenter la force brute de pouss\xE9e.[22, 23]
- **Incline Dumbbell Press (D\xE9velopp\xE9 Inclin\xE9 Halt\xE8res)** : En changeant l'angle d'attaque (30 \xE0 45 degr\xE9s), cet exercice cible le haut de la poitrine et les delto\xEFdes. L'utilisation d'halt\xE8res permet une amplitude de mouvement plus profonde que la barre, maximisant l'\xE9tirement et donc le stimulus hypertrophique.[22, 23]
- **Larsen Press** : En effectuant le d\xE9velopp\xE9 couch\xE9 avec les jambes tendues sans contact au sol, l'athl\xE8te supprime le "leg drive". Cela augmente la demande sur les muscles stabilisateurs du tronc et force les pectoraux \xE0 fournir l'int\xE9gralit\xE9 de l'effort, ce qui en fait un excellent exercice de volume pour la technique et la force pure.[21]
- **Dips (R\xE9pulsions)** : Souvent appel\xE9s le "squat du haut du corps", les dips lest\xE9s construisent une masse imposante dans les pectoraux, les triceps et les \xE9paules.[18, 22] Ils sont particuli\xE8rement efficaces pour les athl\xE8tes qui \xE9chouent au milieu de la remont\xE9e.[23, 24]

### Le R\xF4le de la Stabilit\xE9 du Dos et des \xC9paules
Une erreur commune consiste \xE0 n\xE9gliger les muscles de tirage. Pourtant, le grand dorsal (lats) joue un r\xF4le de stabilisation crucial lors de la descente de la barre et sert de plateforme de pouss\xE9e au d\xE9part de la poitrine.[18, 22]

- **Tractions et Tirages Verticaux** : Indispensables pour b\xE2tir l'\xE9paisseur du dos n\xE9cessaire \xE0 un setup solide.[18, 22]
- **Face Pulls** : Cruciaux pour la sant\xE9 de l'\xE9paule (delto\xEFdes post\xE9rieurs et rotateurs) face au volume massif de pouss\xE9e.[22, 24]
- **Barbell Rows (Tirage Buste Pench\xE9)** : Renforcent la capacit\xE9 \xE0 maintenir les omoplates serr\xE9es et ancr\xE9es dans le banc, un facteur d\xE9terminant pour r\xE9duire la distance parcourue par la barre.[22]

### Tableau des Rep\xE8res de Volume pour le Haut du Corps (Cible Force)

| Groupe Musculaire | MV (S\xE9ries/Semaine) | MEV (S\xE9ries/Semaine) | MRV (S\xE9ries/Semaine) | Reps recommand\xE9es |
| :--- | :--- | :--- | :--- | :--- |
| Pectoraux | 8 | 10 | 22+ | 8-12.[7] |
| Triceps | 4 | 6 | 18+ | 6-15 (press) / 10-20 (ext).[7] |
| Haut du Dos | 8 | 10 | 25+ | 6-20.[7] |
| Delto\xEFdes Ant\xE9rieurs | 0 | 0 | 12+ | 6-10.[7] |

Le volume des delto\xEFdes ant\xE9rieurs est souvent couvert par le bench press et le d\xE9velopp\xE9 militaire, d'o\xF9 un MEV de z\xE9ro pour un travail d'isolation sp\xE9cifique.[7]

## Renforcement du Soulev\xE9 de Terre (D) par le Volume

Le soulev\xE9 de terre est le test ultime de force globale mais il est aussi le mouvement le plus exigeant pour le syst\xE8me nerveux central (SNC).[1, 25] En raison de sa nature traumatisante, le volume de deadlift "comp\xE9tition" doit \xEAtre g\xE9r\xE9 avec parcimonie, souvent une seule s\xE9ance lourde par semaine, compl\xE9t\xE9e par des accessoires de volume \xE0 intensit\xE9 mod\xE9r\xE9e.[26, 27]

### La Domination de la Cha\xEEne Post\xE9rieure
Pour augmenter le total SBD via le deadlift, il faut construire des ischio-jambiers, des fessiers et un bas du dos d'acier.[27, 28]

- **Romanian Deadlift (RDL)** : C'est le standard d'or pour le volume du deadlift. En commen\xE7ant le mouvement debout et en descendant la barre jusqu'au milieu des tibias avec un \xE9tirement maximal des ischio-jambiers, on d\xE9veloppe une force excentrique et une masse musculaire consid\xE9rables.[25, 27, 28] Le RDL renforce \xE9galement la capacit\xE9 \xE0 maintenir un dos neutre sous tension.[15, 28]
- **Deficit Deadlift (Soulev\xE9 de Terre en D\xE9ficit)** : En se tenant sur une plateforme de 3 \xE0 10 cm, on augmente l'amplitude de mouvement. Cela force l'athl\xE8te \xE0 utiliser davantage ses jambes au d\xE9marrage, renfor\xE7ant le maillon faible de ceux qui ont du mal \xE0 d\xE9coller la barre du sol.[27, 29, 30]
- **Block Pulls (Tirages sur Blocs)** : \xC0 l'inverse du d\xE9ficit, on r\xE9duit l'amplitude pour se concentrer sur la partie m\xE9diane et finale du mouvement. Cela permet de manipuler des charges plus lourdes que le 1RM habituel pour renforcer le verrouillage et la poigne (grip).[25, 27, 29]
- **Good Mornings** : Cet exercice cible sp\xE9cifiquement la charni\xE8re de hanche. Il est redoutable pour b\xE2tir la force des \xE9recteurs du rachis et pr\xE9venir l'arrondissement du dos lors des tentatives de record.[13, 27, 29]

### Int\xE9gration de la Technique sous Volume
L'utilisation du Pause Deadlift (marquer une pause juste apr\xE8s le d\xE9collage ou sous les genoux) est cruciale pour corriger les trajectoires. Le volume r\xE9alis\xE9 sur cet exercice apprend \xE0 l'athl\xE8te \xE0 rester proche de la barre et \xE0 ne pas laisser les hanches monter trop vite ("stripper deadlift").[14, 16, 27, 30]

Pour les athl\xE8tes cherchant \xE0 accumuler du volume de jambes sans l'impact nerveux du deadlift conventionnel, le Trap Bar Deadlift est une option sup\xE9rieure. Sa g\xE9om\xE9trie permet une r\xE9partition plus \xE9quilibr\xE9e de la charge entre les hanches et les genoux, permettant des s\xE9ries de 10 \xE0 12 r\xE9p\xE9titions avec un risque de blessure r\xE9duit.[25, 27, 30]

## Programmation et P\xE9riodisation du Volume

L'augmentation du total SBD n\xE9cessite une structuration du temps en blocs d'entra\xEEnement distincts. Le mod\xE8le le plus efficace est la p\xE9riodisation par blocs, qui s\xE9pare les objectifs d'hypertrophie, de force et de pic de performance.[10, 31]

### Les Trois Phases de la P\xE9riodisation par Blocs

| Phase (Bloc) | Objectif Principal | Volume | Intensit\xE9 (% 1RM) | Exercices |
| :--- | :--- | :--- | :--- | :--- |
| **Accumulation** | Hypertrophie, capacit\xE9 de travail, correction des faiblesses. | \xC9lev\xE9 (MAV \xE0 MRV) | 55% - 75% | Beaucoup de variantes et accessoires.[10, 31, 32] |
| **Transmutation** | Conversion de la masse musculaire en force sp\xE9cifique. | Mod\xE9r\xE9 | 75% - 90% | Mouvements de comp\xE9tition et variantes proches.[10, 31, 32] |
| **R\xE9alisation (Peak)** | Maximisation de la performance (1RM), aff\xFBtage. | Faible (Taper) | 85% - 100% | Mouvements de comp\xE9tition uniquement.[10, 31, 32] |

Au cours du bloc d'accumulation, l'athl\xE8te peut utiliser des m\xE9thodes comme le 5/3/1 de Wendler combin\xE9 \xE0 des s\xE9ries de "Back-off" (s\xE9ries de volume apr\xE8s le travail lourd) ou la m\xE9thode MadCow 5x5 pour assurer une progression lin\xE9aire des charges.[3, 33, 34] L'important est de s'assurer que 80% du volume total provient des exercices accessoires et des variantes lors de cette phase pour b\xE2tir une fondation solide.[13]

### Gestion de l'Intensit\xE9 Subjective (RPE et RIR)
Le volume doit \xEAtre r\xE9gul\xE9 s\xE9ance apr\xE8s s\xE9ance pour \xE9viter le surentra\xEEnement. L'utilisation de l'\xE9chelle RPE (Rate of Perceived Exertion) permet de s'ajuster \xE0 l'\xE9tat de fatigue quotidien. Une s\xE9rie efficace de volume devrait g\xE9n\xE9ralement se terminer avec 1 \xE0 3 r\xE9p\xE9titions en r\xE9serve (RIR 1-3), ce qui correspond \xE0 un RPE de 7 \xE0 9.[11, 27, 35] Travailler syst\xE9matiquement \xE0 l'\xE9chec total (RPE 10) est contre-productif en powerlifting car cela d\xE9grade la technique et prolonge inutilement le temps de r\xE9cup\xE9ration.[9, 11]

### Gestion de la Fatigue et Strat\xE9gies de D\xE9charge (Deload)
Le volume est un moteur de progr\xE8s, mais il g\xE9n\xE8re une fatigue cumulative qui doit \xEAtre dissip\xE9e p\xE9riodiquement. La semaine de d\xE9charge (deload) est une r\xE9duction programm\xE9e du stress d'entra\xEEnement pour favoriser la surcompensation.[36, 37]

#### Modalit\xE9s de la D\xE9charge Scientifique
- **R\xE9duction du Volume** : Diminuer le nombre de s\xE9ries par s\xE9ance de 40% \xE0 60% par rapport \xE0 la semaine de MRV.[38, 39]
- **Maintien de l'Intensit\xE9** : Il est souvent conseill\xE9 de maintenir une intensit\xE9 relative \xE9lev\xE9e (environ 80-85% du 1RM) pour ne pas d\xE9sentra\xEEner le syst\xE8me nerveux, mais avec un volume tr\xE8s r\xE9duit (par exemple 2 s\xE9ries au lieu de 5).[36, 38]
- **\xC9limination des Accessoires** : Durant la semaine de d\xE9charge, on conserve les exercices de comp\xE9tition pour la technique mais on \xE9limine la plupart des exercices accessoires fatigants.[36, 38, 40]

Pour les athl\xE8tes confirm\xE9s, une d\xE9charge toutes les 4 semaines est standard. Pour les d\xE9butants, une d\xE9charge toutes les 8 \xE0 12 semaines peut suffire car les charges d\xE9plac\xE9es sont moins traumatisantes pour le SNC.[40]

## Nutrition et Suppl\xE9ments pour le Soutien du Volume

Un programme de haut volume n\xE9cessite un soutien nutritionnel ad\xE9quat pour la r\xE9paration des tissus et le r\xE9approvisionnement du glycog\xE8ne.[26, 41]

| Nutriment | Dose recommand\xE9e | R\xF4le dans la performance SBD |
| :--- | :--- | :--- |
| Prot\xE9ines | 1,6 - 2,2 g/kg PDC | Synth\xE8se prot\xE9ique, r\xE9paration des micro-l\xE9sions.[26] |
| Glucides | 4 - 7 g/kg PDC | Source d'\xE9nergie primaire, restauration du glycog\xE8ne.[26] |
| Lipides | 1 - 1,5 g/kg PDC | \xC9quilibre hormonal, absorption des vitamines.[26] |
| Hydratation | 35 - 45 ml/kg PDC | Performance neuromusculaire, thermor\xE9gulation.[26] |

L'apport calorique doit \xEAtre l\xE9g\xE8rement exc\xE9dentaire lors des phases d'accumulation de volume pour maximiser l'anabolisme. La suppl\xE9mentation en cr\xE9atine (5g/jour) est largement support\xE9e par la litt\xE9rature pour am\xE9liorer la capacit\xE9 de travail lors des s\xE9ries de r\xE9p\xE9titions moyennes \xE0 \xE9lev\xE9es.[42]

## Conclusion et Recommandations Pratiques
L'augmentation du total SBD est un voyage de longue haleine qui exige de placer le volume au centre de la strat\xE9gie d'entra\xEEnement. La route vers un 1RM sup\xE9rieur passe in\xE9vitablement par des milliers de r\xE9p\xE9titions effectu\xE9es sur des variantes intelligemment choisies.

**Recommandations finales :**
- **Priorit\xE9 Technique** : Le volume ne doit jamais se faire au d\xE9triment de la qualit\xE9 d'ex\xE9cution. Une r\xE9p\xE9tition "trich\xE9e" est une occasion perdue de renforcer le sch\xE9ma moteur correct.[1, 43]
- **Individualisation** : Identifiez vos points de blocage (faiblesse au d\xE9collage, au passage des genoux, au verrouillage) et allouez 60% de votre volume accessoire \xE0 ces zones sp\xE9cifiques.[3, 22, 27]
- **Patience et Constance** : La force se construit sur des mois et des ann\xE9es. Respectez les phases de d\xE9charge et les cycles de volume pour \xE9viter l'\xE9puisement et durer dans ce sport exigeant.[1, 26]

En int\xE9grant ces principes de volume et en s\xE9lectionnant les exercices accessoires les plus porteurs de transfert, l'athl\xE8te se donne les moyens de transformer son potentiel physique en une performance brute et mesurable sur le plateau de comp\xE9tition.

## Sources
- SBD musculation - Le guide force et technique | Avis - L'Atelier Gym, https://lateliergym.fr/definition-sbd-musculation/
- Les bases de la planification en musculation - CHUV, https://www.chuv.ch/fileadmin/sites/cms/documents/planificationmusculationfinal.pdf
- Le guide ultime de la programmation en powerlifting - Iron Bull Strength Canada, https://ca.ironbullstrength.com/fr/blogs/powerlifting/powerlifting-program
- Programming and Periodization For Hypertrophy | ft. Mike Israetel & Eric Helms : r/weightroom - Reddit, https://www.reddit.com/r/weightroom/comments/84fvbh/programming_and_periodization_for_hypertrophy_ft/
- Hypertrophy Training Volume: How Many Sets to Build Muscle? - Outlift, https://outlift.com/hypertrophy-training-volume/
- The Volume Roundtable feat. Mike Israetel, Eric Helms, Layne Norton, Greg Nuckols - The Jeff Nippard Podcast | Lyssna h\xE4r - Poddtoppen, https://poddtoppen.se/podcast/905054765/the-jeff-nippard-podcast/the-volume-roundtable-feat-mike-israetel-eric-helms-layne-norton-greg-nuckols
- Dr. Mike Israetel's Training Tips for Hypertrophy : r/weightroom - Reddit, https://www.reddit.com/r/weightroom/comments/6674a4/dr_mike_israetels_training_tips_for_hypertrophy/
- Has anybody implemented Dr. Mike Israetel's tips for Hypertrophy i.e. MV, MEV, MAV and MRV? : r/naturalbodybuilding - Reddit, https://www.reddit.com/r/naturalbodybuilding/comments/18p9a1z/has_anybody_implemented_dr_mike_israetels_tips/
- Hypertrophie : comment mieux appr\xE9hender le continuum de r\xE9p\xE9titions en musculation, https://www.valdemarne.fr/newsletters/sport-sante-et-preparation-physique/hypertrophie-comment-mieux-apprehender-le-continuum-de-repetitions-en-musculation
- P\xE9riodisation pour le Powerlifting - Montreal Powerhouse, https://www.montrealpowerhouse.com/fr/articles/periodisation-pour-le-powerlifting
- Comment param\xE9trer une s\xE9ance d'hypertrophie en musculation ? | Blog Sportifeo, https://www.sportifeo.com/blog/musculation/comment-parametrer-une-seance-dhypertrophie-en-musculation/
- LE SBD en pr\xE9paration physique (Squat Bench Deadlift) - We Are Athletic - WAATH, https://www.weareathletic.com/blog/le-sbd-en-preparation-physique-squat-bench-deadlift
- 5 Accessory Exercises for the Squat - Westside Barbell, https://www.westside-barbell.com/a/blog/wsbb-blog-5-accessory-exercises-for-the-squat
- Movement Tiers for Squat and Deadlift Weakness - EliteFTS, https://elitefts.com/blogs/motivation/movement-tiers-for-squat-and-deadlift-weakness
- The Most Important Accessory Exercises to Get Stronger in the SBD - Thor Athletics, https://thor-athletics.com/blogs/tips-information/the-most-important-accessory-exercises-to-get-stronger-in-the-sbd
- Les exercices accessoires les plus importants pour devenir plus fort dans le SBD, https://thorathletics.fr/blogs/conseils-informations/les-principaux-exercices-accessoires-pour-devenir-plus-fort-en-sbd
- The 9 Best Squat Accessory Lifts and How to Choose Yours -, https://characterstrength.co.uk/post/the-9-best-squat-accessory-lifts-and-how-to-choose-yours
- 10 Powerlifting Accessory Exercises | Mirafit, https://mirafit.co.uk/blog/10-powerlifting-accessory-exercises/
- The Best Accessory Lifts For A Bigger Squat | Juggernaut Training Systems, https://www.jtsstrength.com/best-accessory-lifts-bigger-squat/
- Les ASTUCES Squat, Bench, Deadlift que vous IGNOREZ - YouTube, https://www.youtube.com/watch?v=QTJ98vsZGzM
- Most useful bench variations? : r/powerlifting - Reddit, https://www.reddit.com/r/powerlifting/comments/1i023uf/most_useful_bench_variations/
- Best Accessory Exercises to Improve Your Bench Press \u2013 UPPPER ..., https://uppper.com/blogs/news/best-accessory-exercises-to-improve-your-bench-press
- Top 5 Accessory Exercises to Boost Your Bench Press - Muscle & Fitness, https://www.muscleandfitness.com/flexonline/training/top-5-supportive-exercises-boost-your-bench-press/
- 6 Best Accessory Exercises For Your Bench Press - Seriously Strong Training, https://seriouslystrongtraining.com/the-6-best-accessory-exercises-to-improve-your-bench-press/
- Starting Conjugate: Deadlift Accessory Exercises - Westside Barbell, https://www.westside-barbell.com/a/blog/starting-conjugate-deadlift-accessory-exercises
- SBD en Musculation : Qu'est-ce que c'est ? - Unistrength, https://unistrength.fr/fr/nos-conseils-sbd-squat-bench-et-deadlift.htm?srsltid=AfmBOoo5ZoDEic96f_A2asAWhIHRfNyI9gDrPrwWGSsjSASK9KCU4Ty0
- 8 Best Deadlift Accessory Exercises for Max Pulling Strength | Legion, https://legionathletics.com/deadlift-accessory-exercises/
- The 6 Best Accessory Exercises for The Conventional Deadlift - Seriously Strong Training, https://seriouslystrongtraining.com/the-6-best-accessory-exercises-for-the-conventional-deadlift/
- The 15 Best Deadlift Accessory Exercises for a More Powerful Pull | BarBend, https://barbend.com/best-deadlift-accessory-exercises/
- 16 Best Deadlift Variations to Build Strength | Garage Gym Reviews, https://www.garagegymreviews.com/deadlift-variations
- Block Periodization: Definition, Types, Uses, and Examples - Hevy Coach, https://hevycoach.com/glossary/block-periodization/
- A Practical Guide for Implementing Block Periodization for Powerlifting - EliteFTS, https://elitefts.com/blogs/motivation/a-practical-guide-for-implementing-block-periodization-for-powerlifting
- PowerliftingMag \u2013 Communaut\xE9 force athl\xE9tique et powerlifting, entra\xEEnements force, programmes force, nutrition \u2013 programmes force, force athl\xE9tique, musculation, powerlifting, exercices, musculation ,entra\xEEnements, nutrition, https://www.powerliftingmag.fr/
- Programme de musculation Wendler pour la force : avis ..., https://www.superphysique.org/articles/4272
- Managing Fatigue in Powerlifting, https://precisionpowerlifting.com/2020/02/18/managing-fatigue-in-powerlifting/
- A Practical Approach to Deloading: Recommendations and Considerations for Strength and Physique Sports, https://shura.shu.ac.uk/35313/3/Bell-APracticalApproach%28AM%29.pdf
- Integrating Deloading into Strength and Physique Sports Training Programmes: An International Delphi Consensus Approach - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC10511399/
- A Practical Approach to Deloading: Recommendations and Considerations for Strength and Physique Sports - DORAS | DCU Research Repository, https://doras.dcu.ie/31501/1/a_practical_approach_to_deloading__recommendations.203%282%29.pdf
- Deloading Practices in Strength and Physique Sports: A Cross-sectional Survey - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC10948666/
- L'organisation de l'entrainement : la p\xE9riodisation (I ..., https://www.powerliftingmag.fr/lorganisation-de-lentrainement-la-periodisation/
- Entra\xEEnement d'hypertrophie : comment d\xE9velopper ses muscles et renforcer son corps, https://sportplus.de/fr-fr/blogs/conseils/hypertrophietraining
- The Top 3 Powerlifting Exercises: Squat, Bench Press, And Deadlift - Generation Iron, https://generationiron.com/top-3-powerlifting-exercises/
- Tous les aspects de la musculation d\xE9voil\xE9s. - QNT, https://www.qntsport.com/blogs/news/la-musculation



--- PROGRAMMING-66KG-KNOWLEDGE-BASE.md ---

---
title: "Programmation pour l'Athl\xE8te de 66 kg en Force Athl\xE9tique"
domain: "performance"
tags: ["66kg","programming","biomechanics","peaking","nutrition"]
source_type: "markdown"
---

# Base de Connaissances - Programmation Sp\xE9cifique (Athl\xE8te 66 kg)

## Analyse Scientifique et Ing\xE9nierie de la Performance en Force Athl\xE9tique : Rapport Global de Programmation pour l'Athl\xE8te de 66 kg

La force athl\xE9tique, discipline de force pure structur\xE9e autour du squat, du d\xE9velopp\xE9 couch\xE9 et du soulev\xE9 de terre, repr\xE9sente un d\xE9fi complexe d'ing\xE9nierie humaine o\xF9 la performance est dict\xE9e par l'interaction entre la biom\xE9canique, la neurologie et la physiologie m\xE9tabolique.[1] Pour un athl\xE8te masculin de 20 ans pesant 66 kg, le d\xE9veloppement d'un programme d'entra\xEEnement ne peut se limiter \xE0 une simple prescription de charges. Il s'agit de concevoir un syst\xE8me adaptatif capable de maximiser la force relative \u2014 le ratio entre la charge soulev\xE9e et la masse corporelle \u2014 tout en naviguant dans les contraintes sp\xE9cifiques des cat\xE9gories de poids l\xE9g\xE8res et les avantages hormonaux de la jeunesse.[2, 3] \xC0 20 ans, l'athl\xE8te se situe dans une fen\xEAtre biologique optimale, caract\xE9ris\xE9e par une plasticit\xE9 neuronale \xE9lev\xE9e et une capacit\xE9 de r\xE9cup\xE9ration sup\xE9rieure, permettant une fr\xE9quence d'entra\xEEnement plus \xE9lev\xE9e et une adaptation plus rapide aux stimuli de charge.[2, 4]

## Fondements Biom\xE9caniques et Optimisation des Leviers

La performance en force athl\xE9tique repose sur la capacit\xE9 de l'athl\xE8te \xE0 minimiser les bras de levier (moment arms) pour r\xE9duire le travail n\xE9cessaire \xE0 la mont\xE9e d'une charge donn\xE9e.[5] Le travail physique est d\xE9fini par le produit de la force et de la distance (W=F\xD7d). En r\xE9duisant la distance parcourue par la barre ou en optimisant l'alignement des articulations par rapport \xE0 la ligne d'action de la gravit\xE9, l'athl\xE8te augmente m\xE9caniquement son efficacit\xE9.[5] La gravit\xE9 agissant de mani\xE8re perpendiculaire \xE0 la surface terrestre, toute d\xE9viation horizontale de la barre repr\xE9sente une perte d'\xE9nergie cin\xE9tique et une augmentation du stress sur les structures de stabilisation.[5]

### La Physique du Squat : Leviers et Proportions
Le squat est une interaction complexe entre le segment f\xE9moral, le segment tibial et le torse. Pour un athl\xE8te de 66 kg, les proportions anthropom\xE9triques dictent souvent la technique optimale. Les individus dot\xE9s de f\xE9murs courts par rapport \xE0 leur torse ont tendance \xE0 maintenir une posture plus verticale, favorisant une sollicitation accrue des quadriceps.[6, 7] \xC0 l'inverse, des f\xE9murs longs imposent une inclinaison plus prononc\xE9e du buste pour maintenir le centre de gravit\xE9 au-dessus du milieu du pied, d\xE9pla\xE7ant la charge vers la cha\xEEne post\xE9rieure (fessiers et \xE9recteurs du rachis).[7, 8]

| Type de Squat | Position de la Barre | Leviers M\xE9caniques | Dominance Musculaire |
| :--- | :--- | :--- | :--- |
| **Barre Haute (High Bar)** | Haut des trap\xE8zes | Bras de levier de hanche r\xE9duit, bras de genou augment\xE9 | Quadriceps |
| **Barre Basse (Low Bar)** | Delto\xEFdes post\xE9rieurs | Bras de levier de hanche augment\xE9, bras de genou r\xE9duit | Cha\xEEne post\xE9rieure |
| **Squat Gobelet / Front** | Devant le buste | Verticalit\xE9 maximale, stress lombaire minimal | Quadriceps / Sangle abdominale |

La notion de "mid-foot balance" est le pilier de la stabilit\xE9. Le corps humain trouve son \xE9quilibre naturel directement au-dessus du milieu du pied, point o\xF9 la force n\xE9cessaire pour perturber l'\xE9quilibre vers l'avant ou l'arri\xE8re est maximale.[5] Une d\xE9rive vers les talons ou les orteils force le syst\xE8me nerveux \xE0 recruter des muscles stabilisateurs de mani\xE8re isom\xE9trique, r\xE9duisant ainsi la puissance disponible pour l'extension concentrique.[5]

### L'Architecture du D\xE9velopp\xE9 Couch\xE9 sous les Nouvelles R\xE9glementations
Le d\xE9velopp\xE9 couch\xE9 a subi des mutations r\xE9glementaires majeures sous l'\xE9gide de l'IPF (International Powerlifting Federation). Depuis 2023, les r\xE8gles imposent une profondeur minimale o\xF9 le dessous de l'articulation du coude doit atteindre ou d\xE9passer le niveau de la partie sup\xE9rieure de l'articulation de l'\xE9paule.[9, 10] Cette r\xE8gle vise \xE0 limiter les arches excessives qui r\xE9duisaient l'amplitude de mouvement (ROM) \xE0 quelques centim\xE8tres chez les athl\xE8tes les plus flexibles.[11]

Pour un athl\xE8te de 66 kg, souvent plus souple que les cat\xE9gories lourdes, l'arche reste un outil de stabilit\xE9 crucial. Elle permet de r\xE9tracter et d'abaisser les omoplates, cr\xE9ant une plateforme de pouss\xE9e rigide et prot\xE9geant la coiffe des rotateurs.[11] Le "leg drive" \u2014 l'utilisation des membres inf\xE9rieurs pour g\xE9n\xE9rer une tension horizontale vers le haut du banc \u2014 est indispensable pour transformer le corps en une unit\xE9 cin\xE9tique solide, emp\xEAchant toute fuite de force lors de la phase de transition.[12, 13]

### Analyse Comparative du Soulev\xE9 de Terre : Sumo vs Conventionnel
Le choix entre le soulev\xE9 de terre conventionnel et le style sumo est souvent dict\xE9 par la structure de la hanche (profondeur de l'ac\xE9tabulum) et la longueur relative des bras.[8, 14] Dans la cat\xE9gorie des 66 kg, le style sumo est pr\xE9dominant en raison de la r\xE9duction de la distance verticale parcourue par la barre et d'une position de d\xE9part permettant un torse plus vertical, ce qui r\xE9duit le moment de force sur les vert\xE8bres lombaires.[15, 16]

| Param\xE8tre | Soulev\xE9 Conventionnel | Soulev\xE9 Sumo |
| :--- | :--- | :--- |
| **Position des pieds** | Largeur des hanches | Large (proche des disques) |
| **Position des mains** | Ext\xE9rieur des genoux | Int\xE9rieur des genoux |
| **Charge Lombaire** | \xC9lev\xE9e (bras de levier long) | R\xE9duite (torse vertical) |
| **Activation Musculaire** | Ischio-jambiers, \xE9recteurs, fessiers | Quads, adducteurs, fessiers |
| **Distance de Tirage** | Maximale | R\xE9duite de 10 \xE0 25% |

Cependant, le style sumo demande une mobilit\xE9 de hanche exceptionnelle et une force d'adducteurs sup\xE9rieure.[8, 15] L'utilisation de barres de soulev\xE9 de terre sp\xE9cifiques (deadlift bars), plus flexibles, tend \xE0 avantager le style sumo en permettant \xE0 l'athl\xE8te de "tirer le slack" (tension initiale) plus efficacement, d\xE9collant la charge alors que les disques sont encore partiellement au sol.[14, 15]

## Programmation de la Force : M\xE9thodologies et P\xE9riodisation

La programmation pour un athl\xE8te de 20 ans doit \xE9quilibrer la n\xE9cessit\xE9 de volume pour l'hypertrophie et l'intensit\xE9 pour les adaptations neurologiques.[17, 18] Le principe de surcharge progressive est le moteur de l'adaptation : le stimulus doit cro\xEEtre en amplitude ou en densit\xE9 pour forcer le syst\xE8me biologique \xE0 surcompenser.[19]

### La Progression Lin\xE9aire pour D\xE9butants (Starting Strength)
Pour un athl\xE8te de 66 kg d\xE9butant ou reprenant une base s\xE9rieuse, le mod\xE8le de progression lin\xE9aire reste le plus efficace. Il repose sur l'ajout syst\xE9matique de charge \xE0 chaque s\xE9ance, exploitant la capacit\xE9 de r\xE9cup\xE9ration rapide des jeunes athl\xE8tes.[20, 21]

| S\xE9ance | Exercice 1 | Exercice 2 | Exercice 3 |
| :--- | :--- | :--- | :--- |
| **Jour A** | Squat 3x5 | Bench Press 3x5 | Deadlift 1x5 |
| **Jour B** | Squat 3x5 | Overhead Press 3x5 | Power Clean 5x3 ou Rowing 3x5 |

Le programme alterne entre les jours A et B trois fois par semaine (Lundi, Mercredi, Vendredi). L'objectif est d'atteindre des ratios de force significatifs par rapport au poids de corps (PDC) : 1,6x PDC au squat et 2x PDC au soulev\xE9 de terre avant de transiter vers des mod\xE8les interm\xE9diaires.[20]

### Mod\xE8les Interm\xE9diaires : Texas Method et HLM
Lorsque la progression lin\xE9aire s\xE9ance par s\xE9ance devient impossible en raison de l'accumulation de fatigue syst\xE9mique, l'athl\xE8te doit passer \xE0 une p\xE9riodisation hebdomadaire.[21]
- **Texas Method** : Structure la semaine autour d'un jour de Volume (5x5 \xE0 90% du 5RM), d'un jour de R\xE9cup\xE9ration (2x5 l\xE9ger) et d'un jour d'Intensit\xE9 (tentative de nouveau record sur 1 \xE0 5 reps).[21]
- **HLM (High, Low, Medium)** : R\xE9partit la charge de travail en variant l'intensit\xE9 et le volume pour chaque mouvement principal sur trois jours, permettant une gestion plus fine de la fatigue nerveuse.[21]

### Le Syst\xE8me Candito 6-Semaines
Le programme d\xE9velopp\xE9 par Jonnie Candito est particuli\xE8rement populaire chez les lifters de cat\xE9gories l\xE9g\xE8res car il int\xE8gre une phase d'hypertrophie sp\xE9cifique avant de monter vers la force maximale.[22, 23]

| Semaine | Phase | Focus |
| :--- | :--- | :--- |
| **Semaine 1** | Conditionnement Musculaire | Volume \xE9lev\xE9, temps de repos courts |
| **Semaine 2** | Hypertrophie | Travail \xE0 80% 1RM, accessoires \xE9lev\xE9s |
| **Semaine 3** | Puissance Lin\xE9aire | S\xE9ries lourdes, r\xE9duction des accessoires |
| **Semaine 4** | Acclimatation Lourde | Intensit\xE9 > 90%, focus technique |
| **Semaine 5** | Force Maximale | Test de r\xE9p\xE9titions au seuil maximal |
| **Semaine 6** | D\xE9charge ou Test | Pr\xE9paration \xE0 la comp\xE9tition |

Ce mod\xE8le est efficace car il respecte la sp\xE9cificit\xE9 du powerlifting en gardant des charges proches de 80% m\xEAme en phase d'hypertrophie, \xE9vitant ainsi la d\xE9sadaptation neurologique.[23]

### La M\xE9thode 5/3/1 de Jim Wendler
Pour une progression \xE0 long terme, le syst\xE8me 5/3/1 offre une structure bas\xE9e sur le "Training Max" (90% du 1RM r\xE9el), ce qui r\xE9duit le risque de blessure et d'\xE9puisement.[24, 25] Chaque cycle dure 4 semaines et suit une progression de pourcentages pr\xE9cise.

| Semaine | Set 1 | Set 2 | Set 3 (AMRAP) |
| :--- | :--- | :--- | :--- |
| **Semaine 1** | 65% x 5 | 75% x 5 | 85% x 5+ |
| **Semaine 2** | 70% x 3 | 80% x 3 | 90% x 3+ |
| **Semaine 3** | 75% x 5 | 85% x 3 | 95% x 1+ |
| **Semaine 4** | 40% x 5 | 50% x 5 | 60% x 5 (D\xE9charge) |

Le set "AMRAP" (As Many Reps As Possible) est le c\u0153ur du syst\xE8me, permettant d'exprimer la force actuelle sans avoir \xE0 tester un 1RM maximal chaque semaine.[24, 25]

## Science de l'Effort et Autor\xE9gulation

L'autor\xE9gulation est la capacit\xE9 de l'athl\xE8te \xE0 ajuster sa charge de travail en fonction de sa pr\xE9paration physiologique du jour.[26, 27] Le stress externe (\xE9tudes, sommeil, nutrition) impacte directement la performance neurologique.

### RPE et RIR : Le Langage de l'Intensit\xE9
Le syst\xE8me RPE (Rate of Perceived Exertion) bas\xE9 sur les r\xE9p\xE9titions en r\xE9serve (RIR) a \xE9t\xE9 standardis\xE9 pour le powerlifting par Mike Tuchscherer.[26, 27] Un RPE 10 signifie qu'aucune r\xE9p\xE9tition suppl\xE9mentaire n'\xE9tait possible. Un RPE 9 signifie qu'une r\xE9p\xE9tition restait "dans le r\xE9servoir".

L'utilisation de l'e1RM (Estimated 1-Rep Max) permet de suivre la progression sans les risques inh\xE9rents aux tests maximaux fr\xE9quents.[26, 28] La formule de Brzycki ou d'Epley est int\xE9gr\xE9e dans les calculateurs pour transformer une performance de s\xE9rie en une estimation du potentiel maximal.[29, 30]

### Physiologie de la Contraction et Fatigue
La force produite par le muscle squelettique d\xE9pend du recrutement des unit\xE9s motrices et de la fr\xE9quence de stimulation (rate coding).[31] Lors d'un effort de powerlifting (g\xE9n\xE9ralement > 85% 1RM), presque toutes les unit\xE9s motrices sont recrut\xE9es d\xE8s la premi\xE8re r\xE9p\xE9tition.[31] La fatigue se manifeste par une diminution de la vitesse de contraction et une perte de capacit\xE9 de production de force, souvent li\xE9e \xE0 des facteurs centraux (cerveau/moelle \xE9pini\xE8re) et p\xE9riph\xE9riques (accumulation de m\xE9tabolites dans le muscle).[31]

## Ing\xE9nierie Nutritionnelle pour la Cat\xE9gorie 66 kg

Pour un athl\xE8te de 66 kg, la nutrition est un levier de performance aussi critique que l'entra\xEEnement lui-m\xEAme. L'objectif est de maximiser la force tout en restant dans les limites de la cat\xE9gorie de poids, ou de construire une base solide avant une \xE9ventuelle mont\xE9e en cat\xE9gorie.[32]

### Calcul du M\xE9tabolisme et Surplus Contr\xF4l\xE9
La formule de Katch-McArdle est privil\xE9gi\xE9e car elle utilise la masse maigre pour pr\xE9dire les besoins \xE9nerg\xE9tiques.[32]
\`BMR = 370 + (21,6 \xD7 Masse Maigre [kg])\`

Pour un athl\xE8te de 66 kg avec 10% de masse grasse (59,4 kg de masse maigre), le BMR est d'environ 1653 kcal. Avec un facteur d'activit\xE9 de 1,5, la maintenance s'\xE9tablit \xE0 environ 2480 kcal. Un surplus mod\xE9r\xE9 de 100 \xE0 200 calories est suffisant pour soutenir l'anabolisme sans gain de tissu adipeux excessif.[32]

### Macronutriments et Synth\xE8se Prot\xE9ique

| Nutriment | Recommandation | Justification Scientifique |
| :--- | :--- | :--- |
| **Prot\xE9ines** | 1,8 \xE0 2,2 g/kg | Maximisation de la synth\xE8se prot\xE9ique et r\xE9paration des micro-l\xE9sions.[33, 34] |
| **Glucides** | 5 \xE0 10 g/kg | Restauration du glycog\xE8ne, \xE9nergie pour les s\xE9ances de haute intensit\xE9.[32, 35] |
| **Lipides** | 0,6 \xE0 1,0 g/kg | Sant\xE9 hormonale, absorption des vitamines liposolubles.[34] |

Le concept de "Leucine Pulse" sugg\xE8re que la synth\xE8se prot\xE9ique musculaire est optimis\xE9e par des repas contenant 3 \xE0 5 g de leucine (environ 30-50 g de prot\xE9ines compl\xE8tes) espac\xE9s de 4 \xE0 6 heures.[34] Pour un athl\xE8te de 66 kg, cela signifie diviser l'apport prot\xE9ique total (environ 130-145 g) en 4 ou 5 repas strat\xE9giques.[34]

### Micronutrition et Suppl\xE9ments
L'alimentation doit \xEAtre riche en micronutriments pour soutenir la densit\xE9 osseuse, accrue par les charges lourdes.[2] Les suppl\xE9ments \xE0 l'efficacit\xE9 prouv\xE9e incluent la cr\xE9atine monohydrate pour la r\xE9g\xE9n\xE9ration de l'ATP, la b\xEAta-alanine pour l'endurance musculaire sur des s\xE9ries plus longues, et la caf\xE9ine pour l'activation du syst\xE8me nerveux.[35]

## Strat\xE9gies de R\xE9cup\xE9ration et de Mobilit\xE9

La r\xE9cup\xE9ration est le processus par lequel le stimulus de l'entra\xEEnement devient un gain de force. Elle n'est pas passive mais activement g\xE9r\xE9e.

### Sommeil et Variabilit\xE9 de la Fr\xE9quence Cardiaque
Le sommeil est le principal moteur de la r\xE9cup\xE9ration hormonale et neurologique. Un manque de sommeil r\xE9duit la tol\xE9rance \xE0 la charge et augmente la perception de l'effort (RPE).[32] Le suivi de la VRC (Variabilit\xE9 de la Fr\xE9quence Cardiaque) permet de d\xE9tecter un \xE9tat de surmenage avant l'apparition des sympt\xF4mes cliniques, guidant ainsi l'athl\xE8te vers une journ\xE9e de d\xE9charge si n\xE9cessaire.[32]

### Protocoles de Mobilit\xE9 : Limber 11 et Agile 8
Une mobilit\xE9 ad\xE9quate est n\xE9cessaire pour atteindre les standards de comp\xE9tition (profondeur du squat, verrouillage du soulev\xE9 de terre).[3] La routine "Limber 11" de Joe DeFranco est con\xE7ue pour lib\xE9rer les hanches et r\xE9duire les tensions lombaires en moins de 15 minutes.[36, 37]
- **SMR (Self-Myofascial Release)** : Utilisation d'une balle de lacrosse pour les fessiers et d'un rouleau pour les adducteurs et la bandelette ilio-tibiale.[36, 38]
- **Mouvements Dynamiques** : "Iron Cross" pour la mobilit\xE9 thoracique, "Rocking Frog Stretch" pour les adducteurs, et "Cossack Squats" pour la mobilit\xE9 frontale de la hanche.[37, 38]
- **\xC9tirement du Psoas** : Le "Rear-foot-elevated hip flexor stretch" est crucial pour contrer la raideur induite par les positions de squat et de soulev\xE9 de terre.[38, 39]

## \xC9quipement et Technologie de Performance

L'\xE9quipement en powerlifting sert \xE0 la fois de protection et de multiplicateur de force par l'augmentation de la stabilit\xE9.
- **Ceinture (Powerlifting Belt)** : Une ceinture de 10 mm ou 13 mm d'\xE9paisseur constante (4 pouces de large) est l'outil le plus puissant pour augmenter la pression intra-abdominale.[40, 41] Elle permet de lever entre 5 et 15% de poids suppl\xE9mentaire en stabilisant la colonne vert\xE9brale.[40, 42]
- **Chaussures de Squat** : Les chaussures \xE0 talon rigide (ex: Nike Romaleos ou Adidas Powerlift) am\xE9liorent la g\xE9om\xE9trie du squat pour les athl\xE8tes ayant une mobilit\xE9 de cheville limit\xE9e.[40, 41]
- **Genouill\xE8res (Knee Sleeves)** : Les mod\xE8les en n\xE9opr\xE8ne de 7 mm (ex: SBD) maintiennent l'articulation au chaud et offrent un support proprioceptif important lors de l'inversion du mouvement au fond du squat.[40, 43]
- **Magn\xE9sie (Chalk)** : Essentielle pour le soulev\xE9 de terre afin de neutraliser l'humidit\xE9 des mains et assurer une prise solide, particuli\xE8rement lors de l'utilisation du "Hook Grip" ou de la prise mixte.[43, 44]

## Analyse des Points de Blocage et Travail Accessoire

Un programme d'expert doit inclure des exercices correctifs bas\xE9s sur la localisation de l'\xE9chec lors d'une barre maximale.[45, 46]

### Le Squat
- **\xC9chec au fond** : Souvent li\xE9 \xE0 un manque d'explosivit\xE9 ou une faiblesse des quadriceps. Solution : Squats avec pause, Squats avec cha\xEEnes ou bandes.[45, 46]
- **Le buste tombe en avant** : Indique des \xE9recteurs du rachis ou des fessiers insuffisants. Solution : Good Mornings, Back Extensions, Front Squats.[45, 47]

### Le D\xE9velopp\xE9 Couch\xE9
- **\xC9chec sur la poitrine** : Faiblesse des pectoraux et des delto\xEFdes ant\xE9rieurs. Solution : D\xE9velopp\xE9 couch\xE9 avec pause longue (3-5 sec), Spoto Press.[45, 46]
- **\xC9chec au verrouillage** : Faiblesse des triceps. Solution : Close Grip Bench Press, Floor Press, Board Press.[45, 47]

### Le Soulev\xE9 de Terre
- **\xC9chec au d\xE9collage** : Manque de force dans les jambes ou mauvaise position de d\xE9part. Solution : Soulev\xE9 de terre en d\xE9ficit (sur un disque), Speed Deadlifts.[45, 48]
- **\xC9chec au genou/verrouillage** : Faiblesse des fessiers ou du haut du dos (la barre s'\xE9loigne du corps). Solution : Rack Pulls, Romanian Deadlifts (RDL), Barbell Shrugs.[47, 48]

## Pr\xE9paration \xE0 la Comp\xE9tition et Peaking

La phase finale d'un programme est le "Peaking", o\xF9 l'athl\xE8te r\xE9duit le volume pour dissiper la fatigue tout en maintenant l'intensit\xE9 pour exprimer sa force maximale le jour J.[49]

### La Semaine de Test du 1RM
Le test doit suivre un protocole rigoureux pour garantir la s\xE9curit\xE9 et la pr\xE9cision des donn\xE9es.[3, 50]
- **Mont\xE9e en charge** : S\xE9ries l\xE9g\xE8res pour chauffer, suivies de singles \xE0 70%, 80%, 90% du 1RM estim\xE9.[50]
- **Premi\xE8re tentative (Opener)** : Une charge que l'athl\xE8te peut r\xE9ussir pour 3 r\xE9p\xE9titions m\xEAme dans un mauvais jour (environ 90-92% du 1RM).[51]
- **Deuxi\xE8me tentative** : Un record personnel modeste ou une charge proche du maximum actuel (96-98%).[51]
- **Troisi\xE8me tentative** : L'expression maximale du potentiel du bloc de travail (100-102%+).[51]

### Psychologie et Strat\xE9gie de Match
L'aspect mental est primordial. La visualisation des mouvements et l'arriv\xE9e pr\xE9coce sur le lieu de comp\xE9tition pour s'acclimater au mat\xE9riel (barres plus rigides, bancs diff\xE9rents) sont des facteurs de succ\xE8s.[2] Pour un athl\xE8te de 66 kg, la gestion du poids le jour de la pes\xE9e doit \xEAtre m\xE9ticuleuse pour \xE9viter la d\xE9shydratation, qui impacterait la performance nerveuse lors du squat, premier mouvement de la journ\xE9e.[3, 51]

## Conclusion et Perspectives \xC9volutives
L'\xE9laboration de cet entra\xEEnement pour un athl\xE8te de 20 ans et 66 kg n'est pas une destination mais un point de d\xE9part. La force athl\xE9tique est une science de l'adaptation continue. Les premi\xE8res ann\xE9es de pratique doivent se concentrer sur l'acquisition d'une technique parfaite et d'une base hypertrophique solide. Avec le temps, l'athl\xE8te devra affiner son autor\xE9gulation, identifier ses propres leviers biom\xE9caniques et ajuster son volume d'entra\xEEnement en fonction de sa capacit\xE9 de r\xE9cup\xE9ration neurologique d\xE9croissante avec l'augmentation de l'intensit\xE9 absolue.[2, 49] La rigueur dans la tenue d'un journal d'entra\xEEnement, incluant les scores RPE et les m\xE9triques de r\xE9cup\xE9ration, transformera cette pratique empirique en une d\xE9marche scientifique de haute performance. Dans cette qu\xEAte, la patience est la vertu supr\xEAme : la force est une construction lente, mais sa fondation, une fois \xE9tablie sur des principes m\xE9caniques et physiologiques sains, est pratiquement in\xE9branlable.[52, 53]

*(Sources : Bibliographie compl\xE8te extraite de NotebookLM pour alimenter l'agent IA).*

## Sources
- Fundamentals of Powerlifting | Iron Health, https://www.ironhealth.co/blog/fundamentals-of-powerlifting
- Entra\xEEnement et force athl\xE9tique | Cl\xE9s du Powerlifting - FIT' & RACK, https://www.fitandrack.com/blog/nos-tutoriels-4/comment-optimiser-son-entrainement-et-ses-performances-en-powerlifting-16
- 1RM (one-repetition maximum) Testing - Science for Sport, https://www.scienceforsport.com/1rm-testing/
- The Best Training Frequency for Strength Gains - Power Plant Gym - Strength Training Gym in Aston, PA, https://thepowerplantgym.com/powerlifting/best-training-frequency-strength-gains/
- Powerlifting Technique and Leverages - PowerliftingToWin, https://www.powerliftingtowin.com/powerlifting-technique-the-scientific-principles/
- Upright Squatting Only For Short Legs? - YouTube, https://www.youtube.com/watch?v=No_k3HG0URA
- Long Femur vs Short Femur Squat - YouTube, https://www.youtube.com/shorts/btKQM_4Iwws
- Tailoring Your Squat and Deadlift Setup: Embracing Body Morphology, https://befittrainingphysio.com/tailoring-your-squat-and-deadlift-setup-embracing-body-morphology/
- Should the bench press rules for powerlifting change?, https://www.socalpowerlifting.net/post/should-the-bench-press-rules-for-powerlifting-change
- The New IPF Bench Press Rules May Kill The Sport of Powerlifting - ZAO Strength, https://zaostrength.com/the-new-ipf-bench-press-rules-may-kill-the-sport-of-powerlifting/
- International Powerlifting Federation Unveils Bench Press Rule Change for 2023 | BarBend, https://barbend.com/news/ipf-bench-press-rule-change-2023/
- The Most Common Technique Mistakes for the Main Lifts - Mash Elite Performance, https://www.mashelite.com/most-common-technique-mistakes/
- Peaking for Powerlifting: Training by Tony Bonvechio in TrainHeroic, https://marketplace.trainheroic.com/workout-plan/program/bonvechio-program-1712689374
- Powerlifting Debate #2: The Deadlift: Conventional vs Sumo - Stronger Experts, https://www.strongerexperts.com/blog/powerlifting-debate-2-the-deadlift-conventional-vs-sumo
- Clearing Up the Sumo vs Conventional Deadlift Debate - Moose Coaching, https://moosecoaching.com/blogs/moose-coaching/clearing-up-the-sumo-vs-conventional-deadlift-debate
- Choosing the Right Deadlift: Sumo vs. Conventional - Power Rack Strength, https://www.powerrackstrength.com/choosing-the-right-deadlift-sumo-vs-conventional/
- Training Frequency for Hypertrophy: The Evidence-Based Bible - Weightology, https://weightology.net/the-members-area/evidence-based-guides/training-frequency-for-hypertrophy-the-evidence-based-bible/
- The Minimum Effective Training Dose Required for 1RM Strength in Powerlifters - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC8435792/
- \xC9laborer un programme powerlifting efficace pour progresser, https://bodyhomefitness.fr/programme-powerlifting-efficace/
- Programme de Force pour d\xE9butants en force athl\xE9tique : Starting ..., https://www.powerliftingmag.fr/programme-de-force-pour-debutants-en-force-athletique-starting-strength/
- Evolution d'un programme de d\xE9butant \xE0 confirm\xE9 (partie 2) - Theperfclub, https://www.theperfclub.com/programme-entrainement-de-debutant/
- The Candito Six-Week Strength Training Program, Explained - BarBend, https://barbend.com/candito-6-week-powerlifting-program/
- A Review of Jonnie Candito's 6 Week Strength Program - PowerliftingToWin, https://www.powerliftingtowin.com/candito-6-week-strength-program/
- Creating the 5/3/1 Workout Plan in LiftTrack, https://lifttrackapp.com/creating-531-workout-plan-in-lifttrack/
- 5/3/1 Workout Explained: How to Use the 5/3/1 Method - 2026 - MasterClass, https://www.masterclass.com/articles/5-3-1-workout-explained
- Accurate RPE Calculator for Strength Training - Gravitus Workout Tracker, https://gravitus.com/tools/rpe-calculator/
- The Rate of Perceived Exertion (RPE) Scale Explained - Hevy App, https://www.hevyapp.com/rpe-scale/
- RPE calculator | Estimate 1RM and create an RPE chart - VBTcoach, https://www.vbtcoach.com/rpe-1rm-calculator
- NASM One Rep Max Calculator | Free Strength Assessment Tool, https://www.nasm.org/resources/one-rep-max-calculator
- Mastering the 1 Rep Max Test for Trainers in 2026 - PTPioneer, https://www.ptpioneer.com/personal-training/certifications/study/1-rep-max/
- The Sticking Point in the Bench Press, the Squat, and the Deadlift: Similarities and Differences, and Their Significance for Research and Practice - PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC5357260/
- Powerlifting Recovery Nutrition: Tips for Optimal Recovery, https://fiercelyfueled.com/powerlifting-recovery-nutrition/
- Optimal Protein Intake Guide & Calculator, https://examine.com/guides/protein-intake/
- Setting Up Your Powerlifting Macros \u2013 PowerliftingToWin, https://www.powerliftingtowin.com/powerlifting-macros/
- The Impact of Nutrition on Your Weightlifting Performance, https://www.usaweightlifting.org/news/2024/february/08/the-impact-of-nutrition-on-your-weightlifting-performance
- Joe DeFranco's Limber 11 Routine | PDF - Scribd, https://www.scribd.com/doc/288693295/Joe-DeFranco-s-Limber-11
- Joe D's "Limber 11" (flexibility routine) - DeFranco's Training, https://www.defrancostraining.com/joe-ds-qlimber-11q-flexibility-routine/
- Joe DeFranco's "Limber 11" (flexibility routine) (enhanced Agile 8) : r/weightroom - Reddit, https://www.reddit.com/r/weightroom/comments/1kq3v6/joe_defrancos_limber_11_flexibility_routine/
- Joe DeFranco's "Limber 11" (flexibility routine) - YouTube, https://www.youtube.com/watch?v=FSSDLDhbacc
- 10 Essential Weightlifters Equipment for 2025 Beginners - Katamu Co, https://katamu.co/en-si/blogs/news/weightlifters-equipment
- Is Weightlifting Gear Worth It? How to Pick the Best Gear - ISSA, https://www.issaonline.com/blog/post/geared-up-for-lifting-is-weightlifting-gear-worth-it
- How would you rank powerlifting equipment in terms of importance? - Reddit, https://www.reddit.com/r/powerlifting/comments/61nbpd/how_would_you_rank_powerlifting_equipment_in/
- 13 Must-Have Powerlifting Gears: Powerful Preparations to Unleash Your Strength, https://nordiclifting.com/blogs/fitness/13-must-have-powerlifting-gears-powerful-preparations-to-unleash-your-strength
- 5 Common Deadlift Mistakes (And How to Fix Them) - Pillar Kinetic, https://pillarkinetic.com/sports-medicine/5-common-deadlift-mistakes-and-how-to-fix-them/
- Compendium to Overcoming Weak Points : r/powerlifting - Reddit, https://www.reddit.com/r/powerlifting/comments/7vwoxh/compendium_to_overcoming_weak_points/
- Make the Bottom of the Lift Harder - BONVEC STRENGTH, https://bonvecstrength.com/2021/08/03/make-the-bottom-of-the-lift-harder/
- The Best Accessory Exercises for a Stronger Bench, Squat, and Deadlift - Iron & Mettle, https://www.ironandmettlefitness.com/blog/2025/2/8/the-best-accessory-exercises-for-a-stronger-bench-squat-and-deadlift
- The 6 Best Deadlift Accessories for Smashing Your Sticking Points - BarBend, https://barbend.com/deadlift-accessories/
- Peaking for Powerlifting | Juggernaut Training Systems, https://www.jtsstrength.com/peaking-powerlifting/
- Testing Your 1-Rep Max - Drew Murphy Strength (Gym, Personal Training, Group Training, Programming, Meal Plans), https://www.drewmurphystrength.com/stuff/testingyour1repmax
- A Comprehensive Guide to Powerlifting - SF HealthTech, https://sfhealthtech.com/blogs/post/guide-to-powerlifting
- A Hardcore Look At Wendler's 5/3/1 Powerlifting Routine | Muscle & Strength, https://www.muscleandstrength.com/workouts/hardcore-look-at-jim-wendlers-5-3-1-powerlifting-system.html
- The 5/3/1 Program - Ironmaster, https://www.ironmaster.com/blog/2026/03/25/the-5-3-1-program/
`;

// ../app/src/lib/coachTools.ts
var COACH_TOOLS = [
  {
    name: "add_pr",
    description: "Enregistre un nouveau record personnel (PR) pour un mouvement.",
    input_schema: {
      type: "object",
      properties: {
        lift: { type: "string", enum: ["squat", "bench", "deadlift"] },
        weight: { type: "number", description: "Poids en kg" },
        reps: { type: "number", description: "Nombre de r\xE9p\xE9titions" }
      },
      required: ["lift", "weight", "reps"]
    }
  },
  {
    name: "complete_session",
    description: "Marque une session d'entra\xEEnement comme compl\xE9t\xE9e.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "ID de la session, ex: s3_lun" }
      },
      required: ["sessionId"]
    }
  },
  {
    name: "update_rm",
    description: "Met \xE0 jour les 1RM de l'athl\xE8te. Ne confirmer qu'apr\xE8s validation explicite.",
    input_schema: {
      type: "object",
      properties: {
        squat: { type: "number", description: "1RM squat en kg" },
        bench: { type: "number", description: "1RM bench en kg" },
        deadlift: { type: "number", description: "1RM deadlift en kg" }
      }
    }
  },
  {
    name: "reschedule_session",
    description: "Prend note qu'une session est report\xE9e \xE0 une autre date. R\xE9pond \xE0 l'athl\xE8te en confirmant le report.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        originalDate: { type: "string", description: "Date originale YYYY-MM-DD" },
        newDate: { type: "string", description: "Nouvelle date YYYY-MM-DD" }
      },
      required: ["sessionId", "newDate"]
    }
  }
];

// api/chat.ts
var onRequestOptions = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");
var onRequestPost = /* @__PURE__ */ __name(async (context) => {
  const { request, env } = context;
  if (!env.VITE_ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
  }
  try {
    const { messages, athleteProfile } = await request.json();
    console.log("Chat request received for:", athleteProfile.name);
    console.log("Message count:", messages.length);
    const client = new Anthropic({
      apiKey: env.VITE_ANTHROPIC_API_KEY
    });
    const systemPrompt = `Tu es le coach personnel de ${athleteProfile.name || "l'athl\xE8te"}, int\xE9gr\xE9 dans l'application Programme Candito 6 semaines.

## Profil Athl\xE8te
- Nom : ${athleteProfile.name || "Inconnu"}
- 1RM Squat : ${athleteProfile.rm?.squat || 0} kg | Bench : ${athleteProfile.rm?.bench || 0} kg | Deadlift : ${athleteProfile.rm?.deadlift || 0} kg
- Total : ${(athleteProfile.rm?.squat || 0) + (athleteProfile.rm?.bench || 0) + (athleteProfile.rm?.deadlift || 0)} kg

## Instructions de Communication
- R\xE9ponds en fran\xE7ais, tutoiement syst\xE9matique (tu, jamais vous).
- 1 \xE0 3 phrases maximum \u2014 jamais de listes \xE0 puces dans les r\xE9ponses standards, sois direct.
- 1 emoji max par message, uniquement pour un PR ou une victoire \u2014 jamais en d\xE9but de phrase.
- Adresse l'athl\xE8te par son pr\xE9nom quand c'est naturel.

## Instructions Tool Use
- Tu peux utiliser tes outils pour modifier l'app directement.
- Si l'athl\xE8te mentionne un PR et que le poids est clair, appelle add_pr directement sans demander confirmation.
- Si le poids ou le mouvement est ambigu, demande avant d'appeler add_pr.
- Avant update_rm, confirme toujours les valeurs explicitement avec l'athl\xE8te.
- Ne g\xE9n\xE8re jamais de valeurs fictives dans les outils \u2014 demande si tu n'es pas certain.

## Base de Connaissances Cliniques et Sportives (IMPORTANT)
Toutes tes r\xE9ponses concernant les douleurs, la r\xE9cup\xE9ration (hydroth\xE9rapie, SNC), l'optimisation des charges, ou le choix des exercices DOIVENT \xEAtre bas\xE9es sur la base de donn\xE9es suivante. 
Si l'athl\xE8te mentionne une douleur ou blessure, la r\xE9cup\xE9ration prime sur la performance, applique les protocoles de la base.

--- DEBUT BASE DE CONNAISSANCES ---
${KNOWLEDGE_BASE}
--- FIN BASE DE CONNAISSANCES ---`;
    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      tools: COACH_TOOLS,
      messages
    });
    console.log("Anthropic response received. Stop reason:", response.stop_reason);
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    console.error("API Proxy Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}, "onRequestPost");

// api/push-subscribe.ts
var onRequestOptions2 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}, "onRequestOptions");
var onRequestGet = /* @__PURE__ */ __name(async () => {
  return new Response(JSON.stringify({ status: "API is alive", usage: "POST only" }), {
    headers: { "Content-Type": "application/json" }
  });
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name(async (context) => {
  try {
    const data = await context.request.json();
    const { subscription, weekId, name } = data;
    if (!subscription || !subscription.endpoint) {
      return new Response("Invalid subscription object", { status: 400 });
    }
    if (!context.env.CANDITO_SUBS) {
      return new Response(JSON.stringify({
        error: "Configuration requise : Le namespace Cloudflare KV 'CANDITO_SUBS' n'est pas li\xE9 \xE0 votre projet Pages.",
        help: "Allez dans Dashboard > Pages > Votre Projet > Settings > Functions > KV namespace bindings."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const key = `sub:${subscription.endpoint}`;
    const record = {
      subscription,
      weekId: weekId || "s1",
      name: name || "",
      lastSync: (/* @__PURE__ */ new Date()).toISOString()
    };
    await context.env.CANDITO_SUBS.put(key, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");

// ../.wrangler/tmp/pages-rR8AgS/functionsRoutes-0.6734037671590555.mjs
var routes = [
  {
    routePath: "/api/chat",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/chat",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/push-subscribe",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/push-subscribe",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/push-subscribe",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  }
];

// ../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a2 = options.prefixes, prefixes = _a2 === void 0 ? "./" : _a2, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path2 = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a3 = tokens[i], nextType = _a3.type, index = _a3.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path2 += prefix;
        prefix = "";
      }
      if (path2) {
        result.push(path2);
        path2 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path2 += value;
      continue;
    }
    if (path2) {
      result.push(path2);
      path2 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a2 = options.decode, decode = _a2 === void 0 ? function(x) {
    return x;
  } : _a2;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path2 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path2, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path2, keys) {
  if (!keys)
    return path2;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path2.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path2.source);
  }
  return path2;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path2) {
    return pathToRegexp(path2, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path2, keys, options) {
  return tokensToRegexp(parse(path2, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a2 = options.strict, strict = _a2 === void 0 ? false : _a2, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path2, keys, options) {
  if (path2 instanceof RegExp)
    return regexpToRegexp(path2, keys);
  if (Array.isArray(path2))
    return arrayToRegexp(path2, keys, options);
  return stringToRegexp(path2, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path: path2 } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path2,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
