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
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module"
  },
  overrides: [
    {
      "files": ["src/**/*.js",
                "__tests__/**/*.js"],
      "rules": {
        // See https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-unsupported-features/es-syntax.md
        //   rule supposedly matches ECMA version with node
        //   we get: "Import and export declarations are not supported yet"
        "node/no-unsupported-features/es-syntax": "off",
        // Avoiding: "warning  Found fs.readFileSync with non literal argument ..."
        "security/detect-non-literal-fs-filename": "off"
      }
    },
    {
      files: [
        'src/cli/*.js'
      ],
      rules: {
        'no-console': 'off',
        'no-process-exit': 'off'
      }
    }
  ]
}
