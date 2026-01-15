// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict'

// Attempt to load config files
let chainsConfig = null
let testSeedsConfig = null
const missingFiles = []

try {
  chainsConfig = (await import('../../../local/chains.json', { with: { type: 'json' } })).default
} catch (e) {
  missingFiles.push({ name: 'chains.json', description: 'blockchain configuration' })
}

try {
  testSeedsConfig = (await import('../../../local/test-seeds.json', { with: { type: 'json' } })).default
} catch (e) {
  missingFiles.push({ name: 'test-seeds.json', description: 'test seed phrases' })
}

/**
 * Validates that required config files exist before running tests
 * @throws {Error} If required config files are missing
 */
export function validateTestConfig() {
  if (missingFiles.length > 0) {
    const errorMessages = missingFiles.map(f =>
      `  - ${f.name} (${f.description})`
    ).join('\n')

    throw new Error(
      `Missing required config files:\n${errorMessages}\n\n` +
      `Please create the missing files in the 'local/' directory.\n` +
      `See 'local.example/' for templates.`
    )
  }
}

/**
 * Loads and validates test seeds configuration
 * @returns {{ primary: string, secondary: string }} Test seed phrases
 * @throws {Error} If seeds are missing or invalid
 */
export function loadTestSeeds() {
  if (!testSeedsConfig) {
    throw new Error(
      `Missing test-seeds.json in local/ directory.\n` +
      `Please create it with the following format:\n` +
      `{\n  "primary": "your twelve word seed phrase here",\n  "secondary": "your alternate seed phrase here"\n}`
    )
  }

  if (!testSeedsConfig.primary || typeof testSeedsConfig.primary !== 'string') {
    throw new Error('test-seeds.json must contain a valid "primary" seed phrase')
  }

  if (!testSeedsConfig.secondary || typeof testSeedsConfig.secondary !== 'string') {
    throw new Error('test-seeds.json must contain a valid "secondary" seed phrase')
  }

  // Basic validation - seed phrases should have multiple words
  if (testSeedsConfig.primary.split(' ').length < 12) {
    throw new Error('Primary seed phrase should be at least 12 words')
  }

  if (testSeedsConfig.secondary.split(' ').length < 12) {
    throw new Error('Secondary seed phrase should be at least 12 words')
  }

  return testSeedsConfig
}

/**
 * Loads and validates chains configuration
 * @returns {Object} Chains configuration
 * @throws {Error} If chains config is missing or invalid
 */
export function loadChainsConfig() {
  if (!chainsConfig) {
    throw new Error(
      `Missing chains.json in local/ directory.\n` +
      `Please create it with blockchain configuration.\n` +
      `See local.example/chains.json for template.`
    )
  }

  if (typeof chainsConfig !== 'object') {
    throw new Error('chains.json must contain a valid configuration object')
  }

  return chainsConfig
}
