/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts?(x)'],
  coveragePathIgnorePatterns: ['/node_modules/', '/db/'],
};
