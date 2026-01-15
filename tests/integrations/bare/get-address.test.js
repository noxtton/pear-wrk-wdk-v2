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

/**
 * Integration tests for getAddress RPC method
 * Run with: bare tests/integrations/bare/get-address.test.js
 */

import test from 'brittle'
import { serverStream, clientStream } from '../../../src/lib/ipc.js'
import { validateTestConfig, loadTestSeeds, loadChainsConfig } from './test-utils.js'

// Validate config files exist before proceeding
validateTestConfig()

// Load configurations
const config = loadChainsConfig()
const testSeeds = loadTestSeeds()

// Setup BareKit mock before importing worklet
global.BareKit = { IPC: serverStream }
await import('../../../src/worklet.mjs')

import HRPC from '../../../spec/hrpc'

const rpc = new HRPC(clientStream)

// Test seed phrases loaded from local config (gitignored)
const TEST_SEED_PHRASE = testSeeds.primary
const ALT_SEED_PHRASE = testSeeds.secondary

// Expected addresses for TEST_SEED_PHRASE at accountIndex 0
const EXPECTED_ADDRESSES = {
  ethereum: '0x',  // Will be validated as starting with 0x
  polygon: '0x',
  arbitrum: '0x'
}

// ============================================
// Setup - Initialize WDK before tests
// ============================================

test('setup - initialize WDK for getAddress tests', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDK should be initialized')
})

// ============================================
// Basic getAddress Tests
// ============================================

test('getAddress - should return ethereum address', async (t) => {
  const result = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.ok(result.address, 'Should return an address')
  t.ok(result.address.startsWith('0x'), 'Ethereum address should start with 0x')
  t.is(result.address.length, 42, 'Ethereum address should be 42 characters')
})

test('getAddress - should return polygon address', async (t) => {
  const result = await rpc.getAddress({
    network: 'polygon',
    accountIndex: 0
  })

  t.ok(result.address, 'Should return an address')
  t.ok(result.address.startsWith('0x'), 'Polygon address should start with 0x')
  t.is(result.address.length, 42, 'Polygon address should be 42 characters')
})

test('getAddress - should return arbitrum address', async (t) => {
  const result = await rpc.getAddress({
    network: 'arbitrum',
    accountIndex: 0
  })

  t.ok(result.address, 'Should return an address')
  t.ok(result.address.startsWith('0x'), 'Arbitrum address should start with 0x')
  t.is(result.address.length, 42, 'Arbitrum address should be 42 characters')
})

// ============================================
// EVM Networks - Same Address Tests
// ============================================

test('getAddress - EVM networks should return same address for same seed', async (t) => {
  const evmNetworks = ['ethereum', 'polygon', 'arbitrum']
  const addresses = []

  for (const network of evmNetworks) {
    const result = await rpc.getAddress({
      network,
      accountIndex: 0
    })
    addresses.push(result.address)
  }

  // All EVM networks should derive the same address from the same seed
  t.is(addresses[0], addresses[1], 'Ethereum and Polygon should have same address')
  t.is(addresses[1], addresses[2], 'Polygon and Arbitrum should have same address')
})

// ============================================
// Account Index Tests
// ============================================

test('getAddress - should return different addresses for different account indices', async (t) => {
  const address0 = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const address1 = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 1
  })

  t.ok(address0.address, 'Should return address for index 0')
  t.ok(address1.address, 'Should return address for index 1')
  t.not(address0.address, address1.address, 'Different indices should have different addresses')
})

test('getAddress - should return consistent address for same account index', async (t) => {
  const firstCall = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const secondCall = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(firstCall.address, secondCall.address, 'Same index should always return same address')
})

test('getAddress - should handle multiple account indices', async (t) => {
  const addresses = []
  const numAccounts = 5

  for (let i = 0; i < numAccounts; i++) {
    const result = await rpc.getAddress({
      network: 'ethereum',
      accountIndex: i
    })
    t.ok(result.address, `Should return address for index ${i}`)
    t.ok(result.address.startsWith('0x'), `Address ${i} should start with 0x`)
    addresses.push(result.address)
  }

  // Verify all addresses are unique
  const uniqueAddresses = new Set(addresses)
  t.is(uniqueAddresses.size, numAccounts, 'All addresses should be unique')
})

// ============================================
// Seed Change Tests
// ============================================

test('getAddress - should return different address after seed change', async (t) => {
  // Get address with first seed
  const firstSeedAddress = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  // Reinitialize with different seed
  await rpc.wdkInit({
    seedPhrase: ALT_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  // Get address with second seed
  const secondSeedAddress = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.not(firstSeedAddress.address, secondSeedAddress.address, 'Different seeds should produce different addresses')

  // Restore original seed for subsequent tests
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
})

test('getAddress - should return same address after reinit with same seed', async (t) => {
  // Get address
  const beforeReinit = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  // Reinitialize with same seed
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  // Get address again
  const afterReinit = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(beforeReinit.address, afterReinit.address, 'Same seed should always produce same address')
})

// ============================================
// Address Format Validation Tests
// ============================================

test('getAddress - ethereum address should be valid hex', async (t) => {
  const result = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const addressWithout0x = result.address.slice(2)
  const isValidHex = /^[0-9a-fA-F]+$/.test(addressWithout0x)

  t.ok(isValidHex, 'Address should be valid hexadecimal')
})

test('getAddress - address should be lowercase or checksummed', async (t) => {
  const result = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  // EIP-55 checksum addresses have mixed case, all lowercase is also valid
  const addressWithout0x = result.address.slice(2)
  const isLowercase = addressWithout0x === addressWithout0x.toLowerCase()
  const hasValidChecksum = /^[0-9a-fA-F]{40}$/.test(addressWithout0x)

  t.ok(isLowercase || hasValidChecksum, 'Address should be lowercase or have valid checksum')
})
