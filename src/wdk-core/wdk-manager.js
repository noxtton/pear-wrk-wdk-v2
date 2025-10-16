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

/**
 * Enumeration for all available blockchains.
 *
 * @enum {string}
 */
const Blockchain = {
  Ethereum: 'ethereum',
  Arbitrum: 'arbitrum',
  Polygon: 'polygon',
  Ton: 'ton',
  Tron: 'tron',
  Bitcoin: 'bitcoin',
  Solana: 'solana'
}

const EVM_BLOCKCHAINS = [
  Blockchain.Ethereum,
  Blockchain.Arbitrum,
  Blockchain.Polygon
]

export default class WdkManager {
  /**
     * Creates a new wallet development kit manager.
     *
     * @param {Seed | Seeds} seed - A [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase to use for
     *                                             all blockchains, or an object mapping each blockchain to a different seed phrase.
     * @param {WdkConfig} config - The configuration for each blockchain.
     */
  constructor (seed, config) {
    /** @private */
    this._seed = seed

    /** @private */
    this._config = config

    /** @private */
    this._wallets = { }

    /** @private */
    this._account_abstraction_wallets = { }

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
     * Returns the wallet account for a specific blockchain and index (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
     *
     * @example
     * // Return the account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
     * const account = await wdk.getAccount("ethereum", 1);
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} [index] - The index of the account to get (default: 0).
     * @returns {Promise<IWalletAccount>} The account.
     */
  async getAccount (blockchain, index = 0) {
    const wallet = await this._getWalletManager(blockchain)

    return await wallet.getAccount(index)
  }

  /**
     * Returns the wallet abstracted account for a specific blockchain and index (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
     *
     * Note that the given blockchain must support account abstraction features for this method to work properly.
     *
     * @example
     * // Return the abstracted account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
     * const account = await wdk.getAbstractedAccount("ethereum", 1);
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} [index] - The index of the account to get (default: 0).
     * @returns {Promise<IWalletAccount>} The account.
     */
  async getAbstractedAccount (blockchain, index = 0) {
    const wallet = await this._getWalletManagerWithAccountAbstraction(blockchain)

    return await wallet.getAccount(index)
  }

  /**
     * Returns the wallet account for a specific blockchain and BIP-44 derivation path.
     *
     * @example
     * // Returns the account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
     * const account = await wdk.getAccountByPath("ethereum", "0'/0/1");
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {string} path - The derivation path (e.g. "0'/0/0").
     * @returns {Promise<IWalletAccount>} The account.
     */
  async getAccountByPath (blockchain, path) {
    const wallet = await this._getWalletManager(blockchain)

    return await wallet.getAccountByPath(path)
  }

  /**
     * Returns the wallet abstracted account for a specific blockchain and BIP-44 derivation path.
     *
     * Note that the given blockchain must support account abstraction features for this method to work properly.
     *
     * @example
     * // Returns the abstracted account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
     * const account = await wdk.getAbstractedAccountByPath("ethereum", "0'/0/1");
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {string} path - The derivation path (e.g. "0'/0/0").
     * @returns {Promise<IWalletAccount>} The account.
     */
  async getAbstractedAccountByPath (blockchain, path) {
    const wallet = await this._getWalletManagerWithAccountAbstraction(blockchain)

    return await wallet.getAccountByPath(path)
  }

  /**
     * Returns the current fee rates for a specific blockchain.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @returns {Promise<FeeRates>} The fee rates.
     */
  async getFeeRates (blockchain) {
    const wallet = await this._getWalletManager(blockchain)

    return await wallet.getFeeRates()
  }

  /**
     * Returns the address of an account.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<string>} The abstracted address.
     *
     * @example
     * // Get the abstracted address of the ethereum wallet's account at m/44'/60'/0'/0/3
     * const abstractedAddress = await wdk.getAbstractedAddress("ethereum", 3);
     */
  async getAddress (blockchain, accountIndex) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.getAddress()
  }

  /**
     * Returns the native token balance of an address.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<number>} The native token balance (in base unit).
     */
  async getAddressBalance (blockchain, accountIndex) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.getBalance()
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
  async quoteSendTransaction (blockchain, accountIndex, options) {
    const account = await this.getAccount(blockchain, accountIndex)

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
     * Returns the abstracted address of an account.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<string>} The abstracted address.
     *
     * @example
     * // Get the abstracted address of the ethereum wallet's account at m/44'/60'/0'/0/3
     * const abstractedAddress = await wdk.getAbstractedAddress("ethereum", 3);
     */
  async getAbstractedAddress (blockchain, accountIndex) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)

    return await account.getAddress()
  }

  /**
     * Returns the native token balance of an abstracted address.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<number>} The native token balance (in base unit).
     */
  async getAbstractedAddressBalance (blockchain, accountIndex) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)

    return await account.getBalance()
  }

  /**
     * Returns the balance of an abstracted address for a specific token.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @param {string} tokenAddress - The smart contract address of the token
     * @returns {Promise<number>} The token balance (in base unit).
     */
  async getAbstractedAddressTokenBalance (blockchain, accountIndex, tokenAddress) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)

    return await account.getTokenBalance(tokenAddress)
  }

  /**
     * Returns the paymaster token balance of an abstracted address.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<number>} The paymaster token balance (in base unit).
     */
  async getAbstractedAddressPaymasterTokenBalance (blockchain, accountIndex) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)

    const { paymasterToken: { address } } = this._config[blockchain]

    return await account.getTokenBalance(address)
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
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
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
  async abstractedAccountQuoteTransfer (blockchain, accountIndex, options, config) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)
    return await account.quoteTransfer(options, config)
  }

  /**
     * Get abstracted account transaction receipt.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @param {string} hash - Transaction hash.
     * @return {Promise<unknown | null>} - The receipt, or null if the transaction has not been included in a block yet.
     */
  async getTransactionReceipt (blockchain, accountIndex, hash) {
    const account = await this.getAbstractedAccount(blockchain, accountIndex)
    return await account.getTransactionReceipt(hash)
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

  /** Disposes all the wallet accounts, erasing their private keys from the memory. */
  dispose () {
    for (const blockchain in this._wallets) {
      this._wallets[blockchain].dispose()
    }

    for (const blockchain in this._account_abstraction_wallets) {
      this._account_abstraction_wallets[blockchain].dispose()
    }
    this._seed = null
    this._config = null
    this._wallets = { }
    this._account_abstraction_wallets = { }
  }

  /** @private */
  async _getWalletManager (blockchain) {
    if (!Object.values(Blockchain).includes(blockchain)) {
      throw new Error(`Unsupported blockchain: ${blockchain}.`)
    }

    if (!this._wallets[blockchain]) {
      const seed = (typeof this._seed === 'string' || this._seed instanceof Uint8Array)
        ? this._seed
        : this._seed[blockchain]

      const config = this._config

      if (EVM_BLOCKCHAINS.includes(blockchain)) {
        const { default: WalletManagerEvm } = await import('@tetherto/wdk-wallet-evm')

        this._wallets[blockchain] = new WalletManagerEvm(seed, config[blockchain])
      } else if (blockchain === 'ton') {
        const { default: WalletManagerTon } = await import('@tetherto/wdk-wallet-ton')

        this._wallets.ton = new WalletManagerTon(seed, config.ton)
      } else if (blockchain === 'tron') {
        const { default: WalletManagerTron } = await import('@tetherto/wdk-wallet-tron')

        this._wallets.tron = new WalletManagerTron(seed, config.tron)
      } else if (blockchain === 'bitcoin') {
        const { default: WalletManagerBtc } = await import('@tetherto/wdk-wallet-btc')

        this._wallets.bitcoin = new WalletManagerBtc(seed, config.bitcoin)
      } else if (blockchain === 'solana') {
        const { default: WalletManagerSolana } = await import('@tetherto/wdk-wallet-solana')

        this._wallets.solana = new WalletManagerSolana(seed, config.solana)
      }
    }

    return this._wallets[blockchain]
  }

  /** @private */
  async _getWalletManagerWithAccountAbstraction (blockchain) {
    if (![...EVM_BLOCKCHAINS, Blockchain.Ton, Blockchain.Tron].includes(blockchain)) {
      throw new Error(`Account abstraction unsupported for blockchain: ${blockchain}.`)
    }

    if (!this._account_abstraction_wallets[blockchain]) {
      const seed = (typeof this._seed === 'string' || this._seed instanceof Uint8Array)
        ? this._seed
        : this._seed[blockchain]

      const config = this._config

      if (EVM_BLOCKCHAINS.includes(blockchain)) {
        const { default: WalletManagerEvmErc4337 } = await import('@tetherto/wdk-wallet-evm-erc-4337')

        this._account_abstraction_wallets[blockchain] = new WalletManagerEvmErc4337(seed, config[blockchain])
      } else if (blockchain === 'ton') {
        const { default: WalletManagerTonGasless } = await import('@tetherto/wdk-wallet-ton-gasless')

        this._account_abstraction_wallets.ton = new WalletManagerTonGasless(seed, config.ton)
      } else if (blockchain === 'tron') {
        const { default: WalletManagerTronGasfree } = await import('@tetherto/wdk-wallet-tron-gasfree')

        this._account_abstraction_wallets.tron = new WalletManagerTronGasfree(seed, config.tron)
      }
    }

    return this._account_abstraction_wallets[blockchain]
  }
}
