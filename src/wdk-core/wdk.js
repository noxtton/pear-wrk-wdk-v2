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
/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */
import { BLOCKCHAIN_NETWORK_TYPE, BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE } from './constants.js'
import { moduleRegistry } from './module-registry.js'

/**
 * WDK - Wallet Development Kit with seed phrase
 * Single instance manages all networks dynamically
 */
class WDK {
  /**
   * @param {string | Uint8Array} seed - BIP-39 seed phrase
   * @param {Object} config - Configuration for all blockchains
   */
  constructor (seed, config) {
    /** @private */
    this._seed = seed
    /** @private */
    this._config = config
    /**
     * @private - Initialized wallet managers by blockchain
     * @type {Map<string, IWalletAccount>}
     * */
    this._wallets = new Map()
    /** @private */
    this._disposed = false
  }

  /**
   * Get network type for a blockchain
   * @param {Blockchain} blockchain
   * @returns {NetworkType}
   */
  getNetworkType (blockchain) {
    const networkType = BLOCKCHAIN_NETWORK_TYPE[blockchain]
    if (!networkType) {
      throw new Error(`Unsupported blockchain: ${blockchain}`)
    }
    return networkType
  }

  /**
   * Get abstraction network type for a blockchain
   * @param {Blockchain} blockchain
   * @returns {NetworkType}
   */
  getAbstractionNetworkType (blockchain) {
    const networkType = BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE[blockchain]
    if (!networkType) {
      throw new Error(`Unsupported blockchain for abstraction: ${blockchain}`)
    }
    return networkType
  }

  /**
   * Get configuration for a blockchain
   * @param {Blockchain} blockchain
   * @returns {Object}
   */
  getConfig (blockchain) {
    return this._config[blockchain]
  }

  /**
   * Check if wallet is already initialized for blockchain
   * @param {Blockchain} blockchain
   * @returns {boolean}
   */
  hasWallet (blockchain) {
    return this._wallets.has(blockchain)
  }

  /**
   * Get or initialize wallet manager for blockchain
   * @param {Blockchain} blockchain
   * @returns {Promise<any>}
   */
  async getWallet (blockchain) {
    this._checkDisposed()

    if (this._wallets.has(blockchain)) {
      return this._wallets.get(blockchain)
    }

    const networkType = this.getNetworkType(blockchain)
    const WalletManager = await moduleRegistry.getWalletManager(networkType)
    const config = this.getConfig(blockchain)

    const wallet = new WalletManager(this._seed, config)
    this._wallets.set(blockchain, wallet)

    return wallet
  }

  /**
   * Get or initialize abstracted wallet manager for blockchain
   * Uses abstraction network type (e.g., EVM_ABSTRACTION for ethereum)
   * @param {Blockchain} blockchain
   * @returns {Promise<any>}
   */
  async getAbstractedWallet (blockchain) {
    this._checkDisposed()

    const abstractedKey = `${blockchain}_abstracted`
    if (this._wallets.has(abstractedKey)) {
      return this._wallets.get(abstractedKey)
    }

    const networkType = this.getAbstractionNetworkType(blockchain)
    const WalletManager = await moduleRegistry.getWalletManager(networkType)
    const config = this.getConfig(blockchain)
    const wallet = new WalletManager(this._seed, config)
    this._wallets.set(abstractedKey, wallet)

    return wallet
  }

  /**
   * Get account for blockchain at index
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<IWalletAccount>}
   */
  async getAccount (blockchain, index = 0) {
    const wallet = await this.getWallet(blockchain)
    return wallet.getAccount(index)
  }

  /**
   * Get abstracted account for blockchain at index
   * Uses abstraction wallet manager (e.g., WalletManagerEvmErc4337 for ethereum)
   * @param {Blockchain} blockchain
   * @param {number} index
   * @returns {Promise<IWalletAccount>}
   */
  async getAbstractedAccount (blockchain, index = 0) {
    const wallet = await this.getAbstractedWallet(blockchain)
    return wallet.getAccount(index)
  }

  /**
   * Get account by derivation path
   * @param {Blockchain} blockchain
   * @param {string} path
   * @returns {Promise<IWalletAccount>}
   */
  async getAccountByPath (blockchain, path) {
    const wallet = await this.getWallet(blockchain)
    return wallet.getAccountByPath(path)
  }

  /**
   * Dispose all wallets and clear seed
   */
  dispose () {
    for (const [, wallet] of this._wallets) {
      if (wallet && typeof wallet.dispose === 'function') {
        wallet.dispose()
      }
    }
    this._wallets.clear()
    this._seed = null
    this._config = null
    this._disposed = true
  }

  /** @private */
  _checkDisposed () {
    if (this._disposed) {
      throw new Error('WDK instance has been disposed')
    }
  }
}

export { WDK }
