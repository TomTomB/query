module.exports = {
  displayName: 'query-core',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/query-core',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  preset: '../../jest.preset.ts',
};
