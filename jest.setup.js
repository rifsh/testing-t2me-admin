import '@testing-library/jest-dom';

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Suppress specific React and testing warnings
console.error = (...args) => {
    // Suppress React DOM test utils act() warnings
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('ReactDOMTestUtils.act') ||
            args[0].includes('act(...)') ||
            args[0].includes('was not wrapped in act'))
    ) {
        return;
    }

    // Suppress React Router warnings in tests
    if (
        typeof args[0] === 'string' &&
        args[0].includes('React Router')
    ) {
        return;
    }

    // Suppress warning about using browser-only APIs
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
        return;
    }

    originalError.call(console, ...args);
};

console.warn = (...args) => {
    // Suppress specific warnings if needed
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('componentWillReceiveProps') ||
            args[0].includes('componentWillMount'))
    ) {
        return;
    }

    originalWarn.call(console, ...args);
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.location
delete window.location;
window.location = {
    href: 'http://localhost',
    origin: 'http://localhost',
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

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn(),
    display: 'block',
    visibility: 'visible',
    opacity: '1',
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch API
global.fetch = jest.fn();

// Mock Image
global.Image = class {
    constructor() {
        setTimeout(() => {
            this.onload && this.onload();
        }, 100);
    }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock Ant Design components that might cause issues
jest.mock('antd/lib/message', () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
    loading: jest.fn(),
}));

jest.mock('antd/lib/notification', () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
    open: jest.fn(),
}));

// Mock process.env if needed
process.env = {
    ...process.env,
    NODE_ENV: 'test',
    REACT_APP_API_URL: 'http://localhost:3000/api',
};

// Increase timeout for async operations
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

// Global test utilities
global.testUtils = {
    // Wait for async updates
    waitFor: (callback, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                try {
                    callback();
                    clearInterval(interval);
                    resolve();
                } catch (error) {
                    if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(error);
                    }
                }
            }, 50);
        });
    },
};

// Suppress specific prop-types warnings
const error = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: Failed prop type') ||
            args[0].includes('Warning: React does not recognize'))
    ) {
        return;
    }
    error(...args);
};

// Add custom matchers if needed
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () =>
                    `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false,
            };
        }
    },
});

// Mock crypto.getRandomValues for components that use it
Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: (arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        },
        randomUUID: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                /[xy]/g,
                function (c) {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                }
            );
        },
    },
});

// Mock canvas for chart libraries
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
    callback(new Blob(['mock'], { type: 'image/png' }));
});

// Reset modules after each test to ensure clean state
afterEach(() => {
    jest.resetModules();
});

// Export for use in tests if needed
export { originalError, originalWarn };