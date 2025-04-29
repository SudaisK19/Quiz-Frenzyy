const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFiles: ["openai/shims/node"],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports',
      outputName: 'junit.xml',
    }],
    ['jest-html-reporter', {
      pageTitle: 'QuizApp Test Report',
      outputPath: 'reports/test-report.html',
    }],
  ],
}

module.exports = createJestConfig(config)
