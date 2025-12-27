module.exports = {
    testEnvironment: "jest-environment-jsdom",
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom'], // <-- UPDATED here
};