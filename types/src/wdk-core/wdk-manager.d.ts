export default class WdkManager {
    /**
       * Creates a new wallet development kit manager.
       *
       * @param {Seed | Seeds} seed - A [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase to use for
       *                                             all blockchains, or an object mapping each blockchain to a different seed phrase.
       * @param {WdkConfig} config - The configuration for each blockchain.
       */
    constructor(seed: Seed | Seeds, config: WdkConfig);
    /** @private */
    private _seed;
    /** @private */
    private _config;
    /** @private */
    private _wallets;
    /** @private */
    private _account_abstraction_wallets;
    /** @private */
    private _imports;
    initDefaultImports(): Promise<void>;
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
    getAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
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
    getAbstractedAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
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
    getAccountByPath(blockchain: Blockchain, path: string): Promise<IWalletAccount>;
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
    getAbstractedAccountByPath(blockchain: Blockchain, path: string): Promise<IWalletAccount>;
    /**
       * Returns the current fee rates for a specific blockchain.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @returns {Promise<FeeRates>} The fee rates.
       */
    getFeeRates(blockchain: Blockchain): Promise<FeeRates>;
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
    getAddress(blockchain: Blockchain, accountIndex: number): Promise<string>;
    /**
       * Returns the native token balance of an address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @returns {Promise<number>} The native token balance (in base unit).
       */
    getAddressBalance(blockchain: Blockchain, accountIndex: number): Promise<number>;
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
    quoteSendTransaction(blockchain: Blockchain, accountIndex: number, options: Transaction): Promise<Omit<TransactionResult, "hash">>;
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
    getAbstractedAddress(blockchain: Blockchain, accountIndex: number): Promise<string>;
    /**
       * Returns the native token balance of an abstracted address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @returns {Promise<number>} The native token balance (in base unit).
       */
    getAbstractedAddressBalance(blockchain: Blockchain, accountIndex: number): Promise<number>;
    /**
       * Returns the balance of an abstracted address for a specific token.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @param {string} tokenAddress - The smart contract address of the token
       * @returns {Promise<number>} The token balance (in base unit).
       */
    getAbstractedAddressTokenBalance(blockchain: Blockchain, accountIndex: number, tokenAddress: string): Promise<number>;
    /**
       * Returns the paymaster token balance of an abstracted address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @returns {Promise<number>} The paymaster token balance (in base unit).
       */
    getAbstractedAddressPaymasterTokenBalance(blockchain: Blockchain, accountIndex: number): Promise<number>;
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
    abstractedAccountQuoteTransfer(blockchain: Blockchain, accountIndex: number, options: TransferOptions, config?: TransferConfig): Promise<Omit<TransferResult, "hash">>;
    /**
       * Get abstracted account transaction receipt.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @param {string} hash - Transaction hash.
       * @return {Promise<unknown | null>} - The receipt, or null if the transaction has not been included in a block yet.
       */
    getTransactionReceipt(blockchain: Blockchain, accountIndex: number, hash: string): Promise<unknown | null>;
    /**
       * Returns an evm transaction to approve the interaction transaction.
       *
       * @param {ApproveOptions} options - The approve options.
       * @returns {Promise<EvmTransaction>} The evm transaction.
       */
    getApproveTransaction(options: ApproveOptions): Promise<EvmTransaction>;
    /** Disposes all the wallet accounts, erasing their private keys from the memory. */
    dispose(): void;
    /** @private */
    private _getWalletManager;
    /** @private */
    private _getWalletManagerWithAccountAbstraction;
}
export type FeeRates = import("@wdk/wallet").FeeRates;
export type TransferOptions = import("@wdk/wallet").TransferOptions;
export type Transaction = import("@wdk/wallet").Transaction;
export type TransactionResult = import("@wdk/wallet").TransactionResult;
export type TransferResult = import("@wdk/wallet").TransferResult;
export type IWalletAccount = import("@wdk/wallet").IWalletAccount;
export type EvmWalletConfig = import("@wdk/wallet-evm").EvmWalletConfig;
export type EvmTransaction = import("@wdk/wallet-evm").EvmTransaction;
export type EvmErc4337WalletConfig = import("@wdk/wallet-evm-erc-4337").EvmErc4337WalletConfig;
export type TonWalletConfig = import("@wdk/wallet-ton").TonWalletConfig;
export type TonGaslessWalletConfig = import("@wdk/wallet-ton-gasless").TonGaslessWalletConfig;
export type TronWalletConfig = import("@wdk/wallet-tron").TronWalletConfig;
export type TronGasfreeWalletConfig = import("@wdk/wallet-tron-gasfree").TronGasfreeWalletConfig;
export type BtcWalletConfig = import("@wdk/wallet-btc").BtcWalletConfig;
export type SolanaWalletConfig = import("@wdk/wallet-solana").SolanaWalletConfig;
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
/**
 * Enumeration for all available blockchains.
 */
type Blockchain = string;
declare namespace Blockchain {
    let Ethereum: string;
    let Arbitrum: string;
    let Polygon: string;
    let Ton: string;
    let Tron: string;
    let Bitcoin: string;
    let Solana: string;
}
export {};
