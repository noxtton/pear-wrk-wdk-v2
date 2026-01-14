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

// Mock account class
const mockAccountDispose = jest.fn()
const MockReadOnlyAccount = jest.fn().mockImplementation((address, config) => ({
  address,
  config,
  dispose: mockAccountDispose
}))

// Mock moduleRegistry
jest.unstable_mockModule('../../src/wdk-core/module-registry.js', () => ({
  moduleRegistry: {
    getReadOnlyAccount: jest.fn().mockResolvedValue(MockReadOnlyAccount)
  }
}))

// Import after mocking
const { Blockchain, NetworkType, BLOCKCHAIN_NETWORK_TYPE, BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE } = await import('../../src/wdk-core/constants.js')
const { WDKReadOnly } = await import('../../src/wdk-core/wdk-read-only.js')
const { moduleRegistry } = await import('../../src/wdk-core/module-registry.js')

describe('WDKReadOnly', () => {
  let wdkReadOnly
  const mockConfig = {
    ethereum: { rpcUrl: 'https://eth.example.com' },
    arbitrum: { rpcUrl: 'https://arb.example.com' },
    polygon: { rpcUrl: 'https://polygon.example.com' },
    ton: { rpcUrl: 'https://ton.example.com' },
    tron: { rpcUrl: 'https://tron.example.com' },
    bitcoin: { rpcUrl: 'https://btc.example.com' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    wdkReadOnly = new WDKReadOnly(mockConfig)
  })

  afterEach(() => {
    if (wdkReadOnly && !wdkReadOnly._disposed) {
      wdkReadOnly.dispose()
    }
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(wdkReadOnly._config).toEqual(mockConfig)
      expect(wdkReadOnly._accounts).toBeInstanceOf(Map)
      expect(wdkReadOnly._accounts.size).toBe(0)
      expect(wdkReadOnly._disposed).toBe(false)
    })
  })

  describe('getNetworkType', () => {
    it('should return network type for ethereum', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Ethereum)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for arbitrum', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Arbitrum)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for polygon', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Polygon)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for ton', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Ton)
      expect(result).toBe(NetworkType.TON)
    })

    it('should return network type for tron', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Tron)
      expect(result).toBe(NetworkType.TRON)
    })

    it('should return network type for bitcoin', () => {
      const result = wdkReadOnly.getNetworkType(Blockchain.Bitcoin)
      expect(result).toBe(NetworkType.BITCOIN)
    })

    it('should throw error for unsupported blockchain', () => {
      expect(() => wdkReadOnly.getNetworkType('unsupported'))
        .toThrow('Unsupported blockchain: unsupported')
    })
  })

  describe('getAbstractionNetworkType', () => {
    it('should return abstraction network type for ethereum', () => {
      const result = wdkReadOnly.getAbstractionNetworkType(Blockchain.Ethereum)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for arbitrum', () => {
      const result = wdkReadOnly.getAbstractionNetworkType(Blockchain.Arbitrum)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for polygon', () => {
      const result = wdkReadOnly.getAbstractionNetworkType(Blockchain.Polygon)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for ton', () => {
      const result = wdkReadOnly.getAbstractionNetworkType(Blockchain.Ton)
      expect(result).toBe(NetworkType.TON_ABSTRACTION)
    })

    it('should return abstraction network type for tron', () => {
      const result = wdkReadOnly.getAbstractionNetworkType(Blockchain.Tron)
      expect(result).toBe(NetworkType.TRON_ABSTRACTION)
    })

    it('should throw error for unsupported blockchain', () => {
      expect(() => wdkReadOnly.getAbstractionNetworkType('unsupported'))
        .toThrow('Unsupported blockchain for abstraction: unsupported')
    })

    it('should throw error for bitcoin (no abstraction support)', () => {
      expect(() => wdkReadOnly.getAbstractionNetworkType(Blockchain.Bitcoin))
        .toThrow('Unsupported blockchain for abstraction: bitcoin')
    })
  })

  describe('getConfig', () => {
    it('should return config for ethereum', () => {
      const result = wdkReadOnly.getConfig(Blockchain.Ethereum)
      expect(result).toEqual({ rpcUrl: 'https://eth.example.com' })
    })

    it('should return config for ton', () => {
      const result = wdkReadOnly.getConfig(Blockchain.Ton)
      expect(result).toEqual({ rpcUrl: 'https://ton.example.com' })
    })

    it('should return undefined for non-existent blockchain', () => {
      const result = wdkReadOnly.getConfig('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  describe('_getAccountKey', () => {
    it('should generate correct account key', () => {
      const result = wdkReadOnly._getAccountKey(Blockchain.Ethereum, '0x123')
      expect(result).toBe('ethereum:0x123')
    })

    it('should generate unique keys for different blockchains', () => {
      const key1 = wdkReadOnly._getAccountKey(Blockchain.Ethereum, '0x123')
      const key2 = wdkReadOnly._getAccountKey(Blockchain.Arbitrum, '0x123')
      expect(key1).not.toBe(key2)
    })

    it('should generate unique keys for different addresses', () => {
      const key1 = wdkReadOnly._getAccountKey(Blockchain.Ethereum, '0x123')
      const key2 = wdkReadOnly._getAccountKey(Blockchain.Ethereum, '0x456')
      expect(key1).not.toBe(key2)
    })
  })

  describe('hasAccount', () => {
    it('should return false when account does not exist', () => {
      const result = wdkReadOnly.hasAccount(Blockchain.Ethereum, '0x123')
      expect(result).toBe(false)
    })

    it('should return true when account exists', async () => {
      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      const result = wdkReadOnly.hasAccount(Blockchain.Ethereum, '0x123')
      expect(result).toBe(true)
    })
  })

  describe('getAccount', () => {
    it('should create new account when not cached', async () => {
      const account = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')

      expect(moduleRegistry.getReadOnlyAccount).toHaveBeenCalledWith(NetworkType.EVM)
      expect(MockReadOnlyAccount).toHaveBeenCalledWith('0x123', mockConfig.ethereum)
      expect(account.address).toBe('0x123')
    })

    it('should return cached account on subsequent calls', async () => {
      const account1 = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      const account2 = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')

      expect(account1).toBe(account2)
      expect(MockReadOnlyAccount).toHaveBeenCalledTimes(1)
    })

    it('should create separate accounts for different addresses', async () => {
      const account1 = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      const account2 = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x456')

      expect(account1).not.toBe(account2)
      expect(MockReadOnlyAccount).toHaveBeenCalledTimes(2)
    })

    it('should create separate accounts for different blockchains', async () => {
      const account1 = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      const account2 = await wdkReadOnly.getAccount(Blockchain.Arbitrum, '0x123')

      expect(account1).not.toBe(account2)
      expect(MockReadOnlyAccount).toHaveBeenCalledTimes(2)
    })

    it('should throw error when disposed', async () => {
      wdkReadOnly.dispose()

      await expect(wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123'))
        .rejects.toThrow('WDKReadOnly instance has been disposed')
    })
  })

  describe('getAbstractedAccount', () => {
    it('should create new abstracted account when not cached', async () => {
      const account = await wdkReadOnly.getAbstractedAccount(Blockchain.Ethereum, '0x123')

      expect(moduleRegistry.getReadOnlyAccount).toHaveBeenCalledWith(NetworkType.EVM_ABSTRACTION)
      expect(MockReadOnlyAccount).toHaveBeenCalledWith('0x123', mockConfig.ethereum)
      expect(account.address).toBe('0x123')
    })

    it('should return cached abstracted account on subsequent calls', async () => {
      const account1 = await wdkReadOnly.getAbstractedAccount(Blockchain.Ethereum, '0x123')
      const account2 = await wdkReadOnly.getAbstractedAccount(Blockchain.Ethereum, '0x123')

      expect(account1).toBe(account2)
      expect(MockReadOnlyAccount).toHaveBeenCalledTimes(1)
    })

    it('should create separate accounts for regular and abstracted', async () => {
      const regularAccount = await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      const abstractedAccount = await wdkReadOnly.getAbstractedAccount(Blockchain.Ethereum, '0x123')

      expect(regularAccount).not.toBe(abstractedAccount)
      expect(MockReadOnlyAccount).toHaveBeenCalledTimes(2)
    })

    it('should throw error when disposed', async () => {
      wdkReadOnly.dispose()

      await expect(wdkReadOnly.getAbstractedAccount(Blockchain.Ethereum, '0x123'))
        .rejects.toThrow('WDKReadOnly instance has been disposed')
    })
  })

  describe('removeAccount', () => {
    it('should remove account from cache', async () => {
      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      expect(wdkReadOnly.hasAccount(Blockchain.Ethereum, '0x123')).toBe(true)

      wdkReadOnly.removeAccount(Blockchain.Ethereum, '0x123')

      expect(wdkReadOnly.hasAccount(Blockchain.Ethereum, '0x123')).toBe(false)
    })

    it('should dispose account when removing', async () => {
      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      wdkReadOnly.removeAccount(Blockchain.Ethereum, '0x123')

      expect(mockAccountDispose).toHaveBeenCalled()
    })

    it('should not throw when removing non-existent account', () => {
      expect(() => wdkReadOnly.removeAccount(Blockchain.Ethereum, '0xnonexistent'))
        .not.toThrow()
    })

    it('should handle account without dispose method', async () => {
      // Create account without dispose method
      const AccountWithoutDispose = jest.fn().mockImplementation((address, config) => ({
        address,
        config
      }))
      moduleRegistry.getReadOnlyAccount.mockResolvedValueOnce(AccountWithoutDispose)

      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x789')

      expect(() => wdkReadOnly.removeAccount(Blockchain.Ethereum, '0x789'))
        .not.toThrow()
    })
  })

  describe('dispose', () => {
    it('should dispose all accounts', async () => {
      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      await wdkReadOnly.getAccount(Blockchain.Arbitrum, '0x456')

      wdkReadOnly.dispose()

      expect(mockAccountDispose).toHaveBeenCalledTimes(2)
    })

    it('should clear accounts map', async () => {
      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x123')
      wdkReadOnly.dispose()

      expect(wdkReadOnly._accounts.size).toBe(0)
    })

    it('should set config to null', () => {
      wdkReadOnly.dispose()
      expect(wdkReadOnly._config).toBeNull()
    })

    it('should set disposed flag to true', () => {
      wdkReadOnly.dispose()
      expect(wdkReadOnly._disposed).toBe(true)
    })

    it('should handle accounts without dispose method', async () => {
      const AccountWithoutDispose = jest.fn().mockImplementation((address, config) => ({
        address,
        config
      }))
      moduleRegistry.getReadOnlyAccount.mockResolvedValueOnce(AccountWithoutDispose)

      await wdkReadOnly.getAccount(Blockchain.Ethereum, '0x789')

      expect(() => wdkReadOnly.dispose()).not.toThrow()
    })
  })

  describe('_checkDisposed', () => {
    it('should not throw when not disposed', () => {
      expect(() => wdkReadOnly._checkDisposed()).not.toThrow()
    })

    it('should throw when disposed', () => {
      wdkReadOnly.dispose()

      expect(() => wdkReadOnly._checkDisposed())
        .toThrow('WDKReadOnly instance has been disposed')
    })
  })
})
