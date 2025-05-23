module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^api$": "<rootDir>/tests/__mocks__/api.ts",
    "^api/types$": "<rootDir>/tests/__mocks__/api_types.ts",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["./jest.setup.js"],
};
