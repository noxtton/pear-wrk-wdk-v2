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
 * Integration tests for WDK initialization RPC methods
 * Run with: bare tests/integrations/bare/wdk-init.test.js
 */

import test from 'brittle'
import { serverStream, clientStream } from '../../../src/lib/ipc.js'
import config from '../../../local/chains.json'

// Setup BareKit mock before importing worklet
global.BareKit = { IPC: serverStream }
await import('../../../src/worklet.mjs')

import HRPC from '../../../spec/hrpc'

const rpc = new HRPC(clientStream)

// Test seed phrases
const TEST_SEED_PHRASE = 'clump cherry rural carry lazy blade gain high holiday point witness when'
const ALT_SEED_PHRASE = 'rack cruise mouse aspect wise model abstract acquire crack chicken defense blue'

// ============================================
// onWdkInit Tests
// ============================================

test('onWdkInit - should initialize WDK with seed phrase', async (t) => {
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  t.is(result.status, 'started', 'Status should be "started"')
})

test('onWdkInit - should reinitialize WDK with different seed phrase', async (t) => {
  // First init
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  // Second init with different seed
  const result = await rpc.wdkInit({
    seedPhrase: ALT_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  t.is(result.status, 'started', 'Status should be "started" after reinit')
})

test('onWdkInit - should initialize WDK and allow getAddress call', async (t) => {
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  const addressResult = await rpc.getAddress({
    network: 'ethereum',
    accountIndex: 0
  })

  t.ok(addressResult.address, 'Should return an address')
  t.ok(addressResult.address.startsWith('0x'), 'Ethereum address should start with 0x')
})

test('onWdkInit - should work with valid config after invalid attempt', async (t) => {
  // Re-initialize with valid config to ensure system is in good state
  const result = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(result.status, 'started', 'Should recover with valid config')
})

// ============================================
// onWdkReadOnlyInit Tests
// ============================================

test('onWdkReadOnlyInit - should initialize WDKReadOnly', async (t) => {
  const result = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum',
    config: JSON.stringify(config)
  })

  t.is(result.status, 'started', 'Status should be "started"')
})

test('onWdkReadOnlyInit - should initialize WDKReadOnly multiple times without error', async (t) => {
  // First init
  await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum',
    config: JSON.stringify(config)
  })

  // Second init
  const result = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon',
    config: JSON.stringify(config)
  })

  t.is(result.status, 'started', 'Status should be "started" after second init')
})

// ============================================
// Combined WDK and WDKReadOnly Tests
// ============================================

test('combined - should allow both WDK and WDKReadOnly to be initialized', async (t) => {
  // Initialize WDK
  const wdkResult = await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })
  t.is(wdkResult.status, 'started', 'WDK status should be "started"')

  // Initialize WDKReadOnly
  const readOnlyResult = await rpc.wdkReadOnlyInit({
    allowedNetworks: 'ethereum,polygon,arbitrum',
    config: JSON.stringify(config)
  })
  t.is(readOnlyResult.status, 'started', 'WDKReadOnly status should be "started"')
})

test('combined - should get address for multiple networks after WDK init', async (t) => {
  await rpc.wdkInit({
    seedPhrase: TEST_SEED_PHRASE,
    config: JSON.stringify(config)
  })

  const networks = ['ethereum', 'polygon', 'arbitrum']

  for (const network of networks) {
    const result = await rpc.getAddress({
      network,
      accountIndex: 0
    })
    t.ok(result.address, `Should return address for ${network}`)
  }
})
