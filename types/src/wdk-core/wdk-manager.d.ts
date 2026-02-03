/**
 * WdkManager - Main manager class
 * Manages both WDK (with seed) and WDKReadOnly (without a seed) instances
 */
export default class WdkManager {
    /**
     * @param {WdkConfig} config - The configuration for each blockchain.
     */
    constructor(config: WdkConfig);
    /** @private */
    private _config;
    /**
     * WDK instance (with seed) - initialized via initWdk()
     * @type {WDK | null}
     */
    wdk: WDK | null;
    /**
     * WDKReadOnly instance (without seed) - initialized via initWdkReadOnly()
     * @type {WDKReadOnly | null}
     */
    wdkReadOnly: WDKReadOnly | null;
    /** @private */
    private _imports;
    initDefaultImports(): Promise<void>;
    /**
     * Initialize WDK with seed phrase
     * Creates single instance that can manage all networks
     * @param {string | Uint8Array} seed - BIP-39 seed phrase
     */
    initWdk(seed: string | Uint8Array): void;
    /**
     * Initialize WDKReadOnly
     * Creates instance for read-only account access
     */
    initWdkReadOnly(): void;
    /**
     * Check if WDK is initialized
     * @returns {boolean}
     */
    hasWdk(): boolean;
    /**
     * Check if WDKReadOnly is initialized
     * @returns {boolean}
     */
    hasWdkReadOnly(): boolean;
    /**
     * Get wallet for blockchain (initializes if needed)
     * @param {Blockchain} blockchain
     * @returns {Promise<any>}
     */
    getWallet(blockchain: Blockchain): Promise<any>;
    /**
     * Get account for blockchain at index
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<IWalletAccount>}
     */
    getAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
    /**
     * Get account by derivation path
     * @param {Blockchain} blockchain
     * @param {string} path
     * @returns {Promise<any>}
     */
    getAccountByPath(blockchain: Blockchain, path: string): Promise<any>;
    /**
     * Get account based on wdkType
     * @param {string} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain
     * @param {Object} options
     * @param {number} [options.index] - account index for WDK
     * @param {string} [options.address] - address for WDKReadOnly
     * @returns {Promise<IWalletAccount | IWalletAccountReadOnly>}
     */
    getAccountByType(type: string, blockchain: Blockchain, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<IWalletAccount | IWalletAccountReadOnly>;
    /**
     * Get address for blockchain account
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<string>}
     */
    getAddress(blockchain: Blockchain, index?: number): Promise<string>;
    /**
     * Get abstracted account for blockchain at index
     * Uses abstraction wallet manager (e.g., WalletManagerEvmErc4337 for ethereum)
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<IWalletAccount>}
     */
    getAbstractedAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
    /**
     * Get abstracted account based on wdkType
     * @param {string} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain
     * @param {Object} options
     * @param {number} [options.index] - account index for WDK
     * @param {string} [options.address] - address for WDKReadOnly
     * @returns {Promise<IWalletAccount | IWalletAccountReadOnly>}
     */
    getAbstractedAccountByType(type: string, blockchain: Blockchain, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<IWalletAccount | IWalletAccountReadOnly>;
    /**
     * Get address for blockchain-abstracted account.
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<{eoaAddress: string, address: string}>}
     */
    getAbstractedAddress(blockchain: Blockchain, index?: number): Promise<{
        eoaAddress: string;
        address: string;
    }>;
    /**
     * Get balance for blockchain-abstracted account.
     * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain
     * @param {Object} options
     * @param {number} [options.index] - account index for WDK
     * @param {string} [options.address] - address for WDKReadOnly
     * @returns {Promise<bigint>}
     */
    getAbstractedAddressBalance(type: wdkType, blockchain: Blockchain, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<bigint>;
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
    getAbstractedAddressTokenBalance(type: wdkType, blockchain: Blockchain, tokenAddress: string, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<bigint>;
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
    quoteSendTransaction(type: wdkType, blockchain: Blockchain, { index, address }: {
        index?: number;
        address?: string;
    }, options: Transaction): Promise<Omit<TransactionResult, "hash">>;
    /**
     * Returns the maximum spendable amount for an account.
     *
     * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "bitcoin").
     * @param {Object} opt
     * @param {number} [opt.index] - - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @param {string} [opt.address] - address for WDKReadOnly
     * @returns {Promise<{amount: bigint, fee: bigint, changeValue: bigint}>} The max spendable info.
     */
    getMaxSpendable(type: wdkType, blockchain: Blockchain, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<{
        amount: bigint;
        fee: bigint;
        changeValue: bigint;
    }>;
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
    sendTransaction(blockchain: Blockchain, accountIndex: number, options: Transaction): Promise<Omit<TransactionResult, "hash">>;
    /**
     * Get balance based on wdkType
     * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain
     * @param {Object} options
     * @param {number} [options.index] - account index for WDK
     * @param {string} [options.address] - address for WDKReadOnly
     * @returns {Promise<bigint>}
     */
    getBalance(type: wdkType, blockchain: Blockchain, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<bigint>;
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
    getTokenBalance(type: wdkType, blockchain: Blockchain, tokenAddress: string, { index, address }?: {
        index?: number;
        address?: string;
    }): Promise<bigint>;
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
    abstractedAccountTransfer(blockchain: Blockchain, accountIndex: number, options: TransferOptions, config?: TransferConfig): Promise<TransferResult>;
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
    abstractedSendTransaction(blockchain: Blockchain, accountIndex: number, options: EvmTransaction[], config?: TransferConfig): Promise<TransactionResult>;
    /**
     * Quote the costs of a native token transfer operation. (POL, ARB, ETH)
     *
     * @param {wdkType} type - wdkType.WDK or wdkType.WDKReadOnly
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {Object} opt
     * @param {number} [opt.index] - account index for WDK
     * @param {string} [opt.address] - address for WDKReadOnly
     * @param {EvmTransaction} options - The transaction options.
     * @param {TransferConfig} [config] - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.
     * @return {Promise<Omit<TransactionResult, "hash">>}
     */
    abstractedQuoteSendTransaction(type: wdkType, blockchain: Blockchain, { index, address }: {
        index?: number;
        address?: string;
    }, options: EvmTransaction, config?: TransferConfig): Promise<Omit<TransactionResult, "hash">>;
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
    abstractedAccountQuoteTransfer(type: wdkType, blockchain: Blockchain, { index, address }: {
        index?: number;
        address?: string;
    }, options: TransferOptions, config?: TransferConfig): Promise<Omit<TransferResult, "hash">>;
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
    getTransactionReceipt(type: wdkType, blockchain: Blockchain, { index, address }: {
        index?: number;
        address?: string;
    }, hash: string): Promise<unknown | null>;
    /**
     * Returns an evm transaction to approve the interaction transaction.
     *
     * @param {ApproveOptions} options - The approve options.
     * @returns {Promise<EvmTransaction>} The evm transaction.
     */
    getApproveTransaction(options: ApproveOptions): Promise<EvmTransaction>;
    /**
     * Get read-only account for blockchain and address
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {Promise<IWalletAccountReadOnly>}
     */
    getReadOnlyAccount(blockchain: Blockchain, address: string): Promise<IWalletAccountReadOnly>;
    /**
     * Get read-only abstracted account for blockchain and address
     * Uses abstraction network type (e.g., EVM_ABSTRACTION for ethereum)
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {Promise<IWalletAccountReadOnly>}
     */
    getReadOnlyAbstractedAccount(blockchain: Blockchain, address: string): Promise<IWalletAccountReadOnly>;
    /**
     * Get balance for read-only account
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {Promise<number>}
     */
    /**
     * Dispose WDK instance
     */
    disposeWdk(): void;
    /**
     * Dispose WDKReadOnly instance
     */
    disposeWdkReadOnly(): void;
    /**
     * Dispose all instances
     */
    dispose(): void;
    /** @private */
    private _requireWdk;
    /** @private */
    private _requireWdkReadOnly;
}
export type FeeRates = import("@tetherto/wdk-wallet").FeeRates;
export type TransferOptions = import("@tetherto/wdk-wallet").TransferOptions;
export type Transaction = import("@tetherto/wdk-wallet").Transaction;
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type IWalletAccount = import("@tetherto/wdk-wallet").IWalletAccount;
export type IWalletAccountReadOnly = import("@tetherto/wdk-wallet").IWalletAccountReadOnly;
export type EvmWalletConfig = import("@tetherto/wdk-wallet-evm").EvmWalletConfig;
export type EvmTransaction = import("@tetherto/wdk-wallet-evm").EvmTransaction;
export type EvmErc4337WalletConfig = import("@tetherto/wdk-wallet-evm-erc-4337").EvmErc4337WalletConfig;
export type TonWalletConfig = import("@tetherto/wdk-wallet-ton").TonWalletConfig;
export type TonGaslessWalletConfig = import("@tetherto/wdk-wallet-ton-gasless").TonGaslessWalletConfig;
export type TronWalletConfig = import("@tetherto/wdk-wallet-tron").TronWalletConfig;
export type TronGasfreeWalletConfig = import("@tetherto/wdk-wallet-tron-gasfree").TronGasfreeWalletConfig;
export type BtcWalletConfig = import("@tetherto/wdk-wallet-btc").BtcWalletConfig;
export type SolanaWalletConfig = any;
export type Seed = string | Uint8Array;
export type Seeds = {
    /**
     * - The ethereum's wallet seed phrase.
     */
    ethereum: Seed;
    /**
     * - The arbitrum's wallet seed phrase.
     */
    arbitrum: Seed;
    /**
     * - The polygon's wallet seed phrase.
     */
    polygon: Seed;
    /**
     * - The ton's wallet seed phrase.
     */
    ton: Seed;
    /**
     * - The tron's wallet seed phrase.
     */
    tron: Seed;
    /**
     * - The bitcoin's wallet seed phrase.
     */
    bitcoin: Seed;
    /**
     * - The solana's wallet seed phrase.
     */
    solana: Seed;
};
export type WdkConfig = {
    /**
     * - The ethereum blockchain configuration.
     */
    ethereum: EvmWalletConfig | EvmErc4337WalletConfig;
    /**
     * - The arbitrum blockchain configuration.
     */
    arbitrum: EvmWalletConfig | EvmErc4337WalletConfig;
    /**
     * - The polygon blockchain configuration.
     */
    polygon: EvmWalletConfig | EvmErc4337WalletConfig;
    /**
     * - The ton blockchain configuration.
     */
    ton: TonWalletConfig | TonGaslessWalletConfig;
    /**
     * - The tron blockchain configuration.
     */
    tron: TronWalletConfig | TronGasfreeWalletConfig;
    /**
     * - The bitcoin blockchain configuration.
     */
    bitcoin: BtcWalletConfig;
    /**
     * - The solana blockchain configuration.
     */
    solana: SolanaWalletConfig;
};
export type TransferConfig = {
    /**
     * - The maximum fee amount for transfer operations.
     */
    transferMaxFee?: number;
    /**
     * - The paymaster token configuration.
     */
    paymasterToken: {
        address: string;
    };
};
export type ApproveOptions = {
    token: string;
    recipient: string;
    amount: number;
};
import { WDK } from './wdk.js';
import { WDKReadOnly } from './wdk-read-only.js';
import { Blockchain } from './constants.js';
import { wdkType } from './constants.js';
import { NetworkType } from './constants.js';
import { ModuleRegistry } from './module-registry.js';
import { moduleRegistry } from './module-registry.js';
export { NetworkType, Blockchain, wdkType, WDK, WDKReadOnly, ModuleRegistry, moduleRegistry };
