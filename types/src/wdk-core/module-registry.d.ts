export const moduleRegistry: ModuleRegistry;
/**
 * Module cache for resolved wallet managers and read-only accounts
 * Singleton pattern - modules are resolved once and reused
 */
export class ModuleRegistry {
    /** @private */
    private _walletManagers;
    /** @private */
    private _readOnlyAccounts;
    /** @private */
    private _pendingImports;
    /**
     * Get or import wallet manager class
     * @param {NetworkType} networkType
     * @returns {Promise<any>}
     */
    getWalletManager(networkType: NetworkType): Promise<any>;
    /**
     * Get or import read-only account class
     * @param {NetworkType} networkType
     * @returns {Promise<any>}
     */
    getReadOnlyAccount(networkType: NetworkType): Promise<any>;
    /** @private */
    private _importWalletManager;
    /** @private */
    private _importReadOnlyAccount;
    clear(): void;
}
import { NetworkType } from './constants.js';
