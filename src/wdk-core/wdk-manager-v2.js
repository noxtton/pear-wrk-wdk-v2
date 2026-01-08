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

import WDK from "@tetherto/wdk";
import WalletManagerEvm, {WalletAccountReadOnlyEvm} from "@tetherto/wdk-wallet-evm";
import WalletManagerBtc, {WalletAccountReadOnlyBtc} from "@tetherto/wdk-wallet-btc";
import WalletManagerTron, {WalletAccountReadOnlyTron} from "@tetherto/wdk-wallet-tron";
import WalletManagerTon, {WalletAccountReadOnlyTon} from "@tetherto/wdk-wallet-ton";
import WalletManagerEvmErc4337, {WalletAccountReadOnlyEvmErc4337} from "@tetherto/wdk-wallet-evm-erc-4337";
import WalletManagerTonGasless, {WalletAccountReadOnlyTonGasless} from "@tetherto/wdk-wallet-ton-gasless";
import WalletManagerTronGasfree, {WalletAccountReadOnlyTronGasfree} from "@tetherto/wdk-wallet-tron-gasfree";

/**
 * Enumeration for all available blockchains.
 *
 * @enum {string}
 */
export const BlockChains = {
  Ethereum: 'ethereum',
  Arbitrum: 'arbitrum',
  Polygon: 'polygon',
  Ton: 'ton',
  Tron: 'tron',
  Bitcoin: 'bitcoin',
  EthereumAbstraction: 'ethereumAbstraction',
  ArbitrumAbstraction: 'arbitrumAbstraction',
  PolygonAbstraction: 'polygonAbstraction',
  TonAbstraction: 'tonAbstraction',
  TronAbstraction: 'tronAbstraction',
}
export default class WdkManager {

  /**
   *
   * @param {WdkConfig} config - The configuration for each blockchain.
   */
  constructor(config) {
    /**
     * @type {WDK}
     */
    this.wdk = null;
    /**
     * @type {Map<BlockChains, WalletAccountReadOnlyBtc | WalletAccountReadOnlyEvm | WalletAccountReadOnlyTon | WalletAccountReadOnlyTron | WalletAccountReadOnlyEvmErc4337 | WalletAccountReadOnlyTonGasless | WalletAccountReadOnlyTonGasless>}
     */
    this.wdkReadOnly = new Map();

    /** @private */
    this._config = config

  }

  initWdk(seed) {
    if (this.wdk) this.wdk.dispose();
    this.wdk = new WDK(seed);
  }

  initWdkReadOnly(seed) {
    if (this.wdkReadOnly) this.wdkReadOnly.dispose();
    const wdk = new WDK(seed);

    this.wdkReadOnly = new WDK(null);
    wdk.dispose();
  }

  /**
   * Register wallet for blockchain
   * @param {BlockChains} blockchain
   */
  registerWdkWallet(blockchain) {
    if (this.wdk.hasRegisteredWallet(blockchain)) return;
    switch (true) {
      case blockchain === BlockChains.Bitcoin:
        this.wdk.registerWallet(blockchain, WalletManagerBtc, this._config.bitcoin);
        break;
      case blockchain === BlockChains.Ethereum:
        this.wdk.registerWallet(blockchain, WalletManagerEvm, this._config.ethereum);
        break;
      case blockchain === BlockChains.Arbitrum:
        this.wdk.registerWallet(blockchain, WalletManagerEvm, this._config.arbitrum);
        break;
      case blockchain === BlockChains.Polygon:
        this.wdk.registerWallet(blockchain, WalletManagerEvm, this._config.polygon);
        break;
      case blockchain === BlockChains.Ton:
        this.wdk.registerWallet(blockchain, WalletManagerTon, this._config.ton);
        break;
      case blockchain === BlockChains.Tron:
        this.wdk.registerWallet(blockchain, WalletManagerTron, this._config.tron);
        break;
        //ABSTRACTIONS
      case blockchain === BlockChains.EthereumAbstraction:
        this.wdk.registerWallet(blockchain, WalletManagerEvmErc4337, this._config.ethereum);
        break;
      case blockchain === BlockChains.ArbitrumAbstraction:
        this.wdk.registerWallet(blockchain, WalletManagerEvmErc4337, this._config.arbitrum);
        break;
      case blockchain === BlockChains.PolygonAbstraction:
        this.wdk.registerWallet(blockchain, WalletManagerEvmErc4337, this._config.polygon);
        break;
      case blockchain === BlockChains.TonAbstraction:
        this.wdk.registerWallet(blockchain, WalletManagerTonGasless, this._config.ton);
        break;
      case blockchain === BlockChains.TronAbstraction:
        this.wdk.registerWallet(blockchain, WalletManagerTronGasfree, this._config.tron);
        break;
    }
  }

  /**
   * Register read only account for blockchain
   * @param blockchain
   * @param address
   */
  registerWdkReadOnlyAccount(blockchain, address) {
    if (this.wdkReadOnly.has(blockchain)) return;
    switch (true) {
      case blockchain === BlockChains.Bitcoin:
        this.wdkReadOnly.set(blockchain, new WalletAccountReadOnlyBtc(address, this._config.bitcoin));
        break;
      // case blockchain === BlockChains.Ethereum:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvm, this._config.ethereum);
      //   break;
      // case blockchain === BlockChains.Arbitrum:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvm, this._config.arbitrum);
      //   break;
      // case blockchain === BlockChains.Polygon:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvm, this._config.polygon);
      //   break;
      // case blockchain === BlockChains.Ton:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyTon, this._config.ton);
      //   break;
      // case blockchain === BlockChains.Tron:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyTron, this._config.tron);
      //   break;
      // //ABSTRACTIONS
      // case blockchain === BlockChains.EthereumAbstraction:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvmErc4337, this._config.ethereum);
      //   break;
      // case blockchain === BlockChains.ArbitrumAbstraction:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvmErc4337, this._config.arbitrum);
      //   break;
      // case blockchain === BlockChains.PolygonAbstraction:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyEvmErc4337, this._config.polygon);
      //   break;
      // case blockchain === BlockChains.TonAbstraction:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyTonGasless, this._config.ton);
      //   break;
      // case blockchain === BlockChains.TronAbstraction:
      //   wdk.registerWallet(blockchain, WalletAccountReadOnlyTronGasfree, this._config.tron);
      //   break;
    }
  }

  /**
   * @param {"wdk" | "wdkReadOnly"} type
   */
  wdkDispose(type) {
    if (type === 'wdkReadOnly') {

    }
    this[type].dispose();
    this[type] = null;
  }

  disposeAll() {
    this.dispose("wdk");
    this.dispose("wdkReadOnly");
  }


}
