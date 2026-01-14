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

// Mock dependencies
const mockWdkDispose = jest.fn()
const mockWdkGetWallet = jest.fn()
const mockWdkGetAccount = jest.fn()
const mockWdkGetAccountByPath = jest.fn()
const mockWdkGetAbstractedAccount = jest.fn()

const mockWdkReadOnlyDispose = jest.fn()
const mockWdkReadOnlyGetAccount = jest.fn()

const MockWDK = jest.fn().mockImplementation(() => ({
  dispose: mockWdkDispose,
  getWallet: mockWdkGetWallet,
  getAccount: mockWdkGetAccount,
  getAccountByPath: mockWdkGetAccountByPath,
  getAbstractedAccount: mockWdkGetAbstractedAccount
}))

const MockWDKReadOnly = jest.fn().mockImplementation(() => ({
  dispose: mockWdkReadOnlyDispose,
  getAccount: mockWdkReadOnlyGetAccount
}))

jest.unstable_mockModule('../../src/wdk-core/wdk.js', () => ({
  WDK: MockWDK
}))

jest.unstable_mockModule('../../src/wdk-core/wdk-read-only.js', () => ({
  WDKReadOnly: MockWDKReadOnly
}))

jest.unstable_mockModule('@wdk/bare-ethers', () => ({
  default: {
    Contract: jest.fn().mockImplementation(() => ({
      interface: {
        encodeFunctionData: jest.fn().mockReturnValue('0xmockedData')
      }
    }))
  }
}))

// Import after mocking
const { Blockchain, wdkType } = await import('../../src/wdk-core/constants.js')
const { default: WdkManager } = await import('../../src/wdk-core/wdk-manager-v3.js')

describe('WdkManager', () => {
  let manager
  const mockConfig = {
    ethereum: { rpcUrl: 'https://eth.example.com' },
    arbitrum: { rpcUrl: 'https://arb.example.com' },
    polygon: { rpcUrl: 'https://polygon.example.com' },
    ton: { rpcUrl: 'https://ton.example.com' },
    tron: { rpcUrl: 'https://tron.example.com' },
    bitcoin: { rpcUrl: 'https://btc.example.com' }
  }
  const mockSeed = 'test seed phrase for wallet generation'

  beforeEach(() => {
    jest.clearAllMocks()
    manager = new WdkManager(mockConfig)
  })

  afterEach(() => {
    if (manager) {
      manager.dispose()
    }
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(manager._config).toEqual(mockConfig)
      expect(manager.wdk).toBeNull()
      expect(manager.wdkReadOnly).toBeNull()
    })
  })

  describe('initWdk', () => {
    it('should initialize WDK with seed', () => {
      manager.initWdk(mockSeed)

      expect(MockWDK).toHaveBeenCalledWith(mockSeed, mockConfig)
      expect(manager.wdk).not.toBeNull()
    })

    it('should dispose existing WDK before reinitializing', () => {
      manager.initWdk(mockSeed)
      const firstInstance = manager.wdk
      manager.initWdk('new seed phrase')

      expect(mockWdkDispose).toHaveBeenCalled()
      expect(manager.wdk).not.toBe(firstInstance)
    })
  })

  describe('initWdkReadOnly', () => {
    it('should initialize WDKReadOnly', () => {
      manager.initWdkReadOnly()

      expect(MockWDKReadOnly).toHaveBeenCalledWith(mockConfig)
      expect(manager.wdkReadOnly).not.toBeNull()
    })

    it('should dispose existing WDKReadOnly before reinitializing', () => {
      manager.initWdkReadOnly()
      const firstInstance = manager.wdkReadOnly
      manager.initWdkReadOnly()

      expect(mockWdkReadOnlyDispose).toHaveBeenCalled()
      expect(manager.wdkReadOnly).not.toBe(firstInstance)
    })
  })

  describe('hasWdk', () => {
    it('should return false when WDK is not initialized', () => {
      expect(manager.hasWdk()).toBe(false)
    })

    it('should return true when WDK is initialized', () => {
      manager.initWdk(mockSeed)
      expect(manager.hasWdk()).toBe(true)
    })
  })

  describe('hasWdkReadOnly', () => {
    it('should return false when WDKReadOnly is not initialized', () => {
      expect(manager.hasWdkReadOnly()).toBe(false)
    })

    it('should return true when WDKReadOnly is initialized', () => {
      manager.initWdkReadOnly()
      expect(manager.hasWdkReadOnly()).toBe(true)
    })
  })

  describe('WDK methods (require seed)', () => {
    beforeEach(() => {
      manager.initWdk(mockSeed)
    })

    describe('getWallet', () => {
      it('should call wdk.getWallet with blockchain', async () => {
        const mockWallet = { id: 'mockWallet' }
        mockWdkGetWallet.mockResolvedValue(mockWallet)

        const result = await manager.getWallet(Blockchain.Ethereum)

        expect(mockWdkGetWallet).toHaveBeenCalledWith(Blockchain.Ethereum)
        expect(result).toEqual(mockWallet)
      })

      it('should throw error when WDK is not initialized', async () => {
        manager.disposeWdk()

        await expect(manager.getWallet(Blockchain.Ethereum))
          .rejects.toThrow('WDK not initialized. Call initWdk(seed) first.')
      })
    })

    describe('getAccount', () => {
      it('should call wdk.getAccount with blockchain and index', async () => {
        const mockAccount = { address: '0x123' }
        mockWdkGetAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAccount(Blockchain.Ethereum, 1)

        expect(mockWdkGetAccount).toHaveBeenCalledWith(Blockchain.Ethereum, 1)
        expect(result).toEqual(mockAccount)
      })

      it('should use default index 0', async () => {
        const mockAccount = { address: '0x123' }
        mockWdkGetAccount.mockResolvedValue(mockAccount)

        await manager.getAccount(Blockchain.Ethereum)

        expect(mockWdkGetAccount).toHaveBeenCalledWith(Blockchain.Ethereum, 0)
      })
    })

    describe('getAccountByPath', () => {
      it('should call wdk.getAccountByPath with blockchain and path', async () => {
        const mockAccount = { address: '0x123' }
        mockWdkGetAccountByPath.mockResolvedValue(mockAccount)

        const result = await manager.getAccountByPath(Blockchain.Ethereum, "m/44'/60'/0'/0/0")

        expect(mockWdkGetAccountByPath).toHaveBeenCalledWith(Blockchain.Ethereum, "m/44'/60'/0'/0/0")
        expect(result).toEqual(mockAccount)
      })
    })

    describe('getAddress', () => {
      it('should return address from account', async () => {
        const mockAccount = { getAddress: jest.fn().mockResolvedValue('0xabc') }
        mockWdkGetAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAddress(Blockchain.Ethereum, 0)

        expect(result).toBe('0xabc')
        expect(mockAccount.getAddress).toHaveBeenCalled()
      })
    })

    describe('getAbstractedAccount', () => {
      it('should call wdk.getAbstractedAccount with blockchain and index', async () => {
        const mockAccount = { address: '0x456' }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAbstractedAccount(Blockchain.Ethereum, 1)

        expect(mockWdkGetAbstractedAccount).toHaveBeenCalledWith(Blockchain.Ethereum, 1)
        expect(result).toEqual(mockAccount)
      })
    })

    describe('getAbstractedAddress', () => {
      it('should return EOA and abstracted addresses', async () => {
        const mockAccount = {
          _ownerAccountAddress: '0xeoa',
          getAddress: jest.fn().mockResolvedValue('0xabstracted')
        }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAbstractedAddress(Blockchain.Ethereum, 0)

        expect(result).toEqual({
          eoaAddress: '0xeoa',
          address: '0xabstracted'
        })
      })
    })

    describe('getAbstractedAddressBalance', () => {
      it('should return balance from abstracted account', async () => {
        const mockAccount = { getBalance: jest.fn().mockResolvedValue(BigInt(1000)) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAbstractedAddressBalance(Blockchain.Ethereum, 0)

        expect(result).toBe(BigInt(1000))
        expect(mockAccount.getBalance).toHaveBeenCalled()
      })
    })

    describe('getAbstractedAddressTokenBalance', () => {
      it('should return token balance from abstracted account', async () => {
        const mockAccount = { getTokenBalance: jest.fn().mockResolvedValue(BigInt(500)) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getAbstractedAddressTokenBalance(Blockchain.Ethereum, 0, '0xtoken')

        expect(result).toBe(BigInt(500))
        expect(mockAccount.getTokenBalance).toHaveBeenCalledWith('0xtoken')
      })
    })

    describe('sendTransaction', () => {
      it('should send transaction via account', async () => {
        const mockTxResult = { hash: '0xhash' }
        const mockAccount = { sendTransaction: jest.fn().mockResolvedValue(mockTxResult) }
        mockWdkGetAccount.mockResolvedValue(mockAccount)

        const options = { to: '0xrecipient', value: 100 }
        const result = await manager.sendTransaction(Blockchain.Ethereum, 0, options)

        expect(mockAccount.sendTransaction).toHaveBeenCalledWith(options)
        expect(result).toEqual(mockTxResult)
      })
    })

    describe('abstractedAccountTransfer', () => {
      it('should transfer via abstracted account', async () => {
        const mockResult = { hash: '0xhash' }
        const mockAccount = { transfer: jest.fn().mockResolvedValue(mockResult) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const options = { recipient: '0xabc', token: '0xtoken', amount: 1000000 }
        const config = { transferMaxFee: 100 }
        const result = await manager.abstractedAccountTransfer(Blockchain.Ethereum, 0, options, config)

        expect(mockAccount.transfer).toHaveBeenCalledWith(options, config)
        expect(result).toEqual(mockResult)
      })
    })

    describe('abstractedSendTransaction', () => {
      it('should send transaction via abstracted account', async () => {
        const mockResult = { hash: '0xhash' }
        const mockAccount = { sendTransaction: jest.fn().mockResolvedValue(mockResult) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const options = [{ to: '0xrecipient', value: 0, data: '0xdata' }]
        const config = { transferMaxFee: 100 }
        const result = await manager.abstractedSendTransaction(Blockchain.Ethereum, 0, options, config)

        expect(mockAccount.sendTransaction).toHaveBeenCalledWith(options, config)
        expect(result).toEqual(mockResult)
      })
    })

    describe('abstractedAccountQuoteTransfer', () => {
      it('should quote transfer via abstracted account', async () => {
        const mockQuote = { fee: BigInt(100) }
        const mockAccount = { quoteTransfer: jest.fn().mockResolvedValue(mockQuote) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const options = { recipient: '0xabc', token: '0xtoken', amount: 1000000 }
        const result = await manager.abstractedAccountQuoteTransfer(Blockchain.Ethereum, 0, options)

        expect(mockAccount.quoteTransfer).toHaveBeenCalledWith(options, undefined)
        expect(result).toEqual(mockQuote)
      })
    })

    describe('getTransactionReceipt', () => {
      it('should return transaction receipt', async () => {
        const mockReceipt = { status: 1, blockNumber: 12345 }
        const mockAccount = { getTransactionReceipt: jest.fn().mockResolvedValue(mockReceipt) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getTransactionReceipt(Blockchain.Ethereum, 0, '0xhash')

        expect(mockAccount.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
        expect(result).toEqual(mockReceipt)
      })

      it('should return null when receipt is not found', async () => {
        const mockAccount = { getTransactionReceipt: jest.fn().mockResolvedValue(null) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getTransactionReceipt(Blockchain.Ethereum, 0, '0xhash')

        expect(result).toBeNull()
      })

      it('should handle TON blockchain receipts specially', async () => {
        const mockHashBuffer = Buffer.from('testhash')
        const mockReceipt = { hash: () => mockHashBuffer }
        const mockAccount = { getTransactionReceipt: jest.fn().mockResolvedValue(mockReceipt) }
        mockWdkGetAbstractedAccount.mockResolvedValue(mockAccount)

        const result = await manager.getTransactionReceipt(Blockchain.Ton, 0, '0xhash')

        expect(result).toEqual({ hash: mockHashBuffer.toString('hex') })
      })
    })
  })

  describe('getAccountByType', () => {
    it('should return WDK account when type is WDK', async () => {
      manager.initWdk(mockSeed)
      const mockAccount = { address: '0x123' }
      mockWdkGetAccount.mockResolvedValue(mockAccount)

      const result = await manager.getAccountByType(wdkType.WDK, Blockchain.Ethereum, { index: 1 })

      expect(mockWdkGetAccount).toHaveBeenCalledWith(Blockchain.Ethereum, 1)
      expect(result).toEqual(mockAccount)
    })

    it('should return WDKReadOnly account when type is WDKReadOnly', async () => {
      manager.initWdkReadOnly()
      const mockAccount = { address: '0xreadonly' }
      mockWdkReadOnlyGetAccount.mockResolvedValue(mockAccount)

      const result = await manager.getAccountByType(wdkType.WDKReadOnly, Blockchain.Ethereum, { address: '0xtest' })

      expect(mockWdkReadOnlyGetAccount).toHaveBeenCalledWith(Blockchain.Ethereum, '0xtest')
      expect(result).toEqual(mockAccount)
    })

    it('should throw error when WDKReadOnly requires address but not provided', async () => {
      manager.initWdkReadOnly()

      await expect(manager.getAccountByType(wdkType.WDKReadOnly, Blockchain.Ethereum, {}))
        .rejects.toThrow('address is required for WDKReadOnly')
    })

    it('should throw error for invalid wdkType', async () => {
      await expect(manager.getAccountByType('invalidType', Blockchain.Ethereum, {}))
        .rejects.toThrow('Invalid wdkType: invalidType')
    })
  })

  describe('getBalance', () => {
    it('should return balance based on wdkType', async () => {
      manager.initWdk(mockSeed)
      const mockAccount = { getBalance: jest.fn().mockResolvedValue(BigInt(1000)) }
      mockWdkGetAccount.mockResolvedValue(mockAccount)

      const result = await manager.getBalance(wdkType.WDK, Blockchain.Ethereum, { index: 0 })

      expect(result).toBe(BigInt(1000))
    })
  })

  describe('getTokenBalance', () => {
    it('should return token balance based on wdkType', async () => {
      manager.initWdk(mockSeed)
      const mockAccount = { getTokenBalance: jest.fn().mockResolvedValue(BigInt(500)) }
      mockWdkGetAccount.mockResolvedValue(mockAccount)

      const result = await manager.getTokenBalance(wdkType.WDK, Blockchain.Ethereum, '0xtoken', { index: 0 })

      expect(result).toBe(BigInt(500))
      expect(mockAccount.getTokenBalance).toHaveBeenCalledWith('0xtoken')
    })
  })

  describe('quoteSendTransaction', () => {
    it('should quote transaction based on wdkType', async () => {
      manager.initWdk(mockSeed)
      const mockQuote = { fee: BigInt(100) }
      const mockAccount = { quoteSendTransaction: jest.fn().mockResolvedValue(mockQuote) }
      mockWdkGetAccount.mockResolvedValue(mockAccount)

      const options = { to: '0xrecipient', value: 100 }
      const result = await manager.quoteSendTransaction(wdkType.WDK, Blockchain.Ethereum, { index: 0 }, options)

      expect(mockAccount.quoteSendTransaction).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockQuote)
    })
  })

  describe('WDKReadOnly methods', () => {
    beforeEach(() => {
      manager.initWdkReadOnly()
    })

    describe('getReadOnlyAccount', () => {
      it('should call wdkReadOnly.getAccount with blockchain and address', async () => {
        const mockAccount = { address: '0xreadonly' }
        mockWdkReadOnlyGetAccount.mockResolvedValue(mockAccount)

        const result = await manager.getReadOnlyAccount(Blockchain.Ethereum, '0xtest')

        expect(mockWdkReadOnlyGetAccount).toHaveBeenCalledWith(Blockchain.Ethereum, '0xtest')
        expect(result).toEqual(mockAccount)
      })

      it('should throw error when WDKReadOnly is not initialized', async () => {
        manager.disposeWdkReadOnly()

        await expect(manager.getReadOnlyAccount(Blockchain.Ethereum, '0xtest'))
          .rejects.toThrow('WDKReadOnly not initialized. Call initWdkReadOnly() first.')
      })
    })
  })

  describe('getApproveTransaction', () => {
    it('should return EVM approve transaction', async () => {
      // Wait for ethers import to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      const options = {
        token: '0xtoken',
        recipient: '0xspender',
        amount: 1000000
      }

      const result = await manager.getApproveTransaction(options)

      expect(result).toEqual({
        to: '0xtoken',
        value: 0,
        data: '0xmockedData'
      })
    })
  })

  describe('Disposal methods', () => {
    describe('disposeWdk', () => {
      it('should dispose WDK and set to null', () => {
        manager.initWdk(mockSeed)
        manager.disposeWdk()

        expect(mockWdkDispose).toHaveBeenCalled()
        expect(manager.wdk).toBeNull()
      })

      it('should not throw when WDK is already null', () => {
        expect(() => manager.disposeWdk()).not.toThrow()
      })
    })

    describe('disposeWdkReadOnly', () => {
      it('should dispose WDKReadOnly and set to null', () => {
        manager.initWdkReadOnly()
        manager.disposeWdkReadOnly()

        expect(mockWdkReadOnlyDispose).toHaveBeenCalled()
        expect(manager.wdkReadOnly).toBeNull()
      })

      it('should not throw when WDKReadOnly is already null', () => {
        expect(() => manager.disposeWdkReadOnly()).not.toThrow()
      })
    })

    describe('dispose', () => {
      it('should dispose both WDK and WDKReadOnly', () => {
        manager.initWdk(mockSeed)
        manager.initWdkReadOnly()
        manager.dispose()

        expect(mockWdkDispose).toHaveBeenCalled()
        expect(mockWdkReadOnlyDispose).toHaveBeenCalled()
        expect(manager.wdk).toBeNull()
        expect(manager.wdkReadOnly).toBeNull()
        expect(manager._config).toBeNull()
      })
    })
  })

  describe('_requireWdk', () => {
    it('should throw when WDK is not initialized', () => {
      expect(() => manager._requireWdk())
        .toThrow('WDK not initialized. Call initWdk(seed) first.')
    })

    it('should not throw when WDK is initialized', () => {
      manager.initWdk(mockSeed)
      expect(() => manager._requireWdk()).not.toThrow()
    })
  })

  describe('_requireWdkReadOnly', () => {
    it('should throw when WDKReadOnly is not initialized', () => {
      expect(() => manager._requireWdkReadOnly())
        .toThrow('WDKReadOnly not initialized. Call initWdkReadOnly() first.')
    })

    it('should not throw when WDKReadOnly is initialized', () => {
      manager.initWdkReadOnly()
      expect(() => manager._requireWdkReadOnly()).not.toThrow()
    })
  })
})
