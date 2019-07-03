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
    "es6": true,
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
                "__mocks__/**/*.js",
                "__tests__/**/*.js"],
      "rules": {
        // Indent `case` statements within `switch` blocks
        "indent": ["error", 2, {
          "SwitchCase": 1
        }],
        // See https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-unsupported-features/es-syntax.md
        //   rule supposedly matches ECMA version with node
        //   we get: "Import and export declarations are not supported yet"
        "node/no-unsupported-features/es-syntax": "off",
        // Avoiding: "warning  Found fs.readFileSync with non literal argument ..."
        "security/detect-non-literal-fs-filename": "off",
        // Avoiding: "warning Found non-literal argument to RegExp Constructor"
        "security/detect-non-literal-regexp": "off",
        // this is a CLI tool; we DO want to send output to console
        "no-console": "off",
        // the object injection is to a json file where the value is never assigned to a function.
        "security/detect-object-injection": "off",
        // allow unused variables that begin with underscore
        "no-unused-vars": [
          "error",
          {
            "argsIgnorePattern": "^_"
          }
        ]
      }
    },
    {
      files: [
        'src/cli/*.js'
      ],
      rules: {
        'no-process-exit': 'off'
      }
    },
    {
      // Allow explicit boolean casts in integration tests to permit running inside and outside containerland
      files: [
        '__tests__/**/*.integration.js',
        'src/populateEmptyTrellis.js'
      ],
      rules: {
        'no-extra-boolean-cast': 'off',
      }
    },
    {
      // Allow skipped tests in test suite
      files: [
        '__tests__/**/*.js'
      ],
      rules: {
        'jest/no-disabled-tests': 'off',
      }
    }
  ]
}
