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

import { NetworkType } from './constants.js'

/**
 * Module cache for resolved wallet managers and read-only accounts
 * Singleton pattern - modules are resolved once and reused
 */
class ModuleRegistry {
  constructor () {
    /** @private */
    this._walletManagers = new Map()
    /** @private */
    this._readOnlyAccounts = new Map()
    /** @private */
    this._pendingImports = new Map()
  }

  /**
   * Get or import wallet manager class
   * @param {NetworkType} networkType
   * @returns {Promise<any>}
   */
  async getWalletManager (networkType) {
    if (this._walletManagers.has(networkType)) {
      return this._walletManagers.get(networkType)
    }

    // Check if import is already in progress
    if (this._pendingImports.has(networkType)) {
      return this._pendingImports.get(networkType)
    }

    const importPromise = this._importWalletManager(networkType)
    this._pendingImports.set(networkType, importPromise)

    const result = await importPromise
    this._walletManagers.set(networkType, result)
    this._pendingImports.delete(networkType)

    return result
  }

  /**
   * Get or import read-only account class
   * @param {NetworkType} networkType
   * @returns {Promise<any>}
   */
  async getReadOnlyAccount (networkType) {
    if (this._readOnlyAccounts.has(networkType)) {
      return this._readOnlyAccounts.get(networkType)
    }

    const key = `readonly_${networkType}`
    if (this._pendingImports.has(key)) {
      return this._pendingImports.get(key)
    }

    const importPromise = this._importReadOnlyAccount(networkType)
    this._pendingImports.set(key, importPromise)

    const result = await importPromise
    this._readOnlyAccounts.set(networkType, result)
    this._pendingImports.delete(key)

    return result
  }

  /** @private */
  async _importWalletManager (networkType) {
    switch (networkType) {
      case NetworkType.EVM: {
        const { default: WalletManagerEvm } = await import('@tetherto/wdk-wallet-evm')
        return WalletManagerEvm
      }
      case NetworkType.EVM_ABSTRACTION: {
        const { default: WalletManagerEvmErc4337 } = await import('@tetherto/wdk-wallet-evm-erc-4337')
        return WalletManagerEvmErc4337
      }
      case NetworkType.TON: {
        const { default: WalletManagerTon } = await import('@tetherto/wdk-wallet-ton')
        return WalletManagerTon
      }
      case NetworkType.TON_ABSTRACTION: {
        const { default: WalletManagerTonGasless } = await import('@tetherto/wdk-wallet-ton-gasless')
        return WalletManagerTonGasless
      }
      case NetworkType.TRON: {
        const { default: WalletManagerTron } = await import('@tetherto/wdk-wallet-tron')
        return WalletManagerTron
      }
      case NetworkType.TRON_ABSTRACTION: {
        const { default: WalletManagerTronGasfree } = await import('@tetherto/wdk-wallet-tron-gasfree')
        return WalletManagerTronGasfree
      }
      case NetworkType.BITCOIN: {
        const { default: WalletManagerBtc } = await import('@tetherto/wdk-wallet-btc')
        return WalletManagerBtc
      }
      default:
        throw new Error(`Unknown network type: ${networkType}`)
    }
  }

  /** @private */
  async _importReadOnlyAccount (networkType) {
    switch (networkType) {
      case NetworkType.EVM: {
        const { WalletAccountReadOnlyEvm } = await import('@tetherto/wdk-wallet-evm')
        return WalletAccountReadOnlyEvm
      }
      case NetworkType.EVM_ABSTRACTION: {
        const { WalletAccountReadOnlyEvmErc4337 } = await import('@tetherto/wdk-wallet-evm-erc-4337')
        return WalletAccountReadOnlyEvmErc4337
      }
      case NetworkType.TON: {
        const { WalletAccountReadOnlyTon } = await import('@tetherto/wdk-wallet-ton')
        return WalletAccountReadOnlyTon
      }
      case NetworkType.TON_ABSTRACTION: {
        const { WalletAccountReadOnlyTonGasless } = await import('@tetherto/wdk-wallet-ton-gasless')
        return WalletAccountReadOnlyTonGasless
      }
      case NetworkType.TRON: {
        const { WalletAccountReadOnlyTron } = await import('@tetherto/wdk-wallet-tron')
        return WalletAccountReadOnlyTron
      }
      case NetworkType.TRON_ABSTRACTION: {
        const { WalletAccountReadOnlyTronGasfree } = await import('@tetherto/wdk-wallet-tron-gasfree')
        return WalletAccountReadOnlyTronGasfree
      }
      case NetworkType.BITCOIN: {
        const { WalletAccountReadOnlyBtc } = await import('@tetherto/wdk-wallet-btc')
        return WalletAccountReadOnlyBtc
      }
      default:
        throw new Error(`Unknown network type: ${networkType}`)
    }
  }

  clear () {
    this._walletManagers.clear()
    this._readOnlyAccounts.clear()
    this._pendingImports.clear()
  }
}

// Global module registry (singleton)
export const moduleRegistry = new ModuleRegistry()

export { ModuleRegistry }
