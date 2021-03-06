/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'lint' script for Blockly extension packages.
 * This script:
 *   Runs eslint on the src and test directories.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ESLint = require('eslint').ESLint;
const LintResult = require('eslint').LintResult;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running lint for ${packageJson.name}`);

// Create the eslint engine.
const eslintConfig = require('@blockly/eslint-config');
const linter = new ESLint({
  extensions: ['.js', '.ts'],
  baseConfig: eslintConfig,
  useEslintrc: false,
  resolvePluginsRelativeTo: __dirname,
});

/**
 * Lint this directory.
 * @param {string} dir The directory to lint.
 * @param {ESLint} linter The linter.
 * @return {Promise<LintResult[]|null>} The results, which may be printed with
 *   an approriate formatter.
 */
async function lintDir(dir, linter) {
  const resolvePath = resolveApp(dir);
  if (fs.existsSync(resolvePath)) {
    return await linter.lintFiles([dir]);
  }
  return null;
}

linter.loadFormatter('stylish').then((formatter) => {
  // Run eslint for both the src and test directories.
  // The eslint engine will use the .eslintrc under plugins/ for configuration.
  lintDir('src', linter).then((result) => {
    if (result) {
      console.log(formatter.format(result));
    }
  });
  lintDir('test', linter).then((result) => {
    if (result) {
      console.log(formatter.format(result));
    }
  });
});
