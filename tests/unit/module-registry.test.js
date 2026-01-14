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

import { jest } from '@jest/globals'

// Mock wallet managers
const MockWalletManagerEvm = class WalletManagerEvm {}
const MockWalletManagerEvmErc4337 = class WalletManagerEvmErc4337 {}
const MockWalletManagerTon = class WalletManagerTon {}
const MockWalletManagerTonGasless = class WalletManagerTonGasless {}
const MockWalletManagerTron = class WalletManagerTron {}
const MockWalletManagerTronGasfree = class WalletManagerTronGasfree {}
const MockWalletManagerBtc = class WalletManagerBtc {}

// Mock read-only accounts
const MockWalletAccountReadOnlyEvm = class WalletAccountReadOnlyEvm {}
const MockWalletAccountReadOnlyEvmErc4337 = class WalletAccountReadOnlyEvmErc4337 {}
const MockWalletAccountReadOnlyTon = class WalletAccountReadOnlyTon {}
const MockWalletAccountReadOnlyTonGasless = class WalletAccountReadOnlyTonGasless {}
const MockWalletAccountReadOnlyTron = class WalletAccountReadOnlyTron {}
const MockWalletAccountReadOnlyTronGasfree = class WalletAccountReadOnlyTronGasfree {}
const MockWalletAccountReadOnlyBtc = class WalletAccountReadOnlyBtc {}

// Mock all wallet packages
jest.unstable_mockModule('@tetherto/wdk-wallet-evm', () => ({
  default: MockWalletManagerEvm,
  WalletAccountReadOnlyEvm: MockWalletAccountReadOnlyEvm
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-evm-erc-4337', () => ({
  default: MockWalletManagerEvmErc4337,
  WalletAccountReadOnlyEvmErc4337: MockWalletAccountReadOnlyEvmErc4337
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-ton', () => ({
  default: MockWalletManagerTon,
  WalletAccountReadOnlyTon: MockWalletAccountReadOnlyTon
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-ton-gasless', () => ({
  default: MockWalletManagerTonGasless,
  WalletAccountReadOnlyTonGasless: MockWalletAccountReadOnlyTonGasless
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-tron', () => ({
  default: MockWalletManagerTron,
  WalletAccountReadOnlyTron: MockWalletAccountReadOnlyTron
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-tron-gasfree', () => ({
  default: MockWalletManagerTronGasfree,
  WalletAccountReadOnlyTronGasfree: MockWalletAccountReadOnlyTronGasfree
}))

jest.unstable_mockModule('@tetherto/wdk-wallet-btc', () => ({
  default: MockWalletManagerBtc,
  WalletAccountReadOnlyBtc: MockWalletAccountReadOnlyBtc
}))

// Import after mocking
const { NetworkType } = await import('../../src/wdk-core/constants.js')
const { ModuleRegistry, moduleRegistry } = await import('../../src/wdk-core/module-registry.js')

describe('ModuleRegistry', () => {
  let registry

  beforeEach(() => {
    registry = new ModuleRegistry()
  })

  afterEach(() => {
    registry.clear()
  })

  describe('constructor', () => {
    it('should initialize with empty maps', () => {
      expect(registry._walletManagers).toBeInstanceOf(Map)
      expect(registry._walletManagers.size).toBe(0)
      expect(registry._readOnlyAccounts).toBeInstanceOf(Map)
      expect(registry._readOnlyAccounts.size).toBe(0)
      expect(registry._pendingImports).toBeInstanceOf(Map)
      expect(registry._pendingImports.size).toBe(0)
    })
  })

  describe('getWalletManager', () => {
    describe('EVM', () => {
      it('should import and return EVM wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.EVM)
        expect(result).toBe(MockWalletManagerEvm)
      })

      it('should cache EVM wallet manager', async () => {
        await registry.getWalletManager(NetworkType.EVM)
        expect(registry._walletManagers.has(NetworkType.EVM)).toBe(true)
      })

      it('should return cached EVM wallet manager on subsequent calls', async () => {
        const result1 = await registry.getWalletManager(NetworkType.EVM)
        const result2 = await registry.getWalletManager(NetworkType.EVM)
        expect(result1).toBe(result2)
      })
    })

    describe('EVM_ABSTRACTION', () => {
      it('should import and return EVM ERC-4337 wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.EVM_ABSTRACTION)
        expect(result).toBe(MockWalletManagerEvmErc4337)
      })
    })

    describe('TON', () => {
      it('should import and return TON wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.TON)
        expect(result).toBe(MockWalletManagerTon)
      })
    })

    describe('TON_ABSTRACTION', () => {
      it('should import and return TON gasless wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.TON_ABSTRACTION)
        expect(result).toBe(MockWalletManagerTonGasless)
      })
    })

    describe('TRON', () => {
      it('should import and return TRON wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.TRON)
        expect(result).toBe(MockWalletManagerTron)
      })
    })

    describe('TRON_ABSTRACTION', () => {
      it('should import and return TRON gasfree wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.TRON_ABSTRACTION)
        expect(result).toBe(MockWalletManagerTronGasfree)
      })
    })

    describe('BITCOIN', () => {
      it('should import and return BTC wallet manager', async () => {
        const result = await registry.getWalletManager(NetworkType.BITCOIN)
        expect(result).toBe(MockWalletManagerBtc)
      })
    })

    describe('unknown network type', () => {
      it('should throw error for unknown network type', async () => {
        await expect(registry.getWalletManager('unknown'))
          .rejects.toThrow('Unknown network type: unknown')
      })
    })

    describe('concurrent imports', () => {
      it('should handle concurrent imports for same network type', async () => {
        const promise1 = registry.getWalletManager(NetworkType.EVM)
        const promise2 = registry.getWalletManager(NetworkType.EVM)

        const [result1, result2] = await Promise.all([promise1, promise2])

        expect(result1).toBe(result2)
        expect(result1).toBe(MockWalletManagerEvm)
      })
    })
  })

  describe('getReadOnlyAccount', () => {
    describe('EVM', () => {
      it('should import and return EVM read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.EVM)
        expect(result).toBe(MockWalletAccountReadOnlyEvm)
      })

      it('should cache EVM read-only account', async () => {
        await registry.getReadOnlyAccount(NetworkType.EVM)
        expect(registry._readOnlyAccounts.has(NetworkType.EVM)).toBe(true)
      })

      it('should return cached EVM read-only account on subsequent calls', async () => {
        const result1 = await registry.getReadOnlyAccount(NetworkType.EVM)
        const result2 = await registry.getReadOnlyAccount(NetworkType.EVM)
        expect(result1).toBe(result2)
      })
    })

    describe('EVM_ABSTRACTION', () => {
      it('should import and return EVM ERC-4337 read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.EVM_ABSTRACTION)
        expect(result).toBe(MockWalletAccountReadOnlyEvmErc4337)
      })
    })

    describe('TON', () => {
      it('should import and return TON read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.TON)
        expect(result).toBe(MockWalletAccountReadOnlyTon)
      })
    })

    describe('TON_ABSTRACTION', () => {
      it('should import and return TON gasless read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.TON_ABSTRACTION)
        expect(result).toBe(MockWalletAccountReadOnlyTonGasless)
      })
    })

    describe('TRON', () => {
      it('should import and return TRON read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.TRON)
        expect(result).toBe(MockWalletAccountReadOnlyTron)
      })
    })

    describe('TRON_ABSTRACTION', () => {
      it('should import and return TRON gasfree read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.TRON_ABSTRACTION)
        expect(result).toBe(MockWalletAccountReadOnlyTronGasfree)
      })
    })

    describe('BITCOIN', () => {
      it('should import and return BTC read-only account', async () => {
        const result = await registry.getReadOnlyAccount(NetworkType.BITCOIN)
        expect(result).toBe(MockWalletAccountReadOnlyBtc)
      })
    })

    describe('unknown network type', () => {
      it('should throw error for unknown network type', async () => {
        await expect(registry.getReadOnlyAccount('unknown'))
          .rejects.toThrow('Unknown network type: unknown')
      })
    })

    describe('concurrent imports', () => {
      it('should handle concurrent imports for same network type', async () => {
        const promise1 = registry.getReadOnlyAccount(NetworkType.EVM)
        const promise2 = registry.getReadOnlyAccount(NetworkType.EVM)

        const [result1, result2] = await Promise.all([promise1, promise2])

        expect(result1).toBe(result2)
        expect(result1).toBe(MockWalletAccountReadOnlyEvm)
      })
    })
  })

  describe('clear', () => {
    it('should clear wallet managers', async () => {
      await registry.getWalletManager(NetworkType.EVM)
      await registry.getWalletManager(NetworkType.TON)

      registry.clear()

      expect(registry._walletManagers.size).toBe(0)
    })

    it('should clear read-only accounts', async () => {
      await registry.getReadOnlyAccount(NetworkType.EVM)
      await registry.getReadOnlyAccount(NetworkType.TON)

      registry.clear()

      expect(registry._readOnlyAccounts.size).toBe(0)
    })

    it('should clear pending imports', async () => {
      registry.clear()
      expect(registry._pendingImports.size).toBe(0)
    })
  })

  describe('moduleRegistry singleton', () => {
    it('should be an instance of ModuleRegistry', () => {
      expect(moduleRegistry).toBeInstanceOf(ModuleRegistry)
    })

    it('should be a singleton', async () => {
      const { moduleRegistry: registry2 } = await import('../../src/wdk-core/module-registry.js')
      expect(moduleRegistry).toBe(registry2)
    })
  })
})
