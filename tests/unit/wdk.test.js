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

// Mock wallet manager class
const mockWalletDispose = jest.fn()
const mockGetAccount = jest.fn()
const mockGetAccountByPath = jest.fn()

const MockWalletManager = jest.fn().mockImplementation((seed, config) => ({
  seed,
  config,
  dispose: mockWalletDispose,
  getAccount: mockGetAccount,
  getAccountByPath: mockGetAccountByPath
}))

// Mock moduleRegistry
jest.unstable_mockModule('../../src/wdk-core/module-registry.js', () => ({
  moduleRegistry: {
    getWalletManager: jest.fn().mockResolvedValue(MockWalletManager)
  }
}))

// Import after mocking
const { Blockchain, NetworkType } = await import('../../src/wdk-core/constants.js')
const { WDK } = await import('../../src/wdk-core/wdk.js')
const { moduleRegistry } = await import('../../src/wdk-core/module-registry.js')

describe('WDK', () => {
  let wdk
  const mockSeed = 'test seed phrase for wallet generation'
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
    wdk = new WDK(mockSeed, mockConfig)
  })

  afterEach(() => {
    if (wdk && !wdk._disposed) {
      wdk.dispose()
    }
  })

  describe('constructor', () => {
    it('should initialize with seed and config', () => {
      expect(wdk._seed).toBe(mockSeed)
      expect(wdk._config).toEqual(mockConfig)
      expect(wdk._wallets).toBeInstanceOf(Map)
      expect(wdk._wallets.size).toBe(0)
      expect(wdk._disposed).toBe(false)
    })

    it('should accept Uint8Array as seed', () => {
      const uint8Seed = new Uint8Array([1, 2, 3, 4])
      const wdkWithUint8 = new WDK(uint8Seed, mockConfig)

      expect(wdkWithUint8._seed).toBe(uint8Seed)
      wdkWithUint8.dispose()
    })
  })

  describe('getNetworkType', () => {
    it('should return network type for ethereum', () => {
      const result = wdk.getNetworkType(Blockchain.Ethereum)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for arbitrum', () => {
      const result = wdk.getNetworkType(Blockchain.Arbitrum)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for polygon', () => {
      const result = wdk.getNetworkType(Blockchain.Polygon)
      expect(result).toBe(NetworkType.EVM)
    })

    it('should return network type for ton', () => {
      const result = wdk.getNetworkType(Blockchain.Ton)
      expect(result).toBe(NetworkType.TON)
    })

    it('should return network type for tron', () => {
      const result = wdk.getNetworkType(Blockchain.Tron)
      expect(result).toBe(NetworkType.TRON)
    })

    it('should return network type for bitcoin', () => {
      const result = wdk.getNetworkType(Blockchain.Bitcoin)
      expect(result).toBe(NetworkType.BITCOIN)
    })

    it('should throw error for unsupported blockchain', () => {
      expect(() => wdk.getNetworkType('unsupported'))
        .toThrow('Unsupported blockchain: unsupported')
    })
  })

  describe('getAbstractionNetworkType', () => {
    it('should return abstraction network type for ethereum', () => {
      const result = wdk.getAbstractionNetworkType(Blockchain.Ethereum)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for arbitrum', () => {
      const result = wdk.getAbstractionNetworkType(Blockchain.Arbitrum)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for polygon', () => {
      const result = wdk.getAbstractionNetworkType(Blockchain.Polygon)
      expect(result).toBe(NetworkType.EVM_ABSTRACTION)
    })

    it('should return abstraction network type for ton', () => {
      const result = wdk.getAbstractionNetworkType(Blockchain.Ton)
      expect(result).toBe(NetworkType.TON_ABSTRACTION)
    })

    it('should return abstraction network type for tron', () => {
      const result = wdk.getAbstractionNetworkType(Blockchain.Tron)
      expect(result).toBe(NetworkType.TRON_ABSTRACTION)
    })

    it('should throw error for unsupported blockchain', () => {
      expect(() => wdk.getAbstractionNetworkType('unsupported'))
        .toThrow('Unsupported blockchain for abstraction: unsupported')
    })

    it('should throw error for bitcoin (no abstraction support)', () => {
      expect(() => wdk.getAbstractionNetworkType(Blockchain.Bitcoin))
        .toThrow('Unsupported blockchain for abstraction: bitcoin')
    })
  })

  describe('getConfig', () => {
    it('should return config for ethereum', () => {
      const result = wdk.getConfig(Blockchain.Ethereum)
      expect(result).toEqual({ rpcUrl: 'https://eth.example.com' })
    })

    it('should return config for ton', () => {
      const result = wdk.getConfig(Blockchain.Ton)
      expect(result).toEqual({ rpcUrl: 'https://ton.example.com' })
    })

    it('should return config for bitcoin', () => {
      const result = wdk.getConfig(Blockchain.Bitcoin)
      expect(result).toEqual({ rpcUrl: 'https://btc.example.com' })
    })

    it('should return undefined for non-existent blockchain', () => {
      const result = wdk.getConfig('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  describe('hasWallet', () => {
    it('should return false when wallet does not exist', () => {
      const result = wdk.hasWallet(Blockchain.Ethereum)
      expect(result).toBe(false)
    })

    it('should return true when wallet exists', async () => {
      await wdk.getWallet(Blockchain.Ethereum)
      const result = wdk.hasWallet(Blockchain.Ethereum)
      expect(result).toBe(true)
    })

    it('should return false for abstracted wallet key when checking regular', async () => {
      await wdk.getAbstractedWallet(Blockchain.Ethereum)
      const result = wdk.hasWallet(Blockchain.Ethereum)
      expect(result).toBe(false)
    })
  })

  describe('getWallet', () => {
    it('should create new wallet when not cached', async () => {
      const wallet = await wdk.getWallet(Blockchain.Ethereum)

      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.EVM)
      expect(MockWalletManager).toHaveBeenCalledWith(mockSeed, mockConfig.ethereum)
      expect(wallet.seed).toBe(mockSeed)
      expect(wallet.config).toEqual(mockConfig.ethereum)
    })

    it('should return cached wallet on subsequent calls', async () => {
      const wallet1 = await wdk.getWallet(Blockchain.Ethereum)
      const wallet2 = await wdk.getWallet(Blockchain.Ethereum)

      expect(wallet1).toBe(wallet2)
      expect(MockWalletManager).toHaveBeenCalledTimes(1)
    })

    it('should create separate wallets for different blockchains', async () => {
      const wallet1 = await wdk.getWallet(Blockchain.Ethereum)
      const wallet2 = await wdk.getWallet(Blockchain.Arbitrum)

      expect(wallet1).not.toBe(wallet2)
      expect(MockWalletManager).toHaveBeenCalledTimes(2)
    })

    it('should use correct network type for each blockchain', async () => {
      await wdk.getWallet(Blockchain.Ethereum)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.EVM)

      await wdk.getWallet(Blockchain.Ton)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.TON)

      await wdk.getWallet(Blockchain.Tron)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.TRON)

      await wdk.getWallet(Blockchain.Bitcoin)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.BITCOIN)
    })

    it('should throw error when disposed', async () => {
      wdk.dispose()

      await expect(wdk.getWallet(Blockchain.Ethereum))
        .rejects.toThrow('WDK instance has been disposed')
    })
  })

  describe('getAbstractedWallet', () => {
    it('should create new abstracted wallet when not cached', async () => {
      const wallet = await wdk.getAbstractedWallet(Blockchain.Ethereum)

      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.EVM_ABSTRACTION)
      expect(MockWalletManager).toHaveBeenCalledWith(mockSeed, mockConfig.ethereum)
      expect(wallet.seed).toBe(mockSeed)
    })

    it('should return cached abstracted wallet on subsequent calls', async () => {
      const wallet1 = await wdk.getAbstractedWallet(Blockchain.Ethereum)
      const wallet2 = await wdk.getAbstractedWallet(Blockchain.Ethereum)

      expect(wallet1).toBe(wallet2)
      expect(MockWalletManager).toHaveBeenCalledTimes(1)
    })

    it('should create separate wallets for regular and abstracted', async () => {
      const regularWallet = await wdk.getWallet(Blockchain.Ethereum)
      const abstractedWallet = await wdk.getAbstractedWallet(Blockchain.Ethereum)

      expect(regularWallet).not.toBe(abstractedWallet)
      expect(MockWalletManager).toHaveBeenCalledTimes(2)
    })

    it('should use correct abstraction network type', async () => {
      await wdk.getAbstractedWallet(Blockchain.Ethereum)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.EVM_ABSTRACTION)

      await wdk.getAbstractedWallet(Blockchain.Ton)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.TON_ABSTRACTION)

      await wdk.getAbstractedWallet(Blockchain.Tron)
      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.TRON_ABSTRACTION)
    })

    it('should throw error when disposed', async () => {
      wdk.dispose()

      await expect(wdk.getAbstractedWallet(Blockchain.Ethereum))
        .rejects.toThrow('WDK instance has been disposed')
    })
  })

  describe('getAccount', () => {
    it('should get account from wallet at index', async () => {
      const mockAccount = { address: '0x123' }
      mockGetAccount.mockResolvedValue(mockAccount)

      const account = await wdk.getAccount(Blockchain.Ethereum, 1)

      expect(mockGetAccount).toHaveBeenCalledWith(1)
      expect(account).toEqual(mockAccount)
    })

    it('should use default index 0', async () => {
      const mockAccount = { address: '0x123' }
      mockGetAccount.mockResolvedValue(mockAccount)

      await wdk.getAccount(Blockchain.Ethereum)

      expect(mockGetAccount).toHaveBeenCalledWith(0)
    })

    it('should create wallet if not exists', async () => {
      const mockAccount = { address: '0x123' }
      mockGetAccount.mockResolvedValue(mockAccount)

      await wdk.getAccount(Blockchain.Ethereum, 0)

      expect(MockWalletManager).toHaveBeenCalled()
      expect(wdk.hasWallet(Blockchain.Ethereum)).toBe(true)
    })
  })

  describe('getAbstractedAccount', () => {
    it('should get account from abstracted wallet at index', async () => {
      const mockAccount = { address: '0x456' }
      mockGetAccount.mockResolvedValue(mockAccount)

      const account = await wdk.getAbstractedAccount(Blockchain.Ethereum, 2)

      expect(mockGetAccount).toHaveBeenCalledWith(2)
      expect(account).toEqual(mockAccount)
    })

    it('should use default index 0', async () => {
      const mockAccount = { address: '0x456' }
      mockGetAccount.mockResolvedValue(mockAccount)

      await wdk.getAbstractedAccount(Blockchain.Ethereum)

      expect(mockGetAccount).toHaveBeenCalledWith(0)
    })

    it('should use abstracted wallet', async () => {
      const mockAccount = { address: '0x456' }
      mockGetAccount.mockResolvedValue(mockAccount)

      await wdk.getAbstractedAccount(Blockchain.Ethereum, 0)

      expect(moduleRegistry.getWalletManager).toHaveBeenCalledWith(NetworkType.EVM_ABSTRACTION)
    })
  })

  describe('getAccountByPath', () => {
    it('should get account by derivation path', async () => {
      const mockAccount = { address: '0x789' }
      mockGetAccountByPath.mockResolvedValue(mockAccount)

      const path = "m/44'/60'/0'/0/0"
      const account = await wdk.getAccountByPath(Blockchain.Ethereum, path)

      expect(mockGetAccountByPath).toHaveBeenCalledWith(path)
      expect(account).toEqual(mockAccount)
    })

    it('should create wallet if not exists', async () => {
      const mockAccount = { address: '0x789' }
      mockGetAccountByPath.mockResolvedValue(mockAccount)

      await wdk.getAccountByPath(Blockchain.Ethereum, "m/44'/60'/0'/0/0")

      expect(MockWalletManager).toHaveBeenCalled()
      expect(wdk.hasWallet(Blockchain.Ethereum)).toBe(true)
    })
  })

  describe('dispose', () => {
    it('should dispose all wallets', async () => {
      await wdk.getWallet(Blockchain.Ethereum)
      await wdk.getWallet(Blockchain.Arbitrum)

      wdk.dispose()

      expect(mockWalletDispose).toHaveBeenCalledTimes(2)
    })

    it('should dispose both regular and abstracted wallets', async () => {
      await wdk.getWallet(Blockchain.Ethereum)
      await wdk.getAbstractedWallet(Blockchain.Ethereum)

      wdk.dispose()

      expect(mockWalletDispose).toHaveBeenCalledTimes(2)
    })

    it('should clear wallets map', async () => {
      await wdk.getWallet(Blockchain.Ethereum)
      wdk.dispose()

      expect(wdk._wallets.size).toBe(0)
    })

    it('should set seed to null', () => {
      wdk.dispose()
      expect(wdk._seed).toBeNull()
    })

    it('should set config to null', () => {
      wdk.dispose()
      expect(wdk._config).toBeNull()
    })

    it('should set disposed flag to true', () => {
      wdk.dispose()
      expect(wdk._disposed).toBe(true)
    })

    it('should handle wallets without dispose method', async () => {
      const WalletWithoutDispose = jest.fn().mockImplementation((seed, config) => ({
        seed,
        config,
        getAccount: mockGetAccount
      }))
      moduleRegistry.getWalletManager.mockResolvedValueOnce(WalletWithoutDispose)

      await wdk.getWallet(Blockchain.Polygon)

      expect(() => wdk.dispose()).not.toThrow()
    })
  })

  describe('_checkDisposed', () => {
    it('should not throw when not disposed', () => {
      expect(() => wdk._checkDisposed()).not.toThrow()
    })

    it('should throw when disposed', () => {
      wdk.dispose()

      expect(() => wdk._checkDisposed())
        .toThrow('WDK instance has been disposed')
    })
  })
})
