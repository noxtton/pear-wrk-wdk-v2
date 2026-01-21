export type IWalletAccount = import("@tetherto/wdk-wallet").IWalletAccount;
/**
 * WDK - Wallet Development Kit with seed phrase
 * Single instance manages all networks dynamically
 */
export class WDK {
    /**
     * @param {string | Uint8Array} seed - BIP-39 seed phrase
     * @param {Object} config - Configuration for all blockchains
     */
    constructor(seed: string | Uint8Array, config: any);
    /** @private */
    private _seed;
    /** @private */
    private _config;
    /**
     * @private - Initialized wallet managers by blockchain
     * @type {Map<string, IWalletAccount>}
     * */
    private _wallets;
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
     * Check if wallet is already initialized for blockchain
     * @param {Blockchain} blockchain
     * @returns {boolean}
     */
    hasWallet(blockchain: Blockchain): boolean;
    /**
     * Get or initialize wallet manager for blockchain
     * @param {Blockchain} blockchain
     * @returns {Promise<any>}
     */
    getWallet(blockchain: Blockchain): Promise<any>;
    /**
     * Get or initialize abstracted wallet manager for blockchain
     * Uses abstraction network type (e.g., EVM_ABSTRACTION for ethereum)
     * @param {Blockchain} blockchain
     * @returns {Promise<any>}
     */
    getAbstractedWallet(blockchain: Blockchain): Promise<any>;
    /**
     * Get account for blockchain at index
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<IWalletAccount>}
     */
    getAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
    /**
     * Get abstracted account for blockchain at index
     * Uses abstraction wallet manager (e.g., WalletManagerEvmErc4337 for ethereum)
     * @param {Blockchain} blockchain
     * @param {number} index
     * @returns {Promise<IWalletAccount>}
     */
    getAbstractedAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
    /**
     * Get account by derivation path
     * @param {Blockchain} blockchain
     * @param {string} path
     * @returns {Promise<IWalletAccount>}
     */
    getAccountByPath(blockchain: Blockchain, path: string): Promise<IWalletAccount>;
    /**
     * Dispose all wallets and clear seed
     */
    dispose(): void;
    /** @private */
    private _checkDisposed;
}
