/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    // Optional: Setup files to run before each test (e.g., for global mocks)
    // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    // Match test files (e.g., *.test.ts in tests/ folder)
    testMatch: ["<rootDir>/tests/**/*.test.ts"],
    // Module mapping can be useful if imports use aliases
    // moduleNameMapper: {
    //   '^@/(.*)$': '<rootDir>/src/$1',
    // },
};
