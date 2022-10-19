const isCI = process.env.CI && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() === 'true');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: isCI ? ['clover', 'json', 'lcovonly', 'cobertura'] : ['html', 'text'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
    ],
    testMatch: [
        '**/*.test.ts',
    ],
};