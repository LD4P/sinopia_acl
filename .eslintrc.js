// Copyright 2018 Stanford University see Apache2.txt for license
module.exports = {
  plugins: [
    "import",
    "jest",
    "security"
  ],
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:security/recommended",
    "plugin:jest/recommended"
  ],
  env: {
    "jest": true,
    "node": true
  }
}
