import '@testing-library/jest-dom';

// ============================================================================
// DEBUG MODE
// ============================================================================
const DEBUG_MODE = process.env.DEBUG_TESTS === 'true';

// ============================================================================
// ORIGINAL CONSOLE METHODS
// ============================================================================
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

const suppressedMessages = { errors: [], warnings: [] };
const SUPPRESSED_ERROR_PATTERNS = [
    'ReactDOMTestUtils.act',
    'act(...)',
    'was not wrapped in act',
    'React Router',
    'Not implemented: HTMLFormElement.prototype.submit',
];
const SUPPRESSED_WARN_PATTERNS = ['componentWillReceiveProps', 'componentWillMount'];

// ============================================================================
// CONSOLE OVERRIDES
// ============================================================================
console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    const shouldSuppress = SUPPRESSED_ERROR_PATTERNS.some(pattern => message.includes(pattern));
    if (shouldSuppress && !DEBUG_MODE) {
        suppressedMessages.errors.push(message);
        return;
    }
    // Show full error
    originalError.apply(console, args);
};

console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    const shouldSuppress = SUPPRESSED_WARN_PATTERNS.some(pattern => message.includes(pattern));
    if (shouldSuppress && !DEBUG_MODE) {
        suppressedMessages.warnings.push(message);
        return;
    }
    originalWarn.apply(console, args);
};

global.testLog = (...args) => {
    if (DEBUG_MODE) originalLog.call(console, '🧪 TEST LOG:', ...args);
};

if (DEBUG_MODE) {
    afterAll(() => {
        if (suppressedMessages.errors.length || suppressedMessages.warnings.length) {
            console.log('\n📊 SUPPRESSED MESSAGES SUMMARY:');
            console.log(`  Errors suppressed: ${suppressedMessages.errors.length}`);
            console.log(`  Warnings suppressed: ${suppressedMessages.warnings.length}`);
        }
    });
}

// ============================================================================
// MOCK BROWSER APIS
// ============================================================================
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

global.IntersectionObserver = class {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() { return []; }
    unobserve() { }
};

global.ResizeObserver = class {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

Object.defineProperty(window, 'scrollTo', { writable: true, value: jest.fn() });

// ============================================================================
// MOCK STORAGE
// ============================================================================
const localStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(), length: 0, key: jest.fn() };
const sessionStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(), length: 0, key: jest.fn() };
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;

// ============================================================================
// MOCK LOCATION
// ============================================================================
delete window.location;
window.location = {
    href: '[http://localhost](http://localhost)',
    origin: '[http://localhost](http://localhost)',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn(),
};

// ============================================================================
// MOCK STYLING
// ============================================================================
window.getComputedStyle = jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn(),
    display: 'block',
    visibility: 'visible',
    opacity: '1',
}));

// ============================================================================
// MOCK FILES / MEDIA
// ============================================================================
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();
global.fetch = jest.fn();
global.Image = class { constructor() { setTimeout(() => { this.onload && this.onload(); }, 100); } };

// ============================================================================
// MOCK ANIMATION
// ============================================================================
global.requestAnimationFrame = cb => setTimeout(cb, 0);
global.cancelAnimationFrame = id => clearTimeout(id);

// ============================================================================
// ANT DESIGN MOCKS
// ============================================================================
jest.mock('antd/lib/message', () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn(), warn: jest.fn(), loading: jest.fn() }));
jest.mock('antd/lib/notification', () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn(), warn: jest.fn(), open: jest.fn() }));

// ============================================================================
// ENVIRONMENT
// ============================================================================
process.env = { ...process.env, NODE_ENV: 'test', REACT_APP_API_URL: '[http://localhost:3000/api](http://localhost:3000/api)' };
jest.setTimeout(10000);

// ============================================================================
// CLEANUP
// ============================================================================
afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    localStorage.clear();
    sessionStorage.clear();
});

// ============================================================================
// TEST UTILITIES
// ============================================================================
global.testUtils = {
    waitFor: (callback, timeout = 3000) => new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            try { callback(); clearInterval(interval); resolve(); }
            catch (e) { if (Date.now() - start > timeout) { clearInterval(interval); reject(e); } }
        }, 50);
    }),
};

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        return { pass, message: () => pass ? `expected ${received} not to be within range ${floor} - ${ceiling}` : `expected ${received} to be within range ${floor} - ${ceiling}` };
    },
});

// ============================================================================
// MOCK CRYPTO
// ============================================================================
Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: arr => arr.map((_, i) => Math.floor(Math.random() * 256)),
        randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; const v = c === 'x' ? r : (r & 0x3) | 0x8; return v.toString(16); }),
    },
});

// ============================================================================
// MOCK CANVAS (for chart libs)
// ============================================================================
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(), clearRect: jest.fn(), getImageData: jest.fn(),
    putImageData: jest.fn(), createImageData: jest.fn(), setTransform: jest.fn(),
    drawImage: jest.fn(), save: jest.fn(), fillText: jest.fn(), restore: jest.fn(),
    beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), closePath: jest.fn(),
    stroke: jest.fn(), translate: jest.fn(), scale: jest.fn(), rotate: jest.fn(),
    arc: jest.fn(), fill: jest.fn(), measureText: jest.fn(() => ({ width: 0 })), transform: jest.fn(), rect: jest.fn(), clip: jest.fn()
}));
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = jest.fn(callback => callback(new Blob(['mock'], { type: 'image/png' })));

export { originalError, originalWarn, originalLog };
