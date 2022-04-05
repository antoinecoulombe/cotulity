/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/db/', '/config/'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  // roots: [
  //   '../accounts/src',
  //   '../auth/src',
  //   '../calendar/src',
  //   '../global/src',
  //   '../groceries/src',
  //   '../homes/src',
  //   '../shared/src',
  //   '../tasks/src',
  //   '../test/src',
  // ],
};
