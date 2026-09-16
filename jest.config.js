/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  // Der Standard (5000ms) reicht auf dem langsameren CI-Runner gelegentlich nicht
  // fuer RNTL-Renders mit mehreren State-Uebergaengen (z. B. ScanResultScreen).
  testTimeout: 15000,
};
