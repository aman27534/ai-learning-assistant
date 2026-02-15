module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.js$': 'ts-jest',
    },
    transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
};
