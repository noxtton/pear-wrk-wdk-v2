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

/** @typedef {import('@tetherto/wdk-wallet').FeeRates} FeeRates */

/** @typedef {import('@tetherto/wdk-wallet').TransferOptions} TransferOptions */
/** @typedef {import('@tetherto/wdk-wallet').Transaction} Transaction */
/** @typedef {import('@tetherto/wdk-wallet').TransactionResult} TransactionResult */
/** @typedef {import('@tetherto/wdk-wallet').TransferResult} TransferResult */
/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */
/** @typedef {import('@tetherto/wdk-wallet').IWalletAccountReadOnly} IWalletAccountReadOnly */

/** @typedef {import('@tetherto/wdk-wallet-evm').EvmWalletConfig} EvmWalletConfig */
/** @typedef {import('@tetherto/wdk-wallet-evm').EvmTransaction} EvmTransaction */
/** @typedef {import('@tetherto/wdk-wallet-evm-erc-4337').EvmErc4337WalletConfig} EvmErc4337WalletConfig */

/** @typedef {import('@tetherto/wdk-wallet-ton').TonWalletConfig} TonWalletConfig */
/** @typedef {import('@tetherto/wdk-wallet-ton-gasless').TonGaslessWalletConfig} TonGaslessWalletConfig */

/** @typedef {import('@tetherto/wdk-wallet-tron').TronWalletConfig} TronWalletConfig */
/** @typedef {import('@tetherto/wdk-wallet-tron-gasfree').TronGasfreeWalletConfig} TronGasfreeWalletConfig */

/** @typedef {import('@tetherto/wdk-wallet-btc').BtcWalletConfig} BtcWalletConfig */

/** @typedef {import('@tetherto/wdk-wallet-solana').SolanaWalletConfig} SolanaWalletConfig */

/** @typedef {string | Uint8Array} Seed */

/**
 * @typedef {Object} Seeds
 * @property {Seed} ethereum - The ethereum's wallet seed phrase.
 * @property {Seed} arbitrum - The arbitrum's wallet seed phrase.
 * @property {Seed} polygon - The polygon's wallet seed phrase.
 * @property {Seed} ton - The ton's wallet seed phrase.
 * @property {Seed} tron - The tron's wallet seed phrase.
 * @property {Seed} bitcoin - The bitcoin's wallet seed phrase.
 * @property {Seed} solana - The solana's wallet seed phrase.
 */

/**
 * @typedef {Object} WdkConfig
 * @property {EvmWalletConfig | EvmErc4337WalletConfig} ethereum - The ethereum blockchain configuration.
 * @property {EvmWalletConfig | EvmErc4337WalletConfig} arbitrum - The arbitrum blockchain configuration.
 * @property {EvmWalletConfig | EvmErc4337WalletConfig} polygon - The polygon blockchain configuration.
 * @property {TonWalletConfig | TonGaslessWalletConfig} ton - The ton blockchain configuration.
 * @property {TronWalletConfig | TronGasfreeWalletConfig} tron - The tron blockchain configuration.
 * @property {BtcWalletConfig} bitcoin - The bitcoin blockchain configuration.
 * @property {SolanaWalletConfig} solana - The solana blockchain configuration.
 */

/**
 * @typedef {Object} TransferConfig
 * @property {number} [transferMaxFee] - The maximum fee amount for transfer operations.
 * @property {Object} paymasterToken - The paymaster token configuration.
 * @property {string} paymasterToken.address - The address of the paymaster token.
 */

/**
 * @typedef {Object} ApproveOptions
 * @property {string} token
 * @property {string} recipient
 * @property {number} amount
 */

import { NetworkType, Blockchain, wdkType } from './constants.js'
import { ModuleRegistry, moduleRegistry } from './module-registry.js'
import { WDK } from './wdk.js'
import { WDKReadOnly } from './wdk-read-only.js'

/**
 * WdkManager - Main manager class
 * Manages both WDK (with seed) and WDKReadOnly (without a seed) instances
 */
export default class WdkManager {
  /**
   * @param {WdkConfig} config - The configuration for each blockchain.
   */
  constructor (config) {
    /** @private */
    this._config = config

    /**
     * WDK instance (with seed) - initialized via initWdk()
     * @type {WDK | null}
     */
    this.wdk = null

    /**
     * WDKReadOnly instance (without seed) - initialized via initWdkReadOnly()
     * @type {WDKReadOnly | null}
     */
    this.wdkReadOnly = null

    /** @private */
    this._imports = { }
    this.initDefaultImports().then()
  }

  // todo workaround to support ethers
  async initDefaultImports () {
    const { default: Ethers } = await import('@wdk/bare-ethers')
    if (!this._imports.ethers) this._imports.ethers = Ethers
  }

  /**
   * Initialize WDK with seed phrase
   * Creates single instance that can manage all networks
   * @param {string | Uint8Array} seed - BIP-39 seed phrase
   */
  initWdk (seed) {
    if (this.wdk) {
      this.wdk.dispose()
    }
    this.wdk = new WDK(seed, this._config)
  }

  /**
   * Initialize WDKReadOnly
   * Creates instance for read-only account access
   */
  initWdkReadOnly () {
    if (this.wdkReadOnly) {
      this.wdkReadOnly.dispose()
    }
    this.wdkReadOnly = new WDKReadOnly(this._config)
  }

  /**
   * Check if WDK is initialized
   * @returns {boolean}
   */
  hasWdk () {
    return this.wdk !== null
  }

  /**
   * Check if WDKReadOnly is initialized
   * @returns {boolean}
   */
  hasWdkReadOnly () {
    return this.wdkReadOnly !== null
  }

  // ============================================
  // WDK Methods (require seed)
  // ============================================

  /**
   * Get wallet for blockchain (initializes if needed)
   * @param {Blockchain} blockchain
   * @returns {Promise<any>}
   */
  async getWallet (blockchain) {
    this._requireWdk()
    return this.wdk.getWallet(blockchain)
  }

  /**
   * Get account for blockchain at index
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<IWalletAccount>}
   */
  async getAccount (blockchain, index = 0) {
    this._requireWdk()
    return this.wdk.getAccount(blockchain, index)
  }

  /**
   * Get account by derivation path
   * @param {Blockchain} blockchain
   * @param {string} path
   * @returns {Promise<any>}
   */
  async getAccountByPath (blockchain, path) {
    this._requireWdk()
    return this.wdk.getAccountByPath(blockchain, path)
  }

  /**
   * Get account based on wdkType
   * @param {string} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<IWalletAccount | IWalletAccountReadOnly>}
   */
  async getAccountByType (type, blockchain, { index, address } = {}) {
    if (type === wdkType.WDKReadOnly) {
      if (address === undefined) {
        throw new Error('address is required for WDKReadOnly')
      }
      return this.getReadOnlyAccount(blockchain, address)
    }
    if (type === wdkType.WDK) {
      return this.getAccount(blockchain, index)
    }
    throw new Error(`Invalid wdkType: ${type}`)
  }

  /**
   * Get address for blockchain account
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<string>}
   */
  async getAddress (blockchain, index = 0) {
    const account = await this.getAccount(blockchain, index)
    return account.getAddress()
  }

  /**
   * Get abstracted account for blockchain at index
   * Uses abstraction wallet manager (e.g., WalletManagerEvmErc4337 for ethereum)
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<IWalletAccount>}
   */
  async getAbstractedAccount (blockchain, index = 0) {
    this._requireWdk()
    return this.wdk.getAbstractedAccount(blockchain, index)
  }

  /**
   * Get abstracted account based on wdkType
   * @param {string} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<IWalletAccount | IWalletAccountReadOnly>}
   */
  async getAbstractedAccountByType (type, blockchain, { index, address } = {}) {
    if (type === wdkType.WDKReadOnly) {
      if (address === undefined) {
        throw new Error('address is required for WDKReadOnly')
      }
      return this.getReadOnlyAccount(blockchain, address)
    }
    if (type === wdkType.WDK) {
      return this.getAbstractedAccount(blockchain, index)
    }
    throw new Error(`Invalid wdkType: ${type}`)
  }

  /**
   * Get address for blockchain-abstracted account.
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<{eoaAddress: string, address: string}>}
   */
  async getAbstractedAddress (blockchain, index = 0) {
    const account = await this.getAbstractedAccount(blockchain, index)
    return {
      eoaAddress: account._ownerAccountAddress,
      address: await account.getAddress()
    }
  }

  /**
   * Get balance for blockchain-abstracted account.
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<bigint>}
   */
  async getAbstractedAddressBalance (type, blockchain, { index, address } = {}) {
    const account = await this.getAbstractedAccountByType(type, blockchain, { index, address })
    return account.getBalance()
  }

  /**
   * Get token balance for blockchain-abstracted account.
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {string} tokenAddress
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<bigint>}
   */
  async getAbstractedAddressTokenBalance (type, blockchain, tokenAddress, { index, address } = {}) {
    const account = await this.getAbstractedAccountByType(type, blockchain, { index, address })
    return account.getTokenBalance(tokenAddress)
  }

  /**
   * Transfers a token to another address.
   *
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {Object} opt
   * @param {number} [opt.index] - - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
   * @param {string} [opt.address] - address for WDKReadOnly
   * @param {Transaction} options - The transfer's options.
   * @returns {Promise<Omit<TransactionResult, "hash">>} The transfer's result.
   *
   * @example
   * // Transfer 1 BTC from the spark wallet's account at index 0 to another address
   * const transfer = await wdk.transfer("spark", 0, {
   *     to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
   *     value: 1
   * });
   *
   * console.log("Transaction hash:", transfer.hash);
   */
  async quoteSendTransaction (type, blockchain, { index, address } = { }, options) {
    const account = await this.getAccountByType(type, blockchain, { index, address})

    return await account.quoteSendTransaction(options)
  }

  /**
   * Transfers a token to another address.
   *
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
   * @param {Transaction} options - The transfer's options.
   * @returns {Promise<Omit<TransactionResult, "hash">>} The transfer's result.
   *
   * @example
   * // Transfer 1 BTC from the spark wallet's account at index 0 to another address
   * const transfer = await wdk.transfer("spark", 0, {
   *     to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
   *     value: 1
   * });
   *
   * console.log("Transaction hash:", transfer.hash);
   */
  async sendTransaction (blockchain, accountIndex, options) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.sendTransaction(options)
  }

  /**
   * Get balance based on wdkType
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<bigint>}
   */
  async getBalance (type, blockchain, { index, address } = {}) {
    const account = await this.getAccountByType(type, blockchain, { index, address })
    return account.getBalance()
  }

  /**
   * Get token balance based on wdkType
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain
   * @param {string} tokenAddress
   * @param {Object} options
   * @param {number} [options.index] - account index for WDK
   * @param {string} [options.address] - address for WDKReadOnly
   * @returns {Promise<bigint>}
   */
  async getTokenBalance (type, blockchain, tokenAddress, { index, address } = {}) {
    const account = await this.getAccountByType(type, blockchain, { index, address })
    return account.getTokenBalance(tokenAddress)
  }

  /**
   * Transfers a token to another address.
   *
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
   * @param {TransferOptions} options - The transfer's options.
   * @param {TransferConfig} [config] - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.
   * @returns {Promise<TransferResult>} The transfer's result.
   *
   * @example
   * // Transfer 1.0 USDT from the ethereum wallet's account at index 0 to another address
   * const transfer = await wdk.transfer("ethereum", 0, {
   *     recipient: "0xabc...",
   *     token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
   *     amount: 1_000_000
   * });
   *
   * console.log("Transaction hash:", transfer.hash);
   */
  async abstractedAccountTransfer (blockchain, accountIndex, options, config) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)
    return await account.transfer(options, config)
  }

  /**
   * Transfers a token to another address.
   *
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
   * @param {EvmTransaction[]} options - The transaction options.
   * @param {TransferConfig} [config] - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.
   * @returns {Promise<TransactionResult>} The transfer's result.
   *
   */
  async abstractedSendTransaction (blockchain, accountIndex, options, config) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)

    return await account.sendTransaction(options, config)
  }

  /**
   * Quotes the costs of a transfer operation.
   *
   * @see {@link transfer}
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {Object} opt
   * @param {number} [opt.index] - account index for WDK
   * @param {string} [opt.address] - address for WDKReadOnly
   * @param {TransferOptions} options - The transfer's options.
   * @param {TransferConfig} [config] - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.
   * @returns {Promise<Omit<TransferResult, 'hash'>>} The transfer's quotes.
   *
   * @example
   * // Quote the transfer of 1.0 USDT from the ethereum wallet's account at index 0 to another address
   * const quote = await wdk.quoteTransfer("ethereum", 0, {
   *     recipient: "0xabc...",
   *     token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
   *     amount: 1_000_000
   * });
   *
   * console.log("Gas cost in paymaster token:", quote.fee);
   */
  async abstractedAccountQuoteTransfer (type, blockchain, { index, address } = {}, options, config) {
    const account = await this.getAbstractedAccountByType(type, blockchain, { index, address })
    return await account.quoteTransfer(options, config)
  }

  /**
   * Get abstracted account transaction receipt.
   *
   * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
   * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
   * @param {Object} opt
   * @param {number} [opt.index] - account index for WDK
   * @param {string} [opt.address] - address for WDKReadOnly
   * @param {string} hash - Transaction hash.
   * @return {Promise<unknown | null>} - The receipt, or null if the transaction has not been included in a block yet.
   */
  async getTransactionReceipt (type, blockchain, { index, address } = {}, hash) {
    const account = await this.getAbstractedAccountByType(type, blockchain, { index, address })
    const receipt = await account.getTransactionReceipt(hash)
    if (!receipt) return null
    if (blockchain === Blockchain.Ton) {
      return {
        hash: receipt.hash().toString('hex')
      }
    }
    return receipt
  }

  /**
   * Returns an evm transaction to approve the interaction transaction.
   *
   * @param {ApproveOptions} options - The approve options.
   * @returns {Promise<EvmTransaction>} The evm transaction.
   */
  async getApproveTransaction (options) {
    const { token, recipient, amount } = options

    const erc20Abi = ['function approve(address spender, uint256 amount) external returns (bool)']

    const contract = new this._imports.ethers.Contract(token, erc20Abi)

    return {
      to: token,
      value: 0,
      data: contract.interface.encodeFunctionData('approve', [recipient, amount])
    }
  }

  // ============================================
  // WDKReadOnly Methods (no seed required)
  // ============================================

  /**
   * Get read-only account for blockchain and address
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {Promise<IWalletAccountReadOnly>}
   */
  async getReadOnlyAccount (blockchain, address) {
    this._requireWdkReadOnly()
    return this.wdkReadOnly.getAccount(blockchain, address)
  }

  /**
   * Get balance for read-only account
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {Promise<number>}
   */
  // async getReadOnlyBalance (blockchain, address) {
  //   const account = await this.getReadOnlyAccount(blockchain, address)
  //   return account.getBalance()
  // }
  //
  // /**
  //  * Get token balance for read-only account
  //  * @param {Blockchain} blockchain
  //  * @param {string} address
  //  * @param {string} tokenAddress
  //  * @returns {Promise<number>}
  //  */
  // async getReadOnlyTokenBalance (blockchain, address, tokenAddress) {
  //   const account = await this.getReadOnlyAccount(blockchain, address)
  //   return account.getTokenBalance(tokenAddress)
  // }

  // ============================================
  // Disposal Methods
  // ============================================

  /**
   * Dispose WDK instance
   */
  disposeWdk () {
    if (this.wdk) {
      this.wdk.dispose()
      this.wdk = null
    }
  }

  /**
   * Dispose WDKReadOnly instance
   */
  disposeWdkReadOnly () {
    if (this.wdkReadOnly) {
      this.wdkReadOnly.dispose()
      this.wdkReadOnly = null
    }
  }

  /**
   * Dispose all instances
   */
  dispose () {
    this.disposeWdk()
    this.disposeWdkReadOnly()
    this._config = null
  }

  // ============================================
  // Private Helpers
  // ============================================

  /** @private */
  _requireWdk () {
    if (!this.wdk) {
      throw new Error('WDK not initialized. Call initWdk(seed) first.')
    }
  }

  /** @private */
  _requireWdkReadOnly () {
    if (!this.wdkReadOnly) {
      throw new Error('WDKReadOnly not initialized. Call initWdkReadOnly() first.')
    }
  }
}

// Export classes and constants for direct use if needed
export { NetworkType, Blockchain, wdkType }
export { WDK, WDKReadOnly, ModuleRegistry, moduleRegistry }
