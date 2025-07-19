export default {
	testEnvironment: "node",
	transform: {},
	testMatch: ["**/tests/**/*.test.js"],
	collectCoverageFrom: [
		"**/*.js",
		"!**/node_modules/**",
		"!**/coverage/**",
		"!**/jest.config.js",
		"!**/tests/**",
	],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
	testTimeout: 10000,
};
