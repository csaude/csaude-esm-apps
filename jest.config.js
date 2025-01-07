/** @type {import('jest').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  clearMocks: true,
  transform: {
    '^.+\\.(j|t)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleDirectories: ['node_modules', '__mocks__', 'tools', __dirname],
  moduleNameMapper: {
    '\\.(s?css)$': 'identity-obj-proxy',
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '^dexie$': require.resolve('dexie'),
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lodash-es$': 'lodash',
<<<<<<< HEAD
    '^react-i18next$': path.resolve(__dirname, 'react-i18next.js'),
=======
    '^react-i18next$': path.resolve(__dirname, '__mocks__', 'react-i18next.js'),
>>>>>>> a7ad735 (Add esm-patient-programs to project)
    '^uuid$': path.resolve(__dirname, 'node_modules', 'uuid', 'dist', 'index.js'),
    'react-use-wizard': path.resolve(
      __dirname,
      'node_modules',
      'react-use-wizard',
      'dist',
      'react-use-wizard.cjs.production.min.js',
    ),
  },
  collectCoverageFrom: [
    '**/src/**/*.component.tsx',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/src/**/*.test.*',
    '!**/src/declarations.d.ts',
    '!**/e2e/**',
  ],
  // coverageThreshold: {
  //   global: {
  //     statements: 80,
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //   },
  // },
  setupFilesAfterEnv: [path.resolve(__dirname, 'tools', 'setup-tests.ts')],
  testPathIgnorePatterns: [path.resolve(__dirname, 'e2e')],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testTimeout: 20000,
};
