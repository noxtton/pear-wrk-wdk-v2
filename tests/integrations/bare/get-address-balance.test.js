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
 * Integration tests for getAddressBalance RPC method
 * Run with: bare tests/integrations/bare/get-address-balance.test.js
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

// WDK types
const WDK_TYPE = 'wdk'
const WDK_READ_ONLY_TYPE = 'wdkReadOnly'

// Network lists
const EVM_NETWORKS = ['ethereum', 'polygon', 'arbitrum']
const ALL_NETWORKS = ['ethereum', 'polygon', 'arbitrum', 'bitcoin']

// Store addresses for read-only tests
const addressCache = {}

// ============================================
// Setup - Initialize WDK and get addresses for tests
// ============================================

test('setup - initialize WDK for getAddressBalance tests', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDK should be initialized')
})

test('setup - get addresses for read-only tests', async (t) => {
  for (const network of ALL_NETWORKS) {
    const result = await rpc.getAddress({
      network,
      accountIndex: 0
    })
    addressCache[network] = result.address
    t.ok(result.address, `Should get address for ${network}`)
  }
})

// ============================================
// WDK Type (Non-Read-Only) Balance Tests
// ============================================

test('getAddressBalance - WDK type should return balance for ethereum', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDK type should return balance for polygon', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'polygon',
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDK type should return balance for arbitrum', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'arbitrum',
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDK type should return balance for bitcoin', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'bitcoin',
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDK Type - Account Index Tests
// ============================================

test('getAddressBalance - WDK type should return balance for different account indices', async (t) => {
  const balance0 = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 0
  })

  const balance1 = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 1
  })

  t.ok(balance0.balance !== undefined, 'Should return balance for index 0')
  t.ok(balance1.balance !== undefined, 'Should return balance for index 1')
})

test('getAddressBalance - WDK type should return consistent balance for same account', async (t) => {
  const firstCall = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 0
  })

  const secondCall = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 0
  })

  t.is(firstCall.balance, secondCall.balance, 'Balance should be consistent for same account')
})

// ============================================
// WDK Type - Validation Tests
// ============================================

test('getAddressBalance - WDK type should require accountIndex', async (t) => {
  try {
    await rpc.getAddressBalance({
      wdkType: WDK_TYPE,
      network: 'ethereum'
      // accountIndex missing
    })
    t.fail('Should have thrown an error')
  } catch (error) {
    const errorString = error.message || error.toString()
    t.ok(errorString.includes('accountIndex is required'), 'Error should mention accountIndex requirement')
  }
})

// ============================================
// Setup WDKReadOnly for Read-Only Tests
// ============================================

test('setup - initialize WDKReadOnly for read-only balance tests', async (t) => {
  const result = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum,bitcoin',
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDKReadOnly should be initialized')
})

// ============================================
// WDKReadOnly Type Balance Tests
// ============================================

test('getAddressBalance - WDKReadOnly type should return balance for ethereum with address', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    address: addressCache.ethereum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDKReadOnly type should return balance for polygon with address', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: addressCache.polygon
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDKReadOnly type should return balance for arbitrum with address', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'arbitrum',
    address: addressCache.arbitrum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAddressBalance - WDKReadOnly type should return balance for bitcoin with address', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'bitcoin',
    address: addressCache.bitcoin
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDKReadOnly - Consistent Balance Tests
// ============================================

test('getAddressBalance - WDKReadOnly should return same balance as WDK for same address', async (t) => {
  // Get balance using WDK type (requires re-init since we initialized read-only)
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  const wdkBalance = await rpc.getAddressBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    accountIndex: 0
  })

  // Re-init read-only
  await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum,bitcoin',
    config: JSON.stringify(config)
  })

  const readOnlyBalance = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    address: addressCache.ethereum
  })

  t.is(wdkBalance.balance, readOnlyBalance.balance, 'WDK and WDKReadOnly should return same balance for same address')
})

// ============================================
// WDKReadOnly - Validation Tests
// ============================================

test('getAddressBalance - WDKReadOnly type should require address', async (t) => {
  try {
    await rpc.getAddressBalance({
      wdkType: WDK_READ_ONLY_TYPE,
      network: 'ethereum'
      // address missing
    })
    t.fail('Should have thrown an error')
  } catch (error) {
    const errorString = error.message || error.toString()
    t.ok(errorString.includes('address is required'), 'Error should mention address requirement')
  }
})

// ============================================
// WDKReadOnly - Cross-Network Tests
// ============================================

test('getAddressBalance - WDKReadOnly should work with same address across EVM networks', async (t) => {
  // EVM networks share the same address
  const sharedAddress = addressCache.ethereum

  for (const network of EVM_NETWORKS) {
    const result = await rpc.getAddressBalance({
      wdkType: WDK_READ_ONLY_TYPE,
      network,
      address: sharedAddress
    })

    t.ok(result.balance !== undefined, `Should return balance for ${network}`)
    t.ok(typeof result.balance === 'string', `Balance for ${network} should be a string`)
  }
})

// ============================================
// Balance Format Tests
// ============================================

test('getAddressBalance - balance should be non-negative', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    address: addressCache.ethereum
  })

  const balanceNum = Number(result.balance)
  t.ok(balanceNum >= 0, 'Balance should be non-negative')
})

test('getAddressBalance - balance string should represent valid BigInt', async (t) => {
  const result = await rpc.getAddressBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    address: addressCache.ethereum
  })

  try {
    BigInt(result.balance)
    t.pass('Balance should be convertible to BigInt')
  } catch {
    t.fail('Balance should be a valid BigInt string')
  }
})
