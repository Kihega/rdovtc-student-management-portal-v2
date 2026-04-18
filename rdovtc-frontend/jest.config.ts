import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment:  'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],

  // Map path aliases from tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage thresholds — CI fails if below these
  coverageThreshold: {
    global: {
      branches:   60,
      functions:  65,
      lines:      65,
      statements: 65,
    },
  },

  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!app/layout.tsx',       // layout just wires providers
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

export default createJestConfig(config);
