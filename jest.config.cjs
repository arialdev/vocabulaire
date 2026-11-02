module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/src", "<rootDir>/modules", "<rootDir>/__tests__"],
  modulePathIgnorePatterns: ["<rootDir>/.legacy/", "<rootDir>/.migration/"],
  testPathIgnorePatterns: ["<rootDir>/.legacy/", "<rootDir>/.migration/", "/node_modules/"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/test-support/style-mock.cjs",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|standard-navigation|@sentry/react-native|native-base|react-native-svg))",
  ],
};
