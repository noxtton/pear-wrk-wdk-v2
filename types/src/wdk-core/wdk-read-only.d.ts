export type IWalletAccountReadOnly = import("@tetherto/wdk-wallet").IWalletAccountReadOnly;
/**
 * WDKReadOnly - Read-only wallet access without seed phrase
 * Works with addresses only, no signing capability
 */
export class WDKReadOnly {
    /**
     * @param {Object} config - Configuration for all blockchains
     */
    constructor(config: any);
    /** @private */
    private _config;
    /**
     * @private - Initialized read-only accounts by key (blockchain:address)
     * @type {Map<string, IWalletAccountReadOnly>}
     * */
    private _accounts;
    /** @private */
    private _disposed;
    /**
     * Get network type for a blockchain
     * @param {Blockchain} blockchain
     * @returns {NetworkType}
     */
    getNetworkType(blockchain: Blockchain): NetworkType;
    /**
     * Get abstraction network type for a blockchain
     * @param {Blockchain} blockchain
     * @returns {NetworkType}
     */
    getAbstractionNetworkType(blockchain: Blockchain): NetworkType;
    /**
     * Get configuration for a blockchain
     * @param {Blockchain} blockchain
     * @returns {Object}
     */
    getConfig(blockchain: Blockchain): any;
    /**
     * Generate account key for caching
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {string}
     */
    _getAccountKey(blockchain: Blockchain, address: string): string;
    /**
     * Check if read-only account exists
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {boolean}
     */
    hasAccount(blockchain: Blockchain, address: string): boolean;
    /**
     * Get or create read-only account for blockchain and address
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {Promise<IWalletAccountReadOnly>}
     */
    getAccount(blockchain: Blockchain, address: string): Promise<IWalletAccountReadOnly>;
    /**
     * Get or create abstracted read-only account for blockchain and address
     * Uses abstraction network type (e.g., EVM_ABSTRACTION for ethereum)
     * @param {Blockchain} blockchain
     * @param {string} address
     * @returns {Promise<IWalletAccountReadOnly>}
     */
    getAbstractedAccount(blockchain: Blockchain, address: string): Promise<IWalletAccountReadOnly>;
    /**
     * Remove a specific read-only account
     * @param {Blockchain} blockchain
     * @param {string} address
     */
    removeAccount(blockchain: Blockchain, address: string): void;
    /**
     * Dispose all accounts
     */
    dispose(): void;
    /** @private */
    private _checkDisposed;
}
