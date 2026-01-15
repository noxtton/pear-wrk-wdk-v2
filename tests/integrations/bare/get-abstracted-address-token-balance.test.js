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
 * Integration tests for getAbstractedAddressTokenBalance RPC method
 * Run with: bare tests/integrations/bare/get-abstracted-address-token-balance.test.js
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

// Network list for abstraction
const NETWORKS = ['ethereum', 'polygon', 'arbitrum']

// USDT token addresses per network
const USDT_ADDRESSES = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  polygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  arbitrum: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
}

// XAUT token addresses per network
const XAUT_ADDRESSES = {
  ethereum: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
  polygon: '0xF1815bd50389c46847f0Bda824eC8da914045D14',
  arbitrum: '0x40461291347e1eCbb09499F3371D3f17f10d7159'
}

// Store EOA addresses for read-only tests (from getAbstractedAddress)
const eoaAddressCache = {}

// ============================================
// Setup - Initialize WDK and get EOA addresses for tests
// ============================================

test('setup - initialize WDK for getAbstractedAddressTokenBalance tests', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDK should be initialized')
})

test('setup - get EOA addresses from getAbstractedAddress for read-only tests', async (t) => {
  for (const network of NETWORKS) {
    const result = await rpc.getAbstractedAddress({
      network,
      accountIndex: 0
    })
    eoaAddressCache[network] = result.eoaAddress
    t.ok(result.eoaAddress, `Should get EOA address for ${network}`)
    t.ok(result.eoaAddress.startsWith('0x'), `EOA address for ${network} should start with 0x`)
  }
})

// ============================================
// WDK Type - USDT Token Balance Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDK type should return USDT balance for ethereum', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDK type should return USDT balance for polygon', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'polygon',
    tokenAddress: USDT_ADDRESSES.polygon,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDK type should return USDT balance for arbitrum', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'arbitrum',
    tokenAddress: USDT_ADDRESSES.arbitrum,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDK Type - XAUT Token Balance Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDK type should return XAUT balance for ethereum', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDK type should return XAUT balance for polygon', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'polygon',
    tokenAddress: XAUT_ADDRESSES.polygon,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDK type should return XAUT balance for arbitrum', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'arbitrum',
    tokenAddress: XAUT_ADDRESSES.arbitrum,
    accountIndex: 0
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDK Type - Account Index Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDK type should return USDT balance for different account indices', async (t) => {
  const balance0 = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  const balance1 = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 1
  })

  t.ok(balance0.balance !== undefined, 'Should return balance for index 0')
  t.ok(balance1.balance !== undefined, 'Should return balance for index 1')
})

test('getAbstractedAddressTokenBalance - WDK type should return consistent USDT balance for same account', async (t) => {
  const firstCall = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  const secondCall = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  t.is(firstCall.balance, secondCall.balance, 'USDT balance should be consistent for same account')
})

test('getAbstractedAddressTokenBalance - WDK type should return consistent XAUT balance for same account', async (t) => {
  const firstCall = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  const secondCall = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  t.is(firstCall.balance, secondCall.balance, 'XAUT balance should be consistent for same account')
})

// ============================================
// WDK Type - Validation Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDK type should require accountIndex', async (t) => {
  try {
    await rpc.getAbstractedAddressTokenBalance({
      wdkType: WDK_TYPE,
      network: 'ethereum',
      tokenAddress: USDT_ADDRESSES.ethereum
      // accountIndex missing
    })
    t.fail('Should have thrown an error')
  } catch (error) {
    t.ok(error.message.includes('accountIndex is required'), 'Error should mention accountIndex requirement')
  }
})

// ============================================
// Setup WDKReadOnly for Read-Only Tests
// ============================================

test('setup - initialize WDKReadOnly for read-only token balance tests', async (t) => {
  const result = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum',
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'WDKReadOnly should be initialized')
})

// ============================================
// WDKReadOnly Type - USDT Token Balance Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return USDT balance for ethereum with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return USDT balance for polygon with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    tokenAddress: USDT_ADDRESSES.polygon,
    address: eoaAddressCache.polygon
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return USDT balance for arbitrum with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'arbitrum',
    tokenAddress: USDT_ADDRESSES.arbitrum,
    address: eoaAddressCache.arbitrum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDKReadOnly Type - XAUT Token Balance Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return XAUT balance for ethereum with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return XAUT balance for polygon with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'polygon',
    tokenAddress: XAUT_ADDRESSES.polygon,
    address: eoaAddressCache.polygon
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

test('getAbstractedAddressTokenBalance - WDKReadOnly type should return XAUT balance for arbitrum with EOA address', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'arbitrum',
    tokenAddress: XAUT_ADDRESSES.arbitrum,
    address: eoaAddressCache.arbitrum
  })

  t.ok(result.balance !== undefined, 'Should return a balance')
  t.ok(typeof result.balance === 'string', 'Balance should be a string')
  t.ok(!isNaN(Number(result.balance)), 'Balance should be a valid number string')
})

// ============================================
// WDKReadOnly - Consistent Balance Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDKReadOnly should return same USDT balance as WDK for same EOA address', async (t) => {
  // Get balance using WDK type (requires re-init)
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  const wdkBalance = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  // Re-init read-only
  await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum',
    config: JSON.stringify(config)
  })

  const readOnlyBalance = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  t.is(wdkBalance.balance, readOnlyBalance.balance, 'WDK and WDKReadOnly should return same USDT balance for same EOA address')
})

test('getAbstractedAddressTokenBalance - WDKReadOnly should return same XAUT balance as WDK for same EOA address', async (t) => {
  // Get balance using WDK type (requires re-init)
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  const wdkBalance = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    accountIndex: 0
  })

  // Re-init read-only
  await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum',
    config: JSON.stringify(config)
  })

  const readOnlyBalance = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  t.is(wdkBalance.balance, readOnlyBalance.balance, 'WDK and WDKReadOnly should return same XAUT balance for same EOA address')
})

// ============================================
// WDKReadOnly - Validation Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDKReadOnly type should require address', async (t) => {
  try {
    await rpc.getAbstractedAddressTokenBalance({
      wdkType: WDK_READ_ONLY_TYPE,
      network: 'ethereum',
      tokenAddress: USDT_ADDRESSES.ethereum
      // address missing
    })
    t.fail('Should have thrown an error')
  } catch (error) {
    t.ok(error.message.includes('address is required'), 'Error should mention address requirement')
  }
})

// ============================================
// WDKReadOnly - Cross-Network Tests
// ============================================

test('getAbstractedAddressTokenBalance - WDKReadOnly should work with same EOA address across EVM networks for USDT', async (t) => {
  // EVM networks share the same EOA address
  const sharedEoaAddress = eoaAddressCache.ethereum

  for (const network of NETWORKS) {
    const result = await rpc.getAbstractedAddressTokenBalance({
      wdkType: WDK_READ_ONLY_TYPE,
      network,
      tokenAddress: USDT_ADDRESSES[network],
      address: sharedEoaAddress
    })

    t.ok(result.balance !== undefined, `Should return USDT balance for ${network}`)
    t.ok(typeof result.balance === 'string', `USDT balance for ${network} should be a string`)
  }
})

test('getAbstractedAddressTokenBalance - WDKReadOnly should work with same EOA address across EVM networks for XAUT', async (t) => {
  // EVM networks share the same EOA address
  const sharedEoaAddress = eoaAddressCache.ethereum

  for (const network of NETWORKS) {
    const result = await rpc.getAbstractedAddressTokenBalance({
      wdkType: WDK_READ_ONLY_TYPE,
      network,
      tokenAddress: XAUT_ADDRESSES[network],
      address: sharedEoaAddress
    })

    t.ok(result.balance !== undefined, `Should return XAUT balance for ${network}`)
    t.ok(typeof result.balance === 'string', `XAUT balance for ${network} should be a string`)
  }
})

// ============================================
// Token Balance Format Tests
// ============================================

test('getAbstractedAddressTokenBalance - USDT balance should be non-negative', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  const balanceNum = Number(result.balance)
  t.ok(balanceNum >= 0, 'USDT balance should be non-negative')
})

test('getAbstractedAddressTokenBalance - XAUT balance should be non-negative', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  const balanceNum = Number(result.balance)
  t.ok(balanceNum >= 0, 'XAUT balance should be non-negative')
})

test('getAbstractedAddressTokenBalance - USDT balance string should represent valid BigInt', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: USDT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  try {
    BigInt(result.balance)
    t.pass('USDT balance should be convertible to BigInt')
  } catch {
    t.fail('USDT balance should be a valid BigInt string')
  }
})

test('getAbstractedAddressTokenBalance - XAUT balance string should represent valid BigInt', async (t) => {
  const result = await rpc.getAbstractedAddressTokenBalance({
    wdkType: WDK_READ_ONLY_TYPE,
    network: 'ethereum',
    tokenAddress: XAUT_ADDRESSES.ethereum,
    address: eoaAddressCache.ethereum
  })

  try {
    BigInt(result.balance)
    t.pass('XAUT balance should be convertible to BigInt')
  } catch {
    t.fail('XAUT balance should be a valid BigInt string')
  }
})
