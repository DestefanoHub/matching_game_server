import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  preset: '@shelf/jest-mongodb',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.js$': '$1',
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/logs/"
  ],
  roots: ["<rootDir>/src/"],
  watchPathIgnorePatterns: ['globalConfig']
};