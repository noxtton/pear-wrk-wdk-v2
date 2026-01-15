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
 * Integration tests for getAbstractedAddress RPC method
 * Run with: bare tests/integrations/bare/get-abstracted-address.test.js
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

// ============================================
// Setup - Initialize WDK before tests
// ============================================

test('setup - initialize WDK for getAbstractedAddress tests', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDK should be initialized')
})

// ============================================
// Basic getAbstractedAddress Tests
// ============================================

test('getAbstractedAddress - should return both eoaAddress and abstracted address for ethereum', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.ok(result.eoaAddress, 'Should return eoaAddress')
  t.ok(result.address, 'Should return abstracted address')
  t.ok(result.eoaAddress.startsWith('0x'), 'EOA address should start with 0x')
  t.ok(result.address.startsWith('0x'), 'Abstracted address should start with 0x')
})

test('getAbstractedAddress - should return both addresses for polygon', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'polygon',
    accountIndex: 0
  })

  t.ok(result.eoaAddress, 'Should return eoaAddress')
  t.ok(result.address, 'Should return abstracted address')
  t.ok(result.eoaAddress.startsWith('0x'), 'EOA address should start with 0x')
  t.ok(result.address.startsWith('0x'), 'Abstracted address should start with 0x')
})

test('getAbstractedAddress - should return both addresses for arbitrum', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'arbitrum',
    accountIndex: 0
  })

  t.ok(result.eoaAddress, 'Should return eoaAddress')
  t.ok(result.address, 'Should return abstracted address')
  t.ok(result.eoaAddress.startsWith('0x'), 'EOA address should start with 0x')
  t.ok(result.address.startsWith('0x'), 'Abstracted address should start with 0x')
})

// ============================================
// EOA vs Abstracted Address Tests
// ============================================

test('getAbstractedAddress - eoaAddress should differ from abstracted address', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.not(result.eoaAddress, result.address, 'EOA and abstracted addresses should be different')
})

test('getAbstractedAddress - eoaAddress should match getAddress result', async (t) => {
  const abstractedResult = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const addressResult = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(abstractedResult.eoaAddress, addressResult.address, 'EOA address should match regular getAddress')
})

// ============================================
// Account Index Tests
// ============================================

test('getAbstractedAddress - should return different addresses for different account indices', async (t) => {
  const result0 = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const result1 = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 1
  })

  t.not(result0.eoaAddress, result1.eoaAddress, 'EOA addresses should differ for different indices')
  t.not(result0.address, result1.address, 'Abstracted addresses should differ for different indices')
})

test('getAbstractedAddress - should return consistent addresses for same account index', async (t) => {
  const firstCall = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const secondCall = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(firstCall.eoaAddress, secondCall.eoaAddress, 'EOA address should be consistent')
  t.is(firstCall.address, secondCall.address, 'Abstracted address should be consistent')
})

test('getAbstractedAddress - should handle multiple account indices', async (t) => {
  const eoaAddresses = []
  const abstractedAddresses = []
  const numAccounts = 3

  for (let i = 0; i < numAccounts; i++) {
    const result = await rpc.getAbstractedAddress({
      network: 'ethereum',
      accountIndex: i
    })
    t.ok(result.eoaAddress, `Should return EOA address for index ${i}`)
    t.ok(result.address, `Should return abstracted address for index ${i}`)
    eoaAddresses.push(result.eoaAddress)
    abstractedAddresses.push(result.address)
  }

  // Verify all addresses are unique
  const uniqueEoa = new Set(eoaAddresses)
  const uniqueAbstracted = new Set(abstractedAddresses)
  t.is(uniqueEoa.size, numAccounts, 'All EOA addresses should be unique')
  t.is(uniqueAbstracted.size, numAccounts, 'All abstracted addresses should be unique')
})

// ============================================
// Cross-Network Tests
// ============================================

test('getAbstractedAddress - EOA addresses should be same across EVM networks', async (t) => {
  const evmNetworks = ['ethereum', 'polygon', 'arbitrum']
  const eoaAddresses = []

  for (const network of evmNetworks) {
    const result = await rpc.getAbstractedAddress({
      network,
      accountIndex: 0
    })
    eoaAddresses.push(result.eoaAddress)
  }

  t.is(eoaAddresses[0], eoaAddresses[1], 'EOA should be same for ethereum and polygon')
  t.is(eoaAddresses[1], eoaAddresses[2], 'EOA should be same for polygon and arbitrum')
})

test('getAbstractedAddress - abstracted addresses may differ across networks', async (t) => {
  const evmNetworks = ['ethereum', 'polygon', 'arbitrum']
  const abstractedAddresses = []

  for (const network of evmNetworks) {
    const result = await rpc.getAbstractedAddress({
      network,
      accountIndex: 0
    })
    abstractedAddresses.push(result.address)
  }

  // Abstracted addresses (smart contract wallets) may or may not be the same
  // depending on the deployment - just verify they are valid
  for (const addr of abstractedAddresses) {
    t.ok(addr.startsWith('0x'), 'Abstracted address should be valid')
    t.is(addr.length, 42, 'Abstracted address should be 42 characters')
  }
})

// ============================================
// Seed Change Tests
// ============================================

test('getAbstractedAddress - should return different addresses after seed change', async (t) => {
  // Get addresses with first seed
  const firstSeedResult = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  // Reinitialize with different seed
  await rpc.wdkInit({
    seedPhrase: ALT_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  // Get addresses with second seed
  const secondSeedResult = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.not(firstSeedResult.eoaAddress, secondSeedResult.eoaAddress, 'EOA addresses should differ for different seeds')
  t.not(firstSeedResult.address, secondSeedResult.address, 'Abstracted addresses should differ for different seeds')

  // Restore original seed for subsequent tests
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
})

test('getAbstractedAddress - should return same addresses after reinit with same seed', async (t) => {
  // Get addresses
  const beforeReinit = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  // Reinitialize with same seed
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  // Get addresses again
  const afterReinit = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(beforeReinit.eoaAddress, afterReinit.eoaAddress, 'EOA address should be same after reinit')
  t.is(beforeReinit.address, afterReinit.address, 'Abstracted address should be same after reinit')
})

// ============================================
// Address Format Validation Tests
// ============================================

test('getAbstractedAddress - addresses should be valid hex format', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  const eoaWithout0x = result.eoaAddress.slice(2)
  const abstractedWithout0x = result.address.slice(2)

  const isEoaValidHex = /^[0-9a-fA-F]+$/.test(eoaWithout0x)
  const isAbstractedValidHex = /^[0-9a-fA-F]+$/.test(abstractedWithout0x)

  t.ok(isEoaValidHex, 'EOA address should be valid hexadecimal')
  t.ok(isAbstractedValidHex, 'Abstracted address should be valid hexadecimal')
})

test('getAbstractedAddress - addresses should be correct length', async (t) => {
  const result = await rpc.getAbstractedAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(result.eoaAddress.length, 42, 'EOA address should be 42 characters (including 0x)')
  t.is(result.address.length, 42, 'Abstracted address should be 42 characters (including 0x)')
})
