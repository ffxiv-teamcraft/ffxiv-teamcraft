/* eslint-disable */
export default {
  displayName: 'search',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testTimeout: 300000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/search',
};
