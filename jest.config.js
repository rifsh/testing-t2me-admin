module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    transformIgnorePatterns: [
        "/node_modules/(?!(@firebase|firebase|uuid)/)",
        "/node_modules/(?!(rc-pagination|antd)/)"
    ],

    moduleFileExtensions: ["js", "jsx"],

    transform: {
        "^.+\\.(js|jsx)$": "babel-jest"
    },

    moduleNameMapper: {
        "^utils/(.*)$": "<rootDir>/src/utils/$1",
        "^utils$": "<rootDir>/src/utils/index.js",
        "^store/(.*)$": "<rootDir>/src/store/$1",
        "^components/(.*)$": "<rootDir>/src/components/$1",
        "^views/(.*)$": "<rootDir>/src/views/$1",
        "^configs/(.*)$": "<rootDir>/src/configs/$1",
        "^constants/(.*)$": "<rootDir>/src/constants/$1",
        "^auth/(.*)$": "<rootDir>/src/auth/$1",
        "^mock/(.*)$": "<rootDir>/src/mock/$1",
        "^services/(.*)$": "<rootDir>/src/services/$1",

        // Add SVG / image mocks
        "^assets/(.*)$": "<rootDir>/src/assets/$1",
        "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/test/__mocks__/fileMock.js",

        // CSS/SCSS
        "\\.(css|scss)$": "identity-obj-proxy"
    },

    testMatch: [
        "<rootDir>/tests/**/*.(test|spec).js",
        "<rootDir>/tests/**/*.js",
        "<rootDir>/src/**/*.(test|spec).js",
        "**/?(*.)+(test|spec).js"
    ],

    // 🔥 Coverage ONLY from src/
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.{js,jsx}",
        "!src/index.js",
        "!src/main.jsx",
        "!src/**/*.styles.js"
    ],

    coverageReporters: ["text", "lcov", "html"]
};
