export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/load-env.mjs"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.mjs"],
  testWatch: ["**/tests/**/*.test.mjs"],
  clearMocks: true,
};
