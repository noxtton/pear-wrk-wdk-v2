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
/** @typedef {import('@tetherto/wdk-wallet').IWalletAccountReadOnly} IWalletAccountReadOnly */
import { BLOCKCHAIN_NETWORK_TYPE, BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE } from './constants.js'
import { moduleRegistry } from './module-registry.js'

/**
 * WDKReadOnly - Read-only wallet access without seed phrase
 * Works with addresses only, no signing capability
 */
class WDKReadOnly {
  /**
   * @param {Object} config - Configuration for all blockchains
   */
  constructor (config) {
    /** @private */
    this._config = config
    /**
     * @private - Initialized read-only accounts by key (blockchain:address)
     * @type {Map<string, IWalletAccountReadOnly>}
     * */
    this._accounts = new Map()
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
   * Generate account key for caching
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {string}
   */
  _getAccountKey (blockchain, address) {
    return `${blockchain}:${address}`
  }

  /**
   * Check if read-only account exists
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {boolean}
   */
  hasAccount (blockchain, address) {
    return this._accounts.has(this._getAccountKey(blockchain, address))
  }

  /**
   * Get or create read-only account for blockchain and address
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {Promise<IWalletAccountReadOnly>}
   */
  async getAccount (blockchain, address) {
    this._checkDisposed()

    const key = this._getAccountKey(blockchain, address)

    if (this._accounts.has(key)) {
      return this._accounts.get(key)
    }

    const networkType = this.getNetworkType(blockchain)
    const ReadOnlyAccount = await moduleRegistry.getReadOnlyAccount(networkType)
    const config = this.getConfig(blockchain)

    const account = new ReadOnlyAccount(address, config)
    this._accounts.set(key, account)

    return account
  }

  /**
   * Get or create abstracted read-only account for blockchain and address
   * Uses abstraction network type (e.g., EVM_ABSTRACTION for ethereum)
   * @param {Blockchain} blockchain
   * @param {string} address
   * @returns {Promise<IWalletAccountReadOnly>}
   */
  async getAbstractedAccount (blockchain, address) {
    this._checkDisposed()

    const key = `${blockchain}_abstracted:${address}`

    if (this._accounts.has(key)) {
      return this._accounts.get(key)
    }

    const networkType = this.getAbstractionNetworkType(blockchain)
    const ReadOnlyAccount = await moduleRegistry.getReadOnlyAccount(networkType)
    const config = this.getConfig(blockchain)

    const account = new ReadOnlyAccount(address, config)
    this._accounts.set(key, account)

    return account
  }

  /**
   * Remove a specific read-only account
   * @param {Blockchain} blockchain
   * @param {string} address
   */
  removeAccount (blockchain, address) {
    const key = this._getAccountKey(blockchain, address)
    const account = this._accounts.get(key)
    if (account && typeof account.dispose === 'function') {
      account.dispose()
    }
    this._accounts.delete(key)
  }

  /**
   * Dispose all accounts
   */
  dispose () {
    for (const [, account] of this._accounts) {
      if (account && typeof account.dispose === 'function') {
        account.dispose()
      }
    }
    this._accounts.clear()
    this._config = null
    this._disposed = true
  }

  /** @private */
  _checkDisposed () {
    if (this._disposed) {
      throw new Error('WDKReadOnly instance has been disposed')
    }
  }
}

export { WDKReadOnly }
