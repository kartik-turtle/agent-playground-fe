/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require("@turtlemint/reactpacker");
const path = require("path");
module.exports = defineConfig({
  dev: {
    sourceMap: false,
    overlay: {
      warnings: false,
      errors: false,
      runtimeErrors: false,
    },
  }
});