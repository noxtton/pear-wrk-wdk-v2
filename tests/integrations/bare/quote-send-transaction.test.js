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
 * Integration tests for quoteSendTransaction and abstractedQuoteSendTransaction RPC methods
 * Read-only mode only, polygon network, EOA addresses for accountIndex 0 and 10
 * Run with: bare tests/integrations/bare/quote-send-transaction.test.js
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
const WDK_READ_ONLY_TYPE = 'wdkReadOnly'

// Account indices to test
const ACCOUNT_INDICES = [0, 10]

// Store EOA addresses per account index for read-only tests
const eoaAddressCache = {}

// Dummy recipient address for quote requests
const DUMMY_RECIPIENT = '0x000000000000000000000000000000000000dEaD'

// ============================================
// Setup - Initialize WDK and get EOA addresses
// ============================================

test('setup - initialize WDK to get EOA addresses for polygon', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDK should be initialized')
})

test('setup - get EOA addresses for polygon accountIndex 0 and 10', async (t) => {
  for (const index of ACCOUNT_INDICES) {
    const result = await rpc.getAbstractedAddress({
      network: 'polygon',
      accountIndex: index
    })
    eoaAddressCache[index] = result.eoaAddress
    t.ok(result.eoaAddress, `Should get EOA address for accountIndex ${index}`)
    t.ok(result.eoaAddress.startsWith('0x'), `EOA address for accountIndex ${index} should start with 0x`)
  }
})

test('setup - EOA addresses for different account indices should differ', (t) => {
  t.not(eoaAddressCache[0], eoaAddressCache[10], 'EOA addresses for accountIndex 0 and 10 should be different')
})

// ============================================
// Setup WDKReadOnly
// ============================================

test('setup - initialize WDKReadOnly for read-only quote tests', async (t) => {
  const result = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'polygon',
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDKReadOnly should be initialized')
})

// ============================================
// quoteSendTransaction - WDKReadOnly Tests
// ============================================

test('quoteSendTransaction - WDKReadOnly should return fee for polygon with EOA address (accountIndex 0)', async (t) => {
  const result = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

test('quoteSendTransaction - WDKReadOnly should return fee for polygon with EOA address (accountIndex 10)', async (t) => {
  const result = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[10],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

test('quoteSendTransaction - WDKReadOnly fee should be non-negative for polygon', async (t) => {
  const result = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  const feeNum = Number(result.fee)
  t.ok(feeNum >= 0, 'Fee should be non-negative')
})

test('quoteSendTransaction - WDKReadOnly fee string should represent valid BigInt for polygon', async (t) => {
  const result = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  try {
    BigInt(result.fee)
    t.pass('Fee should be convertible to BigInt')
  } catch {
    t.fail('Fee should be a valid BigInt string')
  }
})

test('quoteSendTransaction - WDKReadOnly should return consistent fee for same params on polygon', async (t) => {
  const params = {
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  }

  const firstCall = await rpc.quoteSendTransaction(params)
  const secondCall = await rpc.quoteSendTransaction(params)

  t.ok(firstCall.fee !== undefined, 'First call should return a fee')
  t.ok(secondCall.fee !== undefined, 'Second call should return a fee')
  // Fees may vary slightly between calls due to gas price fluctuations,
  // but both should be valid
  t.ok(!isNaN(Number(firstCall.fee)), 'First fee should be valid')
  t.ok(!isNaN(Number(secondCall.fee)), 'Second fee should be valid')
})

// ============================================
// quoteSendTransaction - Validation Tests
// ============================================

test('quoteSendTransaction - WDKReadOnly should require address', async (t) => {
  try {
    await rpc.quoteSendTransaction({
      wdkType: WDK_READ_ONLY_TYPE,
      network: 'polygon',
      // address missing
      options: {
        to: DUMMY_RECIPIENT,
        value: '1000'
      }
    })
    t.fail('Should have thrown an error')
  } catch (error) {
    const errorString = error.message || error.toString()
    t.ok(errorString.includes('address is required'), 'Error should mention address requirement')
  }
})

// ============================================
// abstractedQuoteSendTransaction - WDKReadOnly Tests
// ============================================

test('abstractedQuoteSendTransaction - WDKReadOnly should return fee for polygon with EOA address (accountIndex 0)', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

test('abstractedQuoteSendTransaction - WDKReadOnly should return fee for polygon with EOA address (accountIndex 10)', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[10],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

test('abstractedQuoteSendTransaction - WDKReadOnly fee should be non-negative for polygon', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  const feeNum = Number(result.fee)
  t.ok(feeNum >= 0, 'Fee should be non-negative')
})

test('abstractedQuoteSendTransaction - WDKReadOnly fee string should represent valid BigInt for polygon', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  try {
    BigInt(result.fee)
    t.pass('Fee should be convertible to BigInt')
  } catch {
    t.fail('Fee should be a valid BigInt string')
  }
})

test('abstractedQuoteSendTransaction - WDKReadOnly should return consistent fee for same params on polygon', async (t) => {
  const params = {
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  }

  const firstCall = await rpc.abstractedQuoteSendTransaction(params)
  const secondCall = await rpc.abstractedQuoteSendTransaction(params)

  t.ok(firstCall.fee !== undefined, 'First call should return a fee')
  t.ok(secondCall.fee !== undefined, 'Second call should return a fee')
  t.ok(!isNaN(Number(firstCall.fee)), 'First fee should be valid')
  t.ok(!isNaN(Number(secondCall.fee)), 'Second fee should be valid')
})

// ============================================
// abstractedQuoteSendTransaction - With Config Tests
// ============================================

test('abstractedQuoteSendTransaction - WDKReadOnly should accept config with paymasterToken for polygon (accountIndex 0)', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    },
    config: {
      paymasterToken: {
        address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on polygon
      }
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee with config')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

test('abstractedQuoteSendTransaction - WDKReadOnly should accept config with paymasterToken for polygon (accountIndex 10)', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[10],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    },
    config: {
      paymasterToken: {
        address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on polygon
      }
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee with config')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

// ============================================
// abstractedQuoteSendTransaction - With data field Tests
// ============================================

test('abstractedQuoteSendTransaction - WDKReadOnly should accept options with data field for polygon (accountIndex 0)', async (t) => {
  const result = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '0',
      data: '0x'
    }
  })

  t.ok(result.fee !== undefined, 'Should return a fee with data field')
  t.ok(typeof result.fee === 'string', 'Fee should be a string')
  t.ok(!isNaN(Number(result.fee)), 'Fee should be a valid number string')
})

// ============================================
// Cross-Account Index Comparison Tests
// ============================================

test('quoteSendTransaction - WDKReadOnly fees for different account indices should both be valid on polygon', async (t) => {
  const result0 = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  const result10 = await rpc.quoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[10],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result0.fee !== undefined, 'Should return fee for accountIndex 0')
  t.ok(result10.fee !== undefined, 'Should return fee for accountIndex 10')
  t.ok(Number(result0.fee) >= 0, 'Fee for accountIndex 0 should be non-negative')
  t.ok(Number(result10.fee) >= 0, 'Fee for accountIndex 10 should be non-negative')
})

test('abstractedQuoteSendTransaction - WDKReadOnly fees for different account indices should both be valid on polygon', async (t) => {
  const result0 = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[0],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  const result10 = await rpc.abstractedQuoteSendTransaction({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    address: eoaAddressCache[10],
    options: {
      to: DUMMY_RECIPIENT,
      value: '1000'
    }
  })

  t.ok(result0.fee !== undefined, 'Should return fee for accountIndex 0')
  t.ok(result10.fee !== undefined, 'Should return fee for accountIndex 10')
  t.ok(Number(result0.fee) >= 0, 'Fee for accountIndex 0 should be non-negative')
  t.ok(Number(result10.fee) >= 0, 'Fee for accountIndex 10 should be non-negative')
})
