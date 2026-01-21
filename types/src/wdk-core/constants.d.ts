/**
 * Network Types
 */
export type NetworkType = string;
export namespace NetworkType {
    let EVM: string;
    let EVM_ABSTRACTION: string;
    let TON: string;
    let TON_ABSTRACTION: string;
    let TRON: string;
    let TRON_ABSTRACTION: string;
    let BITCOIN: string;
}
/**
 * Blockchain identifiers
 */
export type Blockchain = string;
export namespace Blockchain {
    let Ethereum: string;
    let Arbitrum: string;
    let Polygon: string;
    let Ton: string;
    let Tron: string;
    let Bitcoin: string;
}
/**
 * WDK Type identifiers
 */
export type wdkType = string;
export namespace wdkType {
    let WDK: string;
    let WDKReadOnly: string;
}
/**
 * Mapping of blockchain to network type (standard wallets)
 */
export const BLOCKCHAIN_NETWORK_TYPE: {
    [Blockchain.Ethereum]: string;
    [Blockchain.Arbitrum]: string;
    [Blockchain.Polygon]: string;
    [Blockchain.Ton]: string;
    [Blockchain.Tron]: string;
    [Blockchain.Bitcoin]: string;
};
/**
 * Mapping of blockchain to abstraction network type (abstracted wallets)
 * ethereum, arbitrum, polygon -> EVM_ABSTRACTION (WalletManagerEvmErc4337)
 * ton -> TON_ABSTRACTION (wdk-wallet-ton-gasless)
 * tron -> TRON_ABSTRACTION (wdk-wallet-tron-gasfree)
 */
export const BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE: {
    [Blockchain.Ethereum]: string;
    [Blockchain.Arbitrum]: string;
    [Blockchain.Polygon]: string;
    [Blockchain.Ton]: string;
    [Blockchain.Tron]: string;
};
