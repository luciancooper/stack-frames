module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['html', 'text'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
    ],
    testMatch: [
        '**/*.test.ts',
    ],
};