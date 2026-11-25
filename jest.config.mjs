export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/load-env.mjs"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.mjs"],
  testMatch: ["**/tests/**/*.test.mjs"],
  coverageDirectory: "tests/coverage",
  clearMocks: true,
  verbose: true,
};
